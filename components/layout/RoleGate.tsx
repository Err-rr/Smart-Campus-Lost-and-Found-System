'use client';

import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconTile } from '@/components/ui/IconTile';
import { ROLE_LABEL, homeFor } from '@/lib/domain';
import { useCurrentUser } from '@/lib/store';
import type { Role } from '@/lib/types';

interface RoleGateProps {
  roles: Role[];
  children: ReactNode;
  /** Send other roles to their own start page instead of showing a notice. */
  redirect?: boolean;
}

/** Shows children only to the listed roles. */
export function RoleGate({ roles, children, redirect = false }: RoleGateProps) {
  const user = useCurrentUser();
  const router = useRouter();
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (redirect && user && !allowed) router.replace(homeFor(user.role));
  }, [redirect, user, allowed, router]);

  if (allowed) return <>{children}</>;
  if (redirect) return null;

  const names = roles.map((r) => ROLE_LABEL[r]).join(' or ');

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <IconTile icon={Lock} className="mx-auto" />
      <h1 className="mt-5 text-section text-ink">This page is not part of your role</h1>
      <p className="mt-2 text-body text-ink-2">It is for {names} accounts.</p>
      <ButtonLink href={user ? homeFor(user.role) : '/login'} variant="secondary" className="mt-6">
        Go to my start page
      </ButtonLink>
    </Card>
  );
}
