import { describe, expect, it } from "vitest";

import {
  addToOrder,
  decrementInOrder,
  orderLines,
  orderTotal,
  parseStoredOrder,
  removeFromOrder,
  stepFor,
  syncOrder,
  type OrderProduct,
} from "./order";

const chata: OrderProduct = { id: "chata", name: "Chata", unit: "kg", price: 32000 };
const chorizo: OrderProduct = { id: "chorizo", name: "Chorizo", unit: "unidad", price: 12000 };

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
  it("guarda una copia del producto con la cantidad según su unidad", () => {
    let order = addToOrder({}, chata);
    expect(order).toEqual({ chata: { ...chata, quantity: 0.5 } });

    order = addToOrder(order, chata);
    order = addToOrder(order, chorizo);
    expect(order.chata.quantity).toBe(1);
    expect(order.chorizo).toEqual({ ...chorizo, quantity: 1 });
  });

  it("actualiza la copia si el producto cambió (p. ej. el precio)", () => {
    const order = addToOrder({}, chata);
    const updated = addToOrder(order, { ...chata, price: 35000 });

    expect(updated.chata).toEqual({ ...chata, price: 35000, quantity: 1 });
  });

  it("no muta el pedido original", () => {
    const order = addToOrder({}, chata);
    addToOrder(order, chata);
    expect(order.chata.quantity).toBe(0.5);
  });

  it("resta el paso y quita el producto al llegar a 0", () => {
    const order = { chata: { ...chata, quantity: 1 }, chorizo: { ...chorizo, quantity: 1 } };

    expect(decrementInOrder(order, chata).chata.quantity).toBe(0.5);
    expect(decrementInOrder(decrementInOrder(order, chata), chata)).toEqual({
      chorizo: order.chorizo,
    });
    expect(decrementInOrder({}, chata)).toEqual({});
  });
});

describe("removeFromOrder", () => {
  it("quita el producto sin importar la cantidad", () => {
    const order = { chata: { ...chata, quantity: 2.5 }, chorizo: { ...chorizo, quantity: 1 } };
    expect(removeFromOrder(order, chata)).toEqual({ chorizo: order.chorizo });
  });

  it("devuelve el mismo pedido si el producto no estaba", () => {
    const order = { chorizo: { ...chorizo, quantity: 1 } };
    expect(removeFromOrder(order, chata)).toBe(order);
  });
});

describe("syncOrder", () => {
  const order = {
    chata: { ...chata, quantity: 1.3 },
    chorizo: { ...chorizo, quantity: 2 },
  };

  it("actualiza las copias con los datos frescos y ajusta la cantidad al paso", () => {
    const synced = syncOrder(order, [{ ...chata, price: 30000 }], { dropMissing: false });

    expect(synced.chata).toEqual({ ...chata, price: 30000, quantity: 1.5 });
    expect(synced.chorizo).toEqual(order.chorizo);
  });

  it("con dropMissing quita los productos que ya no están disponibles", () => {
    expect(syncOrder(order, [chata], { dropMissing: true })).toEqual({
      chata: { ...chata, quantity: 1.5 },
    });
  });
});

describe("parseStoredOrder", () => {
  it("lee un pedido guardado válido", () => {
    const raw = JSON.stringify({ chata: { ...chata, quantity: 1.5 } });
    expect(parseStoredOrder(raw)).toEqual({ chata: { ...chata, quantity: 1.5 } });
  });

  it("descarta solo los productos con forma inválida", () => {
    const raw = JSON.stringify({
      chata: { ...chata, quantity: 1.5 },
      roto: { id: "roto", name: 3, unit: "kg", price: 1, quantity: 1 },
      sinCantidad: { ...chorizo, quantity: 0 },
    });
    expect(Object.keys(parseStoredOrder(raw))).toEqual(["chata"]);
  });

  it("devuelve un pedido vacío si el contenido es inválido o del formato anterior", () => {
    expect(parseStoredOrder(null)).toEqual({});
    expect(parseStoredOrder("no json")).toEqual({});
    expect(parseStoredOrder("[1,2]")).toEqual({});
    expect(parseStoredOrder('{"chata":1.5}')).toEqual({});
  });
});

describe("orderLines / orderTotal", () => {
  it("lista los productos en el orden en que se agregaron y calcula el total", () => {
    const order = addToOrder(addToOrder(addToOrder(addToOrder({}, chorizo), chorizo), chata), chata);
    const lines = orderLines(order);

    expect(lines.map((line) => [line.id, line.quantity])).toEqual([
      ["chorizo", 2],
      ["chata", 1],
    ]);
    expect(orderTotal(lines)).toBe(56000);
  });
});
