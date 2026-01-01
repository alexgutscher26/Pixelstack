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
import { useGenerateDesignById } from "@/features/use-project-id";

const Canvas = ({
  projectId,
  isPending,
  projectName,
}: {
  projectId: string;
  isPending: boolean;
  projectName: string | null;
}) => {
  const {
    theme,
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
        if (response.data) {
          console.log("Thumbnail saved", response.data);
        }
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
    if (loadingStatus === "completed") {
      saveThumbnailToProject(projectId);
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
  const defaultPrompt =
    "Mobile app home dashboard: sticky header with avatar and greeting, KPI cards for steps/calories, weekly chart, recent activity list, and fixed bottom navigation with 5 icons. Modern polished style, rounded cards, glows, Tailwind + CSS variables.";
  return (
    <>
      <div className="relative h-full w-full overflow-hidden">
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
                  onClick={() => generateDesign(defaultPrompt)}
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
          smooth={true}
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
                  `absolute inset-0 h-full w-full bg-[#eee] p-3 dark:bg-[#242423]`,
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
                          theme_style={theme?.style}
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

function CanvasLoader({ status }: { status?: LoadingStatusType | "fetching" | "finalizing" }) {
  return (
    <div
      className={cn(
        `absolute top-4 left-1/2 z-20 flex max-w-full min-w-40 -translate-x-1/2 items-center space-x-2 rounded-br-xl rounded-bl-xl px-4 pt-1.5 pb-2 shadow-md`,
        status === "fetching" && "bg-gray-500 text-white",
        status === "running" && "bg-amber-500 text-white",
        status === "analyzing" && "bg-blue-500 text-white",
        status === "generating" && "bg-purple-500 text-white",
        status === "finalizing" && "bg-purple-500 text-white"
      )}
    >
      <Spinner className="h-4 w-4 stroke-3!" />
      <span className="text-sm font-semibold capitalize">
        {status === "fetching" ? "Loading Project" : status}
      </span>
    </div>
  );
}

export default Canvas;
