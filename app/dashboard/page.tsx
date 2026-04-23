import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Sparkles, CheckCircle2 } from "lucide-react";

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user!.id;

  const [agents, latestBriefing, googleAccount, contactsCount, conversationsCount] =
    await Promise.all([
      prisma.agent.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.briefing.findFirst({
        where: { agent: { userId } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.account.findFirst({
        where: { userId, provider: "google" },
        select: { scope: true },
      }),
      prisma.contact.count({ where: { userId } }),
      prisma.conversation.count({ where: { userId } }),
    ]);

  const hasGmail = googleAccount?.scope?.includes("gmail.readonly") ?? false;
  const hasDrive = googleAccount?.scope?.includes("drive.readonly") ?? false;
  const googleLinked = hasGmail && hasDrive;

  const actions = [
    {
      href: "/dashboard/integrations",
      label: "חבר את Gmail ואת Drive",
      done: googleLinked,
    },
    {
      href: "/dashboard/contacts",
      label: "הוסף אנשי מפתח",
      done: contactsCount >= 5,
    },
    {
      href: "/dashboard/agents",
      label: "פתח שיחה עם הסוכן האסטרטגי",
      done: conversationsCount > 0,
    },
  ];
  const pending = actions.filter((a) => !a.done);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-foreground">בוקר טוב</h1>
        <p className="text-muted mt-1">סיכום המצב הנוכחי והפעולות הדרושות.</p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">הסוכנים שלך</h2>
          <span className="text-sm text-muted">{agents.length} פעילים</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/dashboard/agents/${agent.slug}`}>
              <Card className="h-full hover:border-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <Badge variant="success">פעיל</Badge>
                  </div>
                  <CardTitle className="mt-2">{agent.name}</CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}

          <Link href="/dashboard/agents/new">
            <Card className="h-full border-dashed hover:border-accent/50 transition-colors cursor-pointer flex items-center justify-center min-h-[180px]">
              <div className="flex flex-col items-center gap-2 text-muted">
                <div className="w-10 h-10 rounded-lg border border-dashed border-border flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">הוסף סוכן</span>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <CardTitle>סיכום היום</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {latestBriefing ? (
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                {latestBriefing.summary}
              </pre>
            ) : (
              <p className="text-sm text-muted">
                אין עדיין סיכום יומי. הסיכום האוטומטי יופק בכל בוקר ב-07:00 לאחר
                הגדרת חיבור Gmail.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פעולות מומלצות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="w-5 h-5" />
                כל הפעולות הראשוניות הושלמו
              </div>
            ) : (
              pending.map((a) => (
                <ActionRow key={a.href} href={a.href} label={a.label} />
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ActionRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-border/40 transition-colors text-sm"
    >
      <span className="text-foreground">{label}</span>
      <span className="text-muted text-xs">←</span>
    </Link>
  );
}
