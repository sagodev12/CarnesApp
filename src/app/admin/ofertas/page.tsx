import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import OffersSettingsForm from "@/components/admin/OffersSettingsForm";
import PageHeader from "@/components/admin/PageHeader";
import PromotionList from "@/components/admin/PromotionList";
import { requireAdminPage } from "@/lib/auth/admin";
import { getPromotionProducts } from "@/lib/products/queries";
import { promotionStatus } from "@/lib/promotions";
import { getSiteConfig } from "@/lib/site-config/queries";

export const metadata: Metadata = {
  title: "Ofertas · Panel admin",
  robots: { index: false },
};

export default async function AdminOffersPage() {
  const admin = await requireAdminPage("/admin/ofertas");
  if (admin.status !== "admin") return null;

  const [config, promotions] = await Promise.all([getSiteConfig(), getPromotionProducts()]);

  const now = new Date();
  const renderedAt = now.getTime();
  const items = promotions.map((product) => ({ product, status: promotionStatus(product, now) }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Ofertas"
        description="Cómo se ve la franja de ofertas del inicio. Las ofertas en sí se crean poniendo un precio promo a cada producto."
      />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <OffersSettingsForm config={config} promotions={promotions} renderedAt={renderedAt} />

        <aside className="overflow-hidden rounded-xl border border-line bg-white lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-bold">Productos en oferta</h2>
            <Link
              href="/admin/productos"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brick hover:underline"
            >
              Productos
              <ArrowRight size={14} />
            </Link>
          </div>
          {items.length > 0 ? (
            <PromotionList items={items} />
          ) : (
            <p className="px-5 py-8 text-center text-sm text-charcoal/60">
              Aún no hay productos con precio promo. Edita un producto y ponle uno.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
