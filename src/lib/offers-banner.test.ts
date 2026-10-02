import { describe, expect, it } from "vitest";

import { offersBanner } from "./offers-banner";
import { withSiteConfigDefaults } from "./site-config/defaults";

describe("offersBanner", () => {
  it("sin configuración usa la franja oscura en carrusel con los textos de siempre", () => {
    expect(offersBanner(withSiteConfigDefaults(null))).toEqual({
      visible: true,
      eyebrow: "Por tiempo limitado",
      title: "Ofertas",
      subtitle: null,
      style: "dark",
      imageUrl: null,
      layout: "carousel",
      limit: 12,
    });
  });

  it("respeta los textos y opciones guardados", () => {
    const config = withSiteConfigDefaults({
      offers_visible: false,
      offers_eyebrow: "Solo este fin de semana",
      offers_title: "Precios de locura",
      offers_subtitle: "Hasta agotar existencias",
      offers_style: "brand",
      offers_layout: "grid",
      offers_limit: 6,
    });

    expect(offersBanner(config)).toMatchObject({
      visible: false,
      eyebrow: "Solo este fin de semana",
      title: "Precios de locura",
      subtitle: "Hasta agotar existencias",
      style: "brand",
      layout: "grid",
      limit: 6,
    });
  });

  it("el estilo con imagen sin imagen guardada vuelve al oscuro", () => {
    const config = withSiteConfigDefaults({ offers_style: "image" });

    expect(offersBanner(config).style).toBe("dark");
  });

  it("usa la imagen cuando el estilo es con imagen", () => {
    const config = withSiteConfigDefaults({ offers_style: "image", offers_image_url: "https://x/fondo.jpg" });

    expect(offersBanner(config)).toMatchObject({ style: "image", imageUrl: "https://x/fondo.jpg" });
  });

  it("descarta valores guardados inválidos", () => {
    const config = withSiteConfigDefaults({
      offers_style: "neon" as never,
      offers_layout: "lista" as never,
      offers_limit: 500,
    });

    expect(offersBanner(config)).toMatchObject({ style: "dark", layout: "carousel", limit: 24 });
  });
});
