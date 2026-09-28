"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import BrandName from "@/components/public/Brandname";

const LINKS = {
  products: { href: "#productos", label: "Productos" },
  about: { href: "#nosotros", label: "Nosotros" },
  location: { href: "#ubicacion", label: "Ubicación" },
  contact: { href: "#contacto", label: "Contacto" },
};

type HeaderProps = {
  businessName: string;
  highlight?: string;
  logoUrl: string | null;
  // Con ubicación configurada existe la sección #ubicacion.
  hasLocation: boolean;
};

export default function Header({ businessName, highlight, logoUrl, hasLocation }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const navLinks = hasLocation
    ? [LINKS.products, LINKS.about, LINKS.location, LINKS.contact]
    : [LINKS.products, LINKS.about, LINKS.contact];

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
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal/80 transition-colors hover:text-brick"
            >
              {link.label}
            </a>
          ))}
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
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-base font-medium text-charcoal hover:bg-charcoal/5"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
