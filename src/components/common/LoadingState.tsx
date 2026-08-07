// Branded loading state with an indeterminate progress bar — used instead
// of a bare "Loading…" string so a slow real-model fetch (e.g. a cold
// backend, or several parallel live /assess calls) reads as "the system is
// working" rather than "the page is stuck."
export function LoadingState({
  label = "Fetching live machine data…",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-24 h-1 rounded-full bg-surface-sunken overflow-hidden shrink-0">
          <div className="h-full w-1/3 rounded-full bg-accent animate-[loading-slide_1.1s_ease-in-out_infinite]" />
        </div>
        <p className="text-sm text-text-muted">{label}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="w-full max-w-xs h-1.5 rounded-full bg-surface-sunken overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-accent animate-[loading-slide_1.1s_ease-in-out_infinite]" />
      </div>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
