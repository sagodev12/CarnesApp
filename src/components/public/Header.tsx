"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const NAV_LINKS = [
  { href: "#productos", label: "Productos" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

// TODO: mover a site_config (Supabase) cuando esté listo
const WHATSAPP_NUMBER = "573123627031";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-2xl font-black tracking-tight text-charcoal"
        >
          Carnes<span className="text-brick">App</span>
        </Link>

        {/* Nav — solo desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal/80 transition-colors hover:text-brick"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <div className="hidden md:block">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            className="inline-flex items-center justify-center rounded-full bg-[#25D366] p-3 text-white transition-colors hover:bg-[#20BD5A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <FaWhatsapp size={22} />
          </a>
        </div>


        {/* Toggle — solo mobile */}
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
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-base font-medium text-charcoal hover:bg-charcoal/5"
            >
              {link.label}
            </a>
          ))}
        <div className="hidden md:block">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="inline-flex items-center justify-center rounded-full bg-[#25D366] p-3 text-white transition-colors hover:bg-[#20BD5A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        >
          <FaWhatsapp size={22} />
        </a>
      </div>

        </nav>
      )}
    </header>
  );
}