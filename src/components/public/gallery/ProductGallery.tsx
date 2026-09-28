"use client";

import { useRef, useState } from "react";
import { Flame, Loader2, PackageOpen, Percent, RotateCw, Search, X } from "lucide-react";

import { ProductCardSkeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { Paginated } from "@/lib/pagination";
import { productsApiUrl } from "@/lib/products/query-params";
import { matchesSearch, MAX_SEARCH_LENGTH, normalizeSearch } from "@/lib/products/search";
import { isOnSale, toOrderProduct } from "@/lib/promotions";
import type { Category, ProductWithCategory } from "@/types";

import OrderBar from "./OrderBar";
import ProductCard from "./ProductCard";
import ProductDialog from "./ProductDialog";
import { useNow } from "./useNow";
import { useOrder } from "./useOrder";

type ProductGalleryProps = {
  // Primera página sin filtro, renderizada en el servidor.
  initialPage: Paginated<ProductWithCategory>;
  categories: Category[];
  // Productos con precio promo (se filtran por vigencia al mostrarlos).
  offers: ProductWithCategory[];
  // Hora del render en el servidor (ms), para hidratar sin desajustes.
  renderedAt: number;
  phone: string;
  greeting: string | null;
  storeAddress: string | null;
};

type Status = "idle" | "filtering" | "loading-more" | "error";

// Cuántas tarjetas fantasma mostrar al cargar más (no toda la página).
const MORE_SKELETONS = 3;

// Filtro "Ofertas": se muestra la lista de ofertas ya cargada, sin paginar.
const OFFERS = "ofertas";

// Espera tras la última tecla antes de buscar.
const SEARCH_DELAY_MS = 300;

type Request = { page: number; categoryId: string | null; search: string | null };

export default function ProductGallery({
  initialPage,
  categories,
  offers,
  renderedAt,
  phone,
  greeting,
  storeAddress,
}: ProductGalleryProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [result, setResult] = useState(initialPage);
  const [items, setItems] = useState(initialPage.items);
  const [status, setStatus] = useState<Status>("idle");
  // Texto del buscador y búsqueda aplicada (normalizada, null = sin búsqueda).
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<string | null>(null);
  const searchTimer = useRef<number | undefined>(undefined);
  // Producto abierto en el detalle (modal).
  const [detail, setDetail] = useState<ProductWithCategory | null>(null);
  // Para ignorar respuestas viejas si el cliente cambia de filtro rápido.
  const requestId = useRef(0);
  const lastRequest = useRef<Request | null>(null);

  const { order, lines, total, add, decrement, remove, clear, setNote } = useOrder();
  const canOrder = Boolean(phone);

  const now = useNow(renderedAt);
  const liveOffers = offers.filter((product) => !product.sold_out && isOnSale(product, now));
  const showingOffers = categoryId === OFFERS;
  const shownItems = showingOffers
    ? liveOffers.filter((product) => matchesSearch(product, search))
    : items;

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

  function applyFilters(nextCategoryId: string | null, nextSearch: string | null) {
    window.clearTimeout(searchTimer.current);
    setCategoryId(nextCategoryId);
    setSearch(nextSearch);

    // Las ofertas ya están cargadas (se filtran aquí): se cancela cualquier
    // pedido en curso.
    if (nextCategoryId === OFFERS) {
      requestId.current++;
      setStatus("idle");
      return;
    }

    // "Todos" sin búsqueda ya viene del servidor: no hace falta pedirlo otra vez.
    if (nextCategoryId === null && !nextSearch) {
      requestId.current++;
      setResult(initialPage);
      setItems(initialPage.items);
      setStatus("idle");
      return;
    }
    void load({ page: 1, categoryId: nextCategoryId, search: nextSearch });
  }

  function selectCategory(nextCategoryId: string | null) {
    // Aplica también lo que se esté escribiendo, sin esperar la pausa.
    const nextSearch = normalizeSearch(query);
    if (nextCategoryId === categoryId && nextSearch === search && status !== "error") return;
    applyFilters(nextCategoryId, nextSearch);
  }

  function changeQuery(value: string) {
    setQuery(value);
    window.clearTimeout(searchTimer.current);

    const nextSearch = normalizeSearch(value);
    if (nextSearch === search) return;
    // Al borrar se muestra todo de inmediato; al escribir se espera la pausa.
    const delay = nextSearch ? SEARCH_DELAY_MS : 0;
    searchTimer.current = window.setTimeout(() => applyFilters(categoryId, nextSearch), delay);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Cierra el teclado en el celular.
    (document.activeElement as HTMLElement | null)?.blur();
    const nextSearch = normalizeSearch(query);
    if (nextSearch !== search) applyFilters(categoryId, nextSearch);
  }

  function clearSearch() {
    setQuery("");
    applyFilters(categoryId, null);
  }

  function retry() {
    const last = lastRequest.current;
    if (last) void load(last);
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
  const hasMore = !showingOffers && result.hasMore;
  const filters = [
    { id: null, name: "Todos" },
    ...(liveOffers.length > 0 ? [{ id: OFFERS, name: "Ofertas" }] : []),
    ...categories,
  ];

  function renderCard(product: ProductWithCategory) {
    return (
      <ProductCard
        product={product}
        quantity={order[product.id]?.quantity}
        canOrder={canOrder}
        now={now}
        onAdd={() => add(toOrderProduct(product, now))}
        onDecrement={() => decrement(toOrderProduct(product, now))}
        onOpen={() => setDetail(product)}
      />
    );
  }

  const resultCount = showingOffers ? shownItems.length : result.total;

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
          placeholder="Buscar productos, ej. punta de anca"
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

      {liveOffers.length > 0 && !showingOffers && !search && (
        <section
          aria-labelledby="offers-title"
          className="-mx-4 mb-10 bg-charcoal px-4 py-6 text-cream sm:mx-0 sm:rounded-3xl sm:px-6"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mustard">
                <Flame size={14} />
                Por tiempo limitado
              </p>
              <h3 id="offers-title" className="font-display text-2xl font-black sm:text-3xl">
                Ofertas
              </h3>
            </div>
            <button
              type="button"
              onClick={() => selectCategory(OFFERS)}
              className="rounded-full border border-cream/30 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-cream hover:text-charcoal"
            >
              Ver todas ({liveOffers.length})
            </button>
          </div>
          <ul className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 text-charcoal sm:-mx-6 sm:px-6">
            {liveOffers.map((product) => (
              <li
                key={product.id}
                className="w-[82%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
              >
                {renderCard(product)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {filters.length > 1 && (
        <div role="group" aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap gap-2">
          {filters.map((category) => {
            const active = categoryId === category.id;
            const isOffers = category.id === OFFERS;
            return (
              <button
                key={category.id ?? "all"}
                type="button"
                onClick={() => selectCategory(category.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? isOffers
                      ? "border-brick bg-brick text-cream"
                      : "border-charcoal bg-charcoal text-cream"
                    : isOffers
                      ? "border-brick/40 bg-white text-brick hover:border-brick"
                      : "border-line bg-white text-charcoal hover:border-charcoal/40"
                }`}
              >
                {isOffers && <Percent size={14} />}
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      {status === "filtering" ? (
        <ProductGridSkeleton count={6} />
      ) : shownItems.length === 0 && status !== "error" ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-charcoal/70">
          <p>
            {search
              ? `No encontramos productos para “${search}”.`
              : showingOffers
                ? "Las ofertas terminaron. ¡Vuelve pronto!"
                : "No hay productos en esta categoría por ahora."}
          </p>
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-3 text-sm font-semibold text-brick underline-offset-2 hover:underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <>
          {search && status !== "error" && (
            <p className="mb-4 text-sm text-charcoal/70" aria-live="polite">
              {resultCount} {resultCount === 1 ? "resultado" : "resultados"} para “{search}”
            </p>
          )}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy={status === "loading-more"}>
            {shownItems.map((product) => (
              <li key={product.id}>{renderCard(product)}</li>
            ))}
            {status === "loading-more" &&
              Array.from({ length: Math.min(remaining, MORE_SKELETONS) }, (_, index) => (
                <li key={`skeleton-${index}`}>
                  <ProductCardSkeleton />
                </li>
              ))}
          </ul>
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
          hasMore && (
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

      <ProductDialog
        product={detail}
        quantity={detail ? order[detail.id]?.quantity : undefined}
        canOrder={canOrder}
        now={now}
        onAdd={(product) => add(toOrderProduct(product, now))}
        onDecrement={(product) => decrement(toOrderProduct(product, now))}
        onClose={() => setDetail(null)}
      />

      {canOrder && (
        <OrderBar
          lines={lines}
          total={total}
          phone={phone}
          greeting={greeting}
          storeAddress={storeAddress}
          onNote={setNote}
          onAdd={add}
          onDecrement={decrement}
          onRemove={remove}
          onClear={clear}
        />
      )}
    </>
  );
}
