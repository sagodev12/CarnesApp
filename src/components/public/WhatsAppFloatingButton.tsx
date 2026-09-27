import { FaWhatsapp } from "react-icons/fa";
// TODO: mover a site_config (Supabase) cuando esté listo
const WHATSAPP_NUMBER = "57312 3627031";

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brick text-cream shadow-lg shadow-charcoal/20 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard md:hidden"
    >
      <FaWhatsapp size={22} />
    </a>
  );
}