import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { LoadingStatusType, useCanvas } from "@/context/canvas-context";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import CanvasFloatingToolbar from "./canvas-floating-toolbar";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import CanvasControls from "./canvas-controls";
import DeviceFrame from "./device-frame";
import HtmlDialog from "./html-dialog";
import ReactDialog from "./react-dialog";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { useGenerateDesignById, useUpdateProject } from "@/features/use-project-id";

const Canvas = ({
  projectId,
  isPending,
  projectName,
  platform = "mobile",
}: {
  projectId: string;
  isPending: boolean;
  projectName: string | null;
  platform?: "mobile" | "website";
}) => {
  const {
    theme,
    themeStyle,
    frames,
    selectedFrame,
    setSelectedFrameId,
    loadingStatus,
    backgroundType,
    backgroundColor,
  } = useCanvas();
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT);
  const [zoomPercent, setZoomPercent] = useState<number>(53);
  const [currentScale, setCurrentScale] = useState<number>(0.53);
  const [openHtmlDialog, setOpenHtmlDialog] = useState(false);
  const [openReactDialog, setOpenReactDialog] = useState(false);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const hasCelebratedRef = useRef<boolean>(false);

  const canvasRootRef = useRef<HTMLDivElement>(null);

  const saveThumbnailToProject = useCallback(
    async (projectId: string | null) => {
      try {
        if (!projectId) return null;
        const result = getCanvasHtmlContent();
        if (!result?.html) return null;
        setSelectedFrameId(null);
        setIsSaving(true);
        const response = await axios.post("/api/screenshot", {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
          projectId,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setIsSaving(false);
      }
    },
    [setSelectedFrameId]
  );

  useEffect(() => {
    if (!projectId) return;
    if (loadingStatus === "running") {
      hasCelebratedRef.current = false;
    }
    if (loadingStatus === "completed" && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true;
      saveThumbnailToProject(projectId);
      setIsCelebrating(true);
      try {
        const AC =
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
          window.AudioContext;
        const ctx = AC ? new AC() : null;
        if (ctx) {
          const gain = ctx.createGain();
          gain.gain.value = 0.1;
          gain.connect(ctx.destination);
          const osc1 = ctx.createOscillator();
          osc1.type = "sine";
          osc1.frequency.value = 880;
          osc1.connect(gain);
          osc1.start();
          osc1.stop(ctx.currentTime + 0.25);
          const osc2 = ctx.createOscillator();
          osc2.type = "sine";
          osc2.frequency.value = 1320;
          osc2.connect(gain);
          osc2.start(ctx.currentTime + 0.18);
          osc2.stop(ctx.currentTime + 0.55);
        }
      } catch {}
    }
  }, [loadingStatus, projectId, saveThumbnailToProject]);

  const handleSaveProject = useCallback(() => {
    saveThumbnailToProject(projectId);
  }, [projectId, saveThumbnailToProject]);

  const onOpenHtmlDialog = () => {
    setOpenHtmlDialog(true);
  };
  const onOpenReactDialog = () => {
    setOpenReactDialog(true);
  };

  function getCanvasHtmlContent() {
    const el = canvasRootRef.current;
    if (!el) {
      toast.error("Canvas element not found");
      return null;
    }
    let styles = "";
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) styles += rule.cssText;
      } catch {}
    }

    return {
      element: el,
      html: `
         <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>body{margin:0}*{box-sizing:border-box}${styles}</style>
          </head>
          <body>${el.outerHTML}</body>
          </html>
      `,
    };
  }

  const handleCanvasScreenshot = useCallback(async () => {
    try {
      const result = getCanvasHtmlContent();
      if (!result?.html) {
        toast.error("Failed to get canvas content");
        return null;
      }
      setSelectedFrameId(null);
      setIsScreenshotting(true);

      const response = await axios.post(
        "/api/screenshot",
        {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
        },
        {
          responseType: "blob",
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );
      const title = projectName || "Canvas";
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}
      -${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Screenshot downloaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to screenshot canvas");
    } finally {
      setIsScreenshotting(false);
    }
  }, [projectName, setSelectedFrameId]);

  const currentStatus = isSaving
    ? "finalizing"
    : isPending && (loadingStatus === null || loadingStatus === "idle")
      ? "fetching"
      : loadingStatus !== "idle" && loadingStatus !== "completed"
        ? loadingStatus
        : null;

  const { mutate: generateDesign, isPending: isGenerating } = useGenerateDesignById(projectId);
  const updateProjectTheme = useUpdateProject(projectId);
  const defaultPrompt =
    "Mobile app home dashboard: sticky header with avatar and greeting, KPI cards for steps/calories, weekly chart, recent activity list, and fixed bottom navigation with 5 icons. Modern polished style, rounded cards, glows, Tailwind + CSS variables.";
  return (
    <>
      <div className="relative h-full w-full overflow-hidden">
        {isCelebrating && <ConfettiOverlay onDone={() => setIsCelebrating(false)} />}
        <CanvasFloatingToolbar
          projectId={projectId}
          isScreenshotting={isScreenshotting}
          onScreenshot={handleCanvasScreenshot}
          onSave={handleSaveProject}
        />

        {!currentStatus && (frames?.length ?? 0) === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-card text-card-foreground max-w-md rounded-xl border p-8 text-center shadow-md">
              <div className="bg-primary/15 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Wand2 className="size-7" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Design your first screens</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Start with a prompt and we’ll generate 8–12 screens.
              </p>
              <div className="mt-4">
                <Button
                  onClick={async () => {
                    try {
                      if (theme?.id) {
                        await updateProjectTheme.mutateAsync({ themeId: theme.id });
                      }
                    } catch {}
                    generateDesign(defaultPrompt);
                  }}
                  disabled={isGenerating}
                  className="px-6"
                >
                  {isGenerating ? <Spinner /> : <>Generate screens</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStatus && <CanvasLoader status={currentStatus} />}

        <TransformWrapper
          initialScale={0.53}
          initialPositionX={40}
          initialPositionY={5}
          minScale={0.1}
          maxScale={3}
          wheel={{ step: 0.1 }}
          pinch={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
          centerZoomedOut={false}
          centerOnInit={false}
          smooth
          limitToBounds={false}
          panning={{
            disabled: toolMode !== TOOL_MODE_ENUM.HAND,
          }}
          onTransformed={(ref) => {
            setZoomPercent(Math.round(ref.state.scale * 100));
            setCurrentScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div
                ref={canvasRootRef}
                className={cn(
                  "absolute inset-0 h-full w-full bg-[#eee] p-3 dark:bg-[#242423]",
                  toolMode === TOOL_MODE_ENUM.HAND
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-default"
                )}
                style={{
                  backgroundColor: backgroundType === "solid" ? backgroundColor : undefined,
                  backgroundImage:
                    backgroundType === "dots"
                      ? `radial-gradient(circle, ${backgroundColor} 1px, transparent 1px)`
                      : backgroundType === "grid"
                        ? `linear-gradient(${backgroundColor} 1px, transparent 1px), linear-gradient(90deg, ${backgroundColor} 1px, transparent 1px)`
                        : undefined,
                  backgroundSize:
                    backgroundType === "dots"
                      ? "20px 20px"
                      : backgroundType === "grid"
                        ? "20px 20px"
                        : undefined,
                  backgroundPosition: backgroundType === "grid" ? "0 0, 0 0" : undefined,
                }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    overflow: "unset",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div>
                    {frames?.map((frame, index: number) => {
                      const baseX = 100 + index * 480;
                      const y = 100;

                      // if (frame.isLoading) {
                      //   return (
                      //     <DeviceFrameSkeleton
                      //       key={index}
                      //       style={{
                      //         transform: `translate(${baseX}px, ${y}px)`,
                      //       }}
                      //     />
                      //   );
                      // }
                      return (
                        <DeviceFrame
                          key={frame.id}
                          frameId={frame.id}
                          projectId={projectId}
                          title={frame.title}
                          html={frame.htmlContent}
                          isLoading={frame.isLoading}
                          scale={currentScale}
                          initialPosition={{
                            x: baseX,
                            y,
                          }}
                          toolMode={toolMode}
                          theme_style={themeStyle}
                          platform={platform}
                          onOpenHtmlDialog={onOpenHtmlDialog}
                          onOpenReactDialog={onOpenReactDialog}
                        />
                      );
                    })}
                  </div>
                  {/* <DeviceFrame
                    frameId="demo"
                    title="Demo Screen"
                    html={DEMO_HTML}
                    scale={currentScale}
                    initialPosition={{
                      x: 1000,
                      y: 100,
                    }}
                    toolMode={toolMode}
                    theme_style={theme?.style}
                    onOpenHtmlDialog={onOpenHtmlDialog}
                  /> */}
                </TransformComponent>
              </div>

              <CanvasControls
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                zoomPercent={zoomPercent}
                toolMode={toolMode}
                setToolMode={setToolMode}
              />
            </>
          )}
        </TransformWrapper>
      </div>

      <HtmlDialog
        html={selectedFrame?.htmlContent || ""}
        title={selectedFrame?.title}
        theme_style={theme?.style}
        open={openHtmlDialog}
        onOpenChange={setOpenHtmlDialog}
      />
      <ReactDialog
        html={selectedFrame?.htmlContent || ""}
        title={selectedFrame?.title}
        open={openReactDialog}
        onOpenChange={setOpenReactDialog}
      />
    </>
  );
};

function ConfettiOverlay({ onDone }: { onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const colors = ["#ffffff", "#c4b5fd", "#a78bfa", "#818cf8", "#22c55e", "#f472b6", "#60a5fa"];
    const particles = Array.from({ length: 160 }).map(() => {
      const x = Math.random() * window.innerWidth;
      const y = -20 - Math.random() * 80;
      const size = 6 + Math.random() * 8;
      const vx = -1 + Math.random() * 2;
      const vy = 1.2 + Math.random() * 2.8;
      const rot = Math.random() * Math.PI;
      const vr = -0.05 + Math.random() * 0.1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      return { x, y, size, vx, vy, rot, vr, color };
    });
    let raf = 0;
    const start = performance.now();
    const draw = (t: number) => {
      const elapsed = t - start;
      const fadeStart = 6000;
      const fadeDur = 2500;
      const alpha = elapsed < fadeStart ? 1 : Math.max(0, 1 - (elapsed - fadeStart) / fadeDur);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = alpha;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
      if (elapsed > fadeStart + fadeDur) {
        cancelAnimationFrame(raf);
        if (onDone) onDone();
      }
    };
    raf = requestAnimationFrame(draw);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [onDone]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-50" />;
}

function CanvasLoader({ status }: { status?: LoadingStatusType | "fetching" | "finalizing" }) {
  const steps = ["Analyzing prompt...", "Generating Layout...", "Rendering..."];
  const stepIndex =
    status === "analyzing"
      ? 0
      : status === "generating"
        ? 1
        : status === "finalizing"
          ? 2
          : status === "running"
            ? 0
            : -1;

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 z-60 -translate-x-1/2 rounded-full px-5 py-2 shadow-lg",
        "text-white",
        status === "fetching" && "bg-gray-500",
        status === "running" && "bg-amber-500",
        status === "analyzing" && "bg-blue-500",
        status === "generating" && "bg-purple-500",
        status === "finalizing" && "bg-purple-600"
      )}
    >
      {stepIndex === -1 ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold">Loading Project</span>
        </div>
      ) : (
        <div className="flex items-center">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    i <= stepIndex ? "bg-white" : "bg-white/50"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    i <= stepIndex ? "opacity-100" : "opacity-70"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("mx-3 h-px w-8", i < stepIndex ? "bg-white" : "bg-white/40")} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Canvas;
