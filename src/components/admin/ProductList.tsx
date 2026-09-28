import Image from "next/image";
import Link from "next/link";
import { ImageOff, PackageOpen, Pencil } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { unitLabel } from "@/lib/validations/product.schema";
import type { ProductWithCategory } from "@/types";

type ProductListProps = {
  products: ProductWithCategory[];
};


export default function ProductList({ products }: ProductListProps) {
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
      {products.map((product) => (
        <li key={product.id}>
          <Link
            href={`/admin/productos/${product.id}`}
            aria-label={`Editar ${product.name}`}
            className="group block h-full overflow-hidden rounded-xl border border-line bg-white/60 transition hover:border-brick/50 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] bg-charcoal/5">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 100vw"
                  className="object-cover"
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
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-charcoal opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <Pencil size={12} />
                Editar
              </span>
            </div>

            <div className="space-y-1 p-4">
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
              <p className="pt-1 font-semibold text-brick">
                {formatPrice(product.price)}
                {product.unit && (
                  <span className="font-normal text-charcoal/60"> / {unitLabel(product.unit)}</span>
                )}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
