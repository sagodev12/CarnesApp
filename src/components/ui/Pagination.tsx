import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { pageWindow } from "@/lib/pagination";

type PaginationProps = {
  page: number;
  totalPages: number;
  // Construye la URL de una página, p. ej. (n) => `/admin/productos?pagina=${n}`.
  hrefFor: (page: number) => string;
};

const base =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition-colors";

export default function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-1.5">
      <PageLink href={page > 1 ? hrefFor(page - 1) : null} label="Página anterior">
        <ChevronLeft size={16} />
      </PageLink>

      {pageWindow(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-charcoal/50">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={`${base} ${
              item === page
                ? "border-charcoal bg-charcoal text-cream"
                : "border-line bg-white hover:border-charcoal/40"
            }`}
          >
            {item}
          </Link>
        ),
      )}

      <PageLink href={page < totalPages ? hrefFor(page + 1) : null} label="Página siguiente">
        <ChevronRight size={16} />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <span aria-hidden className={`${base} border-line text-charcoal/30`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={`${base} border-line bg-white hover:border-charcoal/40`}>
      {children}
    </Link>
  );
}
