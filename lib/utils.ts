/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.trim().replace(/^#/, "");
  const valid = cleaned.length === 3 || cleaned.length === 6;
  if (!valid) return null;
  const full = cleaned.length === 3 ? cleaned.split("").map((c) => c + c).join("") : cleaned;
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return { r, g, b };
}

export const safeLogger = {
  info: (message: string, meta?: Record<string, any>) => {
    try {
      console.log(
        JSON.stringify({
          level: "info",
          message,
          timestamp: new Date().toISOString(),
          meta,
        })
      );
    } catch (err) {
      console.log(JSON.stringify({ level: "info", message, meta: "[Unserializable]" }));
    }
  },
  error: (message: string, error?: any) => {
    const safeError =
      error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
          }
        : String(error);

    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: safeError,
        timestamp: new Date().toISOString(),
      })
    );
  },
};
