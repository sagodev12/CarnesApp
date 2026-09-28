import type { PromotionStatus } from "@/lib/promotions";

const STYLES: Record<Exclude<PromotionStatus, "none">, { label: string; className: string }> = {
  active: { label: "Oferta activa", className: "bg-brick text-cream" },
  scheduled: { label: "Oferta programada", className: "bg-mustard/20 text-charcoal" },
  expired: { label: "Oferta vencida", className: "bg-charcoal/10 text-charcoal/70" },
};

export default function PromotionBadge({
  status,
  className = "",
}: {
  status: PromotionStatus;
  className?: string;
}) {
  if (status === "none") return null;
  const { label, className: colors } = STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors} ${className}`}
    >
      {label}
    </span>
  );
}
