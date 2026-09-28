"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  addToOrder,
  decrementInOrder,
  orderLines,
  orderTotal,
  parseStoredOrder,
  removeFromOrder,
  sanitizeOrder,
  type Order,
  type OrderProduct,
} from "@/lib/order";

const STORAGE_KEY = "carnesapp:order";
const CHANGE_EVENT = "carnesapp:order-change";

// localStorage puede fallar (modo privado, cookies bloqueadas): el pedido
// sigue funcionando en memoria mientras la pestaña esté abierta.
let memoryFallback: string | null = null;

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryFallback;
  }
}

function writeOrder(order: Order) {
  const raw = Object.keys(order).length ? JSON.stringify(order) : null;
  memoryFallback = raw;
  try {
    if (raw) window.localStorage.setItem(STORAGE_KEY, raw);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Se queda en memoria.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  // "storage" sincroniza entre pestañas; el evento propio, dentro de esta.
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useOrder(products: OrderProduct[]) {
  // En el servidor no hay pedido: se hidrata vacío y luego se lee el guardado.
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);

  const order = useMemo(
    () => sanitizeOrder(parseStoredOrder(raw), products),
    [raw, products],
  );
  const lines = useMemo(() => orderLines(order, products), [order, products]);

  const add = useCallback(
    (product: OrderProduct) => writeOrder(addToOrder(order, product)),
    [order],
  );
  const decrement = useCallback(
    (product: OrderProduct) => writeOrder(decrementInOrder(order, product)),
    [order],
  );
  const remove = useCallback(
    (product: OrderProduct) => writeOrder(removeFromOrder(order, product)),
    [order],
  );
  const clear = useCallback(() => writeOrder({}), []);

  return { order, lines, total: orderTotal(lines), add, decrement, remove, clear };
}
