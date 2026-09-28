import { describe, expect, it } from "vitest";

import { MAX_SEARCH_LENGTH, matchesSearch, normalizeSearch, searchOrFilter } from "./search";

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

describe("searchOrFilter", () => {
  it("busca en nombre o descripción sin distinguir mayúsculas", () => {
    expect(searchOrFilter("pecho")).toBe("name.ilike.%pecho%,description.ilike.%pecho%");
  });

  it("con varias palabras, busca la frase completa", () => {
    expect(searchOrFilter("punta de anca")).toBe(
      "name.ilike.%punta de anca%,description.ilike.%punta de anca%",
    );
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
