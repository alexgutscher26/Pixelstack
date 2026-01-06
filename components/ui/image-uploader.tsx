"use client";

import { useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import { toast } from "sonner";

type Props = {
  onUploaded?: (url: string) => void;
  className?: string;
  label?: string;
};

export const ImageUploader = ({ onUploaded, className, label }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const UTButton = UploadButton as unknown as React.ComponentType<any>;

  return (
    <>
      <UTButton
        endpoint="imageUploader"
        onClientUploadComplete={(res: Array<{ url: string }>) => {
          const url = res?.[0]?.url;
          if (url) {
            toast.success("Image uploaded");
            onUploaded?.(url);
            setPreview(null);
          } else {
            toast.error("Upload failed");
          }
        }}
        onUploadError={(err: { message?: string }) => {
          toast.error(err?.message ?? "Upload error");
        }}
        appearance={{
          button: `bg-card text-muted-foreground hover:border-primary/30 rounded-xl border border-white/5 p-2.5 transition-all hover:text-white ${className ?? ""}`,
          container: "inline-block",
          allowedContent: "hidden",
        }}
        content={{
          button({ ready }: { ready: boolean }) {
            return ready ? (
              <ImageIcon className="size-5" />
            ) : (
              <Loader2 className="size-5 animate-spin" />
            );
          },
        }}
      />
      {preview && <span className="sr-only">{label ?? "Uploading image..."}</span>}
    </>
  );
};
