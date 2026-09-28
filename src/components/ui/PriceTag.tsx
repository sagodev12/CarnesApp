import { formatPrice } from "@/lib/format";
import { discountPercent, isOnSale, type SaleFields } from "@/lib/promotions";
import { unitLabel } from "@/lib/validations/product.schema";

type PriceTagProps = {
  product: SaleFields & { unit: string | null };
  now: Date;
  size?: "md" | "lg";
};

// Precio vigente con su unidad; en promoción, el precio normal va tachado encima.
export function PriceTag({ product, now, size = "md" }: PriceTagProps) {
  const onSale = isOnSale(product, now);
  const price = onSale ? (product.sale_price as number) : product.price;

  return (
    // relative: contiene los textos sr-only (absolutos). Sin esto, dentro de
    // la franja de ofertas escapan del scroll horizontal y ensanchan la página.
    <div className="relative leading-tight">
      {onSale && (
        <p className="text-sm text-charcoal/50 line-through">
          <span className="sr-only">Antes: </span>
          {formatPrice(product.price)}
        </p>
      )}
      <p className={`font-bold text-brick ${size === "lg" ? "text-xl" : "text-lg"}`}>
        {onSale && <span className="sr-only">Ahora: </span>}
        {formatPrice(price)}
        {product.unit && (
          <span className="text-sm font-normal text-charcoal/60"> / {unitLabel(product.unit)}</span>
        )}
      </p>
    </div>
  );
}

type SaleBadgeProps = {
  price: number;
  salePrice: number;
  className?: string;
};

export function SaleBadge({ price, salePrice, className = "" }: SaleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-brick px-2.5 py-0.5 text-xs font-bold text-cream shadow-sm ${className}`}
    >
      -{discountPercent(price, salePrice)}%
    </span>
  );
}
