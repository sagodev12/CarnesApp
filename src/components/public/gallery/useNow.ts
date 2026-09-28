"use client";

import { useMemo, useSyncExternalStore } from "react";

const MINUTE = 60_000;

// Redondeado al minuto: el valor es estable entre renders y una promoción
// que empieza o termina se refleja sin recargar la página.
const currentMinute = () => Math.floor(Date.now() / MINUTE) * MINUTE;

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, MINUTE);
  return () => window.clearInterval(timer);
}

// Hora actual para decidir qué promociones están vigentes. Al hidratar usa la
// hora del render del servidor (serverTime) para que el HTML coincida.
export function useNow(serverTime: number) {
  const time = useSyncExternalStore(subscribe, currentMinute, () => serverTime);
  return useMemo(() => new Date(time), [time]);
}
