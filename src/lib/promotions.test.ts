import { describe, expect, it } from "vitest";

import {
  discountPercent,
  effectivePrice,
  formatSaleWindow,
  fromBusinessDate,
  isOnSale,
  promotionStatus,
  toBusinessDate,
  toOrderProduct,
} from "./promotions";

const NOW = new Date("2026-10-15T12:00:00.000Z");

function product(overrides: Partial<Parameters<typeof promotionStatus>[0]> = {}) {
  return {
    price: 40000,
    sale_price: 30000 as number | null,
    sale_starts_at: null as string | null,
    sale_ends_at: null as string | null,
    ...overrides,
  };
}

describe("promotionStatus", () => {
  it("sin precio promo no hay promoción", () => {
    expect(promotionStatus(product({ sale_price: null }), NOW)).toBe("none");
  });

  it("un precio promo igual o mayor al normal no cuenta como promoción", () => {
    expect(promotionStatus(product({ sale_price: 40000 }), NOW)).toBe("none");
    expect(promotionStatus(product({ sale_price: 45000 }), NOW)).toBe("none");
  });

  it("sin fechas la promoción está activa", () => {
    expect(promotionStatus(product(), NOW)).toBe("active");
  });

  it("antes del inicio está programada", () => {
    expect(
      promotionStatus(product({ sale_starts_at: "2026-10-16T05:00:00+00:00" }), NOW),
    ).toBe("scheduled");
  });

  it("dentro del rango está activa (el inicio es inclusivo)", () => {
    const p = product({
      sale_starts_at: "2026-10-15T12:00:00.000Z",
      sale_ends_at: "2026-10-20T05:00:00.000Z",
    });
    expect(promotionStatus(p, NOW)).toBe("active");
  });

  it("desde el fin está vencida (el fin es exclusivo)", () => {
    expect(
      promotionStatus(product({ sale_ends_at: "2026-10-15T12:00:00.000Z" }), NOW),
    ).toBe("expired");
  });
});

describe("isOnSale / effectivePrice", () => {
  it("usa el precio promo solo mientras la promoción está activa", () => {
    expect(isOnSale(product(), NOW)).toBe(true);
    expect(effectivePrice(product(), NOW)).toBe(30000);

    const expired = product({ sale_ends_at: "2026-10-01T05:00:00.000Z" });
    expect(isOnSale(expired, NOW)).toBe(false);
    expect(effectivePrice(expired, NOW)).toBe(40000);
  });
});

describe("discountPercent", () => {
  it("redondea el porcentaje de descuento", () => {
    expect(discountPercent(40000, 30000)).toBe(25);
    expect(discountPercent(30000, 20000)).toBe(33);
  });
});

describe("fechas del negocio (hora de Colombia, UTC-5)", () => {
  it("el inicio es la medianoche de ese día en Colombia", () => {
    expect(fromBusinessDate("2026-10-01")).toBe("2026-10-01T05:00:00.000Z");
  });

  it("el fin es la medianoche del día siguiente (el último día cuenta entero)", () => {
    expect(fromBusinessDate("2026-10-31", { end: true })).toBe("2026-11-01T05:00:00.000Z");
  });

  it("convierte de vuelta a la fecha del formulario", () => {
    expect(toBusinessDate("2026-10-01T05:00:00+00:00")).toBe("2026-10-01");
    expect(toBusinessDate("2026-11-01T05:00:00+00:00", { end: true })).toBe("2026-10-31");
  });

  it("sin fecha devuelve vacío", () => {
    expect(toBusinessDate(null)).toBe("");
  });
});

describe("toOrderProduct", () => {
  it("copia el producto con el precio vigente", () => {
    const p = { id: "a", name: "Chata", unit: "kg", ...product(), extra: true };

    expect(toOrderProduct(p, NOW)).toEqual({ id: "a", name: "Chata", unit: "kg", price: 30000 });
    expect(toOrderProduct({ ...p, sale_price: null }, NOW).price).toBe(40000);
  });
});

describe("formatSaleWindow", () => {
  const start = "2026-10-01T05:00:00+00:00";
  const end = "2026-11-01T05:00:00+00:00"; // exclusivo: el último día es el 31

  it("describe la vigencia en hora de Colombia", () => {
    expect(formatSaleWindow({ sale_starts_at: start, sale_ends_at: end })).toBe("1 de oct – 31 de oct");
    expect(formatSaleWindow({ sale_starts_at: null, sale_ends_at: end })).toBe("Hasta el 31 de oct");
    expect(formatSaleWindow({ sale_starts_at: start, sale_ends_at: null })).toBe("Desde el 1 de oct");
    expect(formatSaleWindow({ sale_starts_at: null, sale_ends_at: null })).toBe("Sin fecha límite");
  });
});
