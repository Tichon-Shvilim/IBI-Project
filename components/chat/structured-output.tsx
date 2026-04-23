"use client";

import { Copy, Check, ListChecks, Users, FileText, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  parseStructuredOutput,
  STRUCTURED_SECTIONS,
  type ParsedSections,
} from "@/lib/ai/parse-structured-output";

export { parseStructuredOutput };
export type { ParsedSections };

const ICONS = {
  summary: FileText,
  highlights: Users,
  tasks: ListChecks,
  whatsapp: MessageCircle,
} as const;

export function StructuredOutput({ sections }: { sections: ParsedSections }) {
  return (
    <div className="space-y-3">
      {sections.summary && (
        <Section title={STRUCTURED_SECTIONS.summary} icon={ICONS.summary}>
          <BulletBlock text={sections.summary} />
        </Section>
      )}
      {sections.highlights && (
        <Section title={STRUCTURED_SECTIONS.highlights} icon={ICONS.highlights}>
          <BulletBlock text={sections.highlights} />
        </Section>
      )}
      {sections.tasks && (
        <Section title={STRUCTURED_SECTIONS.tasks} icon={ICONS.tasks}>
          <TaskList text={sections.tasks} />
        </Section>
      )}
      {sections.whatsapp && (
        <Section title={STRUCTURED_SECTIONS.whatsapp} icon={ICONS.whatsapp} accent>
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
        accent ? "border-accent/40" : "border-border",
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
  const body = text.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "").trim();

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
      <Button type="button" onClick={copy} variant={copied ? "secondary" : "primary"} size="sm">
        {copied ? <Check /> : <Copy />}
        {copied ? "הועתק" : "העתק ל-WhatsApp"}
      </Button>
    </div>
  );
}
