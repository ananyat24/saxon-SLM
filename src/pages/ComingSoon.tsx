export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-12 h-12 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-center text-xl mb-4">
        🚧
      </div>
      <h1 className="text-lg font-semibold text-text-primary mb-1">{title}</h1>
      <p className="text-sm text-text-muted max-w-sm">
        This section is planned for a future release of the pilot. The navigation entry is wired up so the
        information architecture is complete.
      </p>
    </div>
  );
}
