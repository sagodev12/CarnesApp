// Datos de entrega del cliente: van al final del mensaje de WhatsApp y se
// recuerdan en el navegador para el próximo pedido.

export type Delivery = "domicilio" | "recoger";

export type Customer = {
  name: string;
  delivery: Delivery;
  address: string;
  note: string;
};

export const EMPTY_CUSTOMER: Customer = { name: "", delivery: "domicilio", address: "", note: "" };

export const CUSTOMER_LIMITS = { name: 60, address: 150, note: 200 };

export type CustomerErrors = Partial<Record<keyof Customer, string>>;

export function validateCustomer(customer: Customer): CustomerErrors {
  const errors: CustomerErrors = {};
  const name = customer.name.trim();
  const address = customer.address.trim();

  if (name.length < 2) errors.name = "Escribe tu nombre.";
  else if (name.length > CUSTOMER_LIMITS.name) errors.name = `Máximo ${CUSTOMER_LIMITS.name} caracteres.`;

  if (customer.delivery === "domicilio" && address.length < 5) {
    errors.address = "Escribe la dirección y el barrio.";
  } else if (address.length > CUSTOMER_LIMITS.address) {
    errors.address = `Máximo ${CUSTOMER_LIMITS.address} caracteres.`;
  }

  if (customer.note.trim().length > CUSTOMER_LIMITS.note) {
    errors.note = `Máximo ${CUSTOMER_LIMITS.note} caracteres.`;
  }

  return errors;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

export function parseStoredCustomer(raw: string | null): Customer {
  if (!raw) return EMPTY_CUSTOMER;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY_CUSTOMER;

    const data = parsed as Record<string, unknown>;
    return {
      name: text(data.name),
      delivery: data.delivery === "recoger" ? "recoger" : "domicilio",
      address: text(data.address),
      note: text(data.note),
    };
  } catch {
    return EMPTY_CUSTOMER;
  }
}
