"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import BrandName from "@/components/public/Brandname";

const LINKS = {
  home: { href: "/", label: "Inicio" },
  products: { href: "/productos", label: "Productos" },
  offers: { href: "/ofertas", label: "Ofertas" },
  location: { href: "/ubicacion", label: "Ubicación" },
  // El footer (#contacto) está en todas las páginas.
  contact: { href: "#contacto", label: "Contacto" },
};

// /productos también queda activo dentro de una categoría (/productos/res).
function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type HeaderProps = {
  businessName: string;
  highlight?: string;
  logoUrl: string | null;
  // Con ubicación configurada existe la página /ubicacion.
  hasLocation: boolean;
};

export default function Header({ businessName, highlight, logoUrl, hasLocation }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navLinks = hasLocation
    ? [LINKS.home, LINKS.products, LINKS.offers, LINKS.location, LINKS.contact]
    : [LINKS.home, LINKS.products, LINKS.offers, LINKS.contact];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-display text-2xl font-black tracking-tight text-charcoal"
        >
          {logoUrl && (
            <Image
              src={logoUrl}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-md object-contain"
            />
          )}
          <BrandName
            name={businessName}
            highlight={highlight}
            className="truncate font-display text-xl font-black tracking-tight text-charcoal sm:text-2xl"
          />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition-colors hover:text-brick ${
                  active ? "text-brick" : "text-charcoal/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Toggle mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="inline-flex items-center justify-center rounded-md p-2 text-charcoal md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú mobile */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-cream px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-2.5 text-base font-medium hover:bg-charcoal/5 ${
                  active ? "bg-charcoal/5 text-brick" : "text-charcoal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
