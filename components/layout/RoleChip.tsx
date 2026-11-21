import { ROLE_LABEL } from '@/lib/domain';
import type { Role } from '@/lib/types';

export function RoleChip({ role, className = '' }: { role: Role; className?: string }) {
  return (
    <span
      className={`inline-flex h-7 items-center whitespace-nowrap rounded-full border border-line bg-tile px-3 text-[13px] font-medium text-ink-icon ${className}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}
