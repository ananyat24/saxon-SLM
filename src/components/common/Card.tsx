export function Card({
  title,
  action,
  children,
  className = "",
  delayMs = 0,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div
      className={`rise-in bg-surface border border-border-subtle rounded-xl shadow-sm ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {title && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {action}
        </div>
      )}
      <div className="px-5 pb-5 pt-2">{children}</div>
    </div>
  );
}
