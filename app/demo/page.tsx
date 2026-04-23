import Link from "next/link";
import {
  StructuredOutput,
  parseStructuredOutput,
} from "@/components/chat/structured-output";
import { VerificationPrompt } from "@/components/chat/verification-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SAMPLE_RESPONSE = `**תמצית המצב**
- טל דורי אישר תקציב 500K לפיילוט מוצרי פנסיה במגזר החרדי.
- משה רוח מציע פגישה שלישית עם משפחת גרינברג לקראת חתימה.
- אלעד בורשטיין דיווח על 3 פגישות חדשות השבוע, המרה 40%.

**דגשים מאנשי מפתח**
- טל דורי: מבקש התייחסות מהירה עד סוף השבוע לשאלת התמחור.
- משה רוח: עומד בלו"ז, יש לקבוע פגישה ליום ה'.
- אלעד בורשטיין: צריך חומרי שיווק מעודכנים בעברית-אידיש.

**אופרטיבי**
1. לשלוח לטל דורי מסמך תמחור פיילוט עד יום ד' 17:00.
2. לאשר עם משה רוח את הפגישה עם גרינברג ליום ה' 10:00.
3. להפיק 2 עמודי שיווק לאלעד — קובץ Canva עד ד'.

**טיוטת WhatsApp**
\`\`\`
טל, תמחור פיילוט בדרך - מגיע מחר 17:00.
משה - ה' 10:00 אצלנו?
אלעד - חומרים ב-Canva ד' אחה"צ.
\`\`\``;

export default function DemoPage() {
  const parsed = parseStructuredOutput(SAMPLE_RESPONSE)!;

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant="warning">Demo · נתונים לדוגמה בלבד</Badge>
            <h1 className="text-3xl font-bold mt-3">תצוגת הסוכן האסטרטגי</h1>
            <p className="text-muted mt-1 text-sm max-w-2xl">
              איך נראה פלט אמיתי של הסוכן. זה render של אותו component שמופעל ב-chat — הטקסט למעלה מנותח למבנה הקבוע.
            </p>
          </div>
          <Link href="/login">
            <Button variant="secondary">חזרה ל-login</Button>
          </Link>
        </header>

        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Structured output
          </h2>
          <StructuredOutput sections={parsed} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Verification prompt
          </h2>
          <DemoVerification />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            דוגמה לכרטיס סוכן
          </h2>
          <Card className="max-w-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  🎯
                </div>
                <Badge variant="success">פעיל</Badge>
              </div>
              <CardTitle className="mt-2">יועץ אסטרטגי</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                IBI Capital — חדירה לשוק החרדי
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Raw agent output (מה שנכנס למפרסר)
          </h2>
          <pre className="whitespace-pre-wrap text-xs text-muted bg-surface rounded-xl p-4 border border-border font-mono">
            {SAMPLE_RESPONSE}
          </pre>
        </section>
      </div>
    </main>
  );
}

function DemoVerification() {
  return (
    <VerificationPrompt
      fact={'אלעד בורשטיין אמר שתקציב השיווק לרבעון עומד על 200K ש"ח.'}
      onApprove={() => {}}
      onReject={() => {}}
    />
  );
}
