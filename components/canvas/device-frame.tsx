/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import axios from "axios";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import { useCanvas } from "@/context/canvas-context";
import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { cn } from "@/lib/utils";
import DeviceFrameToolbar from "./device-frame-toolbar";
import { toast } from "sonner";
import DeviceFrameSkeleton from "./device-frame-skeleton";
import { useRegenerateFrame, useDeleteFrame } from "@/features/use-frame";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Wand2Icon, Send } from "lucide-react";

type PropsType = {
  html: string;
  title?: string;
  width?: number;
  minHeight?: number | string;
  initialPosition?: { x: number; y: number };
  frameId: string;
  scale?: number;
  toolMode: ToolModeType;
  theme_style?: string;
  isLoading?: boolean;
  projectId: string;
  onOpenHtmlDialog: () => void;
  onOpenReactDialog?: () => void;
};
const DeviceFrame = ({
  html,
  title = "Untitled",
  width = 420,
  minHeight = 800,
  initialPosition = { x: 0, y: 0 },
  frameId,
  scale = 1,
  toolMode,
  theme_style,
  isLoading = false,
  projectId,
  onOpenHtmlDialog,
  onOpenReactDialog,
}: PropsType) => {
  const { selectedFrameId, setSelectedFrameId, updateFrame } = useCanvas();
  const [frameSize, setFrameSize] = useState({
    width,
    height: minHeight,
  });
  const [isDownloading, setIsDownloading] = useState(false);

  const regenerateMutation = useRegenerateFrame(projectId);
  const deleteMutation = useDeleteFrame(projectId);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isSelected = selectedFrameId === frameId;
  const fullHtml = getHTMLWrapper(html, title, theme_style, frameId);
  const [selectedOuterHTML, setSelectedOuterHTML] = useState<string | null>(null);
  const [partialPrompt, setPartialPrompt] = useState<string>("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.type === "FRAME_HEIGHT" &&
        event.data.frameId === frameId
      ) {
        setFrameSize((prev) => ({
          ...prev,
          height: event.data.height,
        }));
      }
      if (event.data.type === "ELEMENT_SELECTED" && event.data.frameId === frameId) {
        setSelectedFrameId(frameId);
        setSelectedOuterHTML(event.data.outerHTML || null);
      }
      if (event.data.type === "PERF_METRICS" && event.data.frameId === frameId) {
        const store = (window as any).__perfStore || ((window as any).__perfStore = {});
        if (!store[frameId]) store[frameId] = [];
        store[frameId].push({
          ts: Date.now(),
          title,
          ...event.data.metrics,
        });
        const arr = store[frameId];
        if (arr.length % 5 === 0) {
          console.info("PERF_METRICS", frameId, arr[arr.length - 1]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [frameId]);

  useEffect(() => {
    if (!(window as any).exportPerf) {
      (window as any).exportPerf = () => {
        try {
          const data = (window as any).__perfStore || {};
          return JSON.stringify(data, null, 2);
        } catch {
          return "{}";
        }
      };
    }
  }, []);
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      { type: "SELECT_MODE", frameId, enabled: isSelected && toolMode === TOOL_MODE_ENUM.SELECT },
      "*"
    );
  }, [toolMode, isSelected, frameId]);

  const handleDownloadPng = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await axios.post(
        "/api/screenshot",
        {
          html: fullHtml,
          width: frameSize.width,
          height: frameSize.height,
        },
        {
          responseType: "blob",
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}
      -${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Screenshot downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to screenshot");
    } finally {
      setIsDownloading(false);
    }
  }, [frameSize.height, frameSize.width, fullHtml, isDownloading, title]);

  const handleRegenerate = useCallback(
    (prompt: string) => {
      regenerateMutation.mutate(
        { frameId, prompt, targetOuterHTML: undefined },
        {
          onSuccess: () => {
            updateFrame(frameId, { isLoading: true });
          },
          onError: () => {
            updateFrame(frameId, { isLoading: false });
          },
        }
      );
    },
    [frameId, regenerateMutation, updateFrame]
  );

  const handlePartialRegenerate = useCallback(() => {
    if (!selectedOuterHTML || !partialPrompt.trim()) return;
    regenerateMutation.mutate(
      { frameId, prompt: partialPrompt, targetOuterHTML: selectedOuterHTML },
      {
        onSuccess: () => {
          updateFrame(frameId, { isLoading: true });
          setPartialPrompt("");
          setSelectedOuterHTML(null);
        },
        onError: () => {
          updateFrame(frameId, { isLoading: false });
        },
      }
    );
  }, [frameId, partialPrompt, regenerateMutation, selectedOuterHTML, updateFrame]);

  const handleDeleteFrame = useCallback(() => {
    deleteMutation.mutate(frameId);
  }, [frameId, deleteMutation]);

  return (
    <Rnd
      default={{
        x: initialPosition.x,
        y: initialPosition.y,
        width,
        height: frameSize.height,
      }}
      minWidth={width}
      minHeight={minHeight}
      size={{
        width: frameSize.width,
        height: frameSize.height,
      }}
      disableDragging={toolMode !== TOOL_MODE_ENUM.HAND}
      enableResizing={isSelected && toolMode !== TOOL_MODE_ENUM.HAND}
      scale={scale}
      cancel=".xda-no-drag"
      onClick={(e: any) => {
        e.stopPropagation();
        if (toolMode === TOOL_MODE_ENUM.SELECT) {
          setSelectedFrameId(frameId);
        }
      }}
      resizeHandleComponent={{
        topLeft: isSelected ? <Handle /> : undefined,
        topRight: isSelected ? <Handle /> : undefined,
        bottomLeft: isSelected ? <Handle /> : undefined,
        bottomRight: isSelected ? <Handle /> : undefined,
      }}
      resizeHandleStyles={{
        top: { cursor: "ns-resize" },
        bottom: { cursor: "ns-resize" },
        left: { cursor: "ew-resize" },
        right: { cursor: "ew-resize" },
      }}
      onResize={(e, direction, ref) => {
        setFrameSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      className={cn(
        "relative z-10",
        isSelected &&
          toolMode !== TOOL_MODE_ENUM.HAND &&
          "ring-3 ring-blue-400 ring-offset-1",
        toolMode === TOOL_MODE_ENUM.HAND
          ? "cursor-grab! active:cursor-grabbing!"
          : "cursor-move"
      )}
    >
      <div className="w-full h-full">
        <DeviceFrameToolbar
          title={title}
          isSelected={isSelected && toolMode !== TOOL_MODE_ENUM.HAND}
          disabled={
            isDownloading ||
            isLoading ||
            regenerateMutation.isPending ||
            deleteMutation.isPending
          }
          isDownloading={isDownloading}
          isRegenerating={regenerateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onDownloadPng={handleDownloadPng}
          onRegenerate={handleRegenerate}
          onDeleteFrame={handleDeleteFrame}
          onOpenHtmlDialog={onOpenHtmlDialog}
          onOpenReactDialog={onOpenReactDialog}
        />

        <div
          className={cn(
            `relative w-full h-auto
            rounded-[36px] overflow-hidden bg-black
            shadow-2xl
              `,
            isSelected && toolMode !== TOOL_MODE_ENUM.HAND && "rounded-none"
          )}
        >
          <div className="relative bg-white dark:bg-background overflow-hidden">
            {isLoading ? (
              <DeviceFrameSkeleton
                style={{
                  position: "relative",
                  width,
                  minHeight: minHeight,
                  height: `${frameSize.height}px`,
                }}
              />
            ) : (
              <iframe
                ref={iframeRef}
                srcDoc={fullHtml}
                title={title}
                sandbox="allow-scripts allow-same-origin"
                style={{
                  width: "100%",
                  minHeight: `${minHeight}px`,
                  height: `${frameSize.height}px`,
                  border: "none",
                  pointerEvents: isSelected && toolMode === TOOL_MODE_ENUM.SELECT ? "auto" : "none",
                  display: "block",
                  background: "transparent",
                }}
              />
            )}
          </div>
        </div>
        {isSelected && selectedOuterHTML && (
          <div
            className="absolute top-4 right-4 z-20 bg-white dark:bg-muted rounded-xl shadow-lg border p-2 w-[360px] max-w-[85%] xda-no-drag"
          >
            <div className="text-xs font-medium mb-1">Edit selected part with AI</div>
            <InputGroup className="bg-transparent! border-0! shadow-none! ring-0! px-0!">
              <InputGroupAddon>
                <Wand2Icon />
              </InputGroupAddon>
              <Input
                placeholder="Describe the change..."
                value={partialPrompt}
                onChange={(e) => setPartialPrompt(e.target.value)}
                className="ring-0! border-0! shadow-none! bg-transparent!"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePartialRegenerate();
                  }
                }}
              />
              <InputGroupAddon align="inline-end">
                <Button
                  size="icon-sm"
                  disabled={!partialPrompt.trim() || regenerateMutation.isPending}
                  onClick={handlePartialRegenerate}
                >
                  {regenerateMutation.isPending ? <></> : <Send className="size-4" />}
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </div>
        )}
      </div>
    </Rnd>
  );
};

const Handle = () => (
  <div
    className="z-30 h-4 w-4
     bg-white border-2 border-blue-500"
  />
);

export default DeviceFrame;
