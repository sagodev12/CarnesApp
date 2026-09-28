"use client";

import { useActionState, useState } from "react";
import Image from "next/image";

import { updateSiteConfig } from "@/app/admin/configuracion/actions";
import {
  Field,
  FormMessage,
  SubmitButton,
  fileInputClass,
  inputClass,
  pick,
} from "@/components/ui/form";
import { initialFormState } from "@/lib/forms";
import { toCoordinates } from "@/lib/location";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/validations/common";
import type { SiteConfig } from "@/types";

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

      <Section title="Marca" description="Cómo se presenta el negocio en la página.">
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
          label="Descripción"
          name="description"
          errors={errors.description}
          optional
          hint="Aparece en la portada y en el pie de página."
        >
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={300}
            placeholder="Cortes frescos, seleccionados a diario. Del mostrador a tu mesa."
            defaultValue={pick(v, "description", config.description ?? "")}
            aria-invalid={Boolean(errors.description)}
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
      </Section>

      <Section
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
      </Section>

      <Section title="Contacto y redes">
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
      </Section>

      <Section
        title="Horario de atención"
        description="Con él, la página muestra si el local está abierto ahora. Marca los días que abres."
      >
        <OpeningHoursField hours={config.opening_hours} errors={errors.opening_hours} />
      </Section>

      <Section
        title="Ubicación"
        description="Aparece como mapa en la sección “Visítanos” de la página, con un botón para llegar."
      >
        <LocationPicker
          initial={toCoordinates(config)}
          address={config.address}
          error={errors.latitude?.[0]}
        />
      </Section>

      <div className="flex justify-end">
        <SubmitButton pending={pending}>Guardar cambios</SubmitButton>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-5 rounded-xl border border-line bg-white/60 p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-charcoal/60">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

type ImageFieldProps = {
  label: string;
  name: string;
  removeName: string;
  currentUrl: string | null;
  errors?: string[];
  removeChecked: boolean;
};

function ImageField({ label, name, removeName, currentUrl, errors, removeChecked }: ImageFieldProps) {
  return (
    <Field label={label} name={name} errors={errors} optional hint="JPG, PNG o WEBP. Máximo 4 MB.">
      {currentUrl && (
        <div className="mb-3 flex items-center gap-3">
          <div className="relative h-16 w-24 overflow-hidden rounded-md bg-charcoal/5">
            <Image src={currentUrl} alt={label} fill sizes="96px" className="object-contain" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={removeName}
              defaultChecked={removeChecked}
              className="size-4 accent-brick"
            />
            Quitar
          </label>
        </div>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        aria-invalid={Boolean(errors)}
        className={fileInputClass}
      />
    </Field>
  );
}
