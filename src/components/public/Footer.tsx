import { Clock, MapPin, PhoneIcon } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { SiteConfig } from "@/types";

import BrandName from "./Brandname";

type FooterProps = {
  config: SiteConfig;
  highlight?: string;
};

// Muestra el número como "+57 312 362 7031".
function displayPhone(phone: string) {
  const match = phone.match(/^(57)(\d{3})(\d{3})(\d{4})$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]} ${match[4]}` : `+${phone}`;
}

export default function Footer({ config, highlight }: FooterProps) {
  const {
    business_name: businessName,
    description,
    address,
    schedule,
    phone_whatsapp: phone,
    instagram,
    facebook,
  } = config;

  return (
    <footer id="contacto" className="border-t border-line bg-charcoal text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <BrandName
            name={businessName}
            highlight={highlight}
            className="font-display text-2xl font-black"
            highlightClassName="text-mustard"
          />

          {description && <p className="mt-3 max-w-xs text-sm text-cream/70">{description}</p>}
        </div>

        <div className="space-y-3 text-sm text-cream/80">
          {address && (
            <p className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0 text-mustard" />
              {address}
            </p>
          )}

          {schedule && (
            <p className="flex items-center gap-2">
              <Clock size={16} className="shrink-0 text-mustard" />
              {schedule}
            </p>
          )}

          {phone && (
            <p className="flex items-center gap-2">
              <PhoneIcon size={16} className="shrink-0 text-mustard" />
              <a
                href={buildWhatsAppUrl(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-mustard"
              >
                {displayPhone(phone)}
              </a>
            </p>
          )}
        </div>

        {(instagram || facebook) && (
          <div className="flex gap-4 md:justify-end">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-cream/80 transition-colors hover:text-mustard"
              >
                <FaInstagram size={24} />
              </a>
            )}
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-cream/80 transition-colors hover:text-mustard"
              >
                <FaFacebook size={24} />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-cream/10 px-4 py-4 text-center text-xs text-cream/50 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
