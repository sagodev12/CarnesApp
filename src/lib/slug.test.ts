import { describe, expect, it } from "vitest";

import { slugify } from "./slug";

describe("slugify", () => {
  it("pasa a minúsculas y une las palabras con guiones", () => {
    expect(slugify("Res Premium")).toBe("res-premium");
  });

  it("quita tildes y cambia la ñ por n", () => {
    expect(slugify("Ñandú Pequeño Salmón")).toBe("nandu-pequeno-salmon");
  });

  it("colapsa símbolos y espacios repetidos en un solo guion", () => {
    expect(slugify("Pollo  &  Aves / Granja")).toBe("pollo-aves-granja");
  });

  it("no deja guiones al inicio ni al final", () => {
    expect(slugify("  ¡Ofertas!  ")).toBe("ofertas");
  });

  it("conserva los números", () => {
    expect(slugify("Combo 2x1")).toBe("combo-2x1");
  });

  it("devuelve vacío si no queda nada utilizable", () => {
    expect(slugify("¡¿?!")).toBe("");
  });
});
