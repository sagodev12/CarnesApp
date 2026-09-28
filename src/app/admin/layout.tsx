import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { getAdminStatus } from "@/lib/auth/admin";
import { getSiteConfig } from "@/lib/site-config/queries";

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

  const config = await getSiteConfig();

  return (
    <AdminShell businessName={config.business_name} email={admin.email}>
      {children}
    </AdminShell>
  );
}
