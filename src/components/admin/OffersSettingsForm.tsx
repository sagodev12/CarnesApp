"use client";

import { useActionState, useState } from "react";
import { EyeOff, ImageIcon, LayoutGrid, GalleryHorizontal } from "lucide-react";

import { updateOffersSettings } from "@/app/admin/ofertas/actions";
import OfferBanner from "@/components/public/gallery/OfferBanner";
import { useNow } from "@/components/public/gallery/useNow";
import { Field, FormMessage, SubmitButton, inputClass } from "@/components/ui/form";
import { initialFormState } from "@/lib/forms";
import {
  OFFER_LAYOUTS,
  OFFER_STYLES,
  OFFERS_DEFAULT_TEXT,
  OFFERS_LIMIT,
  offersBanner,
  type OfferLayout,
  type OfferStyle,
} from "@/lib/offers-banner";
import { isOnSale } from "@/lib/promotions";
import type { ProductWithCategory, SiteConfig } from "@/types";

import FormSection from "./FormSection";
import ImageField from "./ImageField";
import { measureImageTone } from "./measureImageTone";

type OffersSettingsFormProps = {
  config: SiteConfig;
  // Productos con precio promo, para la vista previa.
  promotions: ProductWithCategory[];
  renderedAt: number;
};

// Muestra de color de cada estilo en el selector.
const SWATCHES: Record<OfferStyle, string> = {
  dark: "bg-charcoal",
  brand: "bg-brick",
  light: "border border-line bg-white",
  image: "bg-gradient-to-br from-charcoal via-charcoal/70 to-mustard/60",
};

const LAYOUT_ICONS: Record<OfferLayout, typeof LayoutGrid> = {
  carousel: GalleryHorizontal,
  grid: LayoutGrid,
};

export default function OffersSettingsForm({
  config,
  promotions,
  renderedAt,
}: OffersSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateOffersSettings, initialFormState);
  const errors = state.fieldErrors ?? {};
  const saved = offersBanner(config);

  // Campos controlados: alimentan la vista previa mientras se edita.
  const [visible, setVisible] = useState(saved.visible);
  const [eyebrow, setEyebrow] = useState(config.offers_eyebrow ?? "");
  const [title, setTitle] = useState(config.offers_title ?? "");
  const [subtitle, setSubtitle] = useState(config.offers_subtitle ?? "");
  // El guardado tal cual (aunque falte la imagen), no el corregido para mostrar.
  const [style, setStyle] = useState<OfferStyle>(
    OFFER_STYLES.some((option) => option.value === config.offers_style)
      ? (config.offers_style as OfferStyle)
      : "dark",
  );
  const [layout, setLayout] = useState<OfferLayout>(saved.layout);
  const [limit, setLimit] = useState(String(saved.limit));
  // Imagen elegida (aún sin subir) como URL local, y casilla "Quitar".
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [localTone, setLocalTone] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  function chooseImage(file: File | null) {
    if (localImage) URL.revokeObjectURL(localImage);
    const url = file ? URL.createObjectURL(file) : null;
    setLocalImage(url);
    setLocalTone(null);
    // Al guardar, el servidor mide la imagen igual; aquí solo para la vista previa.
    if (url) void measureImageTone(url).then((tone) => setLocalTone(tone));
  }

  const imageUrl = localImage ?? (removeImage ? null : config.offers_image_url);
  const imageTone = localImage ? localTone : removeImage ? null : config.offers_image_tone;
  const parsedLimit = Number(limit);
  const preview = offersBanner({
    offers_visible: visible,
    offers_eyebrow: eyebrow.trim() || null,
    offers_title: title.trim() || null,
    offers_subtitle: subtitle.trim() || null,
    offers_style: style,
    offers_image_url: imageUrl,
    offers_image_tone: imageTone,
    offers_layout: layout,
    offers_limit: Number.isInteger(parsedLimit) ? parsedLimit : OFFERS_LIMIT.default,
  });

  // Vista previa con las ofertas vigentes; si no hay, con las de ejemplo.
  const now = useNow(renderedAt);
  const shown = promotions.filter((product) => product.active && !product.sold_out);
  const live = shown.filter((product) => isOnSale(product, now));
  const sample = live.length > 0 ? live : shown;

  return (
    <div className="space-y-6">
      <section aria-label="Vista previa" className="rounded-xl border border-line bg-cream/60 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold">Vista previa</p>
          {!visible ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/10 px-3 py-1 text-xs font-medium text-charcoal/70">
              <EyeOff size={14} />
              Oculta en el inicio
            </span>
          ) : live.length === 0 ? (
            <span className="rounded-full bg-mustard/15 px-3 py-1 text-xs font-medium text-charcoal/70">
              Sin ofertas vigentes: la franja no se ve en el inicio
            </span>
          ) : null}
        </div>
        <div className={visible ? "" : "opacity-50"}>
          {sample.length > 0 ? (
            <OfferBanner settings={preview} offers={sample} now={now} canOrder={false} />
          ) : (
            <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-charcoal/60">
              Ponle precio promo a algún producto para ver aquí cómo queda la franja.
            </p>
          )}
        </div>
      </section>

      <form action={formAction} className="space-y-6">
        <FormMessage state={state} />

        <FormSection title="Visibilidad">
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              name="offers_visible"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
              className="size-5 accent-brick"
            />
            Mostrar la franja de ofertas en el inicio
            <span className="font-normal text-charcoal/50">(la página /ofertas sigue disponible)</span>
          </label>
        </FormSection>

        <FormSection title="Textos" description="Vacíos usan el texto por defecto.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Etiqueta superior" name="offers_eyebrow" errors={errors.offers_eyebrow} optional>
              <input
                id="offers_eyebrow"
                name="offers_eyebrow"
                maxLength={40}
                value={eyebrow}
                onChange={(event) => setEyebrow(event.target.value)}
                placeholder={OFFERS_DEFAULT_TEXT.eyebrow}
                className={inputClass}
              />
            </Field>
            <Field label="Título" name="offers_title" errors={errors.offers_title} optional>
              <input
                id="offers_title"
                name="offers_title"
                maxLength={60}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={OFFERS_DEFAULT_TEXT.title}
                className={inputClass}
              />
            </Field>
          </div>
          <Field
            label="Subtítulo"
            name="offers_subtitle"
            errors={errors.offers_subtitle}
            optional
            hint="También aparece en la página /ofertas."
          >
            <input
              id="offers_subtitle"
              name="offers_subtitle"
              maxLength={160}
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="Ej: Precios especiales hasta agotar existencias."
              className={inputClass}
            />
          </Field>
        </FormSection>

        <FormSection title="Estilo">
          <div role="radiogroup" aria-label="Estilo" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OFFER_STYLES.map((option) => {
              const checked = style === option.value;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border-2 p-2 text-center text-sm font-medium transition-colors ${
                    checked ? "border-brick" : "border-transparent hover:border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="offers_style"
                    value={option.value}
                    checked={checked}
                    onChange={() => setStyle(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={`mb-2 flex h-14 items-center justify-center rounded-lg text-cream ${SWATCHES[option.value]}`}
                  >
                    {option.value === "image" && <ImageIcon size={20} />}
                  </span>
                  {option.label}
                </label>
              );
            })}
          </div>
          {errors.offers_style && <p className="text-sm text-brick">{errors.offers_style[0]}</p>}

          <ImageField
            label="Imagen de fondo"
            name="offers_image"
            removeName="remove_offers_image"
            currentUrl={config.offers_image_url}
            errors={errors.offers_image}
            removeChecked={removeImage}
            hint="Se usa con el estilo “Con imagen”. Horizontal, JPG, PNG o WEBP, máximo 4 MB."
            onFileChange={chooseImage}
            onRemoveChange={setRemoveImage}
          />
        </FormSection>

        <FormSection title="Formato">
          <div role="radiogroup" aria-label="Formato" className="grid gap-3 sm:grid-cols-2">
            {OFFER_LAYOUTS.map((option) => {
              const checked = layout === option.value;
              const Icon = LAYOUT_ICONS[option.value];
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-colors ${
                    checked ? "border-brick" : "border-line hover:border-charcoal/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="offers_layout"
                    value={option.value}
                    checked={checked}
                    onChange={() => setLayout(option.value)}
                    className="sr-only"
                  />
                  <Icon size={22} className={checked ? "text-brick" : "text-charcoal/50"} />
                  <span>
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="block text-xs text-charcoal/60">{option.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <Field
            label="Ofertas en el inicio"
            name="offers_limit"
            errors={errors.offers_limit}
            hint={`Entre ${OFFERS_LIMIT.min} y ${OFFERS_LIMIT.max}. El botón “Ver todas” lleva al resto.`}
          >
            <input
              id="offers_limit"
              name="offers_limit"
              type="number"
              min={OFFERS_LIMIT.min}
              max={OFFERS_LIMIT.max}
              step={1}
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              className={`${inputClass} max-w-32`}
            />
          </Field>
        </FormSection>

        <div className="flex justify-end">
          <SubmitButton pending={pending}>Guardar cambios</SubmitButton>
        </div>
      </form>
    </div>
  );
}
