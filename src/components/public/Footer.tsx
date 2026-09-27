import {MapPin, Clock, PhoneIcon } from "lucide-react";


// TODO: mover a site_config (Supabase) cuando esté listo
const WHATSAPP_NUMBER = "57312 3627031";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-charcoal text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-2xl font-black">
            Surti Carnes<span className="text-mustard"> del Fonce</span>
          </p>

          <p className="mt-3 max-w-xs text-sm text-cream/70">
            Cortes frescos, seleccionados a diario. Del mostrador a tu mesa.
          </p>
        </div>

        <div className="space-y-3 text-sm text-cream/80">
          <p className="flex items-center gap-2">
            <MapPin size={16} className="shrink-0 text-mustard" />
            Cra. 00 # 00-00, tu ciudad
          </p>

          <p className="flex items-center gap-2">
            <Clock size={16} className="shrink-0 text-mustard" />
            Lun a sáb, 7:00 a.m. – 6:00 p.m.
          </p>

          <p className="flex items-center gap-2">
            <PhoneIcon size={16} className="shrink-0 text-mustard" />
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-mustard"
            >
              {WHATSAPP_NUMBER}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-cream/10 px-4 py-4 text-center text-xs text-cream/50 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Surti Carnes del Fonce. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
