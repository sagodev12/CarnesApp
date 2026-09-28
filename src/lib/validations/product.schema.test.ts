import { describe, expect, it } from "vitest";

import { parseProductFormData, unitLabel } from "./product.schema";

const CATEGORY_ID = "4352e764-3ae0-43f0-ac77-dce1563944c7";

function productForm(overrides: Record<string, string | File | null> = {}) {
  const fields: Record<string, string | File | null> = {
    name: "Chata",
    description: "Corte premium",
    price: "32000",
    unit: "kg",
    category_id: CATEGORY_ID,
    order: "2",
    active: "on",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null) formData.set(key, value);
  }
  return formData;
}

function imageFile(size: number, type = "image/jpeg") {
  return new File([new Uint8Array(size)], "foto", { type });
}

describe("parseProductFormData", () => {
  it("acepta un producto válido y convierte los tipos", () => {
    const result = parseProductFormData(productForm());

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      name: "Chata",
      description: "Corte premium",
      price: 32000,
      unit: "kg",
      category_id: CATEGORY_ID,
      order: 2,
      active: true,
      remove_image: false,
      image: undefined,
    });
  });

  it("guarda la descripción vacía como string vacío (la columna es NOT NULL)", () => {
    const result = parseProductFormData(productForm({ description: "   " }));

    expect(result.success).toBe(true);
    expect(result.data?.description).toBe("");
  });

  it("usa orden 0 si viene vacío y sin categoría si no se elige", () => {
    const result = parseProductFormData(productForm({ order: "", category_id: "" }));

    expect(result.data?.order).toBe(0);
    expect(result.data?.category_id).toBeNull();
  });

  it("marca inactivo cuando el checkbox no viene", () => {
    expect(parseProductFormData(productForm({ active: null })).data?.active).toBe(false);
  });

  it("rechaza orden negativo o decimal", () => {
    expect(parseProductFormData(productForm({ order: "-1" })).success).toBe(false);
    expect(parseProductFormData(productForm({ order: "1.5" })).success).toBe(false);
  });

  it("rechaza nombre corto, precio inválido y unidad desconocida", () => {
    const result = parseProductFormData(
      productForm({ name: "A", price: "0", unit: "tonelada" }),
    );

    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["name", "price", "unit"]));
  });

  it("ignora el input de archivo vacío", () => {
    const result = parseProductFormData(productForm({ image: imageFile(0) }));

    expect(result.success).toBe(true);
    expect(result.data?.image).toBeUndefined();
  });

  it("rechaza imágenes de más de 4 MB o de formato no soportado", () => {
    expect(
      parseProductFormData(productForm({ image: imageFile(4 * 1024 * 1024 + 1) })).success,
    ).toBe(false);
    expect(
      parseProductFormData(productForm({ image: imageFile(10, "image/gif") })).success,
    ).toBe(false);
  });

  it("lee la opción de quitar imagen", () => {
    expect(
      parseProductFormData(productForm({ remove_image: "on" })).data?.remove_image,
    ).toBe(true);
  });
});

describe("parseProductFormData · promoción", () => {
  it("sin precio promo guarda la promoción vacía", () => {
    const result = parseProductFormData(productForm());

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      sale_price: null,
      sale_starts_at: null,
      sale_ends_at: null,
    });
  });

  it("acepta precio promo sin fechas", () => {
    const result = parseProductFormData(productForm({ sale_price: "28000" }));

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ sale_price: 28000, sale_starts_at: null, sale_ends_at: null });
  });

  it("convierte las fechas a hora de Colombia (fin inclusivo)", () => {
    const result = parseProductFormData(
      productForm({
        sale_price: "28000",
        sale_starts_at: "2026-10-01",
        sale_ends_at: "2026-10-31",
      }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      sale_starts_at: "2026-10-01T05:00:00.000Z",
      sale_ends_at: "2026-11-01T05:00:00.000Z",
    });
  });

  it("acepta una promoción de un solo día", () => {
    const result = parseProductFormData(
      productForm({ sale_price: "28000", sale_starts_at: "2026-10-01", sale_ends_at: "2026-10-01" }),
    );

    expect(result.success).toBe(true);
  });

  it("rechaza un precio promo igual o mayor al normal", () => {
    const result = parseProductFormData(productForm({ sale_price: "32000" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["sale_price"]);
  });

  it("rechaza un precio promo no positivo", () => {
    expect(parseProductFormData(productForm({ sale_price: "0" })).success).toBe(false);
  });

  it("rechaza un fin anterior al inicio", () => {
    const result = parseProductFormData(
      productForm({ sale_price: "28000", sale_starts_at: "2026-10-10", sale_ends_at: "2026-10-01" }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["sale_ends_at"]);
  });

  it("rechaza fechas con formato inválido", () => {
    expect(
      parseProductFormData(productForm({ sale_price: "28000", sale_starts_at: "01/10/2026" })).success,
    ).toBe(false);
  });

  it("ignora las fechas si no hay precio promo", () => {
    const result = parseProductFormData(
      productForm({ sale_starts_at: "2026-10-01", sale_ends_at: "2026-10-31" }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ sale_price: null, sale_starts_at: null, sale_ends_at: null });
  });
});

describe("unitLabel", () => {
  it("traduce la unidad a texto en minúscula", () => {
    expect(unitLabel("kg")).toBe("kilo");
    expect(unitLabel("unidad")).toBe("unidad");
  });

  it("devuelve la unidad tal cual si no es conocida, o vacío si no hay", () => {
    expect(unitLabel("caja")).toBe("caja");
    expect(unitLabel(null)).toBe("");
  });
});
