"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronUp,
  MessageSquarePlus,
  ShoppingBasket,
  Store,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { CUSTOMER_LIMITS, validateCustomer, type Delivery } from "@/lib/customer";
import { formatPrice } from "@/lib/format";
import { MAX_NOTE_LENGTH, type OrderItem, type OrderProduct } from "@/lib/order";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

import QuantityStepper from "./QuantityStepper";
import { useCustomer } from "./useCustomer";

type OrderBarProps = {
  lines: OrderItem[];
  total: number;
  phone: string;
  greeting: string | null;
  // Dirección del local, para quien elige recoger.
  storeAddress: string | null;
  onAdd: (product: OrderProduct) => void;
  onDecrement: (product: OrderProduct) => void;
  onRemove: (product: OrderProduct) => void;
  onNote: (id: string, note: string) => void;
  onClear: () => void;
};

type Step = "order" | "details";

const fieldClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-base text-charcoal outline-none transition placeholder:text-charcoal/40 focus:border-brick focus:ring-2 focus:ring-brick/20 aria-invalid:border-brick sm:text-sm";

const DELIVERY_OPTIONS: { value: Delivery; label: string; icon: typeof Truck }[] = [
  { value: "domicilio", label: "Domicilio", icon: Truck },
  { value: "recoger", label: "Recoger en tienda", icon: Store },
];

// Pedido en dos pasos: 1) productos con indicaciones, 2) datos de entrega.
// Todo viaja en el mensaje de WhatsApp, así el local no tiene que preguntar.
export default function OrderBar({
  lines,
  total,
  phone,
  greeting,
  storeAddress,
  onAdd,
  onDecrement,
  onRemove,
  onNote,
  onClear,
}: OrderBarProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("order");
  // Productos con el campo de indicación desplegado.
  const [notesOpen, setNotesOpen] = useState<Set<string>>(new Set());
  // Los errores se muestran después del primer intento de enviar.
  const [showErrors, setShowErrors] = useState(false);
  const { customer, update } = useCustomer();

  if (lines.length === 0) return null;

  const count = lines.length;
  const errors = validateCustomer(customer);
  const valid = Object.keys(errors).length === 0;
  const visibleErrors = showErrors ? errors : {};
  const inDetails = open && step === "details";

  function openStep(next: Step) {
    setStep(next);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setStep("order");
  }

  function sent() {
    // Se vacía después de abrir WhatsApp (el enlace ya tiene el mensaje).
    setTimeout(() => {
      onClear();
      close();
      setShowErrors(false);
      setNotesOpen(new Set());
    }, 500);
  }

  const whatsappUrl = valid
    ? buildWhatsAppUrl(phone, buildOrderMessage(greeting, lines, customer))
    : null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:bottom-5 sm:left-auto sm:right-5 sm:w-96">
      {open && (
        <div
          id="order-panel"
          className="mb-2 max-h-[65dvh] overflow-y-auto rounded-2xl border border-line bg-white p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            {step === "details" ? (
              <button
                type="button"
                onClick={() => setStep("order")}
                className="-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm font-medium text-charcoal/70 hover:text-brick"
              >
                <ArrowLeft size={16} />
                Tu pedido
              </button>
            ) : (
              <h2 className="font-display text-lg font-semibold">Tu pedido</h2>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar resumen"
              className="rounded-md p-1 text-charcoal/60 hover:bg-charcoal/5"
            >
              <X size={18} />
            </button>
          </div>

          {step === "order" ? (
            <>
              <ul className="divide-y divide-line">
                {lines.map((line) => {
                  const noteOpen = Boolean(line.note) || notesOpen.has(line.id);
                  return (
                    <li key={line.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium leading-tight">{line.name}</p>
                        <button
                          type="button"
                          onClick={() => onRemove(line)}
                          aria-label={`Quitar ${line.name} del pedido`}
                          className="text-charcoal/40 hover:text-brick"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <QuantityStepper
                          size="sm"
                          name={line.name}
                          quantity={line.quantity}
                          unit={line.unit}
                          onIncrement={() => onAdd(line)}
                          onDecrement={() => onDecrement(line)}
                        />
                        <span className="text-sm font-semibold">
                          {formatPrice(line.price * line.quantity)}
                        </span>
                      </div>
                      {noteOpen ? (
                        <input
                          value={line.note ?? ""}
                          onChange={(event) => onNote(line.id, event.target.value)}
                          maxLength={MAX_NOTE_LENGTH}
                          autoFocus={!line.note}
                          aria-label={`Indicación para ${line.name}`}
                          placeholder="Ej: en bistec, molida, sin grasa"
                          className={`${fieldClass} mt-2`}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setNotesOpen((current) => new Set(current).add(line.id))}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brick hover:underline"
                        >
                          <MessageSquarePlus size={14} />
                          Agregar indicación (corte, tamaño…)
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    close();
                  }}
                  className="text-sm text-charcoal/60 underline hover:text-brick"
                >
                  Vaciar pedido
                </button>
                <p className="text-sm">
                  Total estimado <strong className="text-base">{formatPrice(total)}</strong>
                </p>
              </div>
              <p className="mt-2 text-xs text-charcoal/50">
                El valor final se confirma por WhatsApp según el peso exacto.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-semibold">Datos de entrega</h2>

              <div>
                <label htmlFor="customer-name" className="mb-1 block text-sm font-medium">
                  Tu nombre
                </label>
                <input
                  id="customer-name"
                  value={customer.name}
                  onChange={(event) => update({ name: event.target.value })}
                  maxLength={CUSTOMER_LIMITS.name}
                  autoComplete="name"
                  aria-invalid={Boolean(visibleErrors.name)}
                  className={fieldClass}
                />
                {visibleErrors.name && <p className="mt-1 text-xs text-brick">{visibleErrors.name}</p>}
              </div>

              <fieldset>
                <legend className="mb-1 text-sm font-medium">¿Cómo lo recibes?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {DELIVERY_OPTIONS.map(({ value, label, icon: Icon }) => {
                    const selected = customer.delivery === value;
                    return (
                      <label
                        key={value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brick/30 ${
                          selected
                            ? "border-brick bg-brick/5 text-brick"
                            : "border-line hover:border-charcoal/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={value}
                          checked={selected}
                          onChange={() => update({ delivery: value })}
                          className="sr-only"
                        />
                        <Icon size={16} className="shrink-0" />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {customer.delivery === "domicilio" ? (
                <div>
                  <label htmlFor="customer-address" className="mb-1 block text-sm font-medium">
                    Dirección y barrio
                  </label>
                  <input
                    id="customer-address"
                    value={customer.address}
                    onChange={(event) => update({ address: event.target.value })}
                    maxLength={CUSTOMER_LIMITS.address}
                    autoComplete="street-address"
                    placeholder="Ej: Calle 10 # 5-20, barrio Centro"
                    aria-invalid={Boolean(visibleErrors.address)}
                    className={fieldClass}
                  />
                  {visibleErrors.address && (
                    <p className="mt-1 text-xs text-brick">{visibleErrors.address}</p>
                  )}
                </div>
              ) : (
                storeAddress && (
                  <p className="flex items-start gap-2 rounded-lg bg-cream px-3 py-2 text-sm text-charcoal/80">
                    <Store size={16} className="mt-0.5 shrink-0 text-brick" />
                    Te esperamos en {storeAddress}
                  </p>
                )
              )}

              <div>
                <label htmlFor="customer-note" className="mb-1 block text-sm font-medium">
                  Nota <span className="font-normal text-charcoal/50">(opcional)</span>
                </label>
                <input
                  id="customer-note"
                  value={customer.note}
                  onChange={(event) => update({ note: event.target.value })}
                  maxLength={CUSTOMER_LIMITS.note}
                  placeholder="Ej: pago en efectivo, llamar al llegar"
                  aria-invalid={Boolean(visibleErrors.note)}
                  className={fieldClass}
                />
                {visibleErrors.note && <p className="mt-1 text-xs text-brick">{visibleErrors.note}</p>}
              </div>

              <p className="text-xs text-charcoal/50">
                Guardamos estos datos en este dispositivo para tu próximo pedido.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-stretch overflow-hidden rounded-2xl bg-charcoal text-cream shadow-2xl">
        <button
          type="button"
          onClick={() => (open ? close() : openStep("order"))}
          aria-expanded={open}
          aria-controls="order-panel"
          className="flex flex-1 items-center gap-3 px-4 py-3 text-left"
        >
          <ShoppingBasket size={22} className="shrink-0 text-mustard" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-cream/70">
              {count} {count === 1 ? "producto" : "productos"}
            </span>
            <span className="block font-semibold">{formatPrice(total)}</span>
          </span>
          <ChevronUp
            size={18}
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {!inDetails ? (
          <button
            type="button"
            onClick={() => openStep("details")}
            className="inline-flex items-center gap-2 bg-brick px-5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark"
          >
            Continuar
          </button>
        ) : whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={sent}
            className="inline-flex items-center gap-2 bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#20BD5A]"
          >
            <FaWhatsapp size={20} />
            Enviar
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setShowErrors(true)}
            className="inline-flex items-center gap-2 bg-[#25D366]/60 px-4 text-sm font-semibold text-white"
          >
            <FaWhatsapp size={20} />
            Enviar
          </button>
        )}
      </div>
    </div>
  );
}
