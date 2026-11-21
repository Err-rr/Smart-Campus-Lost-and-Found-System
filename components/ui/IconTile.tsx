import type { LucideIcon } from 'lucide-react';

interface IconTileProps {
  icon: LucideIcon;
  tone?: 'neutral' | 'accent';
  className?: string;
}

export function IconTile({ icon: Icon, tone = 'neutral', className = '' }: IconTileProps) {
  const colours = tone === 'accent' ? 'bg-accent text-accent-ink' : 'bg-tile text-ink-icon';
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-tile ${colours} ${className}`}>
      <Icon size={20} strokeWidth={1.5} aria-hidden />
    </span>
  );
}
