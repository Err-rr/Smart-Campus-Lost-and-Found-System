/** Static placeholder block shown before persisted data is loaded. A span so it is valid inside text. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`block rounded-[10px] bg-divider ${className}`} aria-hidden />;
}
