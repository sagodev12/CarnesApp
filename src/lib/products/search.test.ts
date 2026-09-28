import { describe, expect, it } from "vitest";

import { MAX_SEARCH_LENGTH, matchesSearch, normalizeSearch, searchPage } from "./search";

describe("normalizeSearch", () => {
  it("recorta y une espacios repetidos", () => {
    expect(normalizeSearch("  punta   de  anca ")).toBe("punta de anca");
  });

  it("quita símbolos que romperían el filtro (comodines, comas, paréntesis)", () => {
    expect(normalizeSearch("res%_,(pecho)*\\\"")).toBe("res pecho");
  });

  it("conserva tildes, ñ, números y guiones", () => {
    expect(normalizeSearch("Salmón 1-A piña")).toBe("Salmón 1-A piña");
  });

  it("ignora búsquedas de menos de 2 caracteres o vacías", () => {
    expect(normalizeSearch("a")).toBeNull();
    expect(normalizeSearch("  %% ")).toBeNull();
    expect(normalizeSearch(null)).toBeNull();
  });

  it("corta búsquedas demasiado largas", () => {
    expect(normalizeSearch("x".repeat(200))).toHaveLength(MAX_SEARCH_LENGTH);
  });
});

describe("matchesSearch", () => {
  const product = { name: "Filete de Salmón", description: "Fresco del Pacífico" };

  it("compara sin tildes ni mayúsculas en nombre y descripción", () => {
    expect(matchesSearch(product, "salmon")).toBe(true);
    expect(matchesSearch(product, "PACIFICO")).toBe(true);
    expect(matchesSearch(product, "cerdo")).toBe(false);
  });

  it("sin búsqueda, todo coincide", () => {
    expect(matchesSearch(product, null)).toBe(true);
  });
});

describe("searchPage", () => {
  const items = Array.from({ length: 30 }, (_, i) => ({
    name: i % 3 === 0 ? `Salmón ${i}` : `Res ${i}`,
    description: "",
  }));

  it("filtra sin tildes y pagina el resultado", () => {
    const first = searchPage(items, "salmon", 1, 4);

    expect(first.total).toBe(10);
    expect(first.items.map((item) => item.name)).toEqual(["Salmón 0", "Salmón 3", "Salmón 6", "Salmón 9"]);
    expect(first).toMatchObject({ page: 1, totalPages: 3, hasMore: true });

    const last = searchPage(items, "salmon", 3, 4);
    expect(last.items).toHaveLength(2);
    expect(last.hasMore).toBe(false);
  });

  it("sin coincidencias devuelve una página vacía", () => {
    expect(searchPage(items, "pollo", 1, 4)).toMatchObject({ items: [], total: 0, hasMore: false });
  });
});
