"use client";

import { useActionState, useState } from "react";

import { updateSiteConfig } from "@/app/admin/configuracion/actions";
import { Field, FormMessage, SubmitButton, inputClass, pick } from "@/components/ui/form";
import { initialFormState } from "@/lib/forms";
import { toCoordinates } from "@/lib/location";
import type { SiteConfig } from "@/types";

import FormSection from "./FormSection";
import ImageField from "./ImageField";
import LocationPicker from "./LocationPicker";
import OpeningHoursField from "./OpeningHoursField";

export default function SiteConfigForm({ config }: { config: SiteConfig }) {
  const [state, formAction, pending] = useActionState(updateSiteConfig, initialFormState);
  const errors = state.fieldErrors ?? {};
  const v = state.values;

  const [color, setColor] = useState(config.primary_color ?? "#9a3324");

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <FormSection title="Marca" description="Cómo se presenta el negocio en la página.">
        <Field label="Nombre del negocio" name="business_name" errors={errors.business_name}>
          <input
            id="business_name"
            name="business_name"
            required
            maxLength={80}
            defaultValue={pick(v, "business_name", config.business_name)}
            aria-invalid={Boolean(errors.business_name)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Eslogan de portada"
          name="description"
          errors={errors.description}
          optional
          hint="Frase corta bajo el nombre en la portada. También se ve al compartir el enlace."
        >
          <textarea
            id="description"
            name="description"
            rows={2}
            maxLength={300}
            placeholder="Cortes frescos, seleccionados a diario. Del mostrador a tu mesa."
            defaultValue={pick(v, "description", config.description ?? "")}
            aria-invalid={Boolean(errors.description)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Texto del pie de página"
          name="footer_text"
          errors={errors.footer_text}
          optional
          hint="Si lo dejas vacío, se usa el eslogan de portada."
        >
          <textarea
            id="footer_text"
            name="footer_text"
            rows={2}
            maxLength={300}
            placeholder="Carnicería familiar en el barrio desde 1998."
            defaultValue={pick(v, "footer_text", config.footer_text ?? "")}
            aria-invalid={Boolean(errors.footer_text)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Color principal"
          name="primary_color"
          errors={errors.primary_color}
          hint="Botones, precios y acentos de la página."
        >
          <div className="flex items-center gap-3">
            <input
              id="primary_color"
              name="primary_color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border border-line bg-white p-1"
            />
            <code className="text-sm text-charcoal/70">{color}</code>
            <button
              type="button"
              onClick={() => setColor("#9a3324")}
              className="text-xs text-charcoal/60 underline"
            >
              Restablecer
            </button>
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <ImageField
            label="Logo"
            name="logo"
            removeName="remove_logo"
            currentUrl={config.logo_url}
            errors={errors.logo}
            removeChecked={pick(v, "remove_logo", false)}
          />
          <ImageField
            label="Imagen de portada"
            name="hero"
            removeName="remove_hero"
            currentUrl={config.hero_image_url}
            errors={errors.hero}
            removeChecked={pick(v, "remove_hero", false)}
          />
        </div>
      </FormSection>

      <FormSection
        title="Pedidos por WhatsApp"
        description="Los pedidos de la galería se envían a este número."
      >
        <Field
          label="Número de WhatsApp"
          name="phone_whatsapp"
          errors={errors.phone_whatsapp}
          hint="Con indicativo del país, ej: 57 312 362 7031. Si lo dejas vacío se ocultan los botones de pedido."
        >
          <input
            id="phone_whatsapp"
            name="phone_whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="57 312 362 7031"
            defaultValue={pick(v, "phone_whatsapp", config.phone_whatsapp)}
            aria-invalid={Boolean(errors.phone_whatsapp)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Saludo del pedido"
          name="whatsapp_message"
          errors={errors.whatsapp_message}
          optional
          hint="Primera línea del mensaje; debajo se agrega la lista de productos."
        >
          <input
            id="whatsapp_message"
            name="whatsapp_message"
            maxLength={200}
            defaultValue={pick(v, "whatsapp_message", config.whatsapp_message ?? "")}
            aria-invalid={Boolean(errors.whatsapp_message)}
            className={inputClass}
          />
        </Field>
      </FormSection>

      <FormSection title="Contacto y redes">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Dirección" name="address" errors={errors.address} optional>
            <input
              id="address"
              name="address"
              maxLength={150}
              defaultValue={pick(v, "address", config.address ?? "")}
              aria-invalid={Boolean(errors.address)}
              className={inputClass}
            />
          </Field>
          <Field label="Horario" name="schedule" errors={errors.schedule} optional>
            <input
              id="schedule"
              name="schedule"
              maxLength={150}
              placeholder="Lun a sáb, 7:00 a.m. – 6:00 p.m."
              defaultValue={pick(v, "schedule", config.schedule ?? "")}
              aria-invalid={Boolean(errors.schedule)}
              className={inputClass}
            />
          </Field>
          <Field label="Instagram" name="instagram" errors={errors.instagram} optional>
            <input
              id="instagram"
              name="instagram"
              placeholder="instagram.com/tu-negocio"
              defaultValue={pick(v, "instagram", config.instagram ?? "")}
              aria-invalid={Boolean(errors.instagram)}
              className={inputClass}
            />
          </Field>
          <Field label="Facebook" name="facebook" errors={errors.facebook} optional>
            <input
              id="facebook"
              name="facebook"
              placeholder="facebook.com/tu-negocio"
              defaultValue={pick(v, "facebook", config.facebook ?? "")}
              aria-invalid={Boolean(errors.facebook)}
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Horario de atención"
        description="Con él, la página muestra si el local está abierto ahora. Marca los días que abres."
      >
        <OpeningHoursField hours={config.opening_hours} errors={errors.opening_hours} />
      </FormSection>

      <FormSection
        title="Nosotros"
        description="Página /nosotros con la historia del negocio. Si la historia queda vacía, la página y su enlace no se muestran."
      >
        <Field label="Título" name="about_title" errors={errors.about_title} optional>
          <input
            id="about_title"
            name="about_title"
            maxLength={80}
            placeholder="Nuestra historia"
            defaultValue={pick(v, "about_title", config.about_title ?? "")}
            aria-invalid={Boolean(errors.about_title)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Historia"
          name="about_text"
          errors={errors.about_text}
          optional
          hint="Quiénes son, cómo empezaron, qué los hace distintos. Separa los párrafos con una línea en blanco."
        >
          <textarea
            id="about_text"
            name="about_text"
            rows={8}
            maxLength={3000}
            defaultValue={pick(v, "about_text", config.about_text ?? "")}
            aria-invalid={Boolean(errors.about_text)}
            className={inputClass}
          />
        </Field>

        <ImageField
          label="Imagen"
          name="about_image"
          removeName="remove_about_image"
          currentUrl={config.about_image_url}
          errors={errors.about_image}
          removeChecked={pick(v, "remove_about_image", false)}
          hint="Foto del local o del equipo. JPG, PNG o WEBP. Máximo 4 MB."
        />
      </FormSection>

      <FormSection
        title="Ubicación"
        description="Aparece como mapa en la sección “Visítanos” de la página, con un botón para llegar."
      >
        <LocationPicker
          initial={toCoordinates(config)}
          address={config.address}
          error={errors.latitude?.[0]}
        />
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton pending={pending}>Guardar cambios</SubmitButton>
      </div>
    </form>
  );
}
