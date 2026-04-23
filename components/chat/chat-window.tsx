"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  StructuredOutput,
  parseStructuredOutput,
} from "@/components/chat/structured-output";

export function ChatWindow({
  agentSlug,
  initialConversationId,
}: {
  agentSlug: string;
  initialConversationId?: string;
}) {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { agentSlug, messages, conversationId },
      }),
    }),
    onFinish: ({ message }) => {
      const headers = (message as unknown as { headers?: Headers }).headers;
      const cid = headers?.get?.("x-conversation-id");
      if (cid) setConversationId(cid);
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBusy) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <p className="text-lg font-medium text-foreground">שיחה חדשה</p>
              <p className="text-sm text-muted mt-2 max-w-sm">
                שאל את הסוכן על אנשי מפתח, החלטות אחרונות, או בקש ניסוח הודעה.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} parts={m.parts} />
          ))}
          {isBusy && (
            <div className="flex items-center gap-2 text-sm text-muted px-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              חושב...
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-surface px-4 py-3"
      >
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={1}
            placeholder="כתוב הודעה..."
            dir="auto"
            className="flex-1 resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring max-h-40"
            disabled={isBusy}
          />
          <Button type="submit" size="icon" disabled={isBusy || !input.trim()}>
            <Send className="rotate-180" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({
  role,
  parts,
}: {
  role: string;
  parts: Array<{ type: string; text?: string }>;
}) {
  const isUser = role === "user";
  const text = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");

  if (!isUser) {
    const structured = parseStructuredOutput(text);
    if (structured) {
      return (
        <div className="flex justify-end">
          <div className="max-w-[92%] w-full">
            <StructuredOutput sections={structured} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className={cn("flex", isUser ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-accent text-accent-foreground"
            : "bg-surface text-foreground border border-border"
        )}
      >
        {text}
      </div>
    </div>
  );
}
