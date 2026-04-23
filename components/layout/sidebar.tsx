import Link from "next/link";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Users,
  Plug,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "בית", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "סוכנים", icon: Bot },
  { href: "/dashboard/documents", label: "מסמכים", icon: FileText },
  { href: "/dashboard/contacts", label: "אנשי מפתח", icon: Users },
  { href: "/dashboard/integrations", label: "חיבורים", icon: Plug },
  { href: "/dashboard/settings", label: "הגדרות", icon: Settings },
];

export function Sidebar({ activePath }: { activePath?: string }) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-l border-border bg-surface">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
            IBI
          </div>
          <span className="font-semibold text-foreground">AI Management</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            activePath === item.href ||
            (item.href !== "/dashboard" && activePath?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted hover:bg-border/40 hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border text-xs text-muted">
        גרסה 0.1
      </div>
    </aside>
  );
}
