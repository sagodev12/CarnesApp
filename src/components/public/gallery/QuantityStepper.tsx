import { Minus, Plus } from "lucide-react";

import { formatQuantity, formatUnit } from "@/lib/whatsapp";

type QuantityStepperProps = {
  name: string;
  quantity: number;
  unit: string | null;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
};

export default function QuantityStepper({
  name,
  quantity,
  unit,
  onIncrement,
  onDecrement,
  size = "md",
}: QuantityStepperProps) {
  const button =
    size === "sm"
      ? "size-7 rounded-md"
      : "size-9 rounded-lg";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Quitar ${name}`}
        className={`${button} inline-flex items-center justify-center border border-line bg-white text-charcoal transition-colors hover:border-brick hover:text-brick`}
      >
        <Minus size={size === "sm" ? 14 : 16} />
      </button>
      <span
        aria-live="polite"
        className={`min-w-16 text-center font-semibold ${size === "sm" ? "text-sm" : ""}`}
      >
        {formatQuantity(quantity)} {formatUnit(unit, quantity)}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Agregar más ${name}`}
        className={`${button} inline-flex items-center justify-center bg-brick text-cream transition-colors hover:bg-brick-dark`}
      >
        <Plus size={size === "sm" ? 14 : 16} />
      </button>
    </div>
  );
}
