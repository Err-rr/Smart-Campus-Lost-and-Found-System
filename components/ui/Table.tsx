import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { Card } from './Card';

/** Table inside a card. Scrolls sideways within the card on small screens. */
export function Table({ children, minWidth = 720, label }: { children: ReactNode; minWidth?: number; label: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto" role="region" aria-label={label} tabIndex={0}>
        <table className="w-full border-collapse text-left text-[14px]" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </Card>
  );
}

export function Th({ className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-divider bg-[#FAFAF8] px-4 py-3 font-mono text-eyebrow font-normal uppercase text-ink-3 ${className}`}
      {...props}
    />
  );
}

export function Td({ className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`border-b border-divider px-4 py-3.5 align-middle text-ink ${className}`} {...props} />;
}

export function Tr({ className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) {
  // Drop the bottom border on the last row only, so the card edge is not doubled.
  return <tr className={`[&:last-child>td]:border-b-0 ${className}`} {...props} />;
}
