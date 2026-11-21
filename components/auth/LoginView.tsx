'use client';

import { Briefcase, ChevronRight, GraduationCap, Inbox, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DtuLogo } from '@/components/ui/DtuLogo';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconTile } from '@/components/ui/IconTile';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROLE_LABEL } from '@/lib/domain';
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
  const [ssoNotice, setSsoNotice] = useState(false);

  useEffect(() => {
    if (hydrated && currentUserId) router.replace('/');
  }, [hydrated, currentUserId, router]);

  const choose = (role: Role) => {
    signInAsRole(role);
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[440px] p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <DtuLogo size={56} priority />
            <Eyebrow className="mt-5">Campus lost and found</Eyebrow>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink">Sign in</h1>
            <p className="mt-2 text-body text-ink-2">Use your DTU account to report and claim items.</p>
          </div>

          <Button size="lg" className="mt-6 w-full" onClick={() => setSsoNotice(true)}>
            Continue with Campus SSO
          </Button>
          {ssoNotice && (
            <p role="status" className="mt-3 rounded-[10px] border border-notice-line bg-notice-bg px-4 py-3 text-[14px] text-ink">
              Campus SSO is not connected in this demo build. Choose a role below.
            </p>
          )}

          <div className="mt-8 border-t border-divider pt-6">
            <Eyebrow>Demo mode: choose a role</Eyebrow>
            <p className="mt-1.5 text-[14px] text-ink-2">
              No real sign-in happens. All data stays in this browser.
            </p>

            <ul className="mt-4 flex flex-col gap-2">
              {ROLE_OPTIONS.map(({ role, icon, note }) => {
                const user = hydrated ? users.find((u) => u.role === role) : undefined;
                return (
                  <li key={role}>
                    <button
                      type="button"
                      onClick={() => choose(role)}
                      className="flex w-full items-center gap-3 rounded-[12px] border border-line bg-white p-3 text-left transition-colors hover:border-[#D6D3CB] hover:bg-[#FAFAF8]"
                    >
                      <IconTile icon={icon} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-ink">{ROLE_LABEL[role]}</span>
                        <span className="block min-h-[20px] truncate text-[13px] text-ink-2">
                          {user ? (
                            <>
                              {user.name}
                              {user.rollNo && <span className="ml-1.5 font-mono text-[12px] text-ink-3">{user.rollNo}</span>}
                            </>
                          ) : hydrated ? (
                            note
                          ) : (
                            <Skeleton className="mt-1 h-3 w-32" />
                          )}
                        </span>
                      </span>
                      <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-ink-3" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
