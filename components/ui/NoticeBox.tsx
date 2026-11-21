import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconTile } from './IconTile';

interface NoticeBoxProps {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function NoticeBox({ icon, children, className = '' }: NoticeBoxProps) {
  return (
    <div className={`flex gap-4 rounded-card border border-notice-line bg-notice-bg p-5 ${className}`}>
      <IconTile icon={icon} tone="accent" />
      <div className="min-w-0 text-[15px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}
