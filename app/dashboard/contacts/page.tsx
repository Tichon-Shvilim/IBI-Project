import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ContactsPage() {
  const session = await auth();
  const contacts = await prisma.contact.findMany({
    where: { userId: session!.user!.id },
    orderBy: { importance: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">אנשי מפתח</h1>
        <p className="text-muted mt-1 text-sm">מאגר אנשי הקשר המרכזיים — משמש את הסוכן לשליפת הקשר.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {contacts.map((c) => (
          <Card key={c.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{c.name}</p>
                  {c.role && <p className="text-sm text-muted">{c.role}</p>}
                </div>
                {c.importance >= 9 && <Badge variant="accent">מפתח</Badge>}
              </div>
              {c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
