import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildAgentTools } from "@/lib/ai/tools";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { agentSlug, messages, conversationId } = (await req.json()) as {
    agentSlug: string;
    messages: UIMessage[];
    conversationId?: string;
  };

  const agent = await prisma.agent.findUnique({
    where: { userId_slug: { userId: session.user.id, slug: agentSlug } },
  });
  if (!agent) {
    return NextResponse.json({ error: "agent_not_found" }, { status: 404 });
  }

  let convId = conversationId;
  if (!convId) {
    const firstUserMsg = messages.find((m) => m.role === "user");
    const title = firstUserMsg
      ? extractText(firstUserMsg).slice(0, 60)
      : "שיחה חדשה";
    const conv = await prisma.conversation.create({
      data: { userId: session.user.id, agentId: agent.id, title },
    });
    convId = conv.id;
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(agent.model),
    system: agent.systemPrompt,
    messages: modelMessages,
    tools: buildAgentTools(agent.id),
    onFinish: async ({ text, usage }) => {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) {
        await prisma.message.create({
          data: {
            conversationId: convId!,
            role: "user",
            content: extractText(lastUser),
          },
        });
      }
      await prisma.message.create({
        data: {
          conversationId: convId!,
          role: "assistant",
          content: text,
          tokensIn: usage?.inputTokens,
          tokensOut: usage?.outputTokens,
        },
      });
    },
  });

  return result.toUIMessageStreamResponse({
    headers: { "x-conversation-id": convId! },
  });
}

function extractText(msg: UIMessage): string {
  if (!msg.parts) return "";
  return msg.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("\n");
}
