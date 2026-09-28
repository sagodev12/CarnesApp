import { describe, expect, it } from "vitest";

import { MAX_IDS, parseProductQuery, productsApiUrl } from "./query-params";

const A = "4352e764-3ae0-43f0-ac77-dce1563944c7";
const B = "95df0591-f9a7-418c-8e9b-1673a057d5d2";

const query = (value: string) => parseProductQuery(new URLSearchParams(value));

describe("parseProductQuery", () => {
  it("por defecto pide la página 1 sin filtro", () => {
    expect(query("")).toEqual({ mode: "page", page: 1, categoryId: null });
  });

  it("lee página y categoría", () => {
    expect(query(`pagina=3&categoria=${A}`)).toEqual({
      mode: "page",
      page: 3,
      categoryId: A,
    });
  });

  it("rechaza una categoría que no es uuid", () => {
    expect(query("categoria=res")).toBeNull();
  });

  it("lee una lista de ids sin duplicados", () => {
    expect(query(`ids=${A},${B},${A}`)).toEqual({ mode: "ids", ids: [A, B] });
  });

  it("rechaza ids inválidos o demasiados", () => {
    expect(query(`ids=${A},hola`)).toBeNull();
    expect(query("ids=")).toBeNull();

    const many = Array.from({ length: MAX_IDS + 1 }, (_, i) =>
      `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    );
    expect(query(`ids=${many.join(",")}`)).toBeNull();
  });
});

describe("productsApiUrl", () => {
  it("omite los parámetros por defecto", () => {
    expect(productsApiUrl({ page: 1, categoryId: null })).toBe("/api/products");
  });

  it("incluye página y categoría, y es inverso de parseProductQuery", () => {
    const url = productsApiUrl({ page: 2, categoryId: A });

    expect(url).toBe(`/api/products?pagina=2&categoria=${A}`);
    expect(parseProductQuery(new URL(url, "http://x").searchParams)).toEqual({
      mode: "page",
      page: 2,
      categoryId: A,
    });
  });
});
