import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-title">{title}</h1>
        {description && <p className="mt-3 text-body text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </div>
  );
}
