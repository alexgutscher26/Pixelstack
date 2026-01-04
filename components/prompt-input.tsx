"use client";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group";
import { CornerDownLeftIcon, Wand2, ImageIcon, MicIcon } from "lucide-react";
import { Spinner } from "./ui/spinner";

interface PropsType {
  promptText: string;
  setPromptText: (value: string) => void;
  isLoading?: boolean;
  className?: string;
  hideSubmitBtn?: boolean;
  onSubmit?: () => void;
  placeholder?: string;
  onEnhance?: () => void;
  isEnhancing?: boolean;
  blockStartAddon?: React.ReactNode;
  inlineStartAddon?: React.ReactNode;
  bottomLeftAddon?: React.ReactNode;
  platform?: "mobile" | "website";
}
const PromptInput = ({
  promptText,
  setPromptText,
  isLoading,
  className,
  hideSubmitBtn = false,
  onSubmit,
  placeholder,
  onEnhance,
  isEnhancing,
  blockStartAddon,
  inlineStartAddon,
  bottomLeftAddon,
  platform = "mobile",
}: PropsType) => {
  const trimmed = promptText.trim();
  return (
    <div className="rounded-[1.8rem] overflow-hidden" style={{ backgroundColor: "#202023" }}>
      <InputGroup className={cn("bg-transparent min-h-[176px] rounded-[1.8rem]", className)}>
        {inlineStartAddon && (
          <InputGroupAddon align="inline-start" className="max-sm:hidden">
            {inlineStartAddon}
          </InputGroupAddon>
        )}
        {blockStartAddon && (
          <InputGroupAddon align="block-start" className="w-full">
            {blockStartAddon}
          </InputGroupAddon>
        )}
        <InputGroupTextarea
          className="bg-transparent border-none py-8! px-8! text-xl! text-white placeholder:text-muted-foreground/40 resize-none leading-relaxed"
          placeholder={placeholder ?? "I want to design an app that..."}
          value={promptText}
          onChange={(e) => {
            setPromptText(e.target.value);
          }}
        />

        <InputGroupAddon
          align="block-end"
          className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 pb-6 pt-2 bg-gradient-to-t from-card to-transparent"
        >
          <div className="flex items-center gap-3 w-full md:w-auto">{bottomLeftAddon}</div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {onEnhance && (
              <InputGroupButton
                variant="ghost"
                className="hidden md:flex items-center gap-2 text-sm font-bold text-yellow-500 hover:text-white transition-colors"
                size="sm"
                disabled={isEnhancing || trimmed.length === 0}
                onClick={() => onEnhance?.()}
              >
                {isEnhancing ? (
                  <Spinner />
                ) : (
                  <>
                    <Wand2 className="size-5" />
                    Magic Enhance
                  </>
                )}
              </InputGroupButton>
            )}
            {!hideSubmitBtn && (
              <InputGroupButton
                variant="default"
                className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-extrabold py-3 px-8 rounded-xl shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] hover:-translate-y-0.5 transition-all"
                size="sm"
                disabled={Boolean(isLoading)}
                onClick={() => onSubmit?.()}
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    Design {platform === "mobile" ? "App" : "Website"}
                    <CornerDownLeftIcon className="size-5 font-bold" />
                  </>
                )}
              </InputGroupButton>
            )}
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default PromptInput;
