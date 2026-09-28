import Link from "next/link";
import { LogOut, ShieldAlert } from "lucide-react";

import AdminNav from "@/components/admin/AdminNav";
import { getAdminStatus } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminStatus();

  // Sin sesión, cada página redirige al login con su propia ruta de retorno
  // (el layout no conoce la URL actual). No se renderiza nada del panel.
  if (admin.status === "anonymous") return children;

  if (admin.status === "forbidden") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <ShieldAlert size={40} className="mx-auto text-brick" />
          <h1 className="mt-4 font-display text-2xl font-black">Acceso restringido</h1>
          <p className="mt-2 text-charcoal/70">
            La cuenta {admin.email ? <strong>{admin.email}</strong> : "actual"} no
            tiene permisos de administrador.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="rounded-md border border-line px-4 py-2 text-sm font-medium">
              Ir al inicio
            </Link>
            {/* <a> en lugar de <Link>: las rutas /auth/* no deben prefetchearse */}
            <a
              href="/auth/logout"
              className="rounded-md bg-charcoal px-4 py-2 text-sm font-medium text-cream"
            >
              Cerrar sesión
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="border-b border-line bg-charcoal text-cream">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className="font-display text-lg font-black">Panel admin</span>
            <AdminNav />
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-cream/70 sm:inline">{admin.email}</span>
            <a
              href="/auth/logout"
              className="inline-flex items-center gap-1.5 text-sm text-cream/80 hover:text-cream"
            >
              <LogOut size={16} />
              Salir
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
