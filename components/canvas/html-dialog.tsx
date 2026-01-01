"use client";
import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CodeBlock, CodeBlockCopyButton } from "../ai-elements/code-block";
import { useCanvas } from "@/context/canvas-context";

const HtmlDialog = ({
  open,
  title,
  theme_style,
  onOpenChange,
  html,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  html: string;
  title?: string;
  theme_style?: string;
}) => {
  const { wireframeMode } = useCanvas();
  const fullHtml = getHTMLWrapper(html, title, theme_style, undefined, wireframeMode);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-full sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>{title || "Untitled"}</DialogTitle>
        </DialogHeader>
        <div className="relative h-full w-full overflow-y-auto">
          <div>
            <CodeBlock className="h-auto w-full" code={fullHtml} language="html" showLineNumbers>
              <CodeBlockCopyButton className="bg-muted! fixed top-16 right-12 z-50" />
            </CodeBlock>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HtmlDialog;
