import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

export default async function AgentsPage() {
  const session = await auth();
  const agents = await prisma.agent.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">סוכנים</h1>
        <p className="text-muted mt-1 text-sm">בחר סוכן לפתיחת workspace.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((a) => (
          <Link key={a.id} href={`/dashboard/agents/${a.slug}`}>
            <Card className="h-full hover:border-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <Badge variant={a.isActive ? "success" : "default"}>
                    {a.isActive ? "פעיל" : "מושבת"}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{a.name}</CardTitle>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
