import Link from "next/link";
import { Percent } from "lucide-react";

import type { Category } from "@/types";

type CategoryNavProps = {
  categories: Pick<Category, "id" | "name" | "slug">[];
  // Página actual: slug de la categoría, "todos" (/productos) u "ofertas".
  active: string;
  showOffers: boolean;
};

const ALL = "todos";
const OFFERS = "ofertas";

// Accesos a cada categoría como enlaces (URL propia y compartible). En el
// celular es una fila deslizable para no ocupar media pantalla.
export default function CategoryNav({ categories, active, showOffers }: CategoryNavProps) {
  const links = [
    { key: ALL, href: "/productos", name: "Todos" },
    ...(showOffers ? [{ key: OFFERS, href: "/ofertas", name: "Ofertas" }] : []),
    ...categories.map((category) => ({
      key: category.slug,
      href: `/productos/${category.slug}`,
      name: category.name,
    })),
  ];

  if (links.length <= 1) return null;

  return (
    <nav aria-label="Categorías" className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
        {links.map((link) => {
          const current = link.key === active;
          const isOffers = link.key === OFFERS;
          return (
            <li key={link.key}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  current
                    ? isOffers
                      ? "border-brick bg-brick text-cream"
                      : "border-charcoal bg-charcoal text-cream"
                    : isOffers
                      ? "border-brick/40 bg-white text-brick hover:border-brick"
                      : "border-line bg-white text-charcoal hover:border-charcoal/40"
                }`}
              >
                {isOffers && <Percent size={14} />}
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
