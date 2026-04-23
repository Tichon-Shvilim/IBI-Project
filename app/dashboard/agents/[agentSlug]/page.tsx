import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChatWindow } from "@/components/chat/chat-window";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ agentSlug: string }>;
};

export default async function AgentChatPage({ params }: Props) {
  const { agentSlug } = await params;
  const session = await auth();
  const agent = await prisma.agent.findUnique({
    where: { userId_slug: { userId: session!.user!.id, slug: agentSlug } },
  });
  if (!agent) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
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
        <ChatWindow agentSlug={agent.slug} />
      </div>
    </div>
  );
}
