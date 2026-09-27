import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";

// TODO: mover a site_config (Supabase) cuando esté listo
const WHATSAPP_NUMBER = "573123627031";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton phone={WHATSAPP_NUMBER} floating/>
    </div>
  );
}
