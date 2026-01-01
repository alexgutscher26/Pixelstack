import { generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import { openrouter } from "@/lib/openrouter";
import { GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";
import { unsplashTool } from "../tool";

export const regenerateFrame = inngest.createFunction(
  { id: "regenerate-frame" },
  { event: "ui/regenerate.frame" },
  async ({ event, step, publish }) => {
    const {
      userId,
      projectId,
      frameId,
      prompt,
      theme: themeId,
      frame,
      targetOuterHTML,
    } = event.data;
    const CHANNEL = `user:${userId}`;

    await publish({
      channel: CHANNEL,
      topic: "generation.start",
      data: {
        status: "generating",
        projectId: projectId,
      },
    });

    // Generate new frame with the user's prompt
    await step.run("regenerate-screen", async () => {
      const selectedTheme = THEME_LIST.find((t) => t.id === themeId);

      //Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;


      const result = await generateText({
        model: openrouter("google/gemini-3-pro-preview"),
        system: GENERATION_SYSTEM_PROMPT,
        tools: {
          searchUnsplash: unsplashTool,
        },
        stopWhen: stepCountIs(5),
        prompt: `
        USER REQUEST: ${prompt}

        ORIGINAL SCREEN TITLE: ${frame.title}
        ORIGINAL SCREEN HTML: ${frame.htmlContent}

        THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these): ${fullThemeCSS}

        TARGET ELEMENT MODE:
        ${targetOuterHTML ? "Yes" : "No"}
        ${targetOuterHTML ? `ORIGINAL TARGET OUTER HTML: ${targetOuterHTML}` : ""}

        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        1. **If TARGET ELEMENT MODE = Yes: ONLY redesign the provided target element**
          - Keep the rest of the screen unchanged
          - Output the UPDATED OUTER HTML of the target element only
          - Start with the same root tag and preserve existing id/data-* attributes
          - Preserve existing classes unless requested to change
        1b. **If TARGET ELEMENT MODE = No: PRESERVE overall screen structure; only modify what the user requested**
          - Keep all existing components, styling, and layout that are NOT mentioned in the user request
          - Only change the specific elements the user asked for
          - Do not add or remove sections unless requested
          - Maintain the exact same HTML structure and CSS classes except for requested changes

        2. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
          Use Tailwind classes for layout, spacing, typography, shadows, etc.
          Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
        3. **If TARGET ELEMENT MODE = No: All content must be inside a single root <div> that controls the layout.**
          - No overflow classes on the root.
          - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        4. **For absolute overlays (maps, bottom sheets, modals, etc.):**
          - Use \`relative w-full h-screen\` on the top div of the overlay.
        5. **For regular content:**
          - Use \`w-full h-full min-h-screen\` on the top div.
        6. **Do not use h-screen on inner content unless absolutely required.**
          - Height must grow with content; content must be fully visible inside an iframe.
        7. **For z-index layering:**
          - Ensure absolute elements do not block other content unnecessarily.
        8. **Output raw HTML only.**
          - If TARGET ELEMENT MODE = Yes: output only the updated target element outer HTML
          - If TARGET ELEMENT MODE = No: start with <div and output the full screen HTML
          - Do not include markdown, comments, <html>, <body>, or <head>
        9. **Ensure iframe-friendly rendering:**
            - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
        10. **Paywall rule:**
            - Do not introduce any paywall or gating UI unless the user's request explicitly asks for a paywall.
        Generate the complete, production-ready HTML for this screen now
        `.trim(),
      });

      const isElementMode = !!targetOuterHTML;
      let finalHtml = result.text ?? "";
      if (isElementMode) {
        finalHtml = finalHtml.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
      } else {
        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
        finalHtml = (match ? match[0] : finalHtml)
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```/g, "")
          .trim();
      }

      const normalize = (s: string) =>
        s.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
      const escapeReg = (s: string) =>
        s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const findRangeByTagAndId = (
        html: string,
        tag: string,
        id: string
      ): [number, number] | undefined => {
        const openRe = new RegExp(
          `<${tag}\\b[^>]*id="${escapeReg(id)}"[^>]*>`,
          "i"
        );
        const openMatch = openRe.exec(html);
        if (!openMatch) return undefined;
        const start = openMatch.index;
        let cursor = start + openMatch[0].length;
        let depth = 1;
        while (depth > 0 && cursor < html.length) {
          const nextOpen = html.indexOf(`<${tag}`, cursor);
          const nextClose = html.indexOf(`</${tag}>`, cursor);
          if (nextClose === -1) return undefined;
          if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            cursor = nextOpen + 1;
          } else {
            depth--;
            cursor = nextClose + (`</${tag}>`).length;
          }
        }
        if (depth !== 0) return undefined;
        return [start, cursor];
      };
      const findRangeByTagAndClasses = (
        html: string,
        tag: string,
        classes: string[]
      ): [number, number] | undefined => {
        if (classes.length === 0) return undefined;
        const openRe = new RegExp(`<${tag}\\b[^>]*class="[^"]*"[^>]*>`, "ig");
        let match: RegExpExecArray | null;
        while ((match = openRe.exec(html))) {
          const openStr = match[0];
          const hasAll = classes.every((c) =>
            new RegExp(`\\b${escapeReg(c)}\\b`).test(openStr)
          );
          if (!hasAll) continue;
          const start = match.index;
          let cursor = start + match[0].length;
          let depth = 1;
          while (depth > 0 && cursor < html.length) {
            const nextOpen = html.indexOf(`<${tag}`, cursor);
            const nextClose = html.indexOf(`</${tag}>`, cursor);
            if (nextClose === -1) return undefined;
            if (nextOpen !== -1 && nextOpen < nextClose) {
              depth++;
              cursor = nextOpen + 1;
            } else {
              depth--;
              cursor = nextClose + (`</${tag}>`).length;
            }
          }
          if (depth === 0) return [start, cursor];
        }
        return undefined;
      };
      const replaceOuterHtml = (
        html: string,
        target: string,
        replacement: string
      ): string | undefined => {
        const normalizedHtml = normalize(html);
        const normalizedTarget = normalize(target);
        if (normalizedHtml.includes(normalizedTarget)) {
          const originalIndex = html.indexOf(target);
          if (originalIndex !== -1) {
            return (
              html.slice(0, originalIndex) +
              replacement +
              html.slice(originalIndex + target.length)
            );
          }
          const idx = normalizedHtml.indexOf(normalizedTarget);
          if (idx !== -1) {
            return html.replace(
              new RegExp(escapeReg(target), "g"),
              replacement
            );
          }
        }
        const tagMatch = target.match(/^<([a-zA-Z0-9-]+)\b/);
        const tag = tagMatch ? tagMatch[1] : "div";
        const idMatch = target.match(/\bid="([^"]+)"/);
        if (idMatch) {
          const id = idMatch[1];
          const range = findRangeByTagAndId(html, tag, id);
          if (range) {
            return html.slice(0, range[0]) + replacement + html.slice(range[1]);
          }
        }
        const classMatch = target.match(/\bclass="([^"]+)"/);
        if (classMatch) {
          const classes = classMatch[1]
            .split(" ")
            .map((c) => c.trim())
            .filter(Boolean);
          const range = findRangeByTagAndClasses(html, tag, classes);
          if (range) {
            return html.slice(0, range[0]) + replacement + html.slice(range[1]);
          }
        }
        return undefined;
      };

      let newHtmlContent = frame.htmlContent;
      if (isElementMode && targetOuterHTML) {
        const replaced = replaceOuterHtml(frame.htmlContent, targetOuterHTML, finalHtml);
        if (replaced) {
          newHtmlContent = replaced;
        } else {
          console.warn(`[regenerateFrame] Could not locate target element for replacement in frame ${frameId}`);
          // Optionally: throw or return a partial success status
        }
      } else {
        newHtmlContent = finalHtml;
      }

      const updatedFrame = await prisma.frame.update({
        where: {
          id: frameId,
        },
        data: {
          htmlContent: newHtmlContent,
        },
      });

      await publish({
        channel: CHANNEL,
        topic: "frame.created",
        data: {
          frame: updatedFrame,
          screenId: frameId,
          projectId: projectId,
        },
      });

      return { success: true, frame: updatedFrame };
    });

    await publish({
      channel: CHANNEL,
      topic: "generation.complete",
      data: {
        status: "completed",
        projectId: projectId,
      },
    });
  }
);
