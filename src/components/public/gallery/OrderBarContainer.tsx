"use client";

import OrderBar from "./OrderBar";
import { useOrder } from "./useOrder";

type OrderBarContainerProps = {
  phone: string;
  greeting: string | null;
  storeAddress: string | null;
};

// Barra del pedido en el layout: sigue visible al cambiar de página.
export default function OrderBarContainer({ phone, greeting, storeAddress }: OrderBarContainerProps) {
  const { lines, total, add, decrement, remove, clear, setNote } = useOrder();

  return (
    <OrderBar
      lines={lines}
      total={total}
      phone={phone}
      greeting={greeting}
      storeAddress={storeAddress}
      onNote={setNote}
      onAdd={add}
      onDecrement={decrement}
      onRemove={remove}
      onClear={clear}
    />
  );
}
