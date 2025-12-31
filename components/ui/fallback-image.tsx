/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { FolderOpenDotIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: "folder" | "image";
}

export function FallbackImage({
  className,
  src,
  alt,
  fallbackType = "folder",
  ...props
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn("bg-secondary/50 flex h-full w-full items-center justify-center", className)}
      >
        {fallbackType === "folder" ? (
          <FolderOpenDotIcon className="text-muted-foreground h-10 w-10" />
        ) : (
          <ImageIcon className="text-muted-foreground h-10 w-10" />
        )}
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={className} onError={() => setError(true)} {...props} />
  );
}
