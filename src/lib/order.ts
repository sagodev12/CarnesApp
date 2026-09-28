// Lógica pura del pedido de la galería (sin React ni localStorage) para
// poder probarla aislada. El pedido es un mapa { productId: cantidad }.
export type Order = Record<string, number>;

export type OrderProduct = {
  id: string;
  name: string;
  unit: string | null;
  price: number;
};

export type OrderLineItem = OrderProduct & { quantity: number };

const WEIGHT_UNITS = new Set(["kg", "lb"]);

export function stepFor(unit: string | null) {
  return unit && WEIGHT_UNITS.has(unit) ? 0.5 : 1;
}

// Redondea al múltiplo más cercano del paso (evita 0.1 + 0.2 = 0.30000000000000004).
function roundToStep(quantity: number, step: number) {
  return Math.round(quantity / step) * step;
}

export function addToOrder(order: Order, product: OrderProduct): Order {
  const step = stepFor(product.unit);
  const quantity = roundToStep((order[product.id] ?? 0) + step, step);

  return { ...order, [product.id]: quantity };
}

export function removeFromOrder(order: Order, product: OrderProduct): Order {
  if (!(product.id in order)) return order;

  const rest = { ...order };
  delete rest[product.id];
  return rest;
}

export function decrementInOrder(order: Order, product: OrderProduct): Order {
  const current = order[product.id];
  if (current === undefined) return order;

  const step = stepFor(product.unit);
  const quantity = roundToStep(current - step, step);

  return quantity > 0 ? { ...order, [product.id]: quantity } : removeFromOrder(order, product);
}

// Limpia un pedido guardado: quita productos que ya no están disponibles y
// cantidades inválidas, y ajusta cada cantidad al paso de su unidad.
export function sanitizeOrder(order: Order, products: OrderProduct[]): Order {
  const byId = new Map(products.map((product) => [product.id, product]));
  const clean: Order = {};

  for (const [id, rawQuantity] of Object.entries(order)) {
    const product = byId.get(id);
    if (!product || !Number.isFinite(rawQuantity)) continue;

    const quantity = roundToStep(rawQuantity, stepFor(product.unit));
    if (quantity > 0) clean[id] = quantity;
  }

  return clean;
}

export function parseStoredOrder(raw: string | null): Order {
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const entries = Object.entries(parsed);
    if (!entries.every(([, value]) => typeof value === "number")) return {};

    return Object.fromEntries(entries) as Order;
  } catch {
    return {};
  }
}

export function orderLines(order: Order, products: OrderProduct[]): OrderLineItem[] {
  return products
    .filter((product) => order[product.id] > 0)
    .map(({ id, name, unit, price }) => ({ id, name, unit, price, quantity: order[id] }));
}

export function orderTotal(lines: Pick<OrderLineItem, "price" | "quantity">[]) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
