import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewAgentPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>הוספת סוכן חדש</CardTitle>
          <CardDescription>
            יצירת סוכנים נוספים תהיה זמינה בשלב Phase 3 (Family Office, שטח, סוכנויות).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            הסוכן הראשון הוא "יועץ אסטרטגי" המוגדר על-פי האפיון ב-docs/SPEC.md.
            להוספת סוכן חדש — ניתן להוסיף רשומה לטבלת Agent במאגר עם system prompt
            מותאם.
          </p>
          <Link href="/dashboard/agents">
            <Button variant="secondary">חזרה לרשימת סוכנים</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
