'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCurrentUser, useHasHydrated } from '@/lib/store';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

/** Static outline shown until the saved demo data has loaded. */
function ShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col" aria-busy="true" aria-label="Loading">
      <div className="border-b border-divider bg-white">
        <div className="mx-auto flex h-[72px] max-w-page items-center gap-3 px-4 sm:px-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40 sm:w-56" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="ml-auto h-10 w-10" />
        </div>
      </div>
      <main className="flex-1">
        <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-3/4 max-w-md" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-card" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-card" />
        </div>
      </main>
    </div>
  );
}

/** Signed-in layout. Sends visitors without a role to /login. */
export function CampusShell({ children }: { children: ReactNode }) {
  const hydrated = useHasHydrated();
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.replace('/login');
  }, [hydrated, user, router]);

  if (!hydrated || !user) return <ShellSkeleton />;

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
