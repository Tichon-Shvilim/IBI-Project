import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChatWindow } from "@/components/chat/chat-window";
import { ConversationList } from "@/components/chat/conversation-list";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ agentSlug: string }>;
  searchParams: Promise<{ c?: string }>;
};

export default async function AgentChatPage({ params, searchParams }: Props) {
  const { agentSlug } = await params;
  const { c: conversationId } = await searchParams;
  const session = await auth();
  const userId = session!.user!.id;

  const agent = await prisma.agent.findUnique({
    where: { userId_slug: { userId, slug: agentSlug } },
  });
  if (!agent) notFound();

  const conversations = await prisma.conversation.findMany({
    where: { userId, agentId: agent.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, updatedAt: true },
  });

  let initialMessages: Array<{
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    parts: Array<{ type: string; text?: string }>;
  }> = [];

  if (conversationId) {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, agentId: agent.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, content: true },
        },
      },
    });
    if (conv) {
      initialMessages = conv.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system" | "tool",
        parts: [{ type: "text", text: m.content }],
      }));
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-l border-border bg-surface">
        <ConversationList
          agentSlug={agent.slug}
          conversations={conversations}
          activeId={conversationId}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border bg-surface px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">{agent.name}</h1>
              <Badge variant="accent">{agent.model}</Badge>
            </div>
            <p className="text-xs text-muted mt-0.5">{agent.description}</p>
          </div>
        </header>
        <div className="flex-1 min-h-0">
          <ChatWindow
            agentSlug={agent.slug}
            initialConversationId={conversationId}
            initialMessages={initialMessages}
          />
        </div>
      </div>
    </div>
  );
}
