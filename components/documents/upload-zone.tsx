"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; fileName: string; index: number; total: number }
  | { kind: "error"; message: string }
  | { kind: "done"; count: number };

export function UploadZone() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setStatus({ kind: "uploading", fileName: file.name, index: i, total: list.length });
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const raw = await res.text();
        let parsed: { error?: string; hint?: string; message?: string } = {};
        try {
          parsed = JSON.parse(raw);
        } catch {
          // raw is not JSON — keep as-is for debug
        }
        const msg =
          parsed.hint ||
          parsed.message ||
          parsed.error ||
          raw.slice(0, 200) ||
          `HTTP ${res.status}`;
        setStatus({ kind: "error", message: `${file.name} [${res.status}]: ${msg}` });
        return;
      }
    }
    setStatus({ kind: "done", count: list.length });
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/50 hover:bg-surface",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Upload className="w-8 h-8 mx-auto text-muted" />
        <p className="mt-3 text-sm font-medium text-foreground">
          גרור קבצים לכאן או לחץ לבחירה
        </p>
        <p className="mt-1 text-xs text-muted">
          PDF · Word (.docx) · Excel (.xlsx/.csv) · טקסט (.txt/.md)
        </p>
      </div>

      {status.kind === "uploading" && (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          מעלה {status.index + 1}/{status.total} — {status.fileName}
        </div>
      )}
      {status.kind === "error" && (
        <div className="flex items-start gap-2 text-sm text-danger">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1" dir="auto">
            {status.message}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setStatus({ kind: "idle" })}>
            סגור
          </Button>
        </div>
      )}
      {status.kind === "done" && (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="w-4 h-4" />
          הועלו {status.count} קבצים בהצלחה
        </div>
      )}
    </div>
  );
}
