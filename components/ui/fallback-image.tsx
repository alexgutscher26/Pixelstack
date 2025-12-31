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
        className={cn(
          "h-full w-full flex items-center justify-center bg-secondary/50",
          className
        )}
      >
        {fallbackType === "folder" ? (
          <FolderOpenDotIcon className="h-10 w-10 text-muted-foreground" />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
