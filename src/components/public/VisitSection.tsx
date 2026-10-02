import { Clock, MapPin, Navigation } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { googleMapsDirectionsUrl, googleMapsEmbedUrl, type Coordinates } from "@/lib/location";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { SiteConfig } from "@/types";

import OpenStatus from "./OpenStatus";

type VisitSectionProps = {
  config: SiteConfig;
  coordinates: Coordinates;
};

// "Visítanos": mapa de Google embebido (sin API key) con dirección, horario
// y accesos a la ruta y a WhatsApp.
export default function VisitSection({ config, coordinates }: VisitSectionProps) {
  const { business_name: businessName, address, schedule, phone_whatsapp: phone } = config;

  return (
    <section
      aria-labelledby="ubicacion-title"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="grid overflow-hidden rounded-3xl border border-line bg-white md:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-mustard">
            Te esperamos
          </p>
          <h1 id="ubicacion-title" className="mt-1 font-display text-3xl font-black sm:text-4xl">
            Visítanos
          </h1>
          <OpenStatus hours={config.opening_hours} className="mt-4 self-start" />

          <div className="mt-6 space-y-4 text-charcoal/80">
            {address && (
              <p className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 shrink-0 text-brick" />
                <span>{address}</span>
              </p>
            )}
            {schedule && (
              <p className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-brick" />
                <span>{schedule}</span>
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 md:mt-auto md:pt-8">
            <a
              href={googleMapsDirectionsUrl(coordinates)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brick px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark"
            >
              <Navigation size={16} />
              Cómo llegar
            </a>
            {phone && (
              <a
                href={buildWhatsAppUrl(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-charcoal px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-charcoal hover:text-cream"
              >
                <FaWhatsapp size={16} />
                Escríbenos
              </a>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full bg-charcoal/5 sm:aspect-video md:aspect-auto md:min-h-96">
          <iframe
            src={googleMapsEmbedUrl(coordinates)}
            title={`Mapa de ubicación de ${businessName}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 size-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
