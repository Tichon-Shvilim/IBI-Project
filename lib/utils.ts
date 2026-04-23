import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// All displayed times are rendered in Asia/Jerusalem regardless of where the
// code runs (Vercel serverless is UTC). DB stores timestamptz = UTC; we only
// shift at the view layer.
const IL_TZ = "Asia/Jerusalem";

export function formatHebrewDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: IL_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatHebrewTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: IL_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatHebrewDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: IL_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
