import { describe, expect, it } from "vitest";

import { parseOffersFormData } from "./offers.schema";

function offersForm(fields: Record<string, string | File> = {}) {
  const formData = new FormData();
  const all = { offers_style: "dark", offers_layout: "carousel", offers_limit: "12", ...fields };
  for (const [key, value] of Object.entries(all)) formData.set(key, value);
  return formData;
}

describe("parseOffersFormData", () => {
  it("lee las opciones y deja en null los textos vacíos", () => {
    const result = parseOffersFormData(
      offersForm({ offers_visible: "on", offers_eyebrow: "  ", offers_title: " Precios bajos ", offers_subtitle: "" }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      offers_visible: true,
      offers_eyebrow: null,
      offers_title: "Precios bajos",
      offers_subtitle: null,
      offers_style: "dark",
      offers_layout: "carousel",
      offers_limit: 12,
      offers_image: undefined,
      remove_offers_image: false,
    });
  });

  it("sin la casilla marcada la franja queda oculta", () => {
    expect(parseOffersFormData(offersForm()).data?.offers_visible).toBe(false);
  });

  it("rechaza estilos y formatos desconocidos", () => {
    expect(parseOffersFormData(offersForm({ offers_style: "neon" })).success).toBe(false);
    expect(parseOffersFormData(offersForm({ offers_layout: "lista" })).success).toBe(false);
  });

  it("limita la cantidad de ofertas entre 3 y 24", () => {
    expect(parseOffersFormData(offersForm({ offers_limit: "2" })).success).toBe(false);
    expect(parseOffersFormData(offersForm({ offers_limit: "25" })).success).toBe(false);
    expect(parseOffersFormData(offersForm({ offers_limit: "4.5" })).success).toBe(false);
    expect(parseOffersFormData(offersForm({ offers_limit: "24" })).data?.offers_limit).toBe(24);
  });

  it("limita la longitud de los textos", () => {
    expect(parseOffersFormData(offersForm({ offers_eyebrow: "x".repeat(41) })).success).toBe(false);
    expect(parseOffersFormData(offersForm({ offers_title: "x".repeat(61) })).success).toBe(false);
    expect(parseOffersFormData(offersForm({ offers_subtitle: "x".repeat(161) })).success).toBe(false);
  });

  it("lee la imagen de fondo y la opción de quitarla", () => {
    const image = new File(["x"], "fondo.jpg", { type: "image/jpeg" });
    const result = parseOffersFormData(offersForm({ offers_image: image, remove_offers_image: "on" }));

    expect(result.data?.offers_image).toBeInstanceOf(File);
    expect(result.data?.remove_offers_image).toBe(true);
  });
});
