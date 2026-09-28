import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  // Link "volver" encima del título.
  back?: { href: string; label: string };
  actions?: React.ReactNode;
};

// Encabezado común de las páginas del panel.
export default function PageHeader({ title, description, back, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/60 transition-colors hover:text-brick"
          >
            <ArrowLeft size={16} />
            {back.label}
          </Link>
        )}
        <h1 className="font-display text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-charcoal/70">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
