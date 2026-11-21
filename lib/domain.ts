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

const BASE_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/lost', label: 'Lost Items' },
  { href: '/found', label: 'Found Items' },
  { href: '/report', label: 'Report' },
  { href: '/my-reports', label: 'My Reports' },
  { href: '/about', label: 'About' },
];

export function navLinksFor(role: Role): NavLink[] {
  const links = [...BASE_LINKS];
  if (role === 'desk' || role === 'admin') links.push({ href: '/desk', label: 'Desk' });
  if (role === 'admin') links.push({ href: '/admin', label: 'Admin' });
  return links;
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

export interface UserActivity {
  openReports: number;
  possibleMatches: number;
  claimsInProgress: number;
}

export function userActivity(data: DemoData, userId: string): UserActivity {
  const myReports = data.lostReports.filter((r) => r.userId === userId);
  const openIds = new Set(myReports.filter((r) => r.status === 'open').map((r) => r.id));

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
