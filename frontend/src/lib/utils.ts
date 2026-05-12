import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSlot(iso: string) {
  return format(parseISO(iso), "EEE, MMM d · h:mm a");
}

export function formatDay(iso: string) {
  return format(parseISO(iso), "EEE, MMM d");
}

export function formatTime(iso: string) {
  return format(parseISO(iso), "h:mm a");
}
