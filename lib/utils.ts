import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const safeLogger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(JSON.stringify({ level: "info", message, ...meta }));
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
