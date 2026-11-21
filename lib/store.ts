import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { findNewMatches, nextId } from './matching';
import { createSeedData } from './seed';
import type {
  AuditLog,
  Claim,
  DemoData,
  FoundItem,
  LostReport,
  Match,
  Notification,
  Role,
  Settings,
  User,
} from './types';
import { formatDate } from './format';
import { ROLE_LABEL } from './domain';

export type NewLostReport = Omit<LostReport, 'id' | 'userId' | 'status'>;
export type NewFoundItem = Omit<FoundItem, 'id' | 'reportedBy' | 'status'>;
export type NewClaim = Pick<Claim, 'foundItemId' | 'lostReportId' | 'proofOfOwnership' | 'lostOn' | 'lostAt'>;

interface StoreState extends DemoData {
  currentUserId: string | null;
  signInAsRole: (role: Role) => void;
  signOut: () => void;
  markNotificationsRead: (userId: string) => void;
  resetDemoData: () => void;
  addLostReport: (input: NewLostReport) => { report: LostReport; matches: Match[] };
  addFoundItem: (input: NewFoundItem, auditAction?: string) => { item: FoundItem; matches: Match[] };
  submitClaim: (input: NewClaim) => Claim;
  dismissMatch: (matchId: string) => void;
  // Desk
  approveClaim: (claimId: string) => void;
  rejectClaim: (claimId: string, reason: string) => void;
  confirmHandover: (claimId: string, collectorRollNo: string) => void;
  markUnclaimed: (foundItemId: string) => void;
  // Admin
  changeUserRole: (userId: string, role: Role) => void;
  addCategory: (name: string) => void;
  renameCategory: (categoryId: string, name: string) => void;
  deleteCategory: (categoryId: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const HOME_DESK = 'Central Lost and Found Desk';

/** localStorage can be full or blocked. The demo keeps working in memory if so. */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (err) {
      console.warn('Demo data could not be saved to this browser.', err);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

const nowIso = () => new Date().toISOString();

function makeNotification(existing: Notification[], userId: string, text: string): Notification {
  return {
    id: nextId('N', existing),
    userId,
    text,
    createdAt: nowIso(),
    read: false,
    channel: 'email and SMS, simulated',
  };
}

function makeLog(
  existing: AuditLog[],
  actorId: string,
  action: string,
  entity: AuditLog['entity'],
  entityId: string,
): AuditLog {
  return { id: nextId('A', existing), actorId, action, entity, entityId, timestamp: nowIso() };
}

/**
 * Applies new matches: marks each lost report as matched and notifies its owner.
 * Returns the updated slices.
 */
function applyMatches(
  newMatches: Match[],
  data: Pick<DemoData, 'lostReports' | 'foundItems' | 'notifications'>,
) {
  const lostReports = data.lostReports.map((r) =>
    newMatches.some((m) => m.lostReportId === r.id) && r.status === 'open'
      ? { ...r, status: 'matched' as const }
      : r,
  );
  const notifications = [...data.notifications];
  for (const m of newMatches) {
    const report = lostReports.find((r) => r.id === m.lostReportId);
    const item = data.foundItems.find((f) => f.id === m.foundItemId);
    if (!report || !item) continue;
    notifications.push(
      makeNotification(
        notifications,
        report.userId,
        `Possible match for your report ${report.id}: ${item.title} found at ${item.locationFound}.`,
      ),
    );
  }
  return { lostReports, notifications };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
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

      addLostReport: (input) => {
        const state = get();
        const userId = state.currentUserId!;
        const report: LostReport = {
          ...input,
          id: nextId('LR', state.lostReports),
          userId,
          status: 'open',
        };
        const lostReports = [...state.lostReports, report];
        const auditLogs = [
          ...state.auditLogs,
          makeLog(state.auditLogs, userId, 'Reported lost item', 'LostReport', report.id),
        ];
        const newMatches = findNewMatches({
          scope: { lostReportId: report.id },
          lostReports,
          foundItems: state.foundItems,
          matches: state.matches,
          threshold: state.settings.matchThreshold,
        });
        const applied = applyMatches(newMatches, {
          lostReports,
          foundItems: state.foundItems,
          notifications: state.notifications,
        });
        set({ ...applied, matches: [...state.matches, ...newMatches], auditLogs });
        return { report: applied.lostReports.find((r) => r.id === report.id)!, matches: newMatches };
      },

      addFoundItem: (input, auditAction = 'Reported found item') => {
        const state = get();
        const userId = state.currentUserId!;
        const item: FoundItem = {
          ...input,
          id: nextId('FI', state.foundItems),
          reportedBy: userId,
          status: 'in_custody',
        };
        const foundItems = [...state.foundItems, item];
        const auditLogs = [
          ...state.auditLogs,
          makeLog(state.auditLogs, userId, auditAction, 'FoundItem', item.id),
        ];
        const newMatches = findNewMatches({
          scope: { foundItemId: item.id },
          lostReports: state.lostReports,
          foundItems,
          matches: state.matches,
          threshold: state.settings.matchThreshold,
        });
        const applied = applyMatches(newMatches, {
          lostReports: state.lostReports,
          foundItems,
          notifications: state.notifications,
        });
        set({ ...applied, foundItems, matches: [...state.matches, ...newMatches], auditLogs });
        return { item, matches: newMatches };
      },

      submitClaim: (input) => {
        const state = get();
        const userId = state.currentUserId!;
        const claim: Claim = {
          ...input,
          id: nextId('CL', state.claims),
          userId,
          status: 'submitted',
          submittedOn: nowIso(),
        };
        set({
          claims: [...state.claims, claim],
          foundItems: state.foundItems.map((f) =>
            f.id === claim.foundItemId && f.status !== 'returned' ? { ...f, status: 'claim_pending' } : f,
          ),
          // A claim linked to a report confirms the suggested match for that pair.
          matches: state.matches.map((m) =>
            input.lostReportId &&
            m.lostReportId === input.lostReportId &&
            m.foundItemId === input.foundItemId &&
            m.status === 'suggested'
              ? { ...m, status: 'confirmed' }
              : m,
          ),
          auditLogs: [...state.auditLogs, makeLog(state.auditLogs, userId, 'Submitted claim', 'Claim', claim.id)],
          notifications: [
            ...state.notifications,
            makeNotification(state.notifications, userId, `Claim ${claim.id} submitted. The desk will review it.`),
          ],
        });
        return claim;
      },

      dismissMatch: (matchId) => {
        const state = get();
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) return;
        const matches = state.matches.map((m) =>
          m.id === matchId ? { ...m, status: 'dismissed' as const } : m,
        );
        const stillMatched = matches.some(
          (m) => m.lostReportId === match.lostReportId && m.status !== 'dismissed',
        );
        set({
          matches,
          lostReports: state.lostReports.map((r) =>
            r.id === match.lostReportId && r.status === 'matched' && !stillMatched
              ? { ...r, status: 'open' }
              : r,
          ),
          auditLogs: [
            ...state.auditLogs,
            makeLog(state.auditLogs, state.currentUserId ?? 'unknown', 'Dismissed match', 'Match', matchId),
          ],
        });
      },

      approveClaim: (claimId) => {
        const state = get();
        const claim = state.claims.find((c) => c.id === claimId);
        if (!claim || claim.status !== 'submitted') return;
        set({
          claims: state.claims.map((c) => (c.id === claimId ? { ...c, status: 'approved' } : c)),
          auditLogs: [...state.auditLogs, makeLog(state.auditLogs, state.currentUserId!, 'Approved claim', 'Claim', claimId)],
          notifications: [
            ...state.notifications,
            makeNotification(
              state.notifications,
              claim.userId,
              `Claim ${claimId} approved. Collect your item from ${HOME_DESK} with your college ID.`,
            ),
          ],
        });
      },

      rejectClaim: (claimId, reason) => {
        const state = get();
        const claim = state.claims.find((c) => c.id === claimId);
        if (!claim || claim.status !== 'submitted') return;
        const claims = state.claims.map((c) =>
          c.id === claimId ? { ...c, status: 'rejected' as const, rejectionReason: reason } : c,
        );
        const otherActive = claims.some(
          (c) => c.foundItemId === claim.foundItemId && (c.status === 'submitted' || c.status === 'approved'),
        );
        set({
          claims,
          foundItems: state.foundItems.map((f) =>
            f.id === claim.foundItemId && f.status === 'claim_pending' && !otherActive ? { ...f, status: 'in_custody' } : f,
          ),
          auditLogs: [...state.auditLogs, makeLog(state.auditLogs, state.currentUserId!, 'Rejected claim', 'Claim', claimId)],
          notifications: [
            ...state.notifications,
            makeNotification(state.notifications, claim.userId, `Claim ${claimId} rejected. Reason: ${reason}`),
          ],
        });
      },

      confirmHandover: (claimId, collectorRollNo) => {
        const state = get();
        const claim = state.claims.find((c) => c.id === claimId);
        if (!claim || claim.status !== 'approved') return;
        const now = nowIso();
        const deskUserId = state.currentUserId!;
        set({
          claims: state.claims.map((c) => {
            if (c.id === claimId) {
              return { ...c, status: 'handed_over' as const, handoverDate: now, handedOverBy: deskUserId };
            }
            // Other open claims on the same item can no longer succeed.
            if (c.foundItemId === claim.foundItemId && (c.status === 'submitted' || c.status === 'approved')) {
              return { ...c, status: 'rejected' as const, rejectionReason: 'The item was handed over to its owner.' };
            }
            return c;
          }),
          foundItems: state.foundItems.map((f) => (f.id === claim.foundItemId ? { ...f, status: 'returned' } : f)),
          lostReports: state.lostReports.map((r) => (r.id === claim.lostReportId ? { ...r, status: 'closed' } : r)),
          auditLogs: [
            ...state.auditLogs,
            makeLog(
              state.auditLogs,
              deskUserId,
              `Recorded handover to ${collectorRollNo}, college ID checked`,
              'Claim',
              claimId,
            ),
          ],
          notifications: [
            ...state.notifications,
            makeNotification(
              state.notifications,
              claim.userId,
              `Your item ${claim.foundItemId} was handed over on ${formatDate(now)}.`,
            ),
          ],
        });
      },

      markUnclaimed: (foundItemId) => {
        const state = get();
        set({
          foundItems: state.foundItems.map((f) =>
            f.id === foundItemId && f.status === 'in_custody' ? { ...f, status: 'unclaimed' } : f,
          ),
          auditLogs: [
            ...state.auditLogs,
            makeLog(state.auditLogs, state.currentUserId!, 'Marked as unclaimed', 'FoundItem', foundItemId),
          ],
        });
      },

      changeUserRole: (userId, role) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user || user.role === role) return;
        set({
          users: state.users.map((u) => (u.id === userId ? { ...u, role } : u)),
          auditLogs: [
            ...state.auditLogs,
            makeLog(state.auditLogs, state.currentUserId!, `Changed role to ${ROLE_LABEL[role]}`, 'User', userId),
          ],
        });
      },

      addCategory: (name) => {
        const state = get();
        const id = `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
        set({
          categories: [...state.categories, { id, name }],
          auditLogs: [...state.auditLogs, makeLog(state.auditLogs, state.currentUserId!, `Added category ${name}`, 'Settings', id)],
        });
      },

      renameCategory: (categoryId, name) => {
        const state = get();
        set({
          categories: state.categories.map((c) => (c.id === categoryId ? { ...c, name } : c)),
          auditLogs: [
            ...state.auditLogs,
            makeLog(state.auditLogs, state.currentUserId!, `Renamed category to ${name}`, 'Settings', categoryId),
          ],
        });
      },

      deleteCategory: (categoryId) => {
        const state = get();
        const inUse =
          state.lostReports.some((r) => r.categoryId === categoryId) ||
          state.foundItems.some((f) => f.categoryId === categoryId);
        if (inUse) return;
        set({
          categories: state.categories.filter((c) => c.id !== categoryId),
          auditLogs: [...state.auditLogs, makeLog(state.auditLogs, state.currentUserId!, 'Deleted category', 'Settings', categoryId)],
        });
      },

      updateSettings: (patch) => {
        const state = get();
        const settings = { ...state.settings, ...patch };
        set({
          settings,
          auditLogs: [
            ...state.auditLogs,
            makeLog(
              state.auditLogs,
              state.currentUserId!,
              `Updated settings: threshold ${settings.matchThreshold}, unclaimed after ${settings.unclaimedDays} days`,
              'Settings',
              'settings',
            ),
          ],
        });
      },
    }),
    {
      name: 'dtu-lost-found-demo',
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      // Older saved data used a different scoring model. Start from the fresh seed.
      migrate: (persisted) => ({
        ...createSeedData(),
        currentUserId: (persisted as { currentUserId?: string | null } | null)?.currentUserId ?? null,
      }),
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
