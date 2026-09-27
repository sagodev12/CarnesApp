type BrandNameProps = {
  /** Nombre completo del negocio, ej: "Surti Carnes del Fonce" */
  name: string;
  /** Parte del nombre a resaltar en color de acento, ej: "del Fonce" */
  highlight?: string;
  className?: string;
  /** Color del texto resaltado. Por defecto text-brick (para fondos claros) */
  highlightClassName?: string;
};

export default function BrandName({
  name,
  highlight,
  className = "",
  highlightClassName = "text-brick",
}: BrandNameProps) {
  if (!highlight) {
    return <span className={className}>{name}</span>;
  }

  const index = name.toLowerCase().lastIndexOf(highlight.toLowerCase());

  // Si el texto a resaltar no aparece en el nombre, se muestra completo sin resaltar
  // en vez de romper el render.
  if (index === -1) {
    return <span className={className}>{name}</span>;
  }

  const before = name.slice(0, index);
  const matched = name.slice(index, index + highlight.length);
  const after = name.slice(index + highlight.length);

  return (
    <span className={className}>
      {before}
      <span className={highlightClassName}>{matched}</span>
      {after}
    </span>
  );
}
