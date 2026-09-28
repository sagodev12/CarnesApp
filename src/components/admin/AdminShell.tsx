"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Beef,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Tags,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package, exact: false },
  { href: "/admin/categorias", label: "Categorías", icon: Tags, exact: false },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, exact: false },
];

type AdminShellProps = {
  businessName: string;
  email: string | null;
  children: React.ReactNode;
};

// Estructura del panel: sidebar fijo en escritorio y, en celular, barra
// superior con un menú lateral (<dialog> nativo: Esc, foco y fondo).
export default function AdminShell({ businessName, email, children }: AdminShellProps) {
  const drawerRef = useRef<HTMLDialogElement>(null);
  const closeDrawer = () => drawerRef.current?.close();

  return (
    <div className="min-h-screen w-full">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:flex">
        <Sidebar businessName={businessName} email={email} />
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-cream/10 bg-charcoal px-4 text-cream lg:hidden">
        <Brand businessName={businessName} />
        <button
          type="button"
          onClick={() => drawerRef.current?.showModal()}
          aria-label="Abrir menú"
          className="rounded-md p-2 text-cream/80 hover:bg-cream/10 hover:text-cream"
        >
          <Menu size={22} />
        </button>
      </header>

      <dialog
        ref={drawerRef}
        onClick={(event) => event.target === drawerRef.current && closeDrawer()}
        aria-label="Menú del panel"
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-transparent p-0 backdrop:bg-charcoal/60 backdrop:backdrop-blur-sm lg:hidden"
      >
        <div className="relative flex h-full">
          <Sidebar businessName={businessName} email={email} onNavigate={closeDrawer} />
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar menú"
            className="absolute right-3 top-3 rounded-md p-2 text-cream/70 hover:bg-cream/10 hover:text-cream"
          >
            <X size={20} />
          </button>
        </div>
      </dialog>

      <main className="lg:pl-64">{children}</main>
    </div>
  );
}

function Brand({ businessName }: { businessName: string }) {
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brick text-cream">
        <Beef size={20} />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-display text-base font-black">{businessName}</span>
        <span className="block text-xs text-cream/60">Panel admin</span>
      </span>
    </Link>
  );
}

type SidebarProps = {
  businessName: string;
  email: string | null;
  onNavigate?: () => void;
};

function Sidebar({ businessName, email, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col bg-charcoal text-cream">
      <div className="border-b border-cream/10 px-5 py-5">
        <Brand businessName={businessName} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                active
                  ? "bg-cream/10 text-cream before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-brick"
                  : "text-cream/65 hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <Icon size={18} className={active ? "text-mustard" : ""} />
              {label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-cream/10" />

        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-cream/65 transition-colors hover:bg-cream/5 hover:text-cream"
        >
          <ExternalLink size={18} />
          Ver tienda
        </Link>
      </nav>

      <div className="border-t border-cream/10 px-5 py-4">
        {email && (
          <p className="truncate text-xs text-cream/60" title={email}>
            {email}
          </p>
        )}
        {/* <a> en lugar de <Link>: las rutas /auth/* no deben prefetchearse */}
        <a
          href="/auth/logout"
          className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-cream/80 hover:text-cream"
        >
          <LogOut size={16} />
          Cerrar sesión
        </a>
      </div>
    </div>
  );
}
