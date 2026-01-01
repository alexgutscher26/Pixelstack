import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { HandIcon, MinusIcon, MousePointerIcon, PlusIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type PropsType = {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomPercent: number;
  toolMode: ToolModeType;
  setToolMode: (toolMode: ToolModeType) => void;
};
const CanvasControls = ({ zoomIn, zoomOut, zoomPercent, toolMode, setToolMode }: PropsType) => {
  return (
    <div className="dark:bg-muted absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-black px-4 py-1.5 text-white! shadow-md">
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "cursor-pointer rounded-full text-white! hover:bg-white/25!",
                  toolMode === TOOL_MODE_ENUM.SELECT && "bg-white/30 shadow ring-2 ring-white/70"
                )}
                onClick={() => setToolMode(TOOL_MODE_ENUM.SELECT)}
                aria-pressed={toolMode === TOOL_MODE_ENUM.SELECT}
                data-active={toolMode === TOOL_MODE_ENUM.SELECT || undefined}
                aria-label="Select tool"
              >
                <MousePointerIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select (V)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "cursor-pointer rounded-full text-white! hover:bg-white/25!",
                  toolMode === TOOL_MODE_ENUM.HAND && "bg-white/30 shadow ring-2 ring-white/70"
                )}
                onClick={() => setToolMode(TOOL_MODE_ENUM.HAND)}
                aria-pressed={toolMode === TOOL_MODE_ENUM.HAND}
                data-active={toolMode === TOOL_MODE_ENUM.HAND || undefined}
                aria-label="Hand tool"
              >
                <HandIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hand (H)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator orientation="vertical" className="h-5! bg-white/30" />
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn("cursor-pointer rounded-full text-white! hover:bg-white/20!")}
                onClick={() => zoomOut()}
              >
                <MinusIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="min-w-10 text-center text-sm">{zoomPercent}%</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn("cursor-pointer rounded-full text-white! hover:bg-white/20!")}
                onClick={() => zoomIn()}
              >
                <PlusIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CanvasControls;
