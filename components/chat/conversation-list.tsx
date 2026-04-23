import Link from "next/link";
import { Plus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHebrewDate, formatHebrewTime } from "@/lib/utils";

type Conversation = {
  id: string;
  title: string;
  updatedAt: Date;
};

export function ConversationList({
  agentSlug,
  conversations,
  activeId,
}: {
  agentSlug: string;
  conversations: Conversation[];
  activeId?: string;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <Link
          href={`/dashboard/agents/${agentSlug}`}
          className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          שיחה חדשה
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {conversations.length === 0 ? (
          <p className="text-xs text-muted text-center py-6">אין עדיין שיחות</p>
        ) : (
          conversations.map((c) => {
            const isActive = c.id === activeId;
            return (
              <Link
                key={c.id}
                href={`/dashboard/agents/${agentSlug}?c=${c.id}`}
                className={cn(
                  "flex gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-foreground hover:bg-border/40",
                )}
              >
                <MessageCircle className="w-4 h-4 shrink-0 mt-0.5 opacity-70" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{c.title || "שיחה ללא כותרת"}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {formatHebrewDate(c.updatedAt)} · {formatHebrewTime(c.updatedAt)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
