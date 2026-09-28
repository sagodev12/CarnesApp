import Image from "next/image";

import ProductGallery from "@/components/public/gallery/ProductGallery";
import { PUBLIC_PAGE_SIZE, paginated } from "@/lib/pagination";
import { getActiveProductsPage, getPublicCategories } from "@/lib/products/public-queries";
import { getSiteConfig } from "@/lib/site-config/queries";

// Respaldo: el panel revalida esta página al guardar (revalidatePath).
export const revalidate = 3600;

export default async function Home() {
  const [config, firstPage, categories] = await Promise.all([
    getSiteConfig(),
    // Si falla, la landing se muestra igual (sin productos) en vez de romperse.
    getActiveProductsPage({ page: 1, categoryId: null }).catch((error) => {
      console.error(error);
      return paginated([], 0, 1, PUBLIC_PAGE_SIZE);
    }),
    getPublicCategories(),
  ]);
  const hasProducts = firstPage.total > 0;

  return (
    <>
      <section id="nosotros" className="relative overflow-hidden">
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
          {hasProducts && (
            <a
              href="#productos"
              className="mt-8 inline-flex rounded-lg bg-brick px-6 py-3 font-semibold text-cream transition-colors hover:bg-brick-dark"
            >
              Ver productos
            </a>
          )}
        </div>
      </section>

      <section id="productos" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-32 pt-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 className="font-display text-3xl font-black sm:text-4xl">Nuestros productos</h2>
          {config.phone_whatsapp && hasProducts && (
            <p className="mt-2 text-charcoal/70">
              Elige lo que necesitas y envíanos tu pedido por WhatsApp.
            </p>
          )}
        </header>

        <ProductGallery
          initialPage={firstPage}
          categories={categories}
          phone={config.phone_whatsapp}
          greeting={config.whatsapp_message}
        />
      </section>
    </>
  );
}
