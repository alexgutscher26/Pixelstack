/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateObject, generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import { z } from "zod";
import { openrouter } from "@/lib/openrouter";
import { FrameType } from "@/types/project";
import { ANALYSIS_PROMPT, GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";
import { unsplashTool } from "../tool";

const AnalysisSchema = z.object({
  theme: z
    .string()
    .describe(
      "The specific visual theme ID (e.g., 'midnight', 'ocean-breeze', 'neo-brutalism')."
    ),
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
    .max(20),
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
    } = event.data;
    const preferences = (event.data as any).preferences || {};
    const desiredTotal =
      Math.max(1, Math.min(10, Number(preferences.totalScreens) || 0)) || 9;
    const desiredOnboarding =
      Math.max(1, Math.min(5, Number(preferences.onboardingScreens) || 0)) || 1;
    const includePaywall = Boolean(preferences.includePaywall);
    const CHANNEL = `user:${userId}`;
    const isExistingGeneration = Array.isArray(frames) && frames.length > 0;

    await publish({
      channel: CHANNEL,
      topic: "generation.start",
      data: {
        status: "running",
        projectId: projectId,
      },
    });

    //Analyze or plan
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
            .map(
              (frame: FrameType) =>
                `<!-- ${frame.title} -->\n${frame.htmlContent}`
            )
            .join("\n\n")
        : "";

      const analysisPrompt = isExistingGeneration
        ? `
          USER REQUEST: ${prompt}
          SELECTED THEME: ${existingTheme}

          EXISTING SCREENS (analyze for consistency navigation, layout, design system etc):
          ${contextHTML}

         CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
          - **Analyze the existing screens' layout, navigation patterns, and design system
          - **Extract the EXACT bottom navigation component structure and styling
          - **Identify common components (cards, buttons, headers) for reuse
          - **Maintain the same visual hierarchy and spacing
          - **Generate new screens that seamlessly blend with existing ones
        `.trim()
        : `
          USER REQUEST: ${prompt}
          USER PREFERENCES:
          - Non-onboarding screens to generate (including Home): ${desiredTotal}
          - Onboarding screens count: ${desiredOnboarding}
          - Include paywall in onboarding: ${includePaywall ? "Yes" : "No"}
        `.trim();

      const { object } = await generateObject({
        model:
          process.env.OPENROUTER_API_KEY
            ? openrouter.chat("google/gemini-2.5-flash")
            : ("google/gemini-3-pro-preview" as any),
        schema: AnalysisSchema,
        system: ANALYSIS_PROMPT,
        prompt: analysisPrompt,
      });

  const themeToUse = isExistingGeneration ? existingTheme : object.theme;

  if (!isExistingGeneration) {
        // Ensure onboarding and home screens exist and are ordered first
        const screens = Array.isArray(object.screens) ? [...object.screens] : [];

        const hasOnboarding = screens.some(
          (s) =>
            /onboarding|welcome|splash|intro|getting-started/i.test(
              `${s.id} ${s.name}`
            )
        );
        const hasHome = screens.some(
          (s) =>
            /home|dashboard|main/i.test(`${s.id} ${s.name}`)
        );

        const onboardingPlan = hasOnboarding
          ? screens.find((s) =>
              /onboarding|welcome|splash|intro|getting-started/i.test(
                `${s.id} ${s.name}`
              )
            )!
          : {
            id: "onboarding-welcome",
            name: "Welcome Onboarding",
            purpose:
              "Introduce the app and guide new users through a quick setup.",
            visualDescription:
              [
                "Root: relative w-full min-h-screen bg-[var(--background)] with inner scrollable content.",
                "Hero: large illustration/searchUnsplash hero (topic: abstract gradient onboarding), app logo top-center.",
                "Copy: bold title and subtext describing app value, bullets with lucide:check icons.",
                "Progress: step indicator with rounded-full progress bar.",
                "Actions: primary CTA button 'Continue' (rounded-full, shadow-2xl), secondary 'Skip' text button.",
                "Footer: subtle terms/privacy links.",
                "NO bottom navigation on onboarding.",
              ].join(" "),
          };

        const homePlan = hasHome
          ? screens.find((s) => /home|dashboard|main/i.test(`${s.id} ${s.name}`))!
          : {
            id: "home-dashboard",
            name: "Home Dashboard",
            purpose:
              "Primary landing screen showing overview cards, charts, and quick actions.",
            visualDescription:
              [
                "Root: relative w-full min-h-screen bg-[var(--background)] with inner scrollable content.",
                "Header: glassmorphic sticky header with user avatar (https://i.pravatar.cc/150?u=jane), greeting 'Welcome Jane', notifications with red dot.",
                "Overview: 2x2 grid of metric cards (e.g., Balance $12,430; Steps 8,432; Sleep 7h 20m; Calories 420 kcal).",
                "Charts: SVG line/area chart for weekly trend and circular progress for goals.",
                "Quick actions: rounded-full buttons row.",
                "Bottom navigation: 5 icons (lucide:home ACTIVE, lucide:bar-chart-2, lucide:zap, lucide:user, lucide:menu) — floating, glassmorphic, exact styling with active glow.",
              ].join(" "),
          };

        // Filter out any duplicates of the mandatory screens from the rest
        const rest = screens.filter(
          (s) =>
            !/onboarding|welcome|splash|intro|getting-started/i.test(
              `${s.id} ${s.name}`
            ) &&
            !/home|dashboard|main/i.test(`${s.id} ${s.name}`)
        );

        const extraOnboardingPlans: typeof screens = [];
        if (desiredOnboarding > 1) {
          extraOnboardingPlans.push({
            id: "onboarding-features",
            name: "Onboarding Features",
            purpose: "Showcase key features and benefits before starting.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)] with inner scrollable content.",
              "Header: minimal top bar with skip button.",
              "Feature highlights: stacked rounded-3xl cards with lucide icons and short descriptions.",
              "Progress: step indicator.",
              "Primary CTA: 'Next' rounded-full button.",
              "NO bottom navigation on onboarding.",
            ].join(" "),
          });
        }
        if (desiredOnboarding > 2) {
          extraOnboardingPlans.push({
            id: "onboarding-permissions",
            name: "Onboarding Permissions",
            purpose: "Request optional permissions with clear benefits.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)] with inner scrollable content.",
              "Permission list: cards for Notifications, Location, Health with lucide icons.",
              "Toggle style buttons and a clear CTA to continue.",
              "Progress: step indicator.",
              "NO bottom navigation on onboarding.",
            ].join(" "),
          });
        }

        const paywallPlan = includePaywall
          ? {
              id: "onboarding-paywall",
              name: "Onboarding Paywall",
              purpose:
                "Offer premium plan with benefits, pricing tiers, and trial.",
              visualDescription: [
                "Root: relative w-full min-h-screen bg-[var(--background)] with inner scrollable content.",
                "Pricing: tier cards (Free, Pro, Premium) with features checklist.",
                "Hero: subtle gradient banner and lucide:zap badge for best value.",
                "CTA: 'Start Free Trial' and secondary 'Continue Free' buttons.",
                "Trust: small testimonials or trust badges row.",
                "NO bottom navigation on onboarding.",
              ].join(" "),
            }
          : null;

        const onboardingSequence = [
          onboardingPlan,
          ...extraOnboardingPlans,
          ...(paywallPlan ? [paywallPlan] : []),
        ];

        const fillerCatalog = [
          {
            id: "analytics-overview",
            name: "Analytics Overview",
            purpose: "Visualize key metrics and trends at a glance.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)] with inner scrollable content.",
              "Header: sticky glass header with title 'Analytics'.",
              "Charts: SVG area/line chart, donut chart for distributions.",
              "Cards: KPIs with icons and subtle glow.",
              "Bottom navigation present with lucide:bar-chart-2 ACTIVE.",
            ].join(" "),
          },
          {
            id: "transactions-list",
            name: "Transactions",
            purpose: "List of recent transactions with filters and details.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)] with inner scrollable content.",
              "Header: sticky with filter chips.",
              "List: item cards with logo, title, amount, time.",
              "Bottom navigation present with lucide:menu ACTIVE.",
            ].join(" "),
          },
          {
            id: "messages-center",
            name: "Messages",
            purpose: "Conversations and support messages.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)].",
              "Threads: card list with avatar, name, snippet, time.",
              "Bottom navigation present with lucide:message-circle ACTIVE.",
            ].join(" "),
          },
          {
            id: "profile",
            name: "Profile",
            purpose: "User profile details and preferences.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)].",
              "Header: avatar, name, settings button.",
              "Sections: info cards, achievements, connected accounts.",
              "Bottom navigation present with lucide:user ACTIVE.",
            ].join(" "),
          },
          {
            id: "settings",
            name: "Settings",
            purpose: "App settings, theme, notifications.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)].",
              "List: settings cards with toggles and chevrons.",
              "Bottom navigation present with lucide:user ACTIVE.",
            ].join(" "),
          },
          {
            id: "notifications",
            name: "Notifications",
            purpose: "Alerts and updates.",
            visualDescription: [
              "Root: relative w-full min-h-screen.",
              "Feed: notification cards with status chips.",
              "Bottom navigation present with lucide:zap ACTIVE.",
            ].join(" "),
          },
          {
            id: "explore",
            name: "Explore",
            purpose: "Discover content and recommendations.",
            visualDescription: [
              "Root: relative w-full min-h-screen.",
              "Grid: cards with thumbnails and tags.",
              "Bottom navigation present with lucide:compass ACTIVE.",
            ].join(" "),
          },
          {
            id: "search",
            name: "Search",
            purpose: "Search with recent and popular queries.",
            visualDescription: [
              "Root: relative w-full min-h-screen.",
              "Search bar with filters.",
              "Results list with avatars/images and summary.",
              "Bottom navigation present with lucide:compass ACTIVE.",
            ].join(" "),
          },
        ];

        while (rest.length < 20 && rest.length < desiredTotal * 2) {
          const next = fillerCatalog[rest.length % fillerCatalog.length];
          rest.push(next as any);
        }

        // desiredTotal counts non-onboarding screens including Home
        const allowedRestCount = Math.max(0, desiredTotal - 1);
        const finalScreens = [
          ...onboardingSequence,
          homePlan,
          ...rest.slice(0, allowedRestCount),
        ];
        object.screens = finalScreens;

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
    const generatedFrames: typeof frames = isExistingGeneration
      ? [...frames]
      : [];

    for (let i = 0; i < analysis.screens.length; i++) {
      const screenPlan = analysis.screens[i];
      const selectedTheme = THEME_LIST.find(
        (t) => t.id === analysis.themeToUse
      );

      //Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      // Get all previous existing or generated frames
      const allPreviousFrames = generatedFrames.slice(0, i);
      const previousFramesContext = allPreviousFrames
        .map((f: FrameType) => `<!-- ${f.title} -->\n${f.htmlContent}`)
        .join("\n\n");

      await step.run(`generated-screen-${i}`, async () => {
        const result = await generateText({
          model:
            process.env.OPENROUTER_API_KEY
              ? openrouter.chat("google/gemini-2.5-flash")
              : ("google/gemini-3-pro-preview" as any),
          system: GENERATION_SYSTEM_PROMPT,
          tools: {
            searchUnsplash: unsplashTool,
          },
          stopWhen: stepCountIs(5),
          prompt: `
          - Screen ${i + 1}/${analysis.screens.length}
          - Screen ID: ${screenPlan.id}
          - Screen Name: ${screenPlan.name}
          - Screen Purpose: ${screenPlan.purpose}

          VISUAL DESCRIPTION: ${screenPlan.visualDescription}

          EXISTING SCREENS REFERENCE (Extract and reuse their components):
          ${previousFramesContext || "No previous screens"}

          THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these):
          ${fullThemeCSS}

        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        - **If previous screens exist, COPY the EXACT bottom navigation component structure and styling - do NOT recreate it
        - **Extract common components (cards, buttons, headers) and reuse their styling
        - **Maintain the exact same visual hierarchy, spacing, and color scheme
        - **This screen should look like it belongs in the same app as the previous screens

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
        Generate the complete, production-ready HTML for this screen now
      `.trim(),
        });

        let finalHtml = result.text ?? "";
        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
        finalHtml = match ? match[0] : finalHtml;
        finalHtml = finalHtml.replace(/```/g, "");

        //Create the frame
        const frame = await prisma.frame.create({
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
