import { daysSince } from './format';
import type { DemoData, FoundItem, FoundItemStatus, Role, Settings } from './types';

export const ROLE_LABEL: Record<Role, string> = {
  student: 'Student',
  staff: 'Faculty or Staff',
  desk: 'Desk Staff',
  admin: 'Administrator',
};

export interface NavLink {
  href: string;
  label: string;
}

/** Students and faculty or staff are both campus users: they report, search and claim. */
export const CAMPUS_ROLES: Role[] = ['student', 'staff'];

export function isCampusRole(role: Role | undefined): boolean {
  return !!role && CAMPUS_ROLES.includes(role);
}

const NAV: Record<Role, NavLink[]> = {
  student: [
    { href: '/', label: 'Home' },
    { href: '/lost', label: 'Lost Items' },
    { href: '/found', label: 'Found Items' },
    { href: '/report', label: 'Report' },
    { href: '/my-reports', label: 'My Reports' },
  ],
  staff: [
    { href: '/', label: 'Home' },
    { href: '/lost', label: 'Lost Items' },
    { href: '/found', label: 'Found Items' },
    { href: '/report', label: 'Report' },
    { href: '/my-reports', label: 'My Reports' },
  ],
  // Desk staff work from the console. Report and My Reports are not part of their job.
  desk: [
    { href: '/desk', label: 'Desk' },
    { href: '/found', label: 'Found Items' },
    { href: '/lost', label: 'Lost Items' },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/desk', label: 'Desk' },
    { href: '/found', label: 'Found Items' },
    { href: '/lost', label: 'Lost Items' },
  ],
};

export function navLinksFor(role: Role): NavLink[] {
  return NAV[role];
}

/** Where each role lands after signing in, and where the logo links to. */
export function homeFor(role: Role): string {
  return role === 'desk' ? '/desk' : role === 'admin' ? '/admin' : '/';
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Items still in custody past the unclaimed limit are shown as unclaimed. */
export function effectiveFoundStatus(
  item: FoundItem,
  settings: Settings,
  now: Date = new Date(),
): FoundItemStatus {
  if (item.status === 'in_custody' && daysSince(item.dateFound, now) > settings.unclaimedDays) {
    return 'unclaimed';
  }
  return item.status;
}

export const ACTIVE_CLAIM_STATUSES = ['submitted', 'approved'] as const;

export function isActiveClaim(status: string): boolean {
  return (ACTIVE_CLAIM_STATUSES as readonly string[]).includes(status);
}

/** Desk staff and admin can see clear photos and identifying details. */
export function canSeeHiddenDetails(role: Role | undefined): boolean {
  return role === 'desk' || role === 'admin';
}

export interface UserActivity {
  openReports: number;
  possibleMatches: number;
  claimsInProgress: number;
}

export function userActivity(
  data: Pick<DemoData, 'lostReports' | 'matches' | 'claims' | 'settings'>,
  userId: string,
): UserActivity {
  const myReports = data.lostReports.filter((r) => r.userId === userId);
  const openIds = new Set(myReports.filter((r) => r.status !== 'closed').map((r) => r.id));

  return {
    openReports: myReports.filter((r) => r.status !== 'closed').length,
    possibleMatches: data.matches.filter(
      (m) =>
        m.status === 'suggested' &&
        m.matchScore >= data.settings.matchThreshold &&
        openIds.has(m.lostReportId),
    ).length,
    claimsInProgress: data.claims.filter(
      (c) => c.userId === userId && (c.status === 'submitted' || c.status === 'approved'),
    ).length,
  };
}
