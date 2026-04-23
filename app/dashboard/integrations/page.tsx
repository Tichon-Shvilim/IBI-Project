import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, HardDrive, MessageCircle, Calendar } from "lucide-react";

export default async function IntegrationsPage() {
  const session = await auth();
  const account = await prisma.account.findFirst({
    where: { userId: session!.user!.id, provider: "google" },
  });

  const hasGmail = account?.scope?.includes("gmail.readonly") ?? false;
  const hasDrive = account?.scope?.includes("drive.readonly") ?? false;
  const hasCalendar = account?.scope?.includes("calendar") ?? false;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">חיבורים</h1>
        <p className="text-muted mt-1 text-sm">
          נהל חיבורים לשירותים חיצוניים. הרשאות ניתנות במהלך ההתחברות ל-Google.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IntegrationCard
          icon={<Mail className="w-5 h-5" />}
          title="Gmail"
          desc="קריאה וסיכום של מיילים רלוונטיים"
          connected={hasGmail}
        />
        <IntegrationCard
          icon={<HardDrive className="w-5 h-5" />}
          title="Google Drive"
          desc="שליפת PDF/Excel למערכת RAG"
          connected={hasDrive}
        />
        <IntegrationCard
          icon={<Calendar className="w-5 h-5" />}
          title="Google Calendar"
          desc="הקשר של פגישות לסיכום היומי"
          connected={hasCalendar}
        />
        <IntegrationCard
          icon={<MessageCircle className="w-5 h-5" />}
          title="WhatsApp Business"
          desc="שליחת סיכומים אוטומטיים (דורש אישור Meta)"
          connected={false}
          note="Phase 1C"
        />
      </div>
    </div>
  );
}

function IntegrationCard({
  icon,
  title,
  desc,
  connected,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  connected: boolean;
  note?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            {icon}
          </div>
          {connected ? (
            <Badge variant="success">מחובר</Badge>
          ) : note ? (
            <Badge variant="warning">{note}</Badge>
          ) : (
            <Badge>לא מחובר</Badge>
          )}
        </div>
        <CardTitle className="mt-2">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        {!connected && !note && (
          <p className="text-xs text-muted">
            התחבר דרך Google בדף הכניסה כדי להוסיף הרשאה זו.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
