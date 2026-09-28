import { describe, expect, it } from "vitest";

import { formatTime, openStatus, parseOpeningHours, type OpeningHours } from "./hours";

// 0 = domingo. Lunes a viernes 7–18, sábado 7–13, domingo cerrado.
const weekday = { open: "07:00", close: "18:00" };
const HOURS: OpeningHours = [
  null,
  weekday,
  weekday,
  weekday,
  weekday,
  weekday,
  { open: "07:00", close: "13:00" },
];

// Hora de Colombia = UTC-5. 2026-09-28 es lunes.
const at = (iso: string) => new Date(iso);

describe("openStatus", () => {
  it("abierto dentro del horario del día", () => {
    expect(openStatus(HOURS, at("2026-09-28T15:00:00Z"))).toEqual({
      open: true,
      label: "Abierto ahora · cierra a las 6:00 p. m.",
    });
  });

  it("antes de abrir, abre hoy", () => {
    expect(openStatus(HOURS, at("2026-09-28T11:30:00Z"))).toEqual({
      open: false,
      label: "Cerrado · abre hoy a las 7:00 a. m.",
    });
  });

  it("a la hora de cierre ya está cerrado y abre mañana", () => {
    expect(openStatus(HOURS, at("2026-09-28T23:00:00Z"))?.label).toBe(
      "Cerrado · abre mañana a las 7:00 a. m.",
    );
  });

  it("salta los días cerrados y nombra el día", () => {
    // Sábado 2:00 p. m. → domingo cerrado → lunes.
    expect(openStatus(HOURS, at("2026-09-26T19:00:00Z"))?.label).toBe(
      "Cerrado · abre el lunes a las 7:00 a. m.",
    );
  });

  it("usa la hora de Colombia, no la UTC", () => {
    // Lunes 04:00 UTC = domingo 11:00 p. m. en Colombia.
    expect(openStatus(HOURS, at("2026-09-28T04:00:00Z"))?.label).toBe(
      "Cerrado · abre mañana a las 7:00 a. m.",
    );
  });

  it("sin horario configurado no hay estado", () => {
    expect(openStatus(null, at("2026-09-28T15:00:00Z"))).toBeNull();
    expect(openStatus([null, null, null, null, null, null, null], at("2026-09-28T15:00:00Z"))).toBeNull();
  });
});

describe("formatTime", () => {
  it("usa formato de 12 horas", () => {
    expect(formatTime("07:00")).toBe("7:00 a. m.");
    expect(formatTime("12:30")).toBe("12:30 p. m.");
    expect(formatTime("00:15")).toBe("12:15 a. m.");
    expect(formatTime("18:45")).toBe("6:45 p. m.");
  });
});

describe("parseOpeningHours", () => {
  it("acepta un horario válido de 7 días", () => {
    expect(parseOpeningHours(HOURS)).toEqual(HOURS);
  });

  it("descarta lo que no tiene la forma esperada", () => {
    expect(parseOpeningHours(null)).toBeNull();
    expect(parseOpeningHours("lunes a sábado")).toBeNull();
    expect(parseOpeningHours(HOURS.slice(0, 6))).toBeNull();
    expect(parseOpeningHours([...HOURS.slice(0, 6), { open: "7am", close: "1pm" }])).toBeNull();
    expect(parseOpeningHours([...HOURS.slice(0, 6), { open: "13:00", close: "07:00" }])).toBeNull();
  });
});
