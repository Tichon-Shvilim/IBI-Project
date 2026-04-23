"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GenerateBriefingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const trigger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/briefings/on-demand", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button size="sm" onClick={trigger} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {loading ? "מפיק..." : "הפק סיכום עכשיו"}
      </Button>
      {error && (
        <p className="text-xs text-danger" dir="auto">
          {error}
        </p>
      )}
    </div>
  );
}
