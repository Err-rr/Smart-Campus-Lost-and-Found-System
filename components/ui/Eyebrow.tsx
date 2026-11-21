import type { ReactNode } from 'react';

interface EyebrowProps {
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}

/** Small uppercase mono label, e.g. "CAMPUS LOST AND FOUND". */
export function Eyebrow({ children, tone = 'light', className = '' }: EyebrowProps) {
  const colour = tone === 'dark' ? 'text-panel-muted' : 'text-ink-3';
  return <p className={`font-mono text-eyebrow uppercase ${colour} ${className}`}>{children}</p>;
}
