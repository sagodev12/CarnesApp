import type { Metadata } from "next";

import CategoryNav from "@/components/public/CategoryNav";
import OfferShelf from "@/components/public/gallery/OfferShelf";
import PageIntro from "@/components/public/PageIntro";
import { offersBanner } from "@/lib/offers-banner";
import { getPublicCategories, getSaleProductsOrEmpty } from "@/lib/products/public-queries";
import { getSiteConfig } from "@/lib/site-config/queries";

// Respaldo: el panel revalida esta página al guardar (revalidatePath).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const banner = offersBanner(await getSiteConfig());
  return { title: banner.title, description: banner.subtitle ?? undefined };
}

export default async function OffersPage() {
  const [config, categories, offers] = await Promise.all([
    getSiteConfig(),
    getPublicCategories(),
    getSaleProductsOrEmpty(),
  ]);
  // Los mismos textos que la franja del inicio.
  const banner = offersBanner(config);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PageIntro
        eyebrow={banner.eyebrow}
        title={banner.title}
        description={banner.subtitle ?? "Precios especiales mientras duren las promociones."}
      />
      <CategoryNav categories={categories} active="ofertas" showOffers />
      <OfferShelf
        offers={offers}
        renderedAt={new Date().getTime()}
        canOrder={Boolean(config.phone_whatsapp)}
        variant="grid"
      />
    </section>
  );
}
