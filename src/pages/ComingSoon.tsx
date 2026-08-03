export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-10 h-10 rounded-lg bg-surface border border-border-subtle flex items-center justify-center mb-4">
        <span className="w-2 h-2 rounded-full bg-status-uncertain" />
      </div>
      <h1 className="text-lg font-semibold text-text-primary mb-1">{title}</h1>
      <p className="text-sm text-text-muted max-w-sm">
        This section is planned for a future release of the pilot. The navigation entry is wired up so the
        information architecture is complete.
      </p>
    </div>
  );
}
