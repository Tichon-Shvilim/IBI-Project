import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-6xl font-bold text-accent">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">הדף לא נמצא</h1>
          <p className="text-muted text-sm">
            הקישור שגוי או שהדף הועבר. חזור לבית כדי להמשיך.
          </p>
        </div>
        <Link href="/dashboard">
          <Button>חזרה לבית</Button>
        </Link>
      </div>
    </main>
  );
}
