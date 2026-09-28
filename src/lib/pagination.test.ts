import { describe, expect, it } from "vitest";

import { pageRange, pageWindow, paginated, parsePage } from "./pagination";

describe("parsePage", () => {
  it("lee números de página válidos", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(2)).toBe(2);
  });

  it("usa la página 1 ante valores inválidos", () => {
    for (const value of [undefined, null, "", "0", "-2", "abc", "1.5", ["2"]]) {
      expect(parsePage(value)).toBe(1);
    }
  });

  it("limita páginas absurdamente altas", () => {
    expect(parsePage("999999")).toBe(1000);
  });
});

describe("pageRange", () => {
  it("calcula el rango inclusivo para Supabase", () => {
    expect(pageRange(1, 12)).toEqual({ from: 0, to: 11 });
    expect(pageRange(3, 12)).toEqual({ from: 24, to: 35 });
  });
});

describe("paginated", () => {
  it("arma el resultado con total de páginas y si hay más", () => {
    expect(paginated(["a", "b"], 14, 1, 12)).toEqual({
      items: ["a", "b"],
      total: 14,
      page: 1,
      pageSize: 12,
      totalPages: 2,
      hasMore: true,
    });
    expect(paginated([], 0, 1, 12)).toMatchObject({ totalPages: 1, hasMore: false });
    expect(paginated(["a"], 13, 2, 12).hasMore).toBe(false);
  });
});

describe("pageWindow", () => {
  it("muestra todas las páginas cuando son pocas", () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("recorta con puntos suspensivos alrededor de la página actual", () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, "…", 20]);
    expect(pageWindow(10, 20)).toEqual([1, "…", 9, 10, 11, "…", 20]);
    expect(pageWindow(20, 20)).toEqual([1, "…", 19, 20]);
  });

  it("no pone puntos cuando el hueco es de una sola página", () => {
    expect(pageWindow(4, 20)).toEqual([1, 2, 3, 4, 5, "…", 20]);
  });
});
