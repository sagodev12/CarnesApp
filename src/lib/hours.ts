// Horario de atención y estado "Abierto / Cerrado ahora" (lógica pura).
// Se evalúa en hora de Colombia (UTC-5 todo el año, sin horario de verano).

export type DayHours = { open: string; close: string }; // "HH:MM"
// 7 posiciones, 0 = domingo; null = cerrado ese día.
export type OpeningHours = (DayHours | null)[];

export const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const BUSINESS_OFFSET_MS = 5 * 60 * 60 * 1000;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isValidTime = (value: unknown): value is string =>
  typeof value === "string" && TIME.test(value);

// "HH:MM" se compara bien como texto.
export const isValidDay = (day: DayHours) =>
  isValidTime(day.open) && isValidTime(day.close) && day.close > day.open;

const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

export function formatTime(time: string) {
  const hours = Number(time.slice(0, 2));
  const suffix = hours < 12 ? "a. m." : "p. m.";
  return `${hours % 12 || 12}:${time.slice(3)} ${suffix}`;
}

export type OpenStatus = { open: boolean; label: string };

export function openStatus(hours: OpeningHours | null, now: Date): OpenStatus | null {
  if (!hours || hours.every((day) => day === null)) return null;

  // Hora local de Colombia leída con los métodos UTC.
  const local = new Date(now.getTime() - BUSINESS_OFFSET_MS);
  const today = local.getUTCDay();
  const current = local.getUTCHours() * 60 + local.getUTCMinutes();

  const todayHours = hours[today];
  if (todayHours) {
    if (current >= minutes(todayHours.open) && current < minutes(todayHours.close)) {
      return { open: true, label: `Abierto ahora · cierra a las ${formatTime(todayHours.close)}` };
    }
    if (current < minutes(todayHours.open)) {
      return { open: false, label: `Cerrado · abre hoy a las ${formatTime(todayHours.open)}` };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const day = (today + offset) % 7;
    const next = hours[day];
    if (!next) continue;

    const when = offset === 1 ? "mañana" : `el ${DAY_NAMES[day]}`;
    return { open: false, label: `Cerrado · abre ${when} a las ${formatTime(next.open)}` };
  }

  return null;
}

// Valida lo que viene de la base (jsonb): cualquier forma inesperada = sin horario.
export function parseOpeningHours(value: unknown): OpeningHours | null {
  if (!Array.isArray(value) || value.length !== 7) return null;

  const hours: OpeningHours = [];
  for (const day of value) {
    if (day === null) {
      hours.push(null);
      continue;
    }
    if (typeof day !== "object" || !isValidDay(day as DayHours)) return null;
    const { open, close } = day as DayHours;
    hours.push({ open, close });
  }
  return hours;
}
