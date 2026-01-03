/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

type Props = {
  prompt: string;
  style?: "outline" | "filled";
  size?: number;
  className?: string;
  title?: string;
  ariaLabel?: string;
};

export function GeneratedIcon({
  prompt,
  style = "outline",
  size = 24,
  className,
  title,
  ariaLabel,
}: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const url = useMemo(() => {
    const params = new URLSearchParams({
      prompt,
      style,
      size: String(size),
    });
    return `/api/icon?${params.toString()}`;
  }, [prompt, style, size]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      setSvg(null);
      try {
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Request failed ${res.status}`);
        }
        const text = await res.text();
        if (!cancelled) setSvg(text);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return <Spinner className={cn("size-5", className)} />;
  }
  if (error) {
    return (
      <div
        role="img"
        aria-label={ariaLabel || "Icon generation failed"}
        className={cn("bg-muted inline-block size-6 rounded-sm", className)}
        title={title}
      />
    );
  }
  if (!svg) {
    return <Spinner className={cn("size-5", className)} />;
  }
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return (
    <img
      alt={ariaLabel || prompt}
      className={cn("inline-flex", className)}
      title={title}
      src={dataUrl}
      width={size}
      height={size}
      decoding="async"
    />
  );
}
