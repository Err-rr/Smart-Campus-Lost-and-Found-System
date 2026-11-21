import type { ReactNode } from 'react';
import { CampusShell } from '@/components/layout/CampusShell';

export default function CampusLayout({ children }: { children: ReactNode }) {
  return <CampusShell>{children}</CampusShell>;
}
