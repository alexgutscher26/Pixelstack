"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CodeBlock, CodeBlockCopyButton } from "../ai-elements/code-block";

function toComponentName(title?: string) {
  const base = (title || "Screen").replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const parts = base.split(/\s+/).map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  const name = parts.join("") || "Screen";
  return /^[A-Za-z]/.test(name) ? name : `X${name}`;
}

const ReactDialog = ({
  open,
  title,
  onOpenChange,
  html,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  html: string;
  title?: string;
}) => {
  const componentName = toComponentName(title);
  const escapedHtml = html.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  const jsxCode = `
import React from "react";

export default function ${componentName}() {
  const html = \`
${escapedHtml}
\`;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
`.trim();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-full sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>{title || "Untitled"}</DialogTitle>
        </DialogHeader>
        <div className="relative h-full w-full overflow-y-auto">
          <div>
            <CodeBlock
              className="h-[78vh] w-full [&>div]:h-full [&>div>div]:h-full"
              code={jsxCode}
              language="tsx"
              showLineNumbers
            >
              <CodeBlockCopyButton className="bg-muted! fixed top-16 right-12 z-50" />
            </CodeBlock>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReactDialog;
