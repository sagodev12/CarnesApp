"use client";

import { useState } from "react";

import { toOrderProduct } from "@/lib/promotions";
import type { ProductWithCategory } from "@/types";

import ProductCard from "./ProductCard";
import ProductDialog from "./ProductDialog";
import { useOrder } from "./useOrder";

type ProductListProps = {
  products: ProductWithCategory[];
  // Hora con la que se decide si cada promoción está vigente.
  now: Date;
  canOrder: boolean;
  // grid: cuadrícula; carousel: fila horizontal deslizable.
  variant?: "grid" | "carousel";
  // Elementos extra al final de la lista (p. ej. tarjetas fantasma).
  children?: React.ReactNode;
  busy?: boolean;
};

const LIST_CLASS = {
  grid: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
  carousel:
    "relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 text-charcoal sm:-mx-6 sm:px-6",
};

const ITEM_CLASS = {
  grid: "",
  carousel: "w-[82%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]",
};

// Tarjetas de producto con su detalle (modal) y los botones del pedido.
export default function ProductList({
  products,
  now,
  canOrder,
  variant = "grid",
  children,
  busy,
}: ProductListProps) {
  const { order, add, decrement } = useOrder();
  // Producto abierto en el detalle (modal).
  const [detail, setDetail] = useState<ProductWithCategory | null>(null);

  return (
    <>
      <ul className={LIST_CLASS[variant]} aria-busy={busy}>
        {products.map((product) => (
          <li key={product.id} className={ITEM_CLASS[variant]}>
            <ProductCard
              product={product}
              quantity={order[product.id]?.quantity}
              canOrder={canOrder}
              now={now}
              onAdd={() => add(toOrderProduct(product, now))}
              onDecrement={() => decrement(toOrderProduct(product, now))}
              onOpen={() => setDetail(product)}
            />
          </li>
        ))}
        {children}
      </ul>

      <ProductDialog
        product={detail}
        quantity={detail ? order[detail.id]?.quantity : undefined}
        canOrder={canOrder}
        now={now}
        onAdd={(product) => add(toOrderProduct(product, now))}
        onDecrement={(product) => decrement(toOrderProduct(product, now))}
        onClose={() => setDetail(null)}
      />
    </>
  );
}
