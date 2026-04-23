"use client";

import { Copy, Check, ListChecks, Users, FileText, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Agent outputs a fixed 4-section format (see docs/SPEC.md §6).
// We detect the Hebrew section headings and render each block with its own style.

const SECTIONS = {
  summary: { key: "תמצית המצב", icon: FileText },
  highlights: { key: "דגשים מאנשי מפתח", icon: Users },
  tasks: { key: "אופרטיבי", icon: ListChecks },
  whatsapp: { key: "טיוטת WhatsApp", icon: MessageCircle },
} as const;

type ParsedSections = Partial<Record<keyof typeof SECTIONS, string>>;

export function parseStructuredOutput(text: string): ParsedSections | null {
  const headingRegex = new RegExp(
    `\\*\\*(${Object.values(SECTIONS)
      .map((s) => escape(s.key))
      .join("|")})[^*]*\\*\\*`,
    "g"
  );
  const matches = [...text.matchAll(headingRegex)];
  if (matches.length === 0) return null;

  const result: ParsedSections = {};
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const next = matches[i + 1];
    const headingText = m[1].trim();
    const start = m.index! + m[0].length;
    const end = next ? next.index! : text.length;
    const body = text.slice(start, end).trim();

    const entry = Object.entries(SECTIONS).find(([, cfg]) => cfg.key === headingText);
    if (!entry) continue;
    const key = entry[0] as keyof typeof SECTIONS;
    result[key] = body;
  }
  return Object.keys(result).length > 0 ? result : null;
}

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function StructuredOutput({ sections }: { sections: ParsedSections }) {
  return (
    <div className="space-y-3">
      {sections.summary && (
        <Section title={SECTIONS.summary.key} icon={SECTIONS.summary.icon}>
          <BulletBlock text={sections.summary} />
        </Section>
      )}
      {sections.highlights && (
        <Section title={SECTIONS.highlights.key} icon={SECTIONS.highlights.icon}>
          <BulletBlock text={sections.highlights} />
        </Section>
      )}
      {sections.tasks && (
        <Section title={SECTIONS.tasks.key} icon={SECTIONS.tasks.icon}>
          <TaskList text={sections.tasks} />
        </Section>
      )}
      {sections.whatsapp && (
        <Section
          title={SECTIONS.whatsapp.key}
          icon={SECTIONS.whatsapp.icon}
          accent
        >
          <WhatsAppBlock text={sections.whatsapp} />
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  accent,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface px-4 py-3",
        accent ? "border-accent/40" : "border-border"
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
        <Icon className={cn("w-4 h-4", accent ? "text-accent" : "text-muted")} />
        {title}
      </div>
      {children}
    </div>
  );
}

function BulletBlock({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <ul className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const clean = line.replace(/^[-•*]\s*/, "");
        return (
          <li key={i} className="flex gap-2">
            <span className="text-muted shrink-0 mt-0.5">•</span>
            <span className="text-foreground">{clean}</span>
          </li>
        );
      })}
    </ul>
  );
}

function TaskList({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <ol className="space-y-2 text-sm">
      {lines.map((line, i) => {
        const clean = line.replace(/^\d+[.)]\s*/, "");
        return (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-foreground leading-relaxed">{clean}</span>
          </li>
        );
      })}
    </ol>
  );
}

function WhatsAppBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const body = text
    .replace(/^```[^\n]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  const copy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-background rounded-lg p-3 border border-border">
        {body}
      </pre>
      <Button
        type="button"
        onClick={copy}
        variant={copied ? "secondary" : "primary"}
        size="sm"
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "הועתק" : "העתק ל-WhatsApp"}
      </Button>
    </div>
  );
}
