import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import CategoryCard from "@/components/public/CategoryCard";
import OfferShelf from "@/components/public/gallery/OfferShelf";
import OpenStatus from "@/components/public/OpenStatus";
import { getPublicCategories, getSaleProductsOrEmpty } from "@/lib/products/public-queries";
import { getSiteConfig } from "@/lib/site-config/queries";

// Respaldo: el panel revalida esta página al guardar (revalidatePath).
export const revalidate = 3600;

export default async function Home() {
  const [config, categories, offers] = await Promise.all([
    getSiteConfig(),
    getPublicCategories(),
    getSaleProductsOrEmpty(),
  ]);
  // Hora del render (Server Component: se calcula una vez por render). Las
  // ofertas la usan al hidratar para decidir cuáles están vigentes.
  const renderedAt = new Date().getTime();

  return (
    <>
      <section className="relative overflow-hidden">
        {config.hero_image_url && (
          <>
            <Image
              src={config.hero_image_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/60 to-charcoal/20" />
          </>
        )}

        <div
          className={`relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 ${
            config.hero_image_url ? "text-cream" : "text-charcoal"
          }`}
        >
          <OpenStatus
            hours={config.opening_hours}
            tone={config.hero_image_url ? "light" : "dark"}
            className="mb-5"
          />
          <h1 className="max-w-2xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {config.business_name}
          </h1>
          {config.description && (
            <p
              className={`mt-4 max-w-xl text-lg ${
                config.hero_image_url ? "text-cream/85" : "text-charcoal/70"
              }`}
            >
              {config.description}
            </p>
          )}
          <Link
            href="/productos"
            className="mt-8 inline-flex rounded-lg bg-brick px-6 py-3 font-semibold text-cream transition-colors hover:bg-brick-dark"
          >
            Ver productos
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <OfferShelf
          offers={offers}
          renderedAt={renderedAt}
          canOrder={Boolean(config.phone_whatsapp)}
          variant="carousel"
        />

        {categories.length > 0 && (
          <section aria-labelledby="categories-title">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="categories-title" className="font-display text-3xl font-black sm:text-4xl">
                  Nuestras categorías
                </h2>
                {config.phone_whatsapp && (
                  <p className="mt-2 text-charcoal/70">
                    Elige lo que necesitas y envíanos tu pedido por WhatsApp.
                  </p>
                )}
              </div>
              <Link
                href="/productos"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brick underline-offset-2 hover:underline"
              >
                Ver todos los productos
                <ArrowRight size={16} />
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <CategoryCard category={category} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
