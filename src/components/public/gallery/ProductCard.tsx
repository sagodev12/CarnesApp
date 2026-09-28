import Image from "next/image";
import { Beef, Plus } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { PRODUCT_UNITS } from "@/lib/validations/product.schema";
import type { ProductWithCategory } from "@/types";

import QuantityStepper from "./QuantityStepper";

type ProductCardProps = {
  product: ProductWithCategory;
  quantity: number | undefined;
  canOrder: boolean;
  onAdd: () => void;
  onDecrement: () => void;
};

function unitLabel(unit: string | null) {
  return PRODUCT_UNITS.find((u) => u.value === unit)?.label.toLowerCase() ?? unit;
}

export default function ProductCard({
  product,
  quantity,
  canOrder,
  onAdd,
  onDecrement,
}: ProductCardProps) {
  const selected = quantity !== undefined;

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-shadow ${
        selected ? "border-brick shadow-lg shadow-brick/10" : "border-line hover:shadow-md"
      }`}
    >
      <div className="relative aspect-[4/3] bg-charcoal/5">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-charcoal/20">
            <Beef size={48} />
          </div>
        )}
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-charcoal">
            {product.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-2 line-clamp-3 text-sm text-charcoal/70">{product.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <p className="text-lg font-bold text-brick">
            {formatPrice(product.price)}
            {product.unit && (
              <span className="text-sm font-normal text-charcoal/60">
                {" "}
                / {unitLabel(product.unit)}
              </span>
            )}
          </p>

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
