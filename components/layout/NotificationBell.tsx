'use client';

import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { relativeTime } from '@/lib/format';
import { useStore } from '@/lib/store';

export function NotificationBell({ userId }: { userId: string }) {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationsRead);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const mine = useMemo(
    () =>
      notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications, userId],
  );
  const unread = mine.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative flex h-10 w-10 items-center justify-center rounded-[10px] text-ink-icon transition-colors hover:bg-tile hover:text-ink"
      >
        <Bell size={20} strokeWidth={1.5} aria-hidden />
        {unread > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-white" aria-hidden />
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-[80px] z-40 rounded-card border border-line bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-divider px-5 py-4">
            <p className="text-[15px] font-semibold text-ink">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead(userId)}
                className="text-[13px] font-medium text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {mine.length === 0 ? (
            <p className="px-5 py-8 text-center text-[14px] text-ink-2">No notifications yet.</p>
          ) : (
            <ul className="max-h-[400px] divide-y divide-divider overflow-y-auto">
              {mine.slice(0, 8).map((n) => (
                <li key={n.id} className="flex gap-3 px-5 py-4">
                  <span
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-accent'}`}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className={`text-[14px] leading-snug ${n.read ? 'text-ink-2' : 'text-ink'}`}>{n.text}</p>
                    <p className="mt-1.5 text-[12px] text-ink-3">
                      {relativeTime(n.createdAt)}
                      <span className="mx-1.5">·</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em]">{n.channel}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
