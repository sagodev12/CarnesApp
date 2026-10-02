import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Category } from "@/types";

type CategoryCardProps = {
  category: Pick<Category, "name" | "slug" | "description" | "image_url">;
};

// Tarjeta del inicio que lleva a la página de la categoría.
export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/productos/${category.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-charcoal">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // Sin imagen: la inicial sobre el color de la marca.
          <div className="flex size-full items-center justify-center bg-brick font-display text-6xl font-black text-cream/90">
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-black">{category.name}</h3>
        {category.description && (
          <p className="mt-1 line-clamp-2 text-sm text-charcoal/70">{category.description}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brick">
          Ver productos
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
