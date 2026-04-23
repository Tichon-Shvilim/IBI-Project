"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">משהו השתבש</h1>
          <p className="text-muted text-sm">
            התרחשה שגיאה בלתי צפויה. נסה שוב, ואם החוזרת — בדוק את ה-Vercel logs.
          </p>
          {error.digest && (
            <p className="text-xs text-muted font-mono" dir="ltr">
              error id: {error.digest}
            </p>
          )}
        </div>
        <Button onClick={reset}>נסה שוב</Button>
      </div>
    </main>
  );
}
