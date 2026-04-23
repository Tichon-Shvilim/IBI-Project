"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Users,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "בית", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "סוכנים", icon: Bot },
  { href: "/dashboard/documents", label: "מסמכים", icon: FileText },
  { href: "/dashboard/contacts", label: "אנשים", icon: Users },
  { href: "/dashboard/integrations", label: "חיבורים", icon: Plug },
];

export function MobileNav() {
  const path = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm">
      <ul className="flex items-center justify-around h-16 px-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            path === item.href ||
            (item.href !== "/dashboard" && path?.startsWith(item.href));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-14 rounded-lg mx-1 transition-colors",
                  active ? "text-accent" : "text-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
