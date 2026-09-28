import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CircleAlert,
  EyeOff,
  ExternalLink,
  ImageOff,
  Package,
  Percent,
  Plus,
  Settings,
  Tags,
} from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import PromotionBadge from "@/components/admin/PromotionBadge";
import { requireAdminPage } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/format";
import { getDashboardData } from "@/lib/products/queries";
import { discountPercent, formatSaleWindow, promotionStatus } from "@/lib/promotions";
import { getSiteConfig } from "@/lib/site-config/queries";

export const metadata: Metadata = {
  title: "Inicio · Panel admin",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const admin = await requireAdminPage("/admin");
  if (admin.status !== "admin") return null;

  const [data, config] = await Promise.all([getDashboardData(), getSiteConfig()]);

  const now = new Date();
  const promotions = data.promotions.map((product) => ({
    product,
    status: promotionStatus(product, now),
  }));
  const current = promotions.filter(({ status }) => status === "active" || status === "scheduled");
  const activeCount = promotions.filter(({ status }) => status === "active").length;
  const scheduledCount = current.length - activeCount;
  const expiredCount = promotions.filter(({ status }) => status === "expired").length;
  const visible = data.total - data.hidden;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title={`Hola${admin.name ? `, ${admin.name.split(" ")[0]}` : ""}`}
        description={`Así va ${config.business_name} hoy.`}
        actions={
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark"
          >
            <Plus size={16} />
            Nuevo producto
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/productos"
          icon={Package}
          label="Productos"
          value={data.total}
          detail={`${visible} ${visible === 1 ? "visible" : "visibles"} en la tienda`}
          tone="charcoal"
        />
        <StatCard
          href="/admin/productos"
          icon={EyeOff}
          label="Ocultos"
          value={data.hidden}
          detail="No aparecen en la tienda"
          tone="neutral"
        />
        <StatCard
          href="#promociones"
          icon={Percent}
          label="Ofertas activas"
          value={activeCount}
          detail={
            scheduledCount > 0
              ? `${scheduledCount} ${scheduledCount === 1 ? "programada" : "programadas"}`
              : "Precio promo vigente hoy"
          }
          tone="brick"
        />
        <StatCard
          href="/admin/categorias"
          icon={Tags}
          label="Categorías"
          value={data.categories}
          detail="Filtros de la galería"
          tone="mustard"
        />
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <section
          id="promociones"
          aria-labelledby="promociones-title"
          className="scroll-mt-20 overflow-hidden rounded-2xl border border-line bg-white"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id="promociones-title" className="font-display text-xl font-bold">
              Promociones
            </h2>
            {expiredCount > 0 && (
              <span className="text-xs text-charcoal/60">
                {expiredCount} {expiredCount === 1 ? "vencida" : "vencidas"}
              </span>
            )}
          </header>

          {current.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <Percent size={36} className="text-charcoal/25" />
              <p className="mt-3 font-medium">No hay promociones activas</p>
              <p className="mt-1 max-w-sm text-sm text-charcoal/60">
                Edita un producto y ponle un precio promo para destacarlo en la tienda.
              </p>
              <Link
                href="/admin/productos"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brick hover:underline"
              >
                Ir a productos
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {current.map(({ product, status }) => (
                <li key={product.id}>
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-cream/50"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brick/10 text-sm font-bold text-brick">
                      -{discountPercent(product.price, product.sale_price as number)}%
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{product.name}</span>
                      <span className="block text-xs text-charcoal/60">
                        {formatSaleWindow(product)}
                        {!product.active && " · producto oculto"}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-xs text-charcoal/50 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="block font-semibold text-brick">
                        {formatPrice(product.sale_price as number)}
                      </span>
                    </span>
                    <PromotionBadge status={status} className="sm:w-32 sm:justify-center" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-bold">Accesos rápidos</h2>
            <ul className="mt-3 space-y-1">
              <QuickLink href="/admin/productos/nuevo" icon={Plus} label="Agregar producto" />
              <QuickLink href="/admin/categorias" icon={Tags} label="Gestionar categorías" />
              <QuickLink href="/admin/configuracion" icon={Settings} label="Configurar la tienda" />
              <QuickLink href="/" icon={ExternalLink} label="Ver la tienda" external />
            </ul>
          </section>

          {(data.withoutImage > 0 || data.hidden > 0 || expiredCount > 0) && (
            <section className="rounded-2xl border border-mustard/40 bg-mustard/10 p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <CircleAlert size={18} className="text-mustard" />
                Para revisar
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-charcoal/80">
                {data.withoutImage > 0 && (
                  <li className="flex items-center gap-2">
                    <ImageOff size={16} className="shrink-0 text-charcoal/50" />
                    {data.withoutImage} {data.withoutImage === 1 ? "producto" : "productos"} sin imagen
                  </li>
                )}
                {data.hidden > 0 && (
                  <li className="flex items-center gap-2">
                    <EyeOff size={16} className="shrink-0 text-charcoal/50" />
                    {data.hidden} {data.hidden === 1 ? "producto oculto" : "productos ocultos"}
                  </li>
                )}
                {expiredCount > 0 && (
                  <li className="flex items-center gap-2">
                    <Percent size={16} className="shrink-0 text-charcoal/50" />
                    {expiredCount} {expiredCount === 1 ? "oferta vencida" : "ofertas vencidas"}{" "}
                    por limpiar
                  </li>
                )}
              </ul>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

const TONES = {
  charcoal: "bg-charcoal text-cream",
  neutral: "bg-charcoal/10 text-charcoal",
  brick: "bg-brick text-cream",
  mustard: "bg-mustard text-cream",
};

type StatCardProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
  tone: keyof typeof TONES;
};

function StatCard({ href, icon: Icon, label, value, detail, tone }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-charcoal/30 hover:shadow-md"
    >
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-charcoal/60">{label}</span>
        <span className="block font-display text-3xl font-black leading-tight">{value}</span>
        <span className="block truncate text-xs text-charcoal/60">{detail}</span>
      </span>
    </Link>
  );
}

type QuickLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
};

function QuickLink({ href, icon: Icon, label, external }: QuickLinkProps) {
  return (
    <li>
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-cream"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-cream text-charcoal/70 group-hover:bg-white">
          <Icon size={16} />
        </span>
        <span className="flex-1">{label}</span>
        <ArrowRight
          size={16}
          className="text-charcoal/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brick"
        />
      </Link>
    </li>
  );
}
