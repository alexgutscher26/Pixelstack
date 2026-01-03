"use client";

import { CameraIcon, ChevronDown, Palette, Save, Wand2, Send } from "lucide-react";
import { useCanvas } from "@/context/canvas-context";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import PromptInput from "../prompt-input";
import { useCallback, useMemo, useState } from "react";
import { parseThemeColors } from "@/lib/themes";
import ThemeSelector from "./theme-selector";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { useGenerateDesignById, useUpdateProject } from "@/features/use-project-id";
import { Spinner } from "../ui/spinner";
import axios from "axios";
import { toast } from "sonner";
import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";

const CanvasFloatingToolbar = ({
  projectId,
  isScreenshotting,
  onScreenshot,
  onSave,
}: {
  projectId: string;
  isScreenshotting: boolean;
  onScreenshot: () => void;
  onSave?: () => void;
}) => {
  const {
    themes,
    theme: currentTheme,
    setTheme,
    selectedFrame,
    frames,
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    wireframeMode,
    setWireframeMode,
  } = useCanvas();
  const [promptText, setPromptText] = useState<string>("");
  const [isExportingSelected, setIsExportingSelected] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const { mutate, isPending } = useGenerateDesignById(projectId);

  const update = useUpdateProject(projectId);

  const handleAIGenerate = async () => {
    if (!promptText) return;
    try {
      if (currentTheme?.id) {
        await update.mutateAsync({ themeId: currentTheme.id });
      }
    } catch {}
    mutate(promptText);
  };

  const handleUpdate = () => {
    if (!currentTheme) return;
    if (onSave) {
      try {
        onSave();
      } catch (error) {
        console.error("Error in onSave callback:", error);
        // Optionally show a toast notification
      }
    }
    update.mutate({ themeId: currentTheme.id });
  };

  const exportWidth = 420;

  const measureHeight = useCallback(async (fullHtml: string, frameId: string) => {
    return await new Promise<number>((resolve) => {
      let done = false;
      const handler = (e: MessageEvent) => {
        if (e.data?.type === "FRAME_HEIGHT" && e.data?.frameId === frameId && !done) {
          done = true;
          window.removeEventListener("message", handler);
          if (iframe.parentNode) document.body.removeChild(iframe);
          resolve(Math.max(800, Number(e.data?.height) || 800));
        }
      };
      window.addEventListener("message", handler);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-99999px";
      iframe.style.top = "-99999px";
      iframe.style.width = `${exportWidth}px`;
      iframe.style.height = "800px";
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
      document.body.appendChild(iframe);
      iframe.srcdoc = fullHtml;
      setTimeout(() => {
        if (!done) {
          done = true;
          window.removeEventListener("message", handler);
          if (iframe.parentNode) document.body.removeChild(iframe);
          resolve(900);
        }
      }, 1200);
    });
  }, []);

  const handleExportSelectedPng = useCallback(async () => {
    if (!selectedFrame || isExportingSelected) return;
    setIsExportingSelected(true);
    try {
      const fid = `sel-${Math.random().toString(36).slice(2)}`;
      const fullHtml = getHTMLWrapper(
        selectedFrame.htmlContent,
        selectedFrame.title,
        currentTheme?.style,
        fid,
        wireframeMode
      );
      const h = await measureHeight(fullHtml, fid);
      const response = await axios.post(
        "/api/screenshot",
        {
          html: fullHtml,
          width: exportWidth,
          height: h,
        },
        {
          responseType: "blob",
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedFrame.title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Selected frame exported");
    } catch {
      toast.error("Failed to export selected frame");
    } finally {
      setIsExportingSelected(false);
    }
  }, [selectedFrame, isExportingSelected, currentTheme?.style, measureHeight, wireframeMode]);

  const handleDownloadSelectedHtml = useCallback(() => {
    if (!selectedFrame || isExportingSelected) return;
    const fullHtml = getHTMLWrapper(
      selectedFrame.htmlContent,
      selectedFrame.title,
      currentTheme?.style,
      undefined,
      wireframeMode
    );
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedFrame.title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Selected frame HTML downloaded");
  }, [selectedFrame, currentTheme?.style, isExportingSelected, wireframeMode]);

  const handleExportAllPng = useCallback(async () => {
    if (isExportingAll || frames.length === 0) return;
    setIsExportingAll(true);
    try {
      for (const f of frames) {
        const fid = `all-${Math.random().toString(36).slice(2)}`;
        const fullHtml = getHTMLWrapper(
          f.htmlContent,
          f.title,
          currentTheme?.style,
          fid,
          wireframeMode
        );
        const h = await measureHeight(fullHtml, fid);
        const response = await axios.post(
          "/api/screenshot",
          {
            html: fullHtml,
            width: exportWidth,
            height: h,
          },
          {
            responseType: "blob",
            validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
          }
        );
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${f.title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 150));
      }
      toast.success("All frames exported");
    } catch {
      toast.error("Failed to export all frames");
    } finally {
      setIsExportingAll(false);
    }
  }, [frames, currentTheme?.style, isExportingAll, measureHeight, wireframeMode]);

  const handleDownloadAllHtml = useCallback(async () => {
    if (isExportingAll || frames.length === 0) return;
    setIsExportingAll(true);
    try {
      for (const f of frames) {
        const fullHtml = getHTMLWrapper(
          f.htmlContent,
          f.title,
          currentTheme?.style,
          undefined,
          wireframeMode
        );
        const blob = new Blob([fullHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${f.title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 120));
      }
      toast.success("All frames HTML downloaded");
    } catch {
      toast.error("Failed to download all HTML");
    } finally {
      setIsExportingAll(false);
    }
  }, [frames, currentTheme?.style, isExportingAll, wireframeMode]);

  const hasSelected = useMemo(() => Boolean(selectedFrame), [selectedFrame]);

  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
      <TooltipProvider delayDuration={150} skipDelayDuration={500}>
        <div className="bg-background w-auto max-w-none rounded-full border shadow-xl dark:bg-gray-950">
          <div className="flex flex-row items-center gap-2 px-3">
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon-sm"
                      className="cursor-pointer rounded-2xl bg-linear-to-r from-purple-500 to-indigo-600 px-4 text-white shadow-lg shadow-purple-200/50"
                      aria-label="Open AI design generator"
                    >
                      <Wand2 className="size-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>AI Design</TooltipContent>
              </Tooltip>
              <PopoverContent className="mt-1 w-80 rounded-xl! border p-2! shadow-lg">
                <PromptInput
                  promptText={promptText}
                  setPromptText={setPromptText}
                  className="border-muted min-h-37.5 rounded-xl! shadow-none ring-1! ring-purple-500!"
                  hideSubmitBtn={true}
                />
                <Button
                  disabled={isPending}
                  className="mt-2 w-full cursor-pointer rounded-2xl bg-linear-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200/50"
                  onClick={handleAIGenerate}
                >
                  {isPending ? <Spinner /> : <>Design</>}
                </Button>
              </PopoverContent>
            </Popover>

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Palette className="size-4" />
                      <div className="flex gap-1.5">
                        {themes?.slice(0, 4)?.map((theme, index) => {
                          const color = parseThemeColors(theme.style);
                          return (
                            <div
                              role="button"
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTheme(theme.id);
                              }}
                              className={cn(
                                "h-6.5 w-6.5 cursor-pointer rounded-full",
                                currentTheme?.id === theme.id && "ring-1 ring-offset-1"
                              )}
                              style={{
                                background: `linear-gradient(135deg, ${color.primary}, ${color.accent})`,
                              }}
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        +{themes?.length - 4} more
                        <ChevronDown className="size-4" />
                      </div>
                    </div>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Theme</TooltipContent>
              </Tooltip>
              <PopoverContent className="rounded-xl border px-0 shadow">
                <ThemeSelector />
              </PopoverContent>
            </Popover>

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-sm">Background</span>
                      <ChevronDown className="size-4" />
                    </div>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Canvas Background</TooltipContent>
              </Tooltip>
              <PopoverContent className="mt-1 w-80 rounded-xl! border p-3! shadow-lg">
                <div className="space-y-4">
                  <div className="text-sm font-medium">Background Options</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={backgroundType === "dots" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 cursor-pointer rounded-2xl"
                      onClick={() => setBackgroundType("dots")}
                    >
                      Dots
                    </Button>
                    <Button
                      variant={backgroundType === "grid" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 cursor-pointer rounded-2xl"
                      onClick={() => setBackgroundType("grid")}
                    >
                      Grid
                    </Button>
                    <Button
                      variant={backgroundType === "solid" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 cursor-pointer rounded-2xl"
                      onClick={() => setBackgroundType("solid")}
                    >
                      Solid
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm">Color</div>
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 w-12 p-0"
                    />
                    <div
                      className="bg-background/50 ring-border h-8 w-8 rounded-md ring-1"
                      style={{ background: backgroundColor }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-4!" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "cursor-pointer rounded-full px-3 text-white! hover:bg-white/25!",
                    wireframeMode && "bg-white/30 shadow ring-2 ring-white/70"
                  )}
                  onClick={() => setWireframeMode(!wireframeMode)}
                  aria-pressed={wireframeMode}
                  data-active={wireframeMode || undefined}
                >
                  Wireframe
                </Button>
              </TooltipTrigger>
              <TooltipContent>Wireframe Mode</TooltipContent>
            </Tooltip>

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Send className="size-4" />
                      <span className="text-sm">Export</span>
                      <ChevronDown className="size-4" />
                    </div>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-75">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Export Options</div>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={onScreenshot}
                    disabled={isScreenshotting}
                  >
                    {isScreenshotting ? <Spinner /> : <>Canvas (PNG)</>}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleExportSelectedPng}
                    disabled={!hasSelected || isExportingSelected}
                  >
                    {isExportingSelected ? <Spinner /> : <>Selected Frame (PNG)</>}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleDownloadSelectedHtml}
                    disabled={!hasSelected}
                  >
                    Selected Frame (HTML)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={handleExportAllPng}
                    disabled={isExportingAll || frames.length === 0}
                  >
                    {isExportingAll ? <Spinner /> : <>All Frames (PNG)</>}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={handleDownloadAllHtml}
                    disabled={isExportingAll || frames.length === 0}
                  >
                    All Frames (HTML)
                  </Button>
                  <p className="text-muted-foreground text-xs">
                    PNGs work with Figma and similar tools. HTML downloads preserve theme variables.
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="cursor-pointer rounded-full"
                    disabled={isScreenshotting}
                    onClick={onScreenshot}
                    aria-label="Take canvas screenshot"
                  >
                    {isScreenshotting ? <Spinner /> : <CameraIcon className="size-4.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Screenshot</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="cursor-pointer rounded-full"
                    onClick={handleUpdate}
                  >
                    {update.isPending ? (
                      <Spinner />
                    ) : (
                      <>
                        <Save className="size-4" />
                        Save
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default CanvasFloatingToolbar;
