import { auth, signOut } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth();
  const user = session!.user!;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">הגדרות</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>חשבון</CardTitle>
          <CardDescription>פרטי המשתמש המחובר.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="שם" value={user.name ?? "—"} />
          <Row label="מייל" value={user.email ?? "—"} />
        </CardContent>
        <CardFooter>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="secondary">
              התנתקות
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
