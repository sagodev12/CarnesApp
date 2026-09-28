import { describe, expect, it } from "vitest";

import {
  buildOrderMessage,
  buildWhatsAppUrl,
  formatQuantity,
  formatUnit,
  normalizePhone,
} from "./whatsapp";

// Intl usa un espacio duro (U+00A0) entre "$" y el número.
const normalizeSpaces = (text: string) => text.replace(/ /g, " ");

describe("normalizePhone", () => {
  it("deja solo dígitos", () => {
    expect(normalizePhone("+57 312 362-7031")).toBe("573123627031");
  });

  it("agrega el indicativo 57 a celulares colombianos de 10 dígitos", () => {
    expect(normalizePhone("312 362 7031")).toBe("573123627031");
  });

  it("no toca números que ya tienen indicativo u otros formatos", () => {
    expect(normalizePhone("573123627031")).toBe("573123627031");
    expect(normalizePhone("6012345678")).toBe("6012345678");
  });
});

describe("buildWhatsAppUrl", () => {
  it("construye el enlace sin texto", () => {
    expect(buildWhatsAppUrl("3123627031")).toBe("https://wa.me/573123627031");
  });

  it("codifica el texto del mensaje", () => {
    expect(buildWhatsAppUrl("573123627031", "Hola & chao\n1")).toBe(
      "https://wa.me/573123627031?text=Hola%20%26%20chao%0A1",
    );
  });

  it("ignora un texto vacío o null", () => {
    expect(buildWhatsAppUrl("573123627031", "")).toBe("https://wa.me/573123627031");
    expect(buildWhatsAppUrl("573123627031", null)).toBe("https://wa.me/573123627031");
  });
});

describe("formatQuantity / formatUnit", () => {
  it("usa coma decimal", () => {
    expect(formatQuantity(1.5)).toBe("1,5");
    expect(formatQuantity(2)).toBe("2");
  });

  it("pluraliza unidades y paquetes, pero no kg/lb", () => {
    expect(formatUnit("unidad", 1)).toBe("unidad");
    expect(formatUnit("unidad", 2)).toBe("unidades");
    expect(formatUnit("paquete", 3)).toBe("paquetes");
    expect(formatUnit("kg", 2)).toBe("kg");
    expect(formatUnit(null, 2)).toBe("");
  });
});

describe("buildOrderMessage", () => {
  const lines = [
    { name: "Chata", unit: "kg", price: 32000, quantity: 1.5 },
    { name: "Chorizo", unit: "unidad", price: 12000, quantity: 2 },
  ];

  it("arma saludo, líneas con subtotal y total estimado", () => {
    expect(normalizeSpaces(buildOrderMessage("Hola, quiero pedir", lines))).toBe(
      [
        "Hola, quiero pedir",
        "",
        "• 1,5 kg de Chata — $ 48.000",
        "• 2 unidades de Chorizo — $ 24.000",
        "",
        "Total estimado: $ 72.000",
      ].join("\n"),
    );
  });

  it("usa un saludo por defecto si no hay mensaje configurado", () => {
    expect(buildOrderMessage(null, lines).split("\n")[0]).toBe(
      "Hola, quiero hacer un pedido",
    );
    expect(buildOrderMessage("   ", lines).split("\n")[0]).toBe(
      "Hola, quiero hacer un pedido",
    );
  });
});
