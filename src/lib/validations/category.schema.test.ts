import { describe, expect, it } from "vitest";

import { parseCategoryFormData } from "./category.schema";

function categoryForm(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

describe("parseCategoryFormData", () => {
  it("acepta un nombre válido y recorta espacios", () => {
    const result = parseCategoryFormData(categoryForm({ name: "  Res  ", order: "1" }));

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "Res", order: 1 });
  });

  it("usa orden 0 si no viene", () => {
    expect(parseCategoryFormData(categoryForm({ name: "Cerdo" })).data?.order).toBe(0);
  });

  it("rechaza nombres muy cortos o muy largos", () => {
    expect(parseCategoryFormData(categoryForm({ name: "A" })).success).toBe(false);
    expect(parseCategoryFormData(categoryForm({ name: "x".repeat(61) })).success).toBe(false);
  });
});
