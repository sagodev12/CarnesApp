import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import { brandHighlight } from "@/lib/site-config/defaults";
import { getSiteConfig } from "@/lib/site-config/queries";

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
      />
      <main className="flex-1">{children}</main>
      <Footer config={config} highlight={highlight} />
      {config.phone_whatsapp && (
        <WhatsAppButton
          phone={config.phone_whatsapp}
          message={config.whatsapp_message}
          floating
        />
      )}
    </div>
  );
}
