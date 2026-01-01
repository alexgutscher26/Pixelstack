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
  placeholder?: string;
}
const PromptInput = ({
  promptText,
  setPromptText,
  isLoading,
  className,
  hideSubmitBtn = false,
  onSubmit,
  placeholder,
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
      <InputGroup className={cn("bg-background min-h-43 rounded-3xl", className && className)}>
        <InputGroupTextarea
          className="py-2.5! text-base!"
          placeholder={placeholder ?? "I want to design an app that..."}
          value={promptText}
          aria-invalid={!!invalidMsg}
          onChange={(e) => {
            setPromptText(e.target.value);
          }}
        />

        <InputGroupAddon align="block-end" className="flex items-center justify-end">
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
        <div className="text-destructive mt-2 px-1 text-xs font-medium">{invalidMsg}</div>
      )}
    </div>
  );
};

export default PromptInput;
