"use client";

import { useMemo, useState } from "react";
import { PackageOpen } from "lucide-react";

import type { Category, ProductWithCategory } from "@/types";

import OrderBar from "./OrderBar";
import ProductCard from "./ProductCard";
import { useOrder } from "./useOrder";

type ProductGalleryProps = {
  products: ProductWithCategory[];
  categories: Category[];
  phone: string;
  greeting: string | null;
};

const ALL = "all";

export default function ProductGallery({
  products,
  categories,
  phone,
  greeting,
}: ProductGalleryProps) {
  const [filter, setFilter] = useState(ALL);
  const { order, lines, total, add, decrement, remove, clear } = useOrder(products);
  const canOrder = Boolean(phone);

  // Solo se muestran como filtro las categorías que tienen productos.
  const usedCategories = useMemo(() => {
    const used = new Set(products.map((product) => product.category_id));
    return categories.filter((category) => used.has(category.id));
  }, [products, categories]);

  const visible =
    filter === ALL ? products : products.filter((product) => product.category_id === filter);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <PackageOpen size={40} className="text-charcoal/30" />
        <p className="mt-3 font-medium">Muy pronto verás nuestros productos aquí.</p>
      </div>
    );
  }

  return (
    <>
      {usedCategories.length > 0 && (
        <div role="group" aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap gap-2">
          {[{ id: ALL, name: "Todos" }, ...usedCategories].map((category) => {
            const active = filter === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setFilter(category.id)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-charcoal bg-charcoal text-cream"
                    : "border-line bg-white text-charcoal hover:border-charcoal/40"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              quantity={order[product.id]}
              canOrder={canOrder}
              onAdd={() => add(product)}
              onDecrement={() => decrement(product)}
            />
          </li>
        ))}
      </ul>

      {canOrder && (
        <OrderBar
          lines={lines}
          total={total}
          phone={phone}
          greeting={greeting}
          onAdd={add}
          onDecrement={decrement}
          onRemove={remove}
          onClear={clear}
        />
      )}
    </>
  );
}
