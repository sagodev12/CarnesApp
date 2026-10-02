import type { Metadata } from "next";

import FloatingWhatsApp from "@/components/public/FloatingWhatsApp";
import Footer from "@/components/public/Footer";
import OrderBarContainer from "@/components/public/gallery/OrderBarContainer";
import Header from "@/components/public/Header";
import { toCoordinates } from "@/lib/location";
import { brandHighlight } from "@/lib/site-config/defaults";
import { getSiteConfig } from "@/lib/site-config/queries";

// Título, descripción e imagen al compartir el link (WhatsApp, Facebook…).
export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const title = config.business_name;
  const description = config.description ?? undefined;
  const image = config.hero_image_url ?? config.logo_url;

  return {
    // Las páginas internas ponen su título: "Ofertas · <Negocio>".
    title: { default: title, template: `%s · ${title}` },
    description,
    openGraph: {
      title,
      description,
      siteName: title,
      locale: "es_CO",
      type: "website",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: config.hero_image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    icons: config.logo_url ? { icon: config.logo_url, apple: config.logo_url } : undefined,
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();
  const highlight = brandHighlight(config.business_name);

  // El color principal se configura en el panel: las utilidades de Tailwind
  // (bg-brick, text-brick...) leen estas variables CSS.
  const themeStyle = {
    "--color-brick": config.primary_color,
    "--color-brick-dark": `color-mix(in srgb, ${config.primary_color} 80%, black)`,
  } as React.CSSProperties;

  return (
    <div className="flex min-h-screen w-full flex-col" style={themeStyle}>
      <Header
        businessName={config.business_name}
        highlight={highlight}
        logoUrl={config.logo_url}
        hasLocation={toCoordinates(config) !== null}
      />
      <main className="flex-1">{children}</main>
      <Footer config={config} highlight={highlight} />
      {config.phone_whatsapp && (
        <OrderBarContainer
          phone={config.phone_whatsapp}
          greeting={config.whatsapp_message}
          storeAddress={config.address}
        />
      )}
      {config.phone_whatsapp && (
        <FloatingWhatsApp phone={config.phone_whatsapp} message={config.whatsapp_message} />
      )}
    </div>
  );
}
