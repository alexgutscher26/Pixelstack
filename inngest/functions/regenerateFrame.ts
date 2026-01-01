/* eslint-disable @typescript-eslint/no-explicit-any */
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

    await step.run("regenerate-screen", async () => {
      const selectedTheme = THEME_LIST.find((t) => t.id === themeId);

      //Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      const isPartial = !!targetOuterHTML;
      const result = await generateText({
        model: process.env.OPENROUTER_API_KEY
          ? openrouter.chat("google/gemini-2.5-flash")
          : ("google/gemini-3-pro-preview" as any),
        system: GENERATION_SYSTEM_PROMPT,
        tools: {
          searchUnsplash: unsplashTool,
        },
        stopWhen: stepCountIs(5),
        prompt: isPartial
          ? `
# PARTIAL ELEMENT UPDATE REQUEST

**USER REQUEST:** ${prompt}

**TARGET ELEMENT TO UPDATE:**
\`\`\`html
${String(targetOuterHTML)}
\`\`\`

**SCREEN CONTEXT:**
- Original Screen: "${frame.title}"
- Theme Variables (Reference ONLY — already defined in parent scope, DO NOT redeclare):
${fullThemeCSS}

# CRITICAL INSTRUCTIONS FOR PARTIAL UPDATE

**1. SCOPE - Update Target Element ONLY:**
   - Return ONLY the updated HTML for the target element shown above
   - Start with the EXACT same root tag as the target element (e.g., if target is <div class="...">...</div>, your output must start with <div>)
   - Preserve the element's position and role in the overall layout

**2. PRESERVATION - Keep What Works:**
   - Maintain all existing CSS classes unless explicitly changing styling
   - Preserve all data-* attributes (critical for functionality)
   - Keep existing structure and child elements unless specifically modifying them
   - Maintain z-index, positioning, and layout properties unless requested to change

**3. MODIFICATION - Change Only What's Requested:**
   - Apply ONLY the changes the user explicitly requested
   - Do NOT refactor, reorganize, or "improve" unrequested aspects
   - If changing text, keep the same formatting/styling
   - If changing colors, use theme variables: bg-[var(--primary)], text-[var(--foreground)]
   - If adding elements, match the existing style and structure

**4. STYLING RULES:**
   - Use Tailwind CSS utility classes for all styling
   - Colors: Always use CSS variables (var(--background), var(--primary), etc.)
   - Maintain consistent spacing and sizing with the original
   - Keep the same level of visual polish (shadows, borders, rounded corners)

**5. OUTPUT FORMAT:**
   - Return ONLY the updated HTML element
   - NO markdown code blocks (\`\`\`)
   - NO comments or explanations
   - NO surrounding text
   - Start directly with the opening tag

**EXAMPLE:**
If target is a button, and user says "make it red", return:
<button class="px-6 py-3 bg-destructive text-white rounded-xl font-semibold">Click Me</button>

NOT an explanation, NOT the entire screen, just the updated element.

Generate the updated element now:
        `.trim()
          : `
# FULL SCREEN REGENERATION REQUEST

**USER REQUEST:** ${prompt}

**CURRENT SCREEN:**
- Title: "${frame.title}"
- Current HTML:
\`\`\`html
${frame.htmlContent}
\`\`\`

**THEME VARIABLES (Reference ONLY — already defined in parent scope, DO NOT redeclare):**
${fullThemeCSS}

# CRITICAL INSTRUCTIONS FOR SCREEN REGENERATION

**1. SURGICAL MODIFICATIONS - Preserve What's Not Mentioned:**
   - The current screen is WORKING and STYLED correctly
   - Change ONLY what the user explicitly requested
   - Keep ALL other components, sections, and styling exactly as they are
   - This is a modification, NOT a redesign

**2. PRESERVATION CHECKLIST:**
   ✅ Bottom navigation: Keep structure, icons, styling, and active states identical
   ✅ Header/top bar: Maintain layout, elements, and styling unless specifically requested
   ✅ Existing cards/components: Preserve structure and styling of unrequested elements
   ✅ Layout structure: Keep same grid, flex, spacing patterns
   ✅ Z-index hierarchy: Maintain layering unless specifically changing
   ✅ Color scheme: Use same CSS variables and theme colors
   ✅ Typography: Keep font sizes, weights, and styles consistent
   ✅ Icons: Use same icon library and sizes (iconify-icon with lucide icons)

**3. MODIFICATION SCOPE:**
   - If user requests "change the chart" → modify only the chart section
   - If user requests "update colors" → change color values but keep structure
   - If user requests "add a section" → insert it logically without disrupting others
   - If user requests "remove X" → remove only X, adjust spacing/layout as needed

**4. HTML STRUCTURE REQUIREMENTS:**

   **Root Container:**
   - Single root <div> that controls the entire layout
   - NO overflow classes on root (overflow-hidden, overflow-y-auto, etc.)
   - Use: \`<div class="relative w-full min-h-screen bg-background">\`

   **Scrollable Content:**
   - Apply overflow-y-auto to INNER content containers, not root
   - Hide scrollbars: \`[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]\`
   - Add bottom padding for fixed navigation: \`pb-24\` or \`pb-32\`

   **Height Strategy:**
   - Root: \`min-h-screen\` (NOT h-screen unless overlay/modal)
   - Content: Let height grow naturally with content
   - For overlays/modals only: \`relative w-full h-screen\`
   - Never use h-screen on regular scrollable content

**5. IFRAME COMPATIBILITY (CRITICAL):**
   - Content must define its own height through natural flow
   - All elements contribute to scrollHeight for proper iframe resizing
   - No fixed heights that cut off content
   - Ensure all content is visible and accessible

**6. CSS & STYLING:**

   **Colors (MANDATORY):**
   - Background: \`bg-[var(--background)]\`
   - Foreground/Text: \`text-[var(--foreground)]\`
   - Cards: \`bg-[var(--card)]\`
   - Borders: \`border-[var(--border)]\`
   - Primary accent: \`text-[var(--primary)]\` or \`bg-[var(--primary)]\`
   - Muted text: \`text-[var(--muted-foreground)]\`
   - NEVER hardcode hex colors unless absolutely necessary

   **Tailwind Utilities:**
   - Spacing: Use consistent gaps (gap-4, gap-6), padding (p-4, p-6, p-8)
   - Rounding: rounded-2xl or rounded-3xl for modern look
   - Shadows: shadow-lg, shadow-xl for depth
   - Effects: backdrop-blur-md, drop-shadow-[0_0_8px_var(--primary)]

**7. CHARTS & DATA VISUALIZATION:**
   - ALWAYS use SVG elements for charts (never div-based fake charts)
   - Circular progress: SVG circle with stroke-dasharray
   - Line/area charts: SVG path with smooth curves
   - Bar charts: CSS height manipulation on divs is acceptable
   - All charts should have glow effects: \`drop-shadow-[0_0_8px_var(--primary)]\`

**8. ICONS:**
   - Use iconify-icon: \`<iconify-icon icon="lucide:home" class="text-2xl"></iconify-icon>\`
   - Common icons: home, compass, zap, heart, user, settings, bell, search
   - Size: text-xl (nav), text-2xl (features), text-4xl (hero)

**9. REALISTIC DATA:**
   - Use real-looking numbers: "8,432 steps", "$1,248.50", "7h 20m"
   - Proper formatting: dates, times, currencies
   - NO generic placeholders like "User 1", "Amount", "Item"

**10. OUTPUT FORMAT:**
   - Return ONLY raw HTML
   - Start directly with: \`<div class="relative w-full min-h-screen bg-background">\`
   - NO markdown code blocks (\`\`\`html)
   - NO comments (<!-- -->)
   - NO explanations or surrounding text
   - NO <html>, <body>, or <head> tags
   - End with the final closing </div>

**11. Z-INDEX HIERARCHY:**
   - Background elements: z-0
   - Main content: z-10
   - Floating cards: z-20
   - Bottom navigation: z-30
   - Modals/overlays: z-40
   - Fixed header: z-50

**PRE-OUTPUT CHECKLIST:**
Before generating, verify:
□ Am I changing ONLY what the user requested?
□ Am I preserving the bottom navigation exactly as is?
□ Am I keeping the header/top bar unless specifically asked to change it?
□ Am I using CSS variables for all colors?
□ Is my root div structured correctly (no overflow)?
□ Are scrollbars hidden on scrollable containers?
□ Will this render correctly in an iframe?
□ Am I using SVG for any charts?
□ Is all data realistic and properly formatted?
□ Does my output start with <div and end with </div> (no markdown)?

Generate the complete, updated HTML for this screen now. Remember: preserve everything except what was explicitly requested to change.
        `.trim(),
      });

      let output = result.text ?? "";
      output = output.replace(/```/g, "");
      if (isPartial) {
        const updated = output;
        const original = String(targetOuterHTML);
        const replaced = frame.htmlContent.replace(original, updated);
        const updatedFrame = await prisma.frame.update({
          where: { id: frameId },
          data: { htmlContent: replaced },
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
      }
      let finalHtml = output;
      const match = finalHtml.match(/<div[\s\S]*<\/div>/);
      finalHtml = match ? match[0] : finalHtml;

      // Update the frame
      const updatedFrame = await prisma.frame.update({
        where: {
          id: frameId,
        },
        data: {
          htmlContent: finalHtml,
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
