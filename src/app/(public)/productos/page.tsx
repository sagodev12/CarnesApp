import type { Metadata } from "next";

import CategoryNav from "@/components/public/CategoryNav";
import ProductGallery from "@/components/public/gallery/ProductGallery";
import PageIntro from "@/components/public/PageIntro";
import {
  getFirstPageOrEmpty,
  getPublicCategories,
  getSaleProductsOrEmpty,
} from "@/lib/products/public-queries";
import { getSiteConfig } from "@/lib/site-config/queries";

// Respaldo: el panel revalida esta página al guardar (revalidatePath).
export const revalidate = 3600;

export const metadata: Metadata = { title: "Productos" };

export default async function ProductsPage() {
  const [config, firstPage, categories, offers] = await Promise.all([
    getSiteConfig(),
    getFirstPageOrEmpty(null),
    getPublicCategories(),
    getSaleProductsOrEmpty(),
  ]);
  const canOrder = Boolean(config.phone_whatsapp);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PageIntro
        title="Nuestros productos"
        description={
          canOrder && firstPage.total > 0
            ? "Elige lo que necesitas y envíanos tu pedido por WhatsApp."
            : null
        }
      />
      <CategoryNav categories={categories} active="todos" showOffers={offers.length > 0} />
      <ProductGallery
        initialPage={firstPage}
        categoryId={null}
        renderedAt={new Date().getTime()}
        canOrder={canOrder}
        emptyMessage="Muy pronto verás nuestros productos aquí."
      />
    </section>
  );
}
