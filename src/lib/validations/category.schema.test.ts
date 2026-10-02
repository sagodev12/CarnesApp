import { describe, expect, it } from "vitest";

import { parseCategoryFormData } from "./category.schema";

function categoryForm(fields: Record<string, string | File>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

describe("parseCategoryFormData", () => {
  it("acepta un nombre válido, recorta espacios y genera el slug", () => {
    const result = parseCategoryFormData(categoryForm({ name: "  Res Añeja  ", order: "1" }));

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: "Res Añeja",
      slug: "res-aneja",
      description: null,
      order: 1,
      image: undefined,
      remove_image: false,
    });
  });

  it("usa orden 0 si no viene", () => {
    expect(parseCategoryFormData(categoryForm({ name: "Cerdo" })).data?.order).toBe(0);
  });

  it("rechaza nombres muy cortos o muy largos", () => {
    expect(parseCategoryFormData(categoryForm({ name: "A" })).success).toBe(false);
    expect(parseCategoryFormData(categoryForm({ name: "x".repeat(61) })).success).toBe(false);
  });

  it("rechaza nombres sin letras ni números (no generan una URL)", () => {
    const result = parseCategoryFormData(categoryForm({ name: "¡¿?!" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["name"]);
  });

  it("guarda la descripción recortada y vacía como null", () => {
    expect(
      parseCategoryFormData(categoryForm({ name: "Res", description: "  Cortes finos  " })).data
        ?.description,
    ).toBe("Cortes finos");
    expect(
      parseCategoryFormData(categoryForm({ name: "Res", description: "   " })).data?.description,
    ).toBeNull();
  });

  it("limita la descripción a 200 caracteres", () => {
    const result = parseCategoryFormData(categoryForm({ name: "Res", description: "x".repeat(201) }));

    expect(result.success).toBe(false);
  });

  it("acepta una imagen y la opción de quitarla", () => {
    const image = new File(["x"], "res.webp", { type: "image/webp" });
    const result = parseCategoryFormData(
      categoryForm({ name: "Res", image, remove_image: "on" }),
    );

    expect(result.data?.image).toBeInstanceOf(File);
    expect(result.data?.remove_image).toBe(true);
  });

  it("rechaza imágenes con formato no soportado", () => {
    const image = new File(["x"], "res.gif", { type: "image/gif" });

    expect(parseCategoryFormData(categoryForm({ name: "Res", image })).success).toBe(false);
  });
});
