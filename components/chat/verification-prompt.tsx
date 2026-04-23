"use client";

import { AlertCircle, Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  fact: string;
  onApprove: () => void;
  onReject: (correction?: string) => void;
};

export function VerificationPrompt({ fact, onApprove, onReject }: Props) {
  const [mode, setMode] = useState<"idle" | "correcting">("idle");
  const [correction, setCorrection] = useState("");

  if (mode === "correcting") {
    return (
      <div className="rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-warning">
          <AlertCircle className="w-4 h-4" />
          תיקון פרט
        </div>
        <textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          rows={3}
          dir="auto"
          placeholder="כתוב את הניסוח הנכון..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onReject(correction.trim() || undefined)}
            disabled={!correction.trim()}
          >
            שלח תיקון
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMode("idle")}>
            ביטול
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 space-y-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            הסוכן זיהה פרט חדש. לאשר לפני תיעוד?
          </p>
          <p className="text-sm text-foreground mt-1 leading-relaxed">{fact}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onApprove}>
          <Check />
          מאשר
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setMode("correcting")}>
          <X />
          תקן
        </Button>
      </div>
    </div>
  );
}
