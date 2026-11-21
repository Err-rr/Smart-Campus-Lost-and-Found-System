/** Static placeholder block shown before persisted data is loaded. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-[10px] bg-divider ${className}`} aria-hidden />;
}
