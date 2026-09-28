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
});
