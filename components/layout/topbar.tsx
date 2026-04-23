import { ThemeToggle } from "@/components/common/theme-toggle";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ userName, userImage }: { userName?: string | null; userImage?: string | null }) {
  return (
    <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm text-muted">ברוך הבא,</p>
          <p className="text-sm font-medium text-foreground">{userName || "נתי"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="התראות">
          <Bell />
        </Button>
        <ThemeToggle />
        {userImage ? (
          <img
            src={userImage}
            alt=""
            className="w-9 h-9 rounded-full border border-border"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center font-semibold text-sm">
            {(userName || "נ").slice(0, 1)}
          </div>
        )}
      </div>
    </header>
  );
}
