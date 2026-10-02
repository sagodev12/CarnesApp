type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description?: string | null;
  children?: React.ReactNode;
};

// Encabezado de las páginas internas de la tienda.
export default function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-brick">{eyebrow}</p>
      )}
      <h1 className="font-display text-3xl font-black sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-charcoal/70">{description}</p>}
      {children}
    </header>
  );
}
