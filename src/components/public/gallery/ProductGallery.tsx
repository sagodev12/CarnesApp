"use client";

import { useRef, useState } from "react";
import { Loader2, PackageOpen, RotateCw, Search, X } from "lucide-react";

import { ProductCardSkeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { Paginated } from "@/lib/pagination";
import { productsApiUrl } from "@/lib/products/query-params";
import { MAX_SEARCH_LENGTH, normalizeSearch } from "@/lib/products/search";
import type { ProductWithCategory } from "@/types";

import ProductList from "./ProductList";
import { useNow } from "./useNow";

type ProductGalleryProps = {
  // Primera página sin búsqueda, renderizada en el servidor.
  initialPage: Paginated<ProductWithCategory>;
  // Categoría de la página (null = todo el catálogo).
  categoryId: string | null;
  // Hora del render en el servidor (ms), para hidratar sin desajustes.
  renderedAt: number;
  canOrder: boolean;
  // Texto cuando la categoría (o el catálogo) no tiene productos.
  emptyMessage: string;
};

type Status = "idle" | "filtering" | "loading-more" | "error";

// Cuántas tarjetas fantasma mostrar al cargar más (no toda la página).
const MORE_SKELETONS = 3;

// Espera tras la última tecla antes de buscar.
const SEARCH_DELAY_MS = 300;

type Request = { page: number; categoryId: string | null; search: string | null };

export default function ProductGallery({
  initialPage,
  categoryId,
  renderedAt,
  canOrder,
  emptyMessage,
}: ProductGalleryProps) {
  const [result, setResult] = useState(initialPage);
  const [items, setItems] = useState(initialPage.items);
  const [status, setStatus] = useState<Status>("idle");
  // Texto del buscador y búsqueda aplicada (normalizada, null = sin búsqueda).
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<string | null>(null);
  const searchTimer = useRef<number | undefined>(undefined);
  // Para ignorar respuestas viejas si el cliente busca rápido.
  const requestId = useRef(0);
  const lastRequest = useRef<Request | null>(null);

  const now = useNow(renderedAt);

  async function load(request: Request) {
    const id = ++requestId.current;
    lastRequest.current = request;
    setStatus(request.page === 1 ? "filtering" : "loading-more");

    try {
      const response = await fetch(productsApiUrl(request));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as Paginated<ProductWithCategory>;

      if (id !== requestId.current) return;
      setResult(data);
      setItems((current) => (request.page === 1 ? data.items : [...current, ...data.items]));
      setStatus("idle");
    } catch {
      if (id === requestId.current) setStatus("error");
    }
  }

  function applySearch(nextSearch: string | null) {
    window.clearTimeout(searchTimer.current);
    setSearch(nextSearch);

    // Sin búsqueda, la primera página ya viene del servidor.
    if (!nextSearch) {
      requestId.current++;
      setResult(initialPage);
      setItems(initialPage.items);
      setStatus("idle");
      return;
    }
    void load({ page: 1, categoryId, search: nextSearch });
  }

  function changeQuery(value: string) {
    setQuery(value);
    window.clearTimeout(searchTimer.current);

    const nextSearch = normalizeSearch(value);
    if (nextSearch === search) return;
    // Al borrar se muestra todo de inmediato; al escribir se espera la pausa.
    const delay = nextSearch ? SEARCH_DELAY_MS : 0;
    searchTimer.current = window.setTimeout(() => applySearch(nextSearch), delay);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Cierra el teclado en el celular.
    (document.activeElement as HTMLElement | null)?.blur();
    const nextSearch = normalizeSearch(query);
    if (nextSearch !== search) applySearch(nextSearch);
  }

  function clearSearch() {
    setQuery("");
    applySearch(null);
  }

  function retry() {
    const last = lastRequest.current;
    if (last) void load(last);
  }

  if (initialPage.total === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <PackageOpen size={40} className="text-charcoal/30" />
        <p className="mt-3 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  const remaining = result.total - items.length;

  return (
    <>
      <form role="search" onSubmit={submitSearch} className="relative mb-8 max-w-xl">
        <Search
          size={18}
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          maxLength={MAX_SEARCH_LENGTH}
          enterKeyHint="search"
          aria-label="Buscar productos"
          placeholder={
            categoryId ? "Buscar en esta categoría" : "Buscar productos, ej. punta de anca"
          }
          className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-11 text-base text-charcoal shadow-sm outline-none transition placeholder:text-charcoal/40 focus:border-brick focus:ring-2 focus:ring-brick/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-charcoal/50 hover:bg-charcoal/5 hover:text-charcoal"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {status === "filtering" ? (
        <ProductGridSkeleton count={6} />
      ) : items.length === 0 && status !== "error" ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-charcoal/70">
          <p>No encontramos productos para “{search}”.</p>
          <button
            type="button"
            onClick={clearSearch}
            className="mt-3 text-sm font-semibold text-brick underline-offset-2 hover:underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <>
          {search && status !== "error" && (
            <p className="mb-4 text-sm text-charcoal/70" aria-live="polite">
              {result.total} {result.total === 1 ? "resultado" : "resultados"} para “{search}”
            </p>
          )}
          <ProductList
            products={items}
            now={now}
            canOrder={canOrder}
            busy={status === "loading-more"}
          >
            {status === "loading-more" &&
              Array.from({ length: Math.min(remaining, MORE_SKELETONS) }, (_, index) => (
                <li key={`skeleton-${index}`}>
                  <ProductCardSkeleton />
                </li>
              ))}
          </ProductList>
        </>
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
                onClick={() => void load({ page: result.page + 1, categoryId, search })}
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
    </>
  );
}
