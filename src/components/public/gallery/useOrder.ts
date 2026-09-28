"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import {
  addToOrder,
  decrementInOrder,
  orderLines,
  orderTotal,
  parseStoredOrder,
  removeFromOrder,
  syncOrder,
  type Order,
  type OrderProduct,
} from "@/lib/order";
import { MAX_IDS } from "@/lib/products/query-params";
import { toOrderProduct, type SaleFields } from "@/lib/promotions";

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

// Revalida el pedido guardado contra el servidor una vez por carga de página:
// quita productos inactivos/eliminados y actualiza precios y nombres.
let validated = false;

async function validateStoredOrder() {
  const order = parseStoredOrder(readRaw());
  const ids = Object.keys(order).slice(0, MAX_IDS);
  if (ids.length === 0) return;

  try {
    const response = await fetch(`/api/products?ids=${ids.join(",")}`);
    if (!response.ok) return; // Sin conexión o error: se conserva lo guardado.

    const { items } = (await response.json()) as { items: (OrderProduct & SaleFields)[] };
    // Precio vigente: aplica promociones nuevas y quita las que terminaron.
    const now = new Date();
    const fresh = items.map((item) => toOrderProduct(item, now));
    // Se relee por si el cliente cambió el pedido mientras llegaba la respuesta.
    writeOrder(syncOrder(parseStoredOrder(readRaw()), fresh, { dropMissing: true }));
  } catch {
    // Se conserva lo guardado.
  }
}

export function useOrder() {
  // En el servidor no hay pedido: se hidrata vacío y luego se lee el guardado.
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const order = useMemo(() => parseStoredOrder(raw), [raw]);
  const lines = useMemo(() => orderLines(order), [order]);

  useEffect(() => {
    if (validated) return;
    validated = true;
    void validateStoredOrder();
  }, []);

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
