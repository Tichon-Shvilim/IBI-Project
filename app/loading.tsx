import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[50vh]">
      <Loader2 className="w-6 h-6 text-muted animate-spin" />
    </div>
  );
}
