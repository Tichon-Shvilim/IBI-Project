import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateBriefingButton } from "@/components/briefing/generate-button";
import { formatHebrewDate, formatHebrewTime } from "@/lib/utils";

export default async function BriefingsPage() {
  const session = await auth();
  const briefings = await prisma.briefing.findMany({
    where: { agent: { userId: session!.user!.id } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">סיכומים</h1>
          <p className="text-muted mt-1 text-sm">
            סיכום יומי (07:00) ושבועי (ראשון 07:00). ניתן להפיק סיכום מיידי.
          </p>
        </div>
        <GenerateBriefingButton />
      </div>

      {briefings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted">
            אין עדיין סיכומים. הפק עכשיו, או המתן לסיכום היומי האוטומטי.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {briefings.map((b) => {
            const tasks = (b.tasks as { text?: string } | null)?.text ?? "";
            const highlights = (b.highlights as { text?: string } | null)?.text ?? "";
            return (
              <Card key={b.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {formatHebrewDate(b.createdAt)} · {formatHebrewTime(b.createdAt)}
                    </CardTitle>
                    <Badge variant={b.type === "daily" ? "accent" : "default"}>
                      {b.type === "daily"
                        ? "יומי"
                        : b.type === "weekly"
                        ? "שבועי"
                        : "לפי דרישה"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {b.summary && (
                    <Section title="תמצית">
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                        {b.summary}
                      </pre>
                    </Section>
                  )}
                  {highlights && (
                    <Section title="דגשים">
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                        {highlights}
                      </pre>
                    </Section>
                  )}
                  {tasks && (
                    <Section title="משימות">
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                        {tasks}
                      </pre>
                    </Section>
                  )}
                  {b.whatsappDraft && (
                    <Section title="WhatsApp">
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed bg-background rounded-lg p-3 border border-border">
                        {b.whatsappDraft}
                      </pre>
                    </Section>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
        {title}
      </p>
      {children}
    </div>
  );
}
