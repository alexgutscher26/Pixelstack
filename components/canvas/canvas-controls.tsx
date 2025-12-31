import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { HandIcon, MinusIcon, MousePointerIcon, PlusIcon } from "lucide-react";
import { Separator } from "../ui/separator";

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
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn(
            "cursor-pointer rounded-full text-white! hover:bg-white/20!",
            toolMode === TOOL_MODE_ENUM.SELECT && "bg-white/20"
          )}
          onClick={() => setToolMode(TOOL_MODE_ENUM.SELECT)}
        >
          <MousePointerIcon />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn(
            "cursor-pointer rounded-full text-white! hover:bg-white/20!",
            toolMode === TOOL_MODE_ENUM.HAND && "bg-white/20"
          )}
          onClick={() => setToolMode(TOOL_MODE_ENUM.HAND)}
        >
          <HandIcon />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5! bg-white/30" />
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn("cursor-pointer rounded-full text-white! hover:bg-white/20!")}
          onClick={() => zoomOut()}
        >
          <MinusIcon />
        </Button>
        <div className="min-w-10 text-center text-sm">{zoomPercent}%</div>
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn("cursor-pointer rounded-full text-white! hover:bg-white/20!")}
          onClick={() => zoomIn()}
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
};

export default CanvasControls;
