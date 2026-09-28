"use client";

import { useClientNow } from "@/components/public/gallery/useNow";
import { openStatus, type OpeningHours } from "@/lib/hours";

type OpenStatusProps = {
  hours: OpeningHours | null;
  // "light": sobre fondo oscuro (portada con imagen).
  tone?: "light" | "dark";
  className?: string;
};

// "Abierto ahora · cierra a las 6:00 p. m." según el horario configurado.
// Depende de la hora del visitante: solo se muestra en el navegador.
export default function OpenStatus({ hours, tone = "dark", className = "" }: OpenStatusProps) {
  const now = useClientNow();
  const status = now ? openStatus(hours, now) : null;
  if (!status) return null;

  const colors =
    tone === "light"
      ? "bg-charcoal/50 text-cream ring-1 ring-cream/20 backdrop-blur-sm"
      : "bg-white text-charcoal ring-1 ring-line";

  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${colors} ${className}`}
    >
      <span className="relative flex size-2.5">
        {status.open && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex size-2.5 rounded-full ${status.open ? "bg-green-500" : "bg-red-500"}`}
        />
      </span>
      {status.label}
    </p>
  );
}
