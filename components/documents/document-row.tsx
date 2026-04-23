"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatHebrewDate } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  source: string;
  sizeBytes: number;
  createdAt: Date;
};

export function DocumentRow({ id, name, source, sizeBytes, createdAt }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const doDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleting(false);
      setConfirming(false);
      return;
    }
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <FileText className="w-5 h-5 text-muted shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" dir="auto">
            {name}
          </p>
          <p className="text-xs text-muted">
            {formatHebrewDate(createdAt)} · {source} · {(sizeBytes / 1024).toFixed(1)} KB
          </p>
        </div>
        {confirming ? (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="danger" onClick={doDelete} disabled={deleting}>
              {deleting ? <Loader2 className="animate-spin" /> : null}
              אישור מחיקה
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
              ביטול
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            aria-label="מחק מסמך"
            onClick={() => setConfirming(true)}
          >
            <Trash2 className="text-danger" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
