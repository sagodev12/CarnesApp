import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import CategoryNav from "@/components/public/CategoryNav";
import ProductGallery from "@/components/public/gallery/ProductGallery";
import PageIntro from "@/components/public/PageIntro";
import {
  getFirstPageOrEmpty,
  getPublicCategories,
  getPublicCategoryBySlug,
  getSaleProductsOrEmpty,
} from "@/lib/products/public-queries";
import { getSiteConfig } from "@/lib/site-config/queries";

// Respaldo: el panel revalida esta página al guardar (revalidatePath).
export const revalidate = 3600;

// Ninguna en el build: cada categoría se genera en su primera visita y queda
// cacheada (las categorías se crean desde el panel, no en el código).
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(
  props: PageProps<"/productos/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getPublicCategoryBySlug(slug);
  if (!category) return {};

  const description = category.description ?? undefined;
  return {
    title: category.name,
    description,
    openGraph: category.image_url
      ? { title: category.name, description, images: [{ url: category.image_url, alt: category.name }] }
      : undefined,
  };
}

export default async function CategoryPage(props: PageProps<"/productos/[slug]">) {
  const { slug } = await props.params;
  const category = await getPublicCategoryBySlug(slug);
  if (!category) notFound();

  const [config, firstPage, categories, offers] = await Promise.all([
    getSiteConfig(),
    getFirstPageOrEmpty(category.id),
    getPublicCategories(),
    getSaleProductsOrEmpty(),
  ]);

  return (
    <>
      {category.image_url && (
        <div className="relative h-40 overflow-hidden bg-charcoal sm:h-56">
          <Image
            src={category.image_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent" />
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <PageIntro eyebrow="Categoría" title={category.name} description={category.description} />
        <CategoryNav categories={categories} active={category.slug} showOffers={offers.length > 0} />
        <ProductGallery
          // Al cambiar de categoría se reinicia la búsqueda y la paginación.
          key={category.id}
          initialPage={firstPage}
          categoryId={category.id}
          renderedAt={new Date().getTime()}
          canOrder={Boolean(config.phone_whatsapp)}
          emptyMessage="No hay productos en esta categoría por ahora."
        />
      </section>
    </>
  );
}
