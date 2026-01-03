import { generateObject, generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import { z } from "zod";
//import { openrouter } from "@/lib/openrouter";
import { FrameType } from "@/types/project";
import { ANALYSIS_PROMPT, GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";
import { unsplashTool } from "../tool";

type BrandKit = {
  primaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
};

type Preferences = {
  onboardingScreens?: number;
  totalScreens?: number;
  includePaywall?: boolean;
  negativePrompts?: string[] | string;
  stylePreset?: string;
};

type AnalyzedScreen = {
  id: string;
  name: string;
  purpose: string;
  visualDescription: string;
};

type AnalysisResult = {
  theme: string;
  screens: AnalyzedScreen[];
  themeToUse?: string;
};

function computeCounts(preferences: Preferences) {
  const onboarding =
    typeof preferences?.onboardingScreens === "number" &&
    preferences.onboardingScreens >= 1 &&
    preferences.onboardingScreens <= 5
      ? preferences.onboardingScreens
      : undefined;
  const total =
    typeof preferences?.totalScreens === "number" &&
    preferences.totalScreens >= 1 &&
    preferences.totalScreens <= 15
      ? preferences.totalScreens
      : undefined;
  const effective =
    onboarding !== undefined && total !== undefined ? Math.min(onboarding, total - 1) : onboarding;
  const nonOnboarding =
    total !== undefined && effective !== undefined
      ? Math.max(1, Math.min(10, total - effective))
      : undefined;
  const includePaywall =
    typeof preferences?.includePaywall === "boolean" ? preferences.includePaywall : false;
  return { onboarding, total, effective, nonOnboarding, includePaywall };
}

function buildConstraintLines(
  {
    onboarding,
    nonOnboarding,
    includePaywall,
  }: {
    onboarding?: number;
    nonOnboarding?: number;
    includePaywall: boolean;
  },
  negativePrompts: string[],
  stylePreset?: string
) {
  const lines: string[] = [];
  if (onboarding !== undefined) {
    lines.push(`- Onboarding screens: ${onboarding} (range 1–5)`);
  } else {
    lines.push("- Onboarding screens: 1–5 (designer to choose)");
  }
  if (nonOnboarding !== undefined) {
    lines.push(`- Non-onboarding screens: ${nonOnboarding} (range 1–10)`);
  } else {
    lines.push("- Non-onboarding screens: 1–10 (designer to choose)");
  }
  lines.push(`- Include paywall: ${includePaywall ? "Yes" : "No"}`);
  if (negativePrompts.length > 0) {
    lines.push(`- Negative prompts (strictly avoid): ${negativePrompts.join("; ")}`);
  }
  if (stylePreset) {
    lines.push(`- Design style preset: ${stylePreset}`);
  }
  return lines;
}

function buildAnalysisPrompt(
  isExistingGeneration: boolean,
  prompt: string,
  existingTheme: string | undefined,
  contextHTML: string,
  constraintLines: string[]
) {
  if (isExistingGeneration) {
    return `
          USER REQUEST: ${prompt}
          SELECTED THEME: ${existingTheme}

          EXISTING SCREENS (analyze for consistency navigation, layout, design system etc):
          ${contextHTML}

          SCREEN GENERATION CONSTRAINTS:
          ${constraintLines.join("\n")}

          CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
          - **Analyze the existing screens' layout, navigation patterns, and design system
          - **Extract the EXACT bottom navigation component structure and styling
          - **Identify common components (cards, buttons, headers) for reuse
          - **Maintain the same visual hierarchy and spacing
          - **Generate new screens that seamlessly blend with existing ones
        `.trim();
  }
  return `
          USER REQUEST: ${prompt}

          SCREEN GENERATION CONSTRAINTS:
          ${constraintLines.join("\n")}
        `.trim();
}

function buildThemeCSS(selectedTheme: { style?: string } | undefined, brandKit?: BrandKit) {
  const themeStyle = selectedTheme?.style || "";
  const primary = brandKit?.primaryColor
    ? (() => {
        const hex = String(brandKit.primaryColor);
        const clean = hex.replace(/^#/, "");
        const full =
          clean.length === 3
            ? clean
                .split("")
                .map((c) => c + c)
                .join("")
            : clean;
        const num = Number.parseInt(full, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        const rgbText = `${r}, ${g}, ${b}`;
        return `--primary: ${hex}; --primary-rgb: ${rgbText};`;
      })()
    : "";
  const fontVars = brandKit?.fontFamily
    ? `--font-sans: "${String(brandKit.fontFamily)}"; --font-heading: "${String(brandKit.fontFamily)}";`
    : "";
  return `
        ${BASE_VARIABLES}
        ${themeStyle}
        ${primary}
        ${fontVars}
      `;
}

function buildGenerationPrompt(
  i: number,
  analysis: AnalysisResult & { themeToUse: string },
  screenPlan: AnalyzedScreen,
  previousFramesContext: string,
  fullThemeCSS: string,
  brandKit: BrandKit | undefined,
  negativePrompts: string[],
  stylePreset: string | undefined,
  includePaywall: boolean
) {
  return `
          - Screen ${i + 1}/${analysis.screens.length}
          - Screen ID: ${screenPlan.id}
          - Screen Name: ${screenPlan.name}
          - Screen Purpose: ${screenPlan.purpose}

          VISUAL DESCRIPTION: ${screenPlan.visualDescription}

          EXISTING SCREENS REFERENCE (Extract and reuse their components):
          ${previousFramesContext || "No previous screens"}

          THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these):
          ${fullThemeCSS}

          BRAND KIT:
          ${
            brandKit?.primaryColor
              ? `Primary Color: ${brandKit.primaryColor} (strictly use var(--primary) for color styles)`
              : "Primary Color: None"
          }
          ${brandKit?.fontFamily ? `Font Family: ${brandKit.fontFamily} (strictly use theme font variables)` : "Font Family: None"}
          ${brandKit?.logoUrl ? `Logo URL: ${brandKit.logoUrl} (use in header/navbar where appropriate)` : "Logo URL: None"}
          
        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        - **If previous screens exist, COPY the EXACT bottom navigation component structure and styling - do NOT recreate it
        - **Extract common components (cards, buttons, headers) and reuse their styling
        - **Maintain the exact same visual hierarchy, spacing, and color scheme
        - **This screen should look like it belongs in the same app as the previous screens
        - **Strictly follow NEGATIVE PROMPTS: ${negativePrompts.length > 0 ? negativePrompts.join("; ") : "None"}
          - If a negative prompt conflicts with a default style rule, the negative prompt must win.
          - Replace prohibited colors/components with appropriate alternatives consistent with theme variables.
        - **Style preset rules: ${stylePreset || "None"}
          ${
            stylePreset === "Minimalist"
              ? "Use ample whitespace, thin borders, minimal shadows, subtle color accents, restrained radius (rounded-md), no gradients."
              : stylePreset === "Brutalist"
                ? "Use thick borders, hard drop shadows, bold solid colors, blocky geometry, minimal radius (rounded-none/rounded-sm), visible outlines."
                : stylePreset === "Corporate / Enterprise"
                  ? "Use neutral palette, accessible contrast, clear hierarchy, restrained accents, professional tone, moderate radius, minimal playful elements."
                  : stylePreset === "Playful / Gamified"
                    ? "Use vibrant accents, badges/chips, rounded-2xl/3xl, soft glows on interactive elements, lively micro-interactions, friendly typography."
                    : stylePreset === "Dark Mode Native"
                      ? "Use deep dark backgrounds, OLED-friendly, high-contrast text, subtle glows, avoid pure white surfaces; ensure consistent dark variants."
                      : "Follow general premium mobile style."
          }

        1. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
          Use Tailwind classes for layout, spacing, typography, shadows, etc.
          Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
        2. **All content must be inside a single root <div> that controls the layout.**
          - No overflow classes on the root.
          - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        3. **For absolute overlays (maps, bottom sheets, modals, etc.):**
          - Use \`relative w-full h-screen\` on the top div of the overlay.
        4. **For regular content:**
          - Use \`w-full h-full min-h-screen\` on the top div.
        5. **Do not use h-screen on inner content unless absolutely required.**
          - Height must grow with content; content must be fully visible inside an iframe.
        6. **For z-index layering:**
          - Ensure absolute elements do not block other content unnecessarily.
        7. **Output raw HTML only, starting with <div>.**
          - Do not include markdown, comments, <html>, <body>, or <head>.
        8. **Hardcode a style only if a theme variable is not needed for that element.**
        9. **Ensure iframe-friendly rendering:**
          - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
        10. **Paywall constraint:**
           - ${includePaywall ? "If this screen is the designated paywall, include a polished paywall layout." : "Do not include any paywall or gating UI on this screen unless explicitly specified in the screen plan."}
        Generate the complete, production-ready HTML for this screen now
      `.trim();
}

function extractFinalHtml(text: string) {
  let finalHtml = text ?? "";
  const match = finalHtml.match(/<div[\s\S]*<\/div>/);
  finalHtml = match ? match[0] : finalHtml;
  finalHtml = finalHtml.replace(/```/g, "");
  return finalHtml;
}

const AnalysisSchema = z.object({
  theme: z
    .string()
    .describe("The specific visual theme ID (e.g., 'midnight', 'ocean-breeze', 'neo-brutalism')."),
  screens: z
    .array(
      z.object({
        id: z
          .string()
          .describe(
            "Unique identifier for the screen (e.g., 'home-dashboard', 'profile-settings', 'transaction-history'). Use kebab-case."
          ),
        name: z
          .string()
          .describe(
            "Short, descriptive name of the screen (e.g., 'Home Dashboard', 'Profile', 'Transaction History')"
          ),
        purpose: z
          .string()
          .describe(
            "One clear sentence explaining what this screen accomplishes for the user and its role in the app"
          ),
        visualDescription: z
          .string()
          .describe(
            "A dense, high-fidelity visual directive (like an image generation prompt). Describe the layout, specific data examples (e.g. 'Oct-Mar'), component hierarchy, and physical attributes (e.g. 'Chunky cards', 'Floating header','Floating action button', 'Bottom navigation',Header with user avatar)."
          ),
      })
    )
    .min(1)
    .max(10),
});

export const generateScreens = inngest.createFunction(
  { id: "generate-ui-screens" },
  { event: "ui/generate.screens" },
  async ({ event, step, publish }) => {
    const {
      userId,
      projectId,
      prompt,

      frames,
      theme: existingTheme,
      preferences,
      brandKit,
    } = event.data;
    const CHANNEL = `user:${userId}`;
    const isExistingGeneration = Array.isArray(frames) && frames.length > 0;
    const { onboarding, effective, nonOnboarding, includePaywall } = computeCounts(
      preferences as Preferences
    );
    const negativeListRaw = preferences?.negativePrompts;
    const negativePrompts: string[] = Array.isArray(negativeListRaw)
      ? negativeListRaw
      : typeof negativeListRaw === "string"
        ? negativeListRaw
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    const stylePreset =
      typeof preferences?.stylePreset === "string" ? preferences.stylePreset : undefined;

    await publish({
      channel: CHANNEL,
      topic: "generation.start",
      data: {
        status: "running",
        projectId: projectId,
      },
    });

    const analysis = await step.run("analyze-and-plan-screens", async () => {
      await publish({
        channel: CHANNEL,
        topic: "analysis.start",
        data: {
          status: "analyzing",
          projectId: projectId,
        },
      });

      const contextHTML = isExistingGeneration
        ? frames
            .map((frame: FrameType) => `<!-- ${frame.title} -->\n${frame.htmlContent}`)
            .join("\n\n")
        : "";

      const constraintLines = buildConstraintLines(
        { onboarding: effective ?? onboarding, nonOnboarding, includePaywall },
        negativePrompts,
        stylePreset
      );

      const analysisPrompt = buildAnalysisPrompt(
        isExistingGeneration,
        prompt,
        existingTheme,
        contextHTML,
        constraintLines
      );

      const { object } = await generateObject({
        model: "google/gemini-3-pro-preview",
        schema: AnalysisSchema,
        system: ANALYSIS_PROMPT,
        prompt: analysisPrompt,
      });

      const themeToUse = isExistingGeneration ? existingTheme : object.theme;

      if (!isExistingGeneration) {
        await prisma.project.update({
          where: {
            id: projectId,
            userId: userId,
          },
          data: { theme: themeToUse },
        });
      }

      await publish({
        channel: CHANNEL,
        topic: "analysis.complete",
        data: {
          status: "generating",
          theme: themeToUse,
          totalScreens: object.screens.length,
          screens: object.screens,
          projectId: projectId,
        },
      });

      return { ...object, themeToUse };
    });

    // Actuall generation of each screens
    const generatedFrames: typeof frames = isExistingGeneration ? [...frames] : [];
    const existingCount = isExistingGeneration ? frames.length : 0;

    for (let i = 0; i < analysis.screens.length; i++) {
      const screenPlan = analysis.screens[i];
      const selectedTheme = THEME_LIST.find((t) => t.id === analysis.themeToUse);

      const fullThemeCSS = buildThemeCSS(selectedTheme, brandKit);

      // Get all previous existing or generated frames
      const allPreviousFrames = generatedFrames.slice(0, existingCount + i);
      const previousFramesContext = allPreviousFrames
        .map((f: FrameType) => `<!-- ${f.title} -->\n${f.htmlContent}`)
        .join("\n\n");

      await step.run(`generated-screen-${i}`, async () => {
        const result = await generateText({
          model: "google/gemini-3-pro-preview",
          system: GENERATION_SYSTEM_PROMPT,
          tools: {
            searchUnsplash: unsplashTool,
          },
          stopWhen: stepCountIs(5),
          prompt: buildGenerationPrompt(
            i,
            analysis,
            screenPlan,
            previousFramesContext,
            fullThemeCSS,
            brandKit,
            negativePrompts,
            stylePreset,
            includePaywall
          ),
        });

        const finalHtml = extractFinalHtml(result.text ?? "");

        const existing = await prisma.frame.findFirst({
          where: {
            projectId,
            title: screenPlan.name,
          },
        });
        const frame = existing
          ? await prisma.frame.update({
              where: { id: existing.id },
              data: { htmlContent: finalHtml },
            })
          : await prisma.frame.create({
              data: {
                projectId,
                title: screenPlan.name,
                htmlContent: finalHtml,
              },
            });

        // Add to generatedFrames for next iteration's context
        generatedFrames.push(frame);

        await publish({
          channel: CHANNEL,
          topic: "frame.created",
          data: {
            frame: frame,
            screenId: screenPlan.id,
            projectId: projectId,
          },
        });

        return { success: true, frame: frame };
      });
    }

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
