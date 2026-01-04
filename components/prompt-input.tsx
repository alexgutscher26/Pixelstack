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
    <div className="overflow-hidden rounded-[1.8rem]" style={{ backgroundColor: "#202023" }}>
      <InputGroup className={cn("min-h-[176px] rounded-[1.8rem] bg-transparent", className)}>
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
          className="placeholder:text-muted-foreground/40 resize-none border-none bg-transparent px-8! py-8! text-xl! leading-relaxed text-white"
          placeholder={placeholder ?? "I want to design an app that..."}
          value={promptText}
          onChange={(e) => {
            setPromptText(e.target.value);
          }}
        />

        <InputGroupAddon
          align="block-end"
          className="from-card flex flex-col items-center justify-between gap-4 bg-gradient-to-t to-transparent px-6 pt-2 pb-6 md:flex-row"
        >
          <div className="flex w-full items-center gap-3 md:w-auto">{bottomLeftAddon}</div>
          <div className="flex w-full items-center gap-4 md:w-auto">
            {onEnhance && (
              <InputGroupButton
                variant="ghost"
                className="hidden items-center gap-2 text-sm font-bold text-yellow-500 transition-colors hover:text-white md:flex"
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
                className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 font-extrabold text-black shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] transition-all hover:-translate-y-0.5 hover:from-yellow-600 hover:to-orange-600 hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] md:w-auto"
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
