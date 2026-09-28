"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

const LINKS = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-sm">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${
              active ? "bg-cream/15 text-cream" : "text-cream/70 hover:text-cream"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-cream/70 hover:text-cream"
      >
        Ver sitio
        <ExternalLink size={14} />
      </Link>
    </nav>
  );
}
