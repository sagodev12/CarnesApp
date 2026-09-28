// Lógica pura de las promociones por producto (sin React ni Supabase).
// Una promoción es un precio rebajado con vigencia opcional: sin inicio =
// desde ya; sin fin = hasta que se quite. El inicio es inclusivo y el fin
// exclusivo.
import type { OrderProduct } from "./order";

export type SaleFields = {
  price: number;
  sale_price: number | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
};

export type PromotionStatus = "none" | "scheduled" | "active" | "expired";

export function promotionStatus(product: SaleFields, now: Date): PromotionStatus {
  const { price, sale_price, sale_starts_at, sale_ends_at } = product;
  if (sale_price === null || !(sale_price < price)) return "none";

  const time = now.getTime();
  if (sale_starts_at && time < new Date(sale_starts_at).getTime()) return "scheduled";
  if (sale_ends_at && time >= new Date(sale_ends_at).getTime()) return "expired";

  return "active";
}

export function isOnSale(product: SaleFields, now: Date) {
  return promotionStatus(product, now) === "active";
}

export function effectivePrice(product: SaleFields, now: Date) {
  return isOnSale(product, now) ? (product.sale_price as number) : product.price;
}

export function discountPercent(price: number, salePrice: number) {
  return Math.round((1 - salePrice / price) * 100);
}

// El negocio está en Colombia (UTC-5 todo el año, sin horario de verano).
// El formulario usa fechas sin hora: se interpretan como días en Colombia.
const BUSINESS_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-10-01" → inicio de ese día; con end, inicio del día siguiente
// (el fin es exclusivo, así el último día elegido cuenta entero).
export function fromBusinessDate(date: string, { end = false } = {}) {
  const midnight = new Date(`${date}T00:00:00.000Z`).getTime() + BUSINESS_OFFSET_MS;
  return new Date(end ? midnight + DAY_MS : midnight).toISOString();
}

// Camino inverso, para rellenar el <input type="date">.
export function toBusinessDate(iso: string | null, { end = false } = {}) {
  if (!iso) return "";
  const local = new Date(iso).getTime() - BUSINESS_OFFSET_MS - (end ? 1 : 0);
  return new Date(local).toISOString().slice(0, 10);
}

const dayFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  timeZone: "America/Bogota",
});

// Vigencia legible para el panel. El fin es exclusivo: se muestra el día anterior.
export function formatSaleWindow({
  sale_starts_at,
  sale_ends_at,
}: Pick<SaleFields, "sale_starts_at" | "sale_ends_at">) {
  const start = sale_starts_at && dayFormatter.format(new Date(sale_starts_at));
  const end = sale_ends_at && dayFormatter.format(new Date(new Date(sale_ends_at).getTime() - 1));

  if (start && end) return `${start} – ${end}`;
  if (end) return `Hasta el ${end}`;
  if (start) return `Desde el ${start}`;
  return "Sin fecha límite";
}

// Copia para el pedido con el precio vigente en este momento.
export function toOrderProduct(
  product: Pick<OrderProduct, "id" | "name" | "unit"> & SaleFields,
  now: Date,
): OrderProduct {
  const { id, name, unit } = product;
  return { id, name, unit, price: effectivePrice(product, now) };
}
