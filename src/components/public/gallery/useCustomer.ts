"use client";

import { useState } from "react";

import { EMPTY_CUSTOMER, parseStoredCustomer, type Customer } from "@/lib/customer";

const STORAGE_KEY = "carnesapp:customer";

// localStorage puede fallar (modo privado): los datos siguen en memoria.
function readCustomer(): Customer {
  try {
    return parseStoredCustomer(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return EMPTY_CUSTOMER;
  }
}

function saveCustomer(customer: Customer) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
  } catch {
    // Se queda en memoria.
  }
}

// Datos de entrega del cliente, recordados para el próximo pedido.
// OrderBar solo se muestra en el cliente (con productos), así que leer
// localStorage al iniciar no causa desajustes de hidratación.
export function useCustomer() {
  const [customer, setCustomer] = useState<Customer>(() =>
    typeof window === "undefined" ? EMPTY_CUSTOMER : readCustomer(),
  );

  function update(changes: Partial<Customer>) {
    const next = { ...customer, ...changes };
    setCustomer(next);
    saveCustomer(next);
  }

  return { customer, update };
}
