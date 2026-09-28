import type { Metadata } from "next";

import PageHeader from "@/components/admin/PageHeader";
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
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Configuración"
        description="Personaliza la página pública. Los cambios se ven al guardar."
      />

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
