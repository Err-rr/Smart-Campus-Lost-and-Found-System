'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useCurrentUser, useHasHydrated } from '@/lib/store';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

/** Signed-in layout. Sends visitors without a role to /login. */
export function CampusShell({ children }: { children: ReactNode }) {
  const hydrated = useHasHydrated();
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.replace('/login');
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return <div className="min-h-screen bg-page" aria-busy="true" />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <div className="mx-auto max-w-page px-4 py-8 sm:px-6 sm:py-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
