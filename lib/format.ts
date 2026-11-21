const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "21 Nov 2026" */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** "Just now", "12 minutes ago", "2 hours ago", "Yesterday", "5 days ago", then a date. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(iso);
}

export function daysSince(iso: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}
