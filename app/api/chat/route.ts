import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
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
    tools: buildAgentTools({ agentId: agent.id, userId: session.user.id }),
    // Allow multi-step: agent calls tools, sees results, then produces
    // final text. Without this, streamText stops after the first step
    // (tool call only, no assistant reply).
    stopWhen: stepCountIs(8),
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
      // Only persist assistant turn when it actually produced text. Pure
      // tool-use turns (no textual reply) would otherwise pollute history
      // with empty rows that render as blank bubbles.
      if (text && text.trim().length > 0) {
        await prisma.message.create({
          data: {
            conversationId: convId!,
            role: "assistant",
            content: text,
            tokensIn: usage?.inputTokens,
            tokensOut: usage?.outputTokens,
          },
        });
      }
      // Bump conversation updatedAt so it floats to the top of the sidebar.
      await prisma.conversation.update({
        where: { id: convId! },
        data: { updatedAt: new Date() },
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
