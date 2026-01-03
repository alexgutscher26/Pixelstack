"use client";

import { cn } from "@/lib/utils";
import {
  CodeIcon,
  DownloadIcon,
  GripVertical,
  MoreHorizontalIcon,
  Trash2Icon,
  Send,
  Wand2,
  Wand2Icon,
} from "lucide-react";
import { GeneratedIcon } from "../ui/generated-icon";
import { useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { Input } from "../ui/input";
import { ButtonGroup } from "../ui/button-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type PropsType = {
  title: string;
  isSelected?: boolean;
  disabled?: boolean;
  isDownloading: boolean;
  scale?: number;
  isRegenerating?: boolean;
  isDeleting?: boolean;
  onOpenHtmlDialog: () => void;
  onOpenReactDialog?: () => void;
  onDownloadPng?: () => void;
  onRegenerate?: (prompt: string) => void;
  onDeleteFrame?: () => void;
};
const DeviceFrameToolbar = ({
  title,
  isSelected,
  disabled,
  scale = 1.7,
  isDownloading,
  isRegenerating = false,
  isDeleting = false,
  onOpenHtmlDialog,
  onOpenReactDialog,
  onDownloadPng,
  onRegenerate,
  onDeleteFrame,
}: PropsType) => {
  const [promptValue, setPromptValue] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleRegenerate = () => {
    if (promptValue.trim().length >= 10) {
      onRegenerate?.(promptValue);
      setPromptValue("");
      setIsPopoverOpen(false);
    }
  };
  return (
    <div
      className={cn(
        "absolute z-50 -mt-2 flex items-center justify-between gap-2 rounded-full",
        isSelected
          ? "bg-card dark:bg-muted shadown-sm left-1/2 h-8.75 min-w-65 -translate-x-1/2 border py-1 pl-2"
          : "w-[150px h-auto] left-10"
      )}
      style={{
        top: isSelected ? "-70px" : "-38px",
        transformOrigin: "center top",
        transform: `scale(${scale})`,
      }}
    >
      <div
        role="button"
        className="flex h-full flex-1 cursor-grab items-center justify-start gap-1.5 active:cursor-grabbing"
      >
        <GripVertical className="text-muted-foreground size-4" />
        <GeneratedIcon
          prompt={title}
          size={16}
          style="outline"
          className="text-muted-foreground mr-1.5"
          ariaLabel={`${title} icon`}
        />
        <div
          className={cn("mx-px mt-0.5 min-w-20 truncate text-sm font-medium", isSelected && "w-25")}
        >
          {title}
        </div>
      </div>

      {isSelected && (
        <>
          <Separator orientation="vertical" className="bg-border h-5!" />
          <ButtonGroup className="h-full justify-end gap-px! pr-2!">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled}
                    size="icon-xs"
                    variant="ghost"
                    className="rounded-full!"
                    onClick={onOpenHtmlDialog}
                  >
                    <CodeIcon className="stroke-1.5! mt-px size-3.5!" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View HTML</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled}
                    size="icon-xs"
                    variant="ghost"
                    className="rounded-full!"
                    onClick={onOpenReactDialog}
                  >
                    <CodeIcon className="stroke-1.5! mt-px size-3.5!" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View React</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled || isDownloading}
                    size="icon-xs"
                    className="rounded-full!"
                    variant="ghost"
                    onClick={onDownloadPng}
                  >
                    {isDownloading ? (
                      <Spinner />
                    ) : (
                      <DownloadIcon className="stroke-1.5! size-3.5!" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PNG</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={disabled}
                        size="icon-xs"
                        className="rounded-full!"
                        variant="ghost"
                      >
                        {isRegenerating ? (
                          <Spinner className="size-3.5!" />
                        ) : (
                          <Wand2 className="stroke-1.5! size-3.5!" />
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>AI Regenerate</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent align="end" className="xda-no-drag w-80 rounded-lg! p-1!">
                <div className="space-y-2">
                  <InputGroup className="xda-no-drag border-0! bg-transparent! px-0! shadow-none! ring-0!">
                    <InputGroupAddon>
                      <Wand2Icon />
                    </InputGroupAddon>
                    <Input
                      placeholder="Edit with AI..."
                      value={promptValue}
                      onChange={(e) => setPromptValue(e.target.value)}
                      className="xda-no-drag border-0! bg-transparent! shadow-none! ring-0!"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRegenerate();
                        }
                      }}
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        size="icon-sm"
                        disabled={Boolean(isRegenerating)}
                        onClick={handleRegenerate}
                      >
                        {isRegenerating ? (
                          <Spinner className="size-3.5!" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" className="rounded-full!">
                        <MoreHorizontalIcon className="stroke-1.5! mb-px size-3.5!" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-32 rounded-md p-0!">
                <DropdownMenuItem
                  disabled={disabled || isDeleting}
                  onClick={onDeleteFrame}
                  className="cursor-pointer"
                >
                  {isDeleting ? (
                    <Spinner />
                  ) : (
                    <>
                      <Trash2Icon className="size-4" />
                      Delete
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </>
      )}
    </div>
  );
};

export default DeviceFrameToolbar;
