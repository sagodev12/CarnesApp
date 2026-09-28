import type { Customer } from "./customer";
import { formatPrice } from "./format";

// Deja solo dígitos. Un celular colombiano de 10 dígitos (3xx...) sin
// indicativo recibe el 57 para que wa.me lo entienda.
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;

  return digits;
}

export function buildWhatsAppUrl(phone: string, text?: string | null) {
  const base = `https://wa.me/${normalizePhone(phone)}`;

  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

const quantityFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

export function formatQuantity(quantity: number) {
  return quantityFormatter.format(quantity);
}

const UNIT_NAMES: Record<string, [singular: string, plural: string]> = {
  kg: ["kg", "kg"],
  lb: ["lb", "lb"],
  unidad: ["unidad", "unidades"],
  paquete: ["paquete", "paquetes"],
};

export function formatUnit(unit: string | null, quantity: number) {
  if (!unit) return "";
  const [singular, plural] = UNIT_NAMES[unit] ?? [unit, unit];

  return quantity === 1 ? singular : plural;
}

export type OrderLine = {
  name: string;
  unit: string | null;
  price: number;
  quantity: number;
  note?: string;
};

function customerLines({ name, delivery, address, note }: Customer) {
  return [
    `Nombre: ${name.trim()}`,
    delivery === "domicilio" ? `Entrega: Domicilio — ${address.trim()}` : "Entrega: Recoger en tienda",
    ...(note.trim() ? [`Nota: ${note.trim()}`] : []),
  ];
}

export function buildOrderMessage(
  greeting: string | null,
  lines: OrderLine[],
  customer?: Customer | null,
) {
  const items = lines.flatMap((line) => {
    const unit = formatUnit(line.unit, line.quantity);
    const amount = `${formatQuantity(line.quantity)}${unit ? ` ${unit}` : ""}`;
    const item = `• ${amount} de ${line.name} — ${formatPrice(line.price * line.quantity)}`;

    const note = line.note?.trim();
    return note ? [item, `   ↳ ${note}`] : [item];
  });

  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return [
    greeting?.trim() || "Hola, quiero hacer un pedido",
    "",
    ...items,
    "",
    `Total estimado: ${formatPrice(total)}`,
    ...(customer ? ["", ...customerLines(customer)] : []),
  ].join("\n");
}
