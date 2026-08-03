import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api";
import type { CopilotMessage } from "../types/contract";

const DEFAULT_SUGGESTIONS = [
  "Explain the numbers",
  "Can I continue operating?",
  "What should I inspect?",
  "What happens if I reduce torque by 15%?",
];

const SUBMIT_DEBOUNCE_MS = 800;

export function useCopilotThread(machineId: string | null) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const lastSubmitRef = useRef(0);

  const mutation = useMutation({
    mutationFn: (question: string) => apiClient.postCopilotMessage({ machine_id: machineId ?? "", question }),
    onSuccess: (res) => {
      setMessages((prev) => [...prev, res.message]);
      if (res.suggested_questions.length) setSuggestions(res.suggested_questions);
    },
  });

  function send(question: string) {
    if (!question.trim() || !machineId) return;
    const now = Date.now();
    if (now - lastSubmitRef.current < SUBMIT_DEBOUNCE_MS) return; // client-side rate limit
    lastSubmitRef.current = now;

    const userMessage: CopilotMessage = {
      role: "user",
      content: question,
      machine_id: machineId,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    mutation.mutate(question);
  }

  return { messages, suggestions, send, isPending: mutation.isPending };
}
