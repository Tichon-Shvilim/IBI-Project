import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm tracking-wide text-muted uppercase">IBI AI Management</p>
          <h1 className="text-4xl font-bold text-foreground leading-tight">
            ממשק ניהול סוכני AI
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            פלטפורמה אישית לניהול סוכנים אסטרטגיים, מיילים, מסמכים וסיכומי פעולה
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
          >
            כניסה למערכת
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-border text-foreground font-medium hover:bg-surface transition-colors"
          >
            תצוגה לדוגמה
          </Link>
        </div>

        <p className="text-xs text-muted pt-8">
          גרסה 0.1 · פיתוח פנימי
        </p>
      </div>
    </main>
  );
}
