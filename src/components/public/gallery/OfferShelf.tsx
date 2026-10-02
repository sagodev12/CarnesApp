"use client";

import Link from "next/link";
import { Percent } from "lucide-react";

import type { OffersBanner } from "@/lib/offers-banner";
import { isOnSale } from "@/lib/promotions";
import type { ProductWithCategory } from "@/types";

import OfferBanner from "./OfferBanner";
import ProductList from "./ProductList";
import { useNow } from "./useNow";

type OfferShelfProps = {
  // Productos con precio promo (se filtran por vigencia al mostrarlos).
  offers: ProductWithCategory[];
  // Hora del render en el servidor (ms), para hidratar sin desajustes.
  renderedAt: number;
  canOrder: boolean;
  // banner: franja destacada del inicio (con sus ajustes); grid: página /ofertas.
  variant: "banner" | "grid";
  banner?: OffersBanner;
};

export default function OfferShelf({
  offers,
  renderedAt,
  canOrder,
  variant,
  banner,
}: OfferShelfProps) {
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

  if (!banner || !banner.visible || liveOffers.length === 0) return null;

  return <OfferBanner settings={banner} offers={liveOffers} now={now} canOrder={canOrder} />;
}
