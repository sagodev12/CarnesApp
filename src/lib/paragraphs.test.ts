import { describe, expect, it } from "vitest";

import { toParagraphs } from "./paragraphs";

describe("toParagraphs", () => {
  it("separa los párrafos por líneas en blanco", () => {
    expect(toParagraphs("Empezamos en 1998.\n\nHoy seguimos igual.")).toEqual([
      "Empezamos en 1998.",
      "Hoy seguimos igual.",
    ]);
  });

  it("conserva los saltos de línea simples dentro de un párrafo", () => {
    expect(toParagraphs("Línea uno\nLínea dos")).toEqual(["Línea uno\nLínea dos"]);
  });

  it("ignora espacios y líneas en blanco de más (también con \\r\\n)", () => {
    expect(toParagraphs("  Uno  \r\n \r\n\r\n  Dos \n\n\n")).toEqual(["Uno", "Dos"]);
  });

  it("devuelve una lista vacía sin texto", () => {
    expect(toParagraphs(null)).toEqual([]);
    expect(toParagraphs("   ")).toEqual([]);
  });
});
