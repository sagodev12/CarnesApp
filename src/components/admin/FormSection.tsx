// Bloque con título de un formulario largo del panel.
export default function FormSection({
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
