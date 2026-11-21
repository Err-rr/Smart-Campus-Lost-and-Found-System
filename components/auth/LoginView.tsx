'use client';

import { Briefcase, ChevronRight, GraduationCap, Inbox, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { DtuLogo } from '@/components/ui/DtuLogo';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconTile } from '@/components/ui/IconTile';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROLE_LABEL, homeFor } from '@/lib/domain';
import { useHasHydrated, useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

const ROLE_OPTIONS: { role: Role; icon: LucideIcon; note: string }[] = [
  { role: 'student', icon: GraduationCap, note: 'Report, search and claim items' },
  { role: 'staff', icon: Briefcase, note: 'Same access as students' },
  { role: 'desk', icon: Inbox, note: 'Log items, verify claims, hand over' },
  { role: 'admin', icon: ShieldCheck, note: 'Desk access plus settings and logs' },
];

export function LoginView() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const currentUserId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  const signInAsRole = useStore((s) => s.signInAsRole);

  useEffect(() => {
    const me = users.find((u) => u.id === currentUserId);
    if (hydrated && me) router.replace(homeFor(me.role));
  }, [hydrated, currentUserId, users, router]);

  const choose = (role: Role) => {
    signInAsRole(role);
    router.push(homeFor(role));
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden">
      {/* Campus photo behind the sign-in card. If public/login-bg.jpg is missing, the plain page colour shows. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -inset-6 bg-cover bg-center [filter:blur(6px)]"
          style={{ backgroundImage: "url('/login-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-page/60" />
      </div>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[440px] p-6 sm:p-8 md:max-w-[680px]">
          <div className="flex flex-col items-center text-center">
            <DtuLogo size={56} priority />
            <Eyebrow className="mt-5">Campus lost and found</Eyebrow>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink">Sign in</h1>
            <p className="mt-2 text-body text-ink-2">Choose your role to continue.</p>
          </div>

          <div className="mt-8">
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
              {ROLE_OPTIONS.map(({ role, icon, note }) => {
                const user = hydrated ? users.find((u) => u.role === role) : undefined;
                return (
                  <li key={role}>
                    <button
                      type="button"
                      onClick={() => choose(role)}
                      className="group flex w-full items-center gap-3 rounded-[12px] border border-line bg-white p-3 text-left transition-colors hover:border-accent hover:bg-accent focus-visible:border-accent focus-visible:bg-accent"
                    >
                      <IconTile icon={icon} className="transition-colors group-hover:bg-white group-hover:text-ink group-focus-visible:bg-white group-focus-visible:text-ink" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-ink">{ROLE_LABEL[role]}</span>
                        <span className="block min-h-[20px] truncate text-[13px] text-ink-2 transition-colors group-hover:text-ink group-focus-visible:text-ink">
                          {user ? (
                            <>
                              {user.name}
                              {user.rollNo && <span className="ml-1.5 font-mono text-[12px] text-ink-3 transition-colors group-hover:text-ink group-focus-visible:text-ink">{user.rollNo}</span>}
                            </>
                          ) : hydrated ? (
                            note
                          ) : (
                            <Skeleton className="mt-1 h-3 w-32" />
                          )}
                        </span>
                      </span>
                      <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-ink-3 transition-colors group-hover:text-ink group-focus-visible:text-ink" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </main>
      {/* Solid strip so the footer text stays readable over the photo. */}
      <div className="bg-page">
        <Footer />
      </div>
    </div>
  );
}
