"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Beef, Plus, X } from "lucide-react";

import { PriceTag, SaleBadge } from "@/components/ui/PriceTag";
import { isOnSale } from "@/lib/promotions";
import type { ProductWithCategory } from "@/types";

import QuantityStepper from "./QuantityStepper";

type ProductDialogProps = {
  product: ProductWithCategory | null;
  quantity: number | undefined;
  canOrder: boolean;
  now: Date;
  onAdd: (product: ProductWithCategory) => void;
  onDecrement: (product: ProductWithCategory) => void;
  onClose: () => void;
};

// Detalle del producto: imagen completa y descripción entera.
// <dialog> nativo: cierra con Esc, atrapa el foco y es accesible.
// En celular se muestra como panel inferior; en escritorio, centrado.
export default function ProductDialog({
  product,
  quantity,
  canOrder,
  now,
  onAdd,
  onDecrement,
  onClose,
}: ProductDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (product && !dialog.open) dialog.showModal();
    if (!product && dialog.open) dialog.close();
  }, [product]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clic en el fondo oscuro (fuera del contenido) cierra.
      onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
      aria-labelledby="product-dialog-title"
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-2xl bg-white p-0 text-charcoal shadow-2xl backdrop:bg-charcoal/60 backdrop:backdrop-blur-sm sm:m-auto sm:max-h-[85dvh] sm:max-w-3xl sm:rounded-2xl"
    >
      {product && (
        <div className="flex max-h-[inherit] flex-col sm:grid sm:grid-cols-2">
          <div className="relative aspect-[4/3] shrink-0 bg-charcoal/5 sm:aspect-auto sm:min-h-80">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 384px, 100vw"
                // Completa y sin recortar: object-contain.
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-charcoal/20">
                <Beef size={64} />
              </div>
            )}
            {product.sold_out && (
              <span className="absolute left-4 top-4 rounded-full bg-charcoal px-3 py-1 text-sm font-semibold text-cream">
                Agotado
              </span>
            )}
            {!product.sold_out && isOnSale(product, now) && (
              <SaleBadge
                price={product.price}
                salePrice={product.sale_price as number}
                className="absolute left-4 top-4 px-3 py-1 text-sm"
              />
            )}
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div>
                {product.category && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-mustard">
                    {product.category.name}
                  </p>
                )}
                <h2 id="product-dialog-title" className="font-display text-2xl font-semibold leading-tight">
                  {product.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Cerrar"
                className="-mr-2 -mt-1 shrink-0 rounded-md p-2 text-charcoal/60 hover:bg-charcoal/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Solo la descripción se desplaza; precio y botón quedan fijos abajo. */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/80">
                {product.description || "Sin descripción."}
              </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line px-5 py-4">
              <PriceTag product={product} now={now} size="lg" />

              {canOrder && product.sold_out ? (
                <span className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-charcoal/50">
                  Agotado por ahora
                </span>
              ) : (
                canOrder &&
                (quantity !== undefined ? (
                  <QuantityStepper
                    name={product.name}
                    quantity={quantity}
                    unit={product.unit}
                    onIncrement={() => onAdd(product)}
                    onDecrement={() => onDecrement(product)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brick px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark"
                  >
                    <Plus size={16} />
                    Agregar al pedido
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
