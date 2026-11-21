import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createSeedData } from './seed';
import type { DemoData, Role, User } from './types';

interface StoreState extends DemoData {
  currentUserId: string | null;
  signInAsRole: (role: Role) => void;
  signOut: () => void;
  markNotificationsRead: (userId: string) => void;
  resetDemoData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...createSeedData(),
      currentUserId: null,

      signInAsRole: (role) =>
        set((state) => {
          const user = state.users.find((u) => u.role === role);
          return { currentUserId: user ? user.id : null };
        }),

      signOut: () => set({ currentUserId: null }),

      markNotificationsRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId && !n.read ? { ...n, read: true } : n,
          ),
        })),

      /** Restores the original seed data. Keeps the current sign-in. */
      resetDemoData: () => set({ ...createSeedData() }),
    }),
    {
      name: 'dtu-lost-found-demo',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useCurrentUser(): User | undefined {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId));
}

/**
 * True once the component has mounted on the client. Persisted state is only
 * read after this, which keeps server and client markup in agreement.
 */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
