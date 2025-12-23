"use client";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group";
import { CornerDownLeftIcon } from "lucide-react";
import { Spinner } from "./ui/spinner";

interface PropsType {
  promptText: string;
  setPromptText: (value: string) => void;
  isLoading?: boolean;
  className?: string;
  hideSubmitBtn?: boolean;
  onSubmit?: () => void;
}
const PromptInput = ({
  promptText,
  setPromptText,
  isLoading,
  className,
  hideSubmitBtn = false,
  onSubmit,
}: PropsType) => {
  const trimmed = promptText.trim();
  const invalidMsg =
    trimmed.length === 0
      ? "Please enter a prompt"
      : trimmed.length < 10
      ? "Enter at least 10 characters"
      : "";
  return (
    <div className="bg-background">
      <InputGroup
        className={cn(
          "min-h-[172px] rounded-3xl bg-background ",
          className && className
        )}
      >
        <InputGroupTextarea
          className="text-base! py-2.5!"
          placeholder="I want to design an app that..."
          value={promptText}
          aria-invalid={!!invalidMsg}
          onChange={(e) => {
            setPromptText(e.target.value);
          }}
        />

        
        <InputGroupAddon
          align="block-end"
          className="flex items-center justify-end"
        >
          {!hideSubmitBtn && (
            <InputGroupButton
              variant="default"
              className=""
              size="sm"
              disabled={!!invalidMsg || isLoading}
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
        </InputGroupAddon>
      </InputGroup>
      {invalidMsg && (
        <div className="mt-2 px-1 text-destructive text-xs font-medium">
          {invalidMsg}
        </div>
      )}
    </div>
  );
};

export default PromptInput;
