import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { formatHebrewDate } from "@/lib/utils";

export default async function DocumentsPage() {
  const session = await auth();
  const docs = await prisma.document.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">מסמכים</h1>
        <p className="text-muted mt-1 text-sm">PDF, Excel ומסמכי Drive שסונכרנו למערכת.</p>
      </div>

      {docs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted">
            אין עדיין מסמכים. ייבוא יתאפשר לאחר חיבור Google Drive.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-center gap-3 py-4">
                <FileText className="w-5 h-5 text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{d.name}</p>
                  <p className="text-xs text-muted">
                    {formatHebrewDate(d.createdAt)} · {d.source}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
