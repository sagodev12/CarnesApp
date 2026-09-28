"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

import { inputClass } from "@/components/ui/form";
import { DAY_NAMES, type OpeningHours } from "@/lib/hours";

type Row = { enabled: boolean; open: string; close: string };

// Se muestran de lunes a domingo (en los datos, 0 = domingo).
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAYS = [2, 3, 4, 5];
const DEFAULT_ROW: Row = { enabled: false, open: "07:00", close: "18:00" };

const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);

// Horario por día para el indicador "Abierto / Cerrado ahora". Envía los
// campos hours_<día>_enabled/_open/_close (ver site-config.schema).
export default function OpeningHoursField({
  hours,
  errors,
}: {
  hours: OpeningHours | null;
  errors?: string[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: 7 }, (_, day) => {
      const saved = hours?.[day];
      return saved ? { enabled: true, ...saved } : DEFAULT_ROW;
    }),
  );

  function change(day: number, changes: Partial<Row>) {
    setRows((current) => current.map((row, index) => (index === day ? { ...row, ...changes } : row)));
  }

  function copyMonday() {
    setRows((current) =>
      current.map((row, index) => (WEEKDAYS.includes(index) ? { ...current[1] } : row)),
    );
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
        {DISPLAY_ORDER.map((day) => {
          const row = rows[day];
          const name = capitalize(DAY_NAMES[day]);
          return (
            <li key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5">
              <label className="flex w-32 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name={`hours_${day}_enabled`}
                  checked={row.enabled}
                  onChange={(event) => change(day, { enabled: event.target.checked })}
                  className="size-4 accent-brick"
                />
                {name}
              </label>

              {row.enabled ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    name={`hours_${day}_open`}
                    value={row.open}
                    onChange={(event) => change(day, { open: event.target.value })}
                    aria-label={`${name}: abre`}
                    className={`${inputClass} w-32`}
                  />
                  <span className="text-charcoal/50">a</span>
                  <input
                    type="time"
                    name={`hours_${day}_close`}
                    value={row.close}
                    onChange={(event) => change(day, { close: event.target.value })}
                    aria-label={`${name}: cierra`}
                    className={`${inputClass} w-32`}
                  />
                </div>
              ) : (
                <span className="text-sm text-charcoal/50">Cerrado</span>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={copyMonday}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brick hover:underline"
      >
        <Copy size={14} />
        Copiar el horario del lunes de martes a viernes
      </button>

      {errors?.map((error) => (
        <p key={error} className="text-xs text-brick">
          {error}
        </p>
      ))}
    </div>
  );
}
