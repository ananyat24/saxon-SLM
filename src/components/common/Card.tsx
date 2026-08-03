export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface border border-border-subtle rounded-lg ${className}`}>
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
