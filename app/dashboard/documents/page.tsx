import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentRow } from "@/components/documents/document-row";

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
        <p className="text-muted mt-1 text-sm">
          העלה PDF, Word, Excel או טקסט — הסוכן יחפש בהם דרך search_docs.
        </p>
      </div>

      <UploadZone />

      {docs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted">
            אין עדיין מסמכים. העלה בקופסה למעלה.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <DocumentRow
              key={d.id}
              id={d.id}
              name={d.name}
              source={d.source}
              sizeBytes={d.sizeBytes}
              createdAt={d.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
