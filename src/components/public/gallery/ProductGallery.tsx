"use client";

import { useRef, useState } from "react";
import { Loader2, PackageOpen, RotateCw } from "lucide-react";

import { ProductCardSkeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { Paginated } from "@/lib/pagination";
import { productsApiUrl } from "@/lib/products/query-params";
import type { Category, ProductWithCategory } from "@/types";

import OrderBar from "./OrderBar";
import ProductCard from "./ProductCard";
import ProductDialog from "./ProductDialog";
import { useOrder } from "./useOrder";

type ProductGalleryProps = {
  // Primera página sin filtro, renderizada en el servidor.
  initialPage: Paginated<ProductWithCategory>;
  categories: Category[];
  phone: string;
  greeting: string | null;
};

type Status = "idle" | "filtering" | "loading-more" | "error";

// Cuántas tarjetas fantasma mostrar al cargar más (no toda la página).
const MORE_SKELETONS = 3;

export default function ProductGallery({
  initialPage,
  categories,
  phone,
  greeting,
}: ProductGalleryProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [result, setResult] = useState(initialPage);
  const [items, setItems] = useState(initialPage.items);
  const [status, setStatus] = useState<Status>("idle");
  // Producto abierto en el detalle (modal).
  const [detail, setDetail] = useState<ProductWithCategory | null>(null);
  // Para ignorar respuestas viejas si el cliente cambia de filtro rápido.
  const requestId = useRef(0);
  const lastRequest = useRef<{ page: number; categoryId: string | null } | null>(null);

  const { order, lines, total, add, decrement, remove, clear } = useOrder();
  const canOrder = Boolean(phone);

  async function load(page: number, nextCategoryId: string | null) {
    const id = ++requestId.current;
    lastRequest.current = { page, categoryId: nextCategoryId };
    setStatus(page === 1 ? "filtering" : "loading-more");

    try {
      const response = await fetch(productsApiUrl({ page, categoryId: nextCategoryId }));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as Paginated<ProductWithCategory>;

      if (id !== requestId.current) return;
      setResult(data);
      setItems((current) => (page === 1 ? data.items : [...current, ...data.items]));
      setStatus("idle");
    } catch {
      if (id === requestId.current) setStatus("error");
    }
  }

  function selectCategory(nextCategoryId: string | null) {
    if (nextCategoryId === categoryId && status !== "error") return;
    setCategoryId(nextCategoryId);

    // "Todos" ya viene del servidor: no hace falta pedirlo otra vez.
    if (nextCategoryId === null) {
      requestId.current++;
      setResult(initialPage);
      setItems(initialPage.items);
      setStatus("idle");
      return;
    }
    void load(1, nextCategoryId);
  }

  function retry() {
    const last = lastRequest.current;
    if (last) void load(last.page, last.categoryId);
  }

  if (initialPage.total === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <PackageOpen size={40} className="text-charcoal/30" />
        <p className="mt-3 font-medium">Muy pronto verás nuestros productos aquí.</p>
      </div>
    );
  }

  const remaining = result.total - items.length;

  return (
    <>
      {categories.length > 0 && (
        <div role="group" aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap gap-2">
          {[{ id: null, name: "Todos" }, ...categories].map((category) => {
            const active = categoryId === category.id;
            return (
              <button
                key={category.id ?? "all"}
                type="button"
                onClick={() => selectCategory(category.id)}
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

      {status === "filtering" ? (
        <ProductGridSkeleton count={6} />
      ) : items.length === 0 && status !== "error" ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-charcoal/70">
          No hay productos en esta categoría por ahora.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy={status === "loading-more"}>
          {items.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                quantity={order[product.id]?.quantity}
                canOrder={canOrder}
                onAdd={() => add(product)}
                onDecrement={() => decrement(product)}
                onOpen={() => setDetail(product)}
              />
            </li>
          ))}
          {status === "loading-more" &&
            Array.from({ length: Math.min(remaining, MORE_SKELETONS) }, (_, index) => (
              <li key={`skeleton-${index}`}>
                <ProductCardSkeleton />
              </li>
            ))}
        </ul>
      )}

      <div className="mt-10 flex flex-col items-center gap-3">
        {status === "error" ? (
          <>
            <p className="text-sm text-brick-dark">No pudimos cargar los productos.</p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold hover:border-charcoal/40"
            >
              <RotateCw size={16} />
              Reintentar
            </button>
          </>
        ) : (
          status !== "filtering" &&
          result.hasMore && (
            <>
              <button
                type="button"
                onClick={() => void load(result.page + 1, categoryId)}
                disabled={status === "loading-more"}
                className="inline-flex items-center gap-2 rounded-lg border border-charcoal bg-white px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-charcoal hover:text-cream disabled:opacity-60"
              >
                {status === "loading-more" && <Loader2 size={16} className="animate-spin" />}
                {status === "loading-more" ? "Cargando..." : "Ver más productos"}
              </button>
              <p className="text-xs text-charcoal/60">
                Mostrando {items.length} de {result.total}
              </p>
            </>
          )
        )}
      </div>

      <ProductDialog
        product={detail}
        quantity={detail ? order[detail.id]?.quantity : undefined}
        canOrder={canOrder}
        onAdd={add}
        onDecrement={decrement}
        onClose={() => setDetail(null)}
      />

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
