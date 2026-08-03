import { useEffect, useRef, useState } from "react";
import { useCopilotThread } from "../../hooks/useCopilotThread";
import { useUiStore } from "../../store/uiStore";
import { clientConfig } from "../../config/client.config";
import { SafeMarkdown } from "./SafeMarkdown";

export function CopilotPanel({ fullPage = false }: { fullPage?: boolean }) {
  const selectedMachineId = useUiStore((s) => s.selectedMachineId);
  const { messages, suggestions, send, isPending } = useCopilotThread(selectedMachineId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
    setInput("");
  }

  return (
    <div className={`flex flex-col h-full bg-surface ${fullPage ? "" : "border-l border-border-subtle"}`}>
      <div className="px-4 py-3 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-text-primary">Copilot</h2>
        <p className="text-xs text-text-muted">
          {selectedMachineId ? `Context: ${selectedMachineId}` : "Select a machine to start"}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-xs text-text-muted italic">
            Ask about a flagged machine, e.g. "Why was {selectedMachineId ?? "CNC-104"} flagged?"
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 max-w-[92%] ${
              m.role === "user"
                ? "bg-accent text-white ml-auto"
                : "bg-surface-sunken text-text-primary border border-border-subtle"
            }`}
          >
            {m.role === "assistant" ? <SafeMarkdown content={m.content} /> : <p className="text-sm">{m.content}</p>}
          </div>
        ))}
        {isPending && <div className="text-xs text-text-muted">Copilot is thinking…</div>}
      </div>

      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={!selectedMachineId}
            onClick={() => send(q)}
            className="text-[11px] rounded-full border border-border-subtle px-2.5 py-1 text-text-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!selectedMachineId}
          placeholder={selectedMachineId ? "Ask the copilot…" : "Select a machine first"}
          className="flex-1 rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!selectedMachineId || !input.trim()}
          className="rounded-md bg-accent hover:bg-accent-strong disabled:opacity-40 text-white text-sm px-3 py-2 transition-colors"
        >
          Send
        </button>
      </form>

      <div className="px-4 pb-3 pt-1 border-t border-border-subtle">
        <p className="text-[10.5px] text-text-muted leading-snug">{clientConfig.copilotDisclaimer}</p>
      </div>
    </div>
  );
}
