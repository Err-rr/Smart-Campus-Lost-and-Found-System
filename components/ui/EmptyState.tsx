import type { LucideIcon } from 'lucide-react';
import { ButtonLink, Button } from './Button';
import { Card } from './Card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  text: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, text, actionLabel, actionHref, onAction, className = '' }: EmptyStateProps) {
  return (
    <Card className={`flex flex-col items-center px-6 py-12 text-center ${className}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-accent text-accent-ink">
        <Icon size={26} strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="mt-5 text-[17px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[14px] text-ink-2">{text}</p>
      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} className="mt-6">
          {actionLabel}
        </ButtonLink>
      )}
      {actionLabel && !actionHref && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
