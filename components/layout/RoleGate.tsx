'use client';

import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconTile } from '@/components/ui/IconTile';
import { ROLE_LABEL } from '@/lib/domain';
import { useCurrentUser } from '@/lib/store';
import type { Role } from '@/lib/types';

/** Shows children only to the listed roles. Others see an access notice. */
export function RoleGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const user = useCurrentUser();

  if (user && roles.includes(user.role)) return <>{children}</>;

  const allowed = roles.map((r) => ROLE_LABEL[r]).join(' or ');

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <IconTile icon={Lock} className="mx-auto" />
      <h1 className="mt-5 text-section text-ink">You do not have access to this page</h1>
      <p className="mt-2 text-body text-ink-2">This page is for {allowed} accounts only.</p>
      <ButtonLink href="/" variant="secondary" className="mt-6">
        Back to Home
      </ButtonLink>
    </Card>
  );
}
