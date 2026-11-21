/**
 * Matching engine. Simple, deterministic and explainable.
 *
 * Score out of 100:
 *   Category   40  same category (required, otherwise no match)
 *   Location   20  same campus location
 *   Date       20  found 0 to 2 days after loss = 20, 3 to 7 days = 10, later = 0
 *   Keywords   20  Jaccard similarity of words x 20
 *
 * An item found before the loss date cannot belong to that report and is skipped.
 * Hidden identifying details are never used.
 */
import type { FoundItem, LostReport, Match, MatchFactor } from './types';

export const FACTOR_MAX: Record<MatchFactor, number> = {
  category: 40,
  location: 20,
  date: 20,
  keywords: 20,
};

export const FACTOR_LABEL: Record<MatchFactor, string> = {
  category: 'Same category',
  location: 'Same location',
  date: 'Date gap',
  keywords: 'Keyword overlap',
};

export const FACTOR_ORDER: MatchFactor[] = ['category', 'location', 'date', 'keywords'];

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'has', 'have', 'i', 'in',
  'into', 'is', 'it', 'its', 'my', 'near', 'of', 'on', 'or', 'some', 'that', 'the', 'there', 'this',
  'to', 'was', 'were', 'with', 'left', 'found', 'lost', 'item', 'one', 'two', 'small', 'kept',
  'written', 'inside', 'after', 'during', 'me', 'we', 'our', 'your', 'very', 'also',
]);

/** Lowercase words, stop words removed, plural "s" trimmed so "keys" equals "key". */
export function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));
  return new Set(words);
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let shared = 0;
  a.forEach((w) => {
    if (b.has(w)) shared += 1;
  });
  return shared / (a.size + b.size - shared);
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole calendar days from `fromIso` to `toIso` (negative if `toIso` is earlier). */
export function calendarDayGap(fromIso: string, toIso: string): number {
  const day = (iso: string) => {
    const d = new Date(iso);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };
  return Math.round((day(toIso) - day(fromIso)) / DAY);
}

export interface ScoreResult {
  matchScore: number;
  breakdown: Record<MatchFactor, number>;
}

/** Returns null when the pair cannot match (different category, or found before lost). */
export function scorePair(lost: LostReport, found: FoundItem): ScoreResult | null {
  if (lost.categoryId !== found.categoryId) return null;

  const gap = calendarDayGap(lost.dateLost, found.dateFound);
  if (gap < 0) return null;

  const breakdown: Record<MatchFactor, number> = {
    category: FACTOR_MAX.category,
    location:
      lost.locationLost.trim().toLowerCase() === found.locationFound.trim().toLowerCase()
        ? FACTOR_MAX.location
        : 0,
    date: gap <= 2 ? 20 : gap <= 7 ? 10 : 0,
    keywords: Math.round(
      jaccard(
        tokenize(`${lost.title} ${lost.description}`),
        tokenize(`${found.title} ${found.publicDescription}`),
      ) * FACTOR_MAX.keywords,
    ),
  };

  const matchScore = FACTOR_ORDER.reduce((sum, f) => sum + breakdown[f], 0);
  return { matchScore, breakdown };
}

export function nextId(prefix: string, existing: { id: string }[]): string {
  const max = existing.reduce((m, { id }) => {
    const n = Number(id.split('-')[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}

const isActiveReport = (r: LostReport) => r.status !== 'closed';
const isActiveItem = (f: FoundItem) => f.status !== 'returned';

/**
 * Finds new suggested matches for one new lost report or one new found item.
 * Pairs that already have a Match (in any status, including dismissed) are skipped.
 */
export function findNewMatches(params: {
  scope: { lostReportId: string } | { foundItemId: string };
  lostReports: LostReport[];
  foundItems: FoundItem[];
  matches: Match[];
  threshold: number;
  now?: Date;
}): Match[] {
  const { scope, lostReports, foundItems, matches, threshold } = params;
  const now = (params.now ?? new Date()).toISOString();

  const reports =
    'lostReportId' in scope ? lostReports.filter((r) => r.id === scope.lostReportId) : lostReports;
  const items =
    'foundItemId' in scope ? foundItems.filter((f) => f.id === scope.foundItemId) : foundItems;

  const existing = new Set(matches.map((m) => `${m.lostReportId}|${m.foundItemId}`));
  const created: Match[] = [];

  for (const report of reports.filter(isActiveReport)) {
    for (const item of items.filter(isActiveItem)) {
      if (existing.has(`${report.id}|${item.id}`)) continue;
      const result = scorePair(report, item);
      if (!result || result.matchScore < threshold) continue;
      created.push({
        id: nextId('M', [...matches, ...created]),
        lostReportId: report.id,
        foundItemId: item.id,
        matchScore: result.matchScore,
        breakdown: result.breakdown,
        status: 'suggested',
        matchedOn: now,
      });
    }
  }

  return created.sort((a, b) => b.matchScore - a.matchScore);
}
