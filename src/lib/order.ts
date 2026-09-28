// Lógica pura del pedido de la galería (sin React ni localStorage) para
// poder probarla aislada. Con la galería paginada, el pedido guarda una copia
// de cada producto: así puede mostrar productos de páginas no cargadas.
export type OrderProduct = {
  id: string;
  name: string;
  unit: string | null;
  price: number;
};

// note: indicación del cliente para ese producto ("en bistec", "molida"…).
export type OrderItem = OrderProduct & { quantity: number; note?: string };
export type Order = Record<string, OrderItem>;

const WEIGHT_UNITS = new Set(["kg", "lb"]);
export const MAX_NOTE_LENGTH = 100;

export function stepFor(unit: string | null) {
  return unit && WEIGHT_UNITS.has(unit) ? 0.5 : 1;
}

// Redondea al múltiplo más cercano del paso (evita 0.1 + 0.2 = 0.30000000000000004).
function roundToStep(quantity: number, step: number) {
  return Math.round(quantity / step) * step;
}

function snapshot({ id, name, unit, price }: OrderProduct): OrderProduct {
  return { id, name, unit, price };
}

// La indicación sobrevive a los cambios de cantidad y a la sincronización.
function keepNote(item: OrderItem | undefined) {
  return item?.note ? { note: item.note } : {};
}

export function addToOrder(order: Order, product: OrderProduct): Order {
  const step = stepFor(product.unit);
  const quantity = roundToStep((order[product.id]?.quantity ?? 0) + step, step);

  return {
    ...order,
    [product.id]: { ...snapshot(product), quantity, ...keepNote(order[product.id]) },
  };
}

export function removeFromOrder(order: Order, product: Pick<OrderProduct, "id">): Order {
  if (!(product.id in order)) return order;

  const rest = { ...order };
  delete rest[product.id];
  return rest;
}

export function decrementInOrder(order: Order, product: OrderProduct): Order {
  const current = order[product.id];
  if (!current) return order;

  const step = stepFor(current.unit);
  const quantity = roundToStep(current.quantity - step, step);

  return quantity > 0
    ? { ...order, [product.id]: { ...current, quantity } }
    : removeFromOrder(order, product);
}

// Actualiza las copias con datos frescos del servidor. Con dropMissing, quita
// los productos que ya no llegaron (inactivos o eliminados).
export function syncOrder(
  order: Order,
  fresh: OrderProduct[],
  { dropMissing }: { dropMissing: boolean },
): Order {
  const byId = new Map(fresh.map((product) => [product.id, product]));
  const synced: Order = {};

  for (const [id, item] of Object.entries(order)) {
    const product = byId.get(id);
    if (!product && dropMissing) continue;

    const base = product ? snapshot(product) : snapshot(item);
    const quantity = roundToStep(item.quantity, stepFor(base.unit));
    if (quantity > 0) synced[id] = { ...base, quantity, ...keepNote(item) };
  }

  return synced;
}

export function setNote(order: Order, id: string, note: string): Order {
  const current = order[id];
  if (!current) return order;

  // Se guarda tal cual (el cliente la escribe letra a letra, con espacios);
  // el mensaje de WhatsApp la recorta.
  const item: OrderItem = { ...current };
  if (note.trim()) item.note = note.slice(0, MAX_NOTE_LENGTH);
  else delete item.note;
  return { ...order, [id]: item };
}

function isOrderItem(value: unknown): value is OrderItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    (typeof item.unit === "string" || item.unit === null) &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0 &&
    (item.note === undefined || typeof item.note === "string")
  );
}

export function parseStoredOrder(raw: string | null): Order {
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const order: Order = {};
    for (const [id, item] of Object.entries(parsed)) {
      if (isOrderItem(item) && item.id === id) order[id] = item;
    }
    return order;
  } catch {
    return {};
  }
}

export function orderLines(order: Order): OrderItem[] {
  return Object.values(order);
}

export function orderTotal(lines: Pick<OrderItem, "price" | "quantity">[]) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
