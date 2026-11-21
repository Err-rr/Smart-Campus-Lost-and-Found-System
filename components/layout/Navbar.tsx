'use client';

import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DtuLogo } from '@/components/ui/DtuLogo';
import { homeFor, isActivePath, navLinksFor } from '@/lib/domain';
import { useStore } from '@/lib/store';
import type { User } from '@/lib/types';
import { NotificationBell } from './NotificationBell';
import { RoleChip } from './RoleChip';

export function Navbar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useStore((s) => s.signOut);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = navLinksFor(user.role);

  useEffect(() => setMenuOpen(false), [pathname]);

  const handleSignOut = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <header className="relative z-30 border-b border-divider bg-white">
      <div className="mx-auto flex h-[72px] max-w-page items-center gap-6 px-4 sm:px-6">
        <Link href={homeFor(user.role)} className="flex min-w-0 shrink-0 items-center gap-3">
          <DtuLogo priority />
          <span className="whitespace-nowrap text-[17px] font-bold tracking-[-0.01em] text-ink">Lost and Found</span>
        </Link>

        <nav aria-label="Main" className="hidden h-full items-stretch gap-6 lg:flex">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center whitespace-nowrap text-[15px] transition-colors ${
                  active ? 'font-semibold text-ink' : 'text-ink-icon hover:text-ink'
                }`}
              >
                {link.label}
                {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" aria-hidden />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell userId={user.id} />
          <RoleChip role={user.role} className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="hidden h-10 items-center gap-2 rounded-[10px] px-3 text-[15px] text-ink-icon transition-colors hover:bg-tile hover:text-ink lg:inline-flex"
          >
            <LogOut size={18} strokeWidth={1.5} aria-hidden />
            <span>Sign out</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-ink transition-colors hover:bg-tile lg:hidden"
          >
            {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-divider bg-white lg:hidden">
          <div className="mx-auto max-w-page px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-[12px] bg-tile px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-ink">{user.name}</p>
                {user.rollNo && <p className="font-mono text-[12px] text-ink-3">{user.rollNo}</p>}
              </div>
              <RoleChip role={user.role} className="bg-white" />
            </div>
            <nav aria-label="Main" className="flex flex-col">
              {links.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex h-12 items-center border-l-2 pl-4 text-[15px] transition-colors ${
                      active
                        ? 'border-accent font-semibold text-ink'
                        : 'border-transparent text-ink-icon hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 flex h-12 w-full items-center gap-2 border-t border-divider pl-4 pt-1 text-[15px] text-ink-icon transition-colors hover:text-ink"
            >
              <LogOut size={18} strokeWidth={1.5} aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
