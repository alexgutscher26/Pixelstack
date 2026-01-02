"use client";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group";
import { CornerDownLeftIcon, Wand2 } from "lucide-react";
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
}: PropsType) => {
  const trimmed = promptText.trim();
  return (
    <div className="bg-background">
      <InputGroup className={cn("bg-background min-h-43 rounded-3xl", className && className)}>
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
          className="py-2.5! text-base!"
          placeholder={placeholder ?? "I want to design an app that..."}
          value={promptText}
          onChange={(e) => {
            setPromptText(e.target.value);
          }}
        />

        <InputGroupAddon align="block-end" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bottomLeftAddon}
          </div>
          <div className="flex items-center gap-2">
          {onEnhance && (
            <InputGroupButton
              variant="outline"
              className=""
              size="sm"
              disabled={isEnhancing || trimmed.length === 0}
              onClick={() => onEnhance?.()}
            >
              {isEnhancing ? (
                <Spinner />
              ) : (
                <>
                  Magic Enhance
                  <Wand2 className="size-4" />
                </>
              )}
            </InputGroupButton>
          )}
          {!hideSubmitBtn && (
            <InputGroupButton
              variant="default"
              className=""
              size="sm"
              disabled={!!isLoading}
              onClick={() => onSubmit?.()}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  Design
                  <CornerDownLeftIcon className="size-4" />
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
