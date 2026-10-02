"use client";

import Link from "next/link";
import { Flame, Percent } from "lucide-react";

import { isOnSale } from "@/lib/promotions";
import type { ProductWithCategory } from "@/types";

import ProductList from "./ProductList";
import { useNow } from "./useNow";

type OfferShelfProps = {
  // Productos con precio promo (se filtran por vigencia al mostrarlos).
  offers: ProductWithCategory[];
  // Hora del render en el servidor (ms), para hidratar sin desajustes.
  renderedAt: number;
  canOrder: boolean;
  // carousel: franja destacada del inicio; grid: página /ofertas.
  variant: "carousel" | "grid";
};

export default function OfferShelf({ offers, renderedAt, canOrder, variant }: OfferShelfProps) {
  const now = useNow(renderedAt);
  const liveOffers = offers.filter((product) => !product.sold_out && isOnSale(product, now));

  if (variant === "grid") {
    return liveOffers.length > 0 ? (
      <ProductList products={liveOffers} now={now} canOrder={canOrder} />
    ) : (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center text-charcoal/70">
        <Percent size={36} className="text-charcoal/30" />
        <p className="mt-3">Las ofertas terminaron. ¡Vuelve pronto!</p>
        <Link
          href="/productos"
          className="mt-3 text-sm font-semibold text-brick underline-offset-2 hover:underline"
        >
          Ver todos los productos
        </Link>
      </div>
    );
  }

  if (liveOffers.length === 0) return null;

  return (
    <section
      aria-labelledby="offers-title"
      className="-mx-4 bg-charcoal px-4 py-6 text-cream sm:mx-0 sm:rounded-3xl sm:px-6"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mustard">
            <Flame size={14} />
            Por tiempo limitado
          </p>
          <h2 id="offers-title" className="font-display text-2xl font-black sm:text-3xl">
            Ofertas
          </h2>
        </div>
        <Link
          href="/ofertas"
          className="rounded-full border border-cream/30 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-cream hover:text-charcoal"
        >
          Ver todas ({liveOffers.length})
        </Link>
      </div>
      <ProductList products={liveOffers} now={now} canOrder={canOrder} variant="carousel" />
    </section>
  );
}
