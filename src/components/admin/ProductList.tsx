import Image from "next/image";
import Link from "next/link";
import { ImageOff, PackageOpen, Pencil } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { discountPercent, formatSaleWindow, promotionStatus } from "@/lib/promotions";
import { unitLabel } from "@/lib/validations/product.schema";
import type { ProductWithCategory } from "@/types";

import PromotionBadge from "./PromotionBadge";

type ProductListProps = {
  products: ProductWithCategory[];
  // Hora con la que se calcula el estado de cada promoción.
  now: Date;
};

export default function ProductList({ products, now }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-16 text-center">
        <PackageOpen size={40} className="text-charcoal/30" />
        <p className="mt-3 font-medium">Aún no hay productos</p>
        <p className="mt-1 text-sm text-charcoal/60">
          Usa el botón &quot;Nuevo producto&quot; para agregar el primero.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const promotion = promotionStatus(product, now);
        const onSale = promotion === "active";

        return (
          <li key={product.id}>
            <Link
              href={`/admin/productos/${product.id}`}
              aria-label={`Editar ${product.name}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-brick/50 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-charcoal/5">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 100vw"
                    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                      product.active ? "" : "grayscale-[60%]"
                    }`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-charcoal/30">
                    <ImageOff size={32} />
                  </div>
                )}
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    product.active
                      ? "bg-green-100 text-green-800"
                      : "bg-charcoal/80 text-cream"
                  }`}
                >
                  {product.active ? "Visible" : "Oculto"}
                </span>
                {onSale && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-brick px-2.5 py-0.5 text-xs font-bold text-cream shadow-sm">
                    -{discountPercent(product.price, product.sale_price as number)}%
                  </span>
                )}
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-charcoal opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Pencil size={12} />
                  Editar
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-1 p-4">
                {product.category && (
                  <p className="text-xs font-medium uppercase tracking-wide text-mustard">
                    {product.category.name}
                  </p>
                )}
                <h3 className="font-display text-lg font-semibold leading-tight">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="line-clamp-2 text-sm text-charcoal/70">
                    {product.description}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                  <p className="font-semibold text-brick">
                    {onSale && (
                      <span className="block text-xs font-normal text-charcoal/50 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                    {formatPrice(onSale ? (product.sale_price as number) : product.price)}
                    {product.unit && (
                      <span className="font-normal text-charcoal/60"> / {unitLabel(product.unit)}</span>
                    )}
                  </p>
                  {promotion !== "none" && (
                    <span className="text-right">
                      <PromotionBadge status={promotion} />
                      <span className="mt-0.5 block text-[11px] text-charcoal/50">
                        {formatSaleWindow(product)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
