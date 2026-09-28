import { describe, expect, it } from "vitest";

import { formValues } from "./forms";

describe("formValues", () => {
  it("copia los campos de texto y omite archivos y campos internos de Next", () => {
    const formData = new FormData();
    formData.set("name", "Chata");
    formData.set("$ACTION_ID_abc", "");
    formData.set("image", new File(["x"], "foto.jpg", { type: "image/jpeg" }));

    expect(formValues(formData)).toEqual({ name: "Chata" });
  });

  it("convierte checkboxes a boolean, marcados o no", () => {
    const formData = new FormData();
    formData.set("active", "on");

    expect(formValues(formData, ["active", "remove_image"])).toEqual({
      active: true,
      remove_image: false,
    });
  });
});
