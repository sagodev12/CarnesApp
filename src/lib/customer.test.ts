import { describe, expect, it } from "vitest";

import { EMPTY_CUSTOMER, parseStoredCustomer, validateCustomer, type Customer } from "./customer";

const ana: Customer = {
  name: "Ana Gómez",
  delivery: "domicilio",
  address: "Cra 10 # 5-20, barrio Centro",
  note: "",
};

describe("validateCustomer", () => {
  it("acepta datos completos para domicilio", () => {
    expect(validateCustomer(ana)).toEqual({});
  });

  it("exige el nombre", () => {
    expect(validateCustomer({ ...ana, name: " A " })).toHaveProperty("name");
  });

  it("exige la dirección solo para domicilio", () => {
    expect(validateCustomer({ ...ana, address: "  " })).toHaveProperty("address");
    expect(validateCustomer({ ...ana, delivery: "recoger", address: "" })).toEqual({});
  });

  it("limita la longitud de los textos", () => {
    const errors = validateCustomer({
      ...ana,
      name: "x".repeat(61),
      address: "x".repeat(151),
      note: "x".repeat(201),
    });
    expect(Object.keys(errors).sort()).toEqual(["address", "name", "note"]);
  });
});

describe("parseStoredCustomer", () => {
  it("lee los datos guardados", () => {
    expect(parseStoredCustomer(JSON.stringify(ana))).toEqual(ana);
  });

  it("completa campos faltantes o inválidos con valores vacíos", () => {
    expect(parseStoredCustomer(JSON.stringify({ name: "Ana", delivery: "avion", note: 3 }))).toEqual({
      ...EMPTY_CUSTOMER,
      name: "Ana",
    });
  });

  it("devuelve datos vacíos si no hay nada o no es JSON", () => {
    expect(parseStoredCustomer(null)).toEqual(EMPTY_CUSTOMER);
    expect(parseStoredCustomer("{roto")).toEqual(EMPTY_CUSTOMER);
    expect(parseStoredCustomer("[1]")).toEqual(EMPTY_CUSTOMER);
  });
});
