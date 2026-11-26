// Connects the widget to Penny's API (/api/chat). The conversation lives in the browser;
// every request sends the history, and the API returns Penny's answer plus the Langfuse trace ID.

const ERRORS = {
  passcode: "To start, open Settings (bottom left) and enter the passcode.",
  name: "To start, open Settings (bottom left) and enter your first name or a nickname.",
  limit: "This chat has reached its message limit. Start a new conversation to continue.",
  generic: "Something went wrong on my side. Try again in a moment.",
};

const textOf = (message) =>
  (message?.content ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");

export function createPennyAdapter(getSettings) {
  return {
    async run({ messages, abortSignal }) {
      const { name, passcode, model, effort, sessionId, guardrails, lookUp, maxResults, promptLabel } = getSettings();
      const history = messages.slice(0, -1).map((m) => ({ role: m.role, content: textOf(m) }));
      const message = textOf(messages.at(-1));

      let data;
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message, history, name, passcode, model, effort, guardrails,
            look_up: lookUp === true, max_results: Number(maxResults), prompt_label: promptLabel || "",
            session_id: sessionId,
          }),
          signal: abortSignal,
        });
        data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return { content: [{ type: "text", text: ERRORS[data.error] ?? ERRORS.generic }] };
        }
      } catch (error) {
        if (error.name === "AbortError") throw error;
        return { content: [{ type: "text", text: ERRORS.generic }] };
      }

      return {
        content: [{ type: "text", text: data.answer }],
        metadata: {
          custom: {
            traceId: data.trace_id,
            masked: data.masked === true, // the server says whether it removed a bank account number
          },
        },
      };
    },
  };
}

export const pennyFeedbackAdapter = {
  submit({ message, type }) {
    const traceId = message?.metadata?.custom?.traceId;
    if (!traceId) return;
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trace_id: traceId, liked: type === "positive" }),
    }).catch(() => {});
  },
};
