import Link from "next/link";

import { formatPrice } from "@/lib/format";
import { discountPercent, formatSaleWindow, type PromotionStatus } from "@/lib/promotions";
import type { ProductWithCategory } from "@/types";

import PromotionBadge from "./PromotionBadge";

type PromotionListProps = {
  items: { product: ProductWithCategory; status: PromotionStatus }[];
};

// Productos con precio promo, cada uno enlazado a su edición.
export default function PromotionList({ items }: PromotionListProps) {
  return (
    <ul className="divide-y divide-line">
      {items.map(({ product, status }) => (
        <li key={product.id}>
          <Link
            href={`/admin/productos/${product.id}`}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-cream/50"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brick/10 text-sm font-bold text-brick">
              -{discountPercent(product.price, product.sale_price as number)}%
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{product.name}</span>
              <span className="block text-xs text-charcoal/60">
                {formatSaleWindow(product)}
                {!product.active && " · producto oculto"}
                {product.sold_out && " · agotado"}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-xs text-charcoal/50 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="block font-semibold text-brick">
                {formatPrice(product.sale_price as number)}
              </span>
            </span>
            <PromotionBadge status={status} className="sm:w-32 sm:justify-center" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
