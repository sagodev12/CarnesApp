"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";

import type { OffersBanner, OfferStyle } from "@/lib/offers-banner";
import type { ProductWithCategory } from "@/types";

import ProductList from "./ProductList";

type OfferBannerProps = {
  settings: OffersBanner;
  // Ofertas vigentes ya filtradas (se muestran hasta settings.limit).
  offers: ProductWithCategory[];
  now: Date;
  canOrder: boolean;
};

// Clases por estilo: fondo y colores de texto de la franja.
const THEMES: Record<
  OfferStyle,
  { section: string; eyebrow: string; subtitle: string; button: string }
> = {
  dark: {
    section: "bg-charcoal text-cream",
    eyebrow: "text-mustard",
    subtitle: "text-cream/75",
    button: "border-cream/30 hover:bg-cream hover:text-charcoal",
  },
  brand: {
    section: "bg-brick text-cream",
    eyebrow: "text-cream/80",
    subtitle: "text-cream/80",
    button: "border-cream/40 hover:bg-cream hover:text-brick",
  },
  light: {
    section: "border-y border-line bg-white text-charcoal sm:border-x",
    eyebrow: "text-brick",
    subtitle: "text-charcoal/70",
    button: "border-charcoal/20 hover:bg-charcoal hover:text-cream",
  },
  image: {
    section: "bg-charcoal text-cream",
    eyebrow: "text-mustard",
    subtitle: "text-cream/85",
    button: "border-cream/40 bg-charcoal/30 hover:bg-cream hover:text-charcoal",
  },
};

// Franja destacada de ofertas del inicio (se configura en /admin/ofertas).
export default function OfferBanner({ settings, offers, now, canOrder }: OfferBannerProps) {
  const theme = THEMES[settings.style];
  const shown = offers.slice(0, settings.limit);
  const withImage = settings.style === "image" && settings.imageUrl;

  return (
    <section
      aria-labelledby="offers-title"
      className={`relative -mx-4 overflow-hidden px-4 py-6 sm:mx-0 sm:rounded-3xl sm:px-6 sm:py-8 ${theme.section}`}
    >
      {withImage && (
        <>
          <Image
            src={settings.imageUrl as string}
            alt=""
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            // La vista previa del panel usa una URL local (blob:) sin optimizar.
            unoptimized={settings.imageUrl?.startsWith("blob:")}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/40" />
        </>
      )}

      <div className="relative">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            <p
              className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${theme.eyebrow}`}
            >
              <Flame size={14} />
              {settings.eyebrow}
            </p>
            <h2 id="offers-title" className="font-display text-2xl font-black sm:text-3xl">
              {settings.title}
            </h2>
            {settings.subtitle && (
              <p className={`mt-1 text-sm sm:text-base ${theme.subtitle}`}>{settings.subtitle}</p>
            )}
          </div>
          <Link
            href="/ofertas"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${theme.button}`}
          >
            Ver todas ({offers.length})
          </Link>
        </div>

        {/* Las tarjetas son blancas: su texto va en oscuro sobre cualquier fondo. */}
        <div className="text-charcoal">
          <ProductList
            products={shown}
            now={now}
            canOrder={canOrder}
            variant={settings.layout}
          />
        </div>
      </div>
    </section>
  );
}
