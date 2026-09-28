import { FaWhatsapp } from "react-icons/fa";

import { buildWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppButtonProps = {
  phone: string;
  /** Texto con el que se abre el chat */
  message?: string | null;
  label?: string;
  floating?: boolean;
  className?: string;
  iconSize?: number;
};

export default function WhatsAppButton({
  phone,
  message,
  label = "",
  floating = false,
  className = "",
  iconSize = 20,
}: WhatsAppButtonProps) {
  const hasLabel = Boolean(label?.trim());

  const isCircular = floating || !hasLabel;

  return (
    <a
      href={buildWhatsAppUrl(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label || "Escribir por WhatsApp"}
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        bg-[#25D366]
        text-white
        shadow-md
        shadow-charcoal/10
        transition-colors
        hover:bg-[#20BD5A]
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#25D366]

        ${isCircular ? "h-12 w-12 p-0" : "gap-2 px-5 py-2.5"}

        ${floating ? "fixed bottom-5 right-5 z-50 h-14 w-14" : ""}

        ${className}
      `}
    >
      <FaWhatsapp size={iconSize} className="shrink-0" aria-hidden="true" />

      {hasLabel && !floating && <span>{label}</span>}
    </a>
  );
}
