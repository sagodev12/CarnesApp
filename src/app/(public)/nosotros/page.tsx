import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import PageIntro from "@/components/public/PageIntro";
import { toParagraphs } from "@/lib/paragraphs";
import { hasAboutPage } from "@/lib/site-config/defaults";
import { getSiteConfig } from "@/lib/site-config/queries";

// Respaldo: el panel revalida esta página al guardar (revalidatePath).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const description = toParagraphs(config.about_text)[0];
  return {
    title: "Nosotros",
    description,
    openGraph: config.about_image_url
      ? { title: "Nosotros", description, images: [{ url: config.about_image_url }] }
      : undefined,
  };
}

export default async function AboutPage() {
  const config = await getSiteConfig();
  // Sin historia escrita no hay página (el menú tampoco muestra el enlace).
  if (!hasAboutPage(config)) notFound();

  const paragraphs = toParagraphs(config.about_text);
  const image = config.about_image_url;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className={`grid items-start gap-10 ${image ? "lg:grid-cols-2" : "max-w-3xl"}`}>
        <div>
          <PageIntro eyebrow="Nosotros" title={config.about_title ?? config.business_name} />
          <div className="space-y-4 text-lg leading-relaxed text-charcoal/80">
            {paragraphs.map((paragraph, index) => (
              // Los saltos de línea simples se respetan dentro del párrafo.
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-charcoal/5 lg:sticky lg:top-24">
            <Image
              src={image}
              alt={config.business_name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
