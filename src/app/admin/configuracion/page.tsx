import type { Metadata } from "next";

import SiteConfigForm from "@/components/admin/SiteConfigForm";
import { requireAdminPage } from "@/lib/auth/admin";
import { getSiteConfig } from "@/lib/site-config/queries";

export const metadata: Metadata = {
  title: "Configuración · Panel admin",
  robots: { index: false },
};

export default async function AdminConfigPage() {
  const admin = await requireAdminPage("/admin/configuracion");
  if (admin.status !== "admin") return null;

  const config = await getSiteConfig();

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black">Configuración</h1>
        <p className="mt-1 text-charcoal/70">
          Personaliza la página pública. Los cambios se ven al guardar.
        </p>
      </header>

      {config.id ? (
        <SiteConfigForm config={config} />
      ) : (
        <p className="rounded-md bg-brick/10 px-4 py-3 text-sm text-brick-dark">
          No se encontró la fila de configuración en la tabla <code>site_config</code>.
        </p>
      )}
    </section>
  );
}
