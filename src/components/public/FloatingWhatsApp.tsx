"use client";

import { useOrderCount } from "@/components/public/gallery/useOrder";

import WhatsAppButton from "./WhatsAppButton";

type FloatingWhatsAppProps = {
  phone: string;
  message: string | null;
};

// Con un pedido en curso, la barra del pedido ya tiene su botón de WhatsApp:
// el flotante se oculta y vuelve al enviar o vaciar el pedido.
export default function FloatingWhatsApp({ phone, message }: FloatingWhatsAppProps) {
  const count = useOrderCount();
  if (count > 0) return null;

  return <WhatsAppButton phone={phone} message={message} floating />;
}
