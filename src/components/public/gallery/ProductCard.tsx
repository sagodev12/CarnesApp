import Image from "next/image";
import { Beef, Plus } from "lucide-react";

import { PriceTag, SaleBadge } from "@/components/ui/PriceTag";
import { isOnSale } from "@/lib/promotions";
import type { ProductWithCategory } from "@/types";

import QuantityStepper from "./QuantityStepper";

type ProductCardProps = {
  product: ProductWithCategory;
  quantity: number | undefined;
  canOrder: boolean;
  // Hora con la que se decide si la promoción está vigente.
  now: Date;
  onAdd: () => void;
  onDecrement: () => void;
  // Abre el detalle con la imagen completa y la descripción entera.
  onOpen: () => void;
};

export default function ProductCard({
  product,
  quantity,
  canOrder,
  now,
  onAdd,
  onDecrement,
  onOpen,
}: ProductCardProps) {
  const selected = quantity !== undefined;
  const onSale = isOnSale(product, now);

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-shadow ${
        selected ? "border-brick shadow-lg shadow-brick/10" : "border-line hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver detalle de ${product.name}`}
        className="group relative block aspect-[4/3] w-full overflow-hidden bg-charcoal/5"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-charcoal/20">
            <Beef size={48} />
          </span>
        )}
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-charcoal">
            {product.category.name}
          </span>
        )}
        {onSale && (
          <SaleBadge
            price={product.price}
            salePrice={product.sale_price as number}
            className="absolute right-3 top-3 px-3 py-1 text-sm"
          />
        )}
      </button>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-tight">
          <button type="button" onClick={onOpen} className="text-left hover:text-brick">
            {product.name}
          </button>
        </h3>
        {product.description && (
          <>
            <p className="mt-2 line-clamp-3 text-sm text-charcoal/70">{product.description}</p>
            <button
              type="button"
              onClick={onOpen}
              className="mt-1 self-start text-xs font-semibold text-brick underline-offset-2 hover:underline"
            >
              Leer más
            </button>
          </>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <PriceTag product={product} now={now} />

          {canOrder &&
            (selected ? (
              <QuantityStepper
                name={product.name}
                quantity={quantity}
                unit={product.unit}
                onIncrement={onAdd}
                onDecrement={onDecrement}
              />
            ) : (
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brick px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark"
              >
                <Plus size={16} />
                Agregar
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}
