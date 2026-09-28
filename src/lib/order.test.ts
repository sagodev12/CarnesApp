import { describe, expect, it } from "vitest";

import {
  addToOrder,
  decrementInOrder,
  orderLines,
  orderTotal,
  parseStoredOrder,
  removeFromOrder,
  sanitizeOrder,
  stepFor,
  type OrderProduct,
} from "./order";

const chata: OrderProduct = { id: "chata", name: "Chata", unit: "kg", price: 32000 };
const chorizo: OrderProduct = { id: "chorizo", name: "Chorizo", unit: "unidad", price: 12000 };
const products = [chata, chorizo];

describe("stepFor", () => {
  it("avanza de 0,5 en productos por peso y de 1 en el resto", () => {
    expect(stepFor("kg")).toBe(0.5);
    expect(stepFor("lb")).toBe(0.5);
    expect(stepFor("unidad")).toBe(1);
    expect(stepFor("paquete")).toBe(1);
    expect(stepFor(null)).toBe(1);
  });
});

describe("addToOrder / decrementInOrder", () => {
  it("agrega con el paso de la unidad y suma al repetir", () => {
    let order = addToOrder({}, chata);
    expect(order).toEqual({ chata: 0.5 });

    order = addToOrder(order, chata);
    order = addToOrder(order, chorizo);
    expect(order).toEqual({ chata: 1, chorizo: 1 });
  });

  it("no muta el pedido original", () => {
    const order = { chata: 1 };
    addToOrder(order, chata);
    expect(order).toEqual({ chata: 1 });
  });

  it("resta el paso y quita el producto al llegar a 0", () => {
    expect(decrementInOrder({ chata: 1 }, chata)).toEqual({ chata: 0.5 });
    expect(decrementInOrder({ chata: 0.5, chorizo: 1 }, chata)).toEqual({ chorizo: 1 });
    expect(decrementInOrder({}, chata)).toEqual({});
  });
});

describe("removeFromOrder", () => {
  it("quita el producto sin importar la cantidad", () => {
    expect(removeFromOrder({ chata: 2.5, chorizo: 1 }, chata)).toEqual({ chorizo: 1 });
  });

  it("devuelve el mismo pedido si el producto no estaba", () => {
    const order = { chorizo: 1 };
    expect(removeFromOrder(order, chata)).toBe(order);
  });
});

describe("sanitizeOrder", () => {
  it("descarta productos que ya no existen y cantidades inválidas", () => {
    expect(
      sanitizeOrder({ chata: 1, borrado: 2, chorizo: -1 }, products),
    ).toEqual({ chata: 1 });
    expect(sanitizeOrder({ chata: Number.NaN }, products)).toEqual({});
  });

  it("ajusta la cantidad al paso de la unidad", () => {
    expect(sanitizeOrder({ chata: 1.3, chorizo: 2.7 }, products)).toEqual({
      chata: 1.5,
      chorizo: 3,
    });
  });
});

describe("parseStoredOrder", () => {
  it("lee un pedido guardado válido", () => {
    expect(parseStoredOrder('{"chata":1.5}')).toEqual({ chata: 1.5 });
  });

  it("devuelve un pedido vacío si el contenido es inválido", () => {
    expect(parseStoredOrder(null)).toEqual({});
    expect(parseStoredOrder("no json")).toEqual({});
    expect(parseStoredOrder("[1,2]")).toEqual({});
    expect(parseStoredOrder('{"chata":"mucho"}')).toEqual({});
  });
});

describe("orderLines / orderTotal", () => {
  it("genera las líneas en el orden de los productos y calcula el total", () => {
    const lines = orderLines({ chorizo: 2, chata: 1.5 }, products);

    expect(lines).toEqual([
      { id: "chata", name: "Chata", unit: "kg", price: 32000, quantity: 1.5 },
      { id: "chorizo", name: "Chorizo", unit: "unidad", price: 12000, quantity: 2 },
    ]);
    expect(orderTotal(lines)).toBe(72000);
  });
});
