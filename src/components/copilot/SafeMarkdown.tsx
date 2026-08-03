// Renders a small, safe subset of markdown (bold + bullet lines) coming from
// the SLM. Content is treated as untrusted plain text — everything is built
// with React elements, never dangerouslySetInnerHTML, so no HTML/script from
// the model can ever execute.
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

export function SafeMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;
        if (line.trim().startsWith("- ")) {
          return (
            <div key={idx} className="flex gap-1.5 pl-1">
              <span className="text-text-muted">•</span>
              <span>{renderInline(line.trim().slice(2), `l${idx}`)}</span>
            </div>
          );
        }
        return <p key={idx}>{renderInline(line, `l${idx}`)}</p>;
      })}
    </div>
  );
}
