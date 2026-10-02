import { describe, expect, it } from "vitest";

import { parseSiteConfigFormData } from "./site-config.schema";

function configForm(overrides: Record<string, string | File | null> = {}) {
  const fields: Record<string, string | File | null> = {
    business_name: "Surticarnes del Fonce",
    description: "Cortes frescos",
    address: "Cra 1 # 2-3",
    schedule: "Lun a sáb",
    phone_whatsapp: "312 362 7031",
    whatsapp_message: "Hola, quiero hacer un pedido",
    instagram: "https://instagram.com/surticarnes",
    facebook: "",
    primary_color: "#9A3324",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null) formData.set(key, value);
  }
  return formData;
}

describe("parseSiteConfigFormData", () => {
  it("acepta una configuración válida y normaliza el WhatsApp", () => {
    const result = parseSiteConfigFormData(configForm());

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      business_name: "Surticarnes del Fonce",
      phone_whatsapp: "573123627031",
      instagram: "https://instagram.com/surticarnes",
      facebook: null,
      primary_color: "#9a3324",
      remove_logo: false,
      remove_hero: false,
      logo: undefined,
      hero: undefined,
    });
  });

  it("convierte los textos opcionales vacíos en null", () => {
    const result = parseSiteConfigFormData(
      configForm({ description: " ", address: "", schedule: "" }),
    );

    expect(result.data).toMatchObject({ description: null, address: null, schedule: null });
  });

  it("lee el texto del footer y la sección Nosotros; vacíos quedan en null", () => {
    const filled = parseSiteConfigFormData(
      configForm({
        footer_text: "  Carnicería familiar desde 1998  ",
        about_title: "Nuestra historia",
        about_text: "Empezamos en 1998.\n\nHoy seguimos igual.",
      }),
    );
    const empty = parseSiteConfigFormData(configForm({ footer_text: " ", about_title: "", about_text: "" }));

    expect(filled.data).toMatchObject({
      footer_text: "Carnicería familiar desde 1998",
      about_title: "Nuestra historia",
      about_text: "Empezamos en 1998.\n\nHoy seguimos igual.",
      about_image: undefined,
      remove_about_image: false,
    });
    expect(empty.data).toMatchObject({ footer_text: null, about_title: null, about_text: null });
  });

  it("limita la longitud de los textos de Nosotros y del footer", () => {
    expect(parseSiteConfigFormData(configForm({ footer_text: "x".repeat(301) })).success).toBe(false);
    expect(parseSiteConfigFormData(configForm({ about_title: "x".repeat(81) })).success).toBe(false);
    expect(parseSiteConfigFormData(configForm({ about_text: "x".repeat(3001) })).success).toBe(false);
    expect(parseSiteConfigFormData(configForm({ about_text: "x".repeat(3000) })).success).toBe(true);
  });

  it("lee la imagen de Nosotros y la opción de quitarla", () => {
    const image = new File(["x"], "local.jpg", { type: "image/jpeg" });
    const result = parseSiteConfigFormData(configForm({ about_image: image, remove_about_image: "on" }));

    expect(result.data?.about_image).toBeInstanceOf(File);
    expect(result.data?.remove_about_image).toBe(true);
  });

  it("exige el nombre del negocio", () => {
    expect(parseSiteConfigFormData(configForm({ business_name: "  " })).success).toBe(false);
  });

  it("permite dejar el WhatsApp vacío, pero rechaza números inválidos", () => {
    expect(parseSiteConfigFormData(configForm({ phone_whatsapp: "" })).data?.phone_whatsapp).toBe(
      "",
    );
    expect(parseSiteConfigFormData(configForm({ phone_whatsapp: "12345" })).success).toBe(false);
  });

  it("agrega https:// a las redes escritas sin protocolo", () => {
    expect(
      parseSiteConfigFormData(configForm({ facebook: "facebook.com/surticarnes" })).data
        ?.facebook,
    ).toBe("https://facebook.com/surticarnes");
  });

  it("rechaza redes que no son URL", () => {
    expect(parseSiteConfigFormData(configForm({ instagram: "no es url" })).success).toBe(false);
  });

  it("rechaza colores que no sean #RRGGBB", () => {
    expect(parseSiteConfigFormData(configForm({ primary_color: "red" })).success).toBe(false);
    expect(parseSiteConfigFormData(configForm({ primary_color: "#fff" })).success).toBe(false);
  });

  it("lee las opciones de quitar logo e imagen principal", () => {
    const result = parseSiteConfigFormData(configForm({ remove_logo: "on", remove_hero: "on" }));

    expect(result.data).toMatchObject({ remove_logo: true, remove_hero: true });
  });

  it("sin ubicación guarda latitud y longitud en null", () => {
    expect(parseSiteConfigFormData(configForm()).data).toMatchObject({
      latitude: null,
      longitude: null,
    });
  });

  it("lee la ubicación y la redondea a 6 decimales", () => {
    const result = parseSiteConfigFormData(
      configForm({ latitude: "4.6097112345", longitude: "-74.0817549999" }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ latitude: 4.609711, longitude: -74.081755 });
  });

  it("exige latitud y longitud juntas", () => {
    const result = parseSiteConfigFormData(configForm({ latitude: "4.6", longitude: "" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["latitude"]);
  });

  it("rechaza coordenadas fuera de rango o que no son números", () => {
    expect(
      parseSiteConfigFormData(configForm({ latitude: "91", longitude: "0" })).success,
    ).toBe(false);
    expect(
      parseSiteConfigFormData(configForm({ latitude: "0", longitude: "-181" })).success,
    ).toBe(false);
    expect(
      parseSiteConfigFormData(configForm({ latitude: "abc", longitude: "1" })).success,
    ).toBe(false);
  });

  it("sin días marcados no guarda horario", () => {
    expect(parseSiteConfigFormData(configForm()).data?.opening_hours).toBeNull();
  });

  it("arma el horario de la semana (0 = domingo); los días sin marcar quedan cerrados", () => {
    const result = parseSiteConfigFormData(
      configForm({
        hours_1_enabled: "on",
        hours_1_open: "07:00",
        hours_1_close: "18:00",
        hours_6_enabled: "on",
        hours_6_open: "07:00",
        hours_6_close: "13:00",
        // Horas escritas en un día sin marcar: se ignoran.
        hours_0_open: "08:00",
        hours_0_close: "12:00",
      }),
    );

    expect(result.success).toBe(true);
    expect(result.data?.opening_hours).toEqual([
      null,
      { open: "07:00", close: "18:00" },
      null,
      null,
      null,
      null,
      { open: "07:00", close: "13:00" },
    ]);
  });

  it("rechaza un día abierto sin horas o con cierre antes de la apertura", () => {
    const missing = parseSiteConfigFormData(configForm({ hours_2_enabled: "on", hours_2_open: "07:00" }));
    expect(missing.success).toBe(false);
    expect(missing.error?.issues[0]?.path).toEqual(["opening_hours"]);
    expect(missing.error?.issues[0]?.message).toMatch(/martes/i);

    const reversed = parseSiteConfigFormData(
      configForm({ hours_3_enabled: "on", hours_3_open: "18:00", hours_3_close: "07:00" }),
    );
    expect(reversed.success).toBe(false);
    expect(reversed.error?.issues[0]?.message).toMatch(/miércoles/i);
  });
});
