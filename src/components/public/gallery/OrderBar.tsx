"use client";

import { useState } from "react";
import { ChevronUp, ShoppingBasket, Trash2, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { formatPrice } from "@/lib/format";
import type { OrderLineItem, OrderProduct } from "@/lib/order";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

import QuantityStepper from "./QuantityStepper";

type OrderBarProps = {
  lines: OrderLineItem[];
  total: number;
  phone: string;
  greeting: string | null;
  onAdd: (product: OrderProduct) => void;
  onDecrement: (product: OrderProduct) => void;
  onRemove: (product: OrderProduct) => void;
  onClear: () => void;
};

export default function OrderBar({
  lines,
  total,
  phone,
  greeting,
  onAdd,
  onDecrement,
  onRemove,
  onClear,
}: OrderBarProps) {
  const [open, setOpen] = useState(false);

  if (lines.length === 0) return null;

  const whatsappUrl = buildWhatsAppUrl(phone, buildOrderMessage(greeting, lines));
  const count = lines.length;

  return (
    // Deja libre la esquina derecha para el botón flotante de WhatsApp.
    <div className="fixed bottom-5 left-4 right-24 z-40 sm:left-auto sm:w-96">
      {open && (
        <div
          id="order-panel"
          className="mb-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-line bg-white p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Tu pedido</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar resumen"
              className="rounded-md p-1 text-charcoal/60 hover:bg-charcoal/5"
            >
              <X size={18} />
            </button>
          </div>

          <ul className="divide-y divide-line">
            {lines.map((line) => (
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
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
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
        </div>
      )}

      <div className="flex items-stretch overflow-hidden rounded-2xl bg-charcoal text-cream shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
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
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            // Se vacía después de abrir WhatsApp (el enlace ya tiene el mensaje).
            setTimeout(() => {
              onClear();
              setOpen(false);
            }, 500);
          }}
          className="inline-flex items-center gap-2 bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#20BD5A]"
        >
          <FaWhatsapp size={20} />
          Pedir
        </a>
      </div>
    </div>
  );
}
