import { describe, expect, it } from "vitest";

import { brandHighlight, footerText, hasAboutPage, withSiteConfigDefaults } from "./defaults";

describe("withSiteConfigDefaults", () => {
  it("devuelve valores por defecto si no hay fila", () => {
    const config = withSiteConfigDefaults(null);

    expect(config.id).toBeNull();
    expect(config.business_name).toBeTruthy();
    expect(config.phone_whatsapp).toBe("");
    expect(config.primary_color).toBe("#9a3324");
    expect(config.latitude).toBeNull();
    expect(config.longitude).toBeNull();
    expect(config.opening_hours).toBeNull();
    expect(config.footer_text).toBeNull();
    expect(config.about_title).toBeNull();
    expect(config.about_text).toBeNull();
    expect(config.about_image_url).toBeNull();
  });

  it("descarta un horario guardado con forma inválida", () => {
    expect(withSiteConfigDefaults({ opening_hours: "todos los días" as never }).opening_hours).toBeNull();
  });

  it("conserva una ubicación guardada, incluso en cero", () => {
    expect(withSiteConfigDefaults({ latitude: 0, longitude: -74.08 })).toMatchObject({
      latitude: 0,
      longitude: -74.08,
    });
  });

  it("respeta los valores guardados y completa los nulos", () => {
    const config = withSiteConfigDefaults({
      id: "1",
      business_name: "Surticarnes del Fonce",
      phone_whatsapp: "573123627031",
      primary_color: null,
      whatsapp_message: null,
    });

    expect(config).toMatchObject({
      id: "1",
      business_name: "Surticarnes del Fonce",
      phone_whatsapp: "573123627031",
      primary_color: "#9a3324",
      whatsapp_message: "Hola, quiero hacer un pedido",
      logo_url: null,
    });
  });

  it("ignora un color guardado inválido", () => {
    expect(withSiteConfigDefaults({ primary_color: "red" }).primary_color).toBe("#9a3324");
  });
});

describe("footerText", () => {
  it("usa el texto propio del footer si existe", () => {
    const config = withSiteConfigDefaults({ description: "Eslogan", footer_text: "Desde 1998" });

    expect(footerText(config)).toBe("Desde 1998");
  });

  it("si no hay texto del footer usa el eslogan de la portada", () => {
    expect(footerText(withSiteConfigDefaults({ description: "Eslogan" }))).toBe("Eslogan");
    expect(footerText(withSiteConfigDefaults(null))).toBeNull();
  });
});

describe("hasAboutPage", () => {
  it("solo hay página Nosotros si se escribió la historia", () => {
    expect(hasAboutPage(withSiteConfigDefaults({ about_text: "Empezamos en 1998." }))).toBe(true);
    expect(hasAboutPage(withSiteConfigDefaults({ about_title: "Nosotros" }))).toBe(false);
    expect(hasAboutPage(withSiteConfigDefaults(null))).toBe(false);
  });
});

describe("brandHighlight", () => {
  it("resalta la última palabra de nombres de varias palabras", () => {
    expect(brandHighlight("Surticarnes del Fonce")).toBe("Fonce");
  });

  it("no resalta nada en nombres de una sola palabra", () => {
    expect(brandHighlight("Surticarnes")).toBeUndefined();
    expect(brandHighlight("  ")).toBeUndefined();
  });
});
