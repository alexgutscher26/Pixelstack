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
    const desiredTotal = Math.max(1, Math.min(10, Number(preferences.totalScreens) || 0)) || 9;
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
            .map((frame: FrameType) => `<!-- ${frame.title} -->\n${frame.htmlContent}`)
            .join("\n\n")
        : "";

      const analysisPrompt = isExistingGeneration
        ? `
          USER REQUEST: ${prompt}
          SELECTED THEME: ${existingTheme}

          EXISTING SCREENS HTML CODE:
          ${contextHTML}

          YOUR TASK: Analyze the existing screens deeply and plan new screens that match perfectly.

          STEP 1 - EXTRACT THE DESIGN SYSTEM:
          Look at the HTML code above and identify:
          - Bottom navigation: exact class names, structure, icon names, active state styling
          - Header patterns: sticky/fixed positioning, glassmorphic effects (backdrop-blur, bg opacity), height values
          - Card components: border-radius values (rounded-xl, rounded-2xl, etc.), padding, shadow depth, border styles
          - Button styles: primary button classes, secondary button classes, sizes, hover states
          - Spacing scale: gap values (gap-4, gap-6), padding values (p-4, p-6), margin patterns
          - Color usage: which CSS variables are used where (--background, --foreground, --accent, --muted, etc.)
          - Typography: text sizes (text-sm, text-base, text-lg), font weights, line heights
          - Icons: lucide icon names used, icon sizes, positioning patterns

          STEP 2 - IDENTIFY REUSABLE PATTERNS:
          From the existing HTML, extract:
          - The exact bottom navigation div structure with all classes
          - Common card wrapper patterns
          - Header/title component patterns
          - List item structures
          - Input field styling
          - Badge/chip components
          - How images/avatars are styled

          STEP 3 - PLAN NEW SCREENS:
          Create new screen plans that:
          - Use the EXACT SAME bottom navigation structure (copy the classes verbatim)
          - Follow the same spacing rhythm (if existing screens use gap-4 between sections, use gap-4)
          - Use the same component patterns (if cards are rounded-xl with p-6, new cards should match)
          - Maintain the same visual density and polish level
          - Keep the same header style and positioning
          - Use the same icon family and sizes
          
          CRITICAL: Your new screens must look like they were designed by the same person who made the existing screens.
        `.trim()
        : `
          USER REQUEST: ${prompt}
          USER PREFERENCES:
          - Total main screens (including Home): ${desiredTotal}
          - Onboarding screens: ${desiredOnboarding}
          - Include paywall: ${includePaywall ? "Yes" : "No"}
          
          YOUR TASK: Plan a complete app screen sequence.

          REQUIREMENTS:
          1. Start with ${desiredOnboarding} onboarding screen(s) - welcoming, introducing features
          2. Follow with the Home/Dashboard screen - the main landing page after onboarding
          3. Then plan ${Math.max(0, desiredTotal - 1)} additional feature screens
          4. ${includePaywall ? "Include a paywall/pricing screen in the onboarding flow" : "Skip paywall screen"}
          
          SCREEN PLANNING TIPS:
          - Make each screen serve a clear, specific purpose
          - Think about the user journey: onboarding → home → features
          - Include variety: lists, grids, forms, detail views, settings
          - Plan for consistent navigation (bottom nav on main screens, no nav on onboarding)
          - Consider common app screens: profile, settings, notifications, search, analytics
          
          Create a cohesive set of screens that tell a complete story.
        `.trim();

      const { object } = await generateObject({
        model: process.env.OPENROUTER_API_KEY
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

        const hasOnboarding = screens.some((s) =>
          /onboarding|welcome|splash|intro|getting-started/i.test(`${s.id} ${s.name}`)
        );
        const hasHome = screens.some((s) => /home|dashboard|main/i.test(`${s.id} ${s.name}`));

        const onboardingPlan = hasOnboarding
          ? screens.find((s) =>
              /onboarding|welcome|splash|intro|getting-started/i.test(`${s.id} ${s.name}`)
            )!
          : {
              id: "onboarding-welcome",
              name: "Welcome Onboarding",
              purpose:
                "Welcome new users with an engaging hero image, clear value proposition, and easy way to get started or skip ahead.",
              visualDescription: [
                "Root div: relative w-full min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6",
                "Hero image area: use searchUnsplash for 'abstract gradient mobile app onboarding' - display as rounded-3xl with shadow-2xl, max-w-md mx-auto mb-8",
                "App logo: centered above hero, 64px size with drop shadow",
                "Headline: text-3xl font-bold text-center mb-3 text-[var(--foreground)]",
                "Subheadline: text-lg text-center text-[var(--muted-foreground)] mb-6 max-w-sm",
                "Feature bullets: 3 items in flex flex-col gap-3, each with lucide:check-circle icon (text-[var(--primary)]), bold label, short description",
                "Progress dots: flex gap-2 justify-center mb-8, using rounded-full w-2 h-2 for inactive (bg-[var(--muted)]), w-3 h-3 for active (bg-[var(--primary)] shadow-lg)",
                "Primary button: 'Get Started' - rounded-full px-8 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xl text-lg",
                "Secondary link: 'Skip' text button below - text-sm text-[var(--muted-foreground)] underline-offset-4 hover:underline",
                "Footer links: Terms & Privacy in text-xs text-[var(--muted-foreground)] at bottom",
                "NO bottom navigation bar on this screen",
              ].join(" "),
            };

        const homePlan = hasHome
          ? screens.find((s) => /home|dashboard|main/i.test(`${s.id} ${s.name}`))!
          : {
              id: "home-dashboard",
              name: "Home Dashboard",
              purpose:
                "Main landing screen showing personalized overview with key metrics, recent activity, quick actions, and navigation to other sections.",
              visualDescription: [
                "Root div: relative w-full min-h-screen bg-[var(--background)]",
                "Inner scroll container: w-full pb-24 (space for bottom nav) [&::-webkit-scrollbar]:hidden overflow-y-auto",
                "Sticky header: fixed top-0 w-full backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)] px-6 py-4 z-10",
                "Header content: flex justify-between items-center - left side has user avatar (https://i.pravatar.cc/150?u=jane) rounded-full w-12 h-12 ring-2 ring-[var(--ring)] + greeting 'Good morning, Jane' text-lg font-semibold, right side has bell icon with red dot notification badge",
                "Main content padding: px-6 pt-6 space-y-6",
                "Metric cards: grid grid-cols-2 gap-4, each card is rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 shadow-lg",
                "Card examples: 'Balance $12,430' with trend +2.3% (lucide:trending-up text-green-500), 'Steps 8,432/10k' with circular progress ring, 'Sleep 7h 20m' with moon icon, 'Calories 420 kcal' with fire icon",
                "Chart section: rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 mb-4 - contains SVG line chart (h-48) with gradient fill under line, smooth bezier curves, axis labels, data point dots",
                "Quick actions: flex gap-3 overflow-x-auto, each action is rounded-full bg-[var(--accent)] p-4 flex flex-col items-center gap-2 min-w-[80px] with lucide icon and label",
                "Recent activity: space-y-3, each item is flex items-center gap-4 rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 with icon, title, subtitle, timestamp",
                "Bottom navigation: fixed bottom-0 w-full backdrop-blur-xl bg-[var(--background)]/90 border-t border-[var(--border)] px-6 py-3 z-20",
                "Bottom nav items: flex justify-around items-center, 5 buttons each flex flex-col items-center gap-1 with lucide icon (24px) and label (text-xs)",
                "Bottom nav icons: lucide:home (ACTIVE - has ring-2 ring-[var(--ring)] rounded-full p-2 bg-[var(--accent)] text-[var(--primary)]), lucide:bar-chart-2, lucide:zap, lucide:user, lucide:menu (all inactive in text-[var(--muted-foreground)])",
              ].join(" "),
            };

        // Filter out any duplicates of the mandatory screens from the rest
        const rest = screens.filter(
          (s) =>
            !/onboarding|welcome|splash|intro|getting-started/i.test(`${s.id} ${s.name}`) &&
            !/home|dashboard|main/i.test(`${s.id} ${s.name}`)
        );

        const extraOnboardingPlans: typeof screens = [];
        if (desiredOnboarding > 1) {
          extraOnboardingPlans.push({
            id: "onboarding-features",
            name: "Onboarding Features",
            purpose:
              "Highlight 3-4 key features with icons and descriptions to show users what they can do with the app.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)] flex flex-col p-6",
              "Header: flex justify-between items-center mb-8 - left has back button (lucide:arrow-left), right has 'Skip' text button in text-[var(--muted-foreground)]",
              "Title: text-2xl font-bold mb-2 text-center",
              "Subtitle: text-base text-[var(--muted-foreground)] text-center mb-8",
              "Feature cards: space-y-4 mb-auto - each is rounded-3xl bg-[var(--card)] border-2 border-[var(--border)] p-6 flex gap-4 items-start",
              "Card structure: lucide icon (48px) in bg-[var(--accent)] rounded-2xl p-3 + text column with font-bold title and text-sm description",
              "Example features: Analytics (lucide:bar-chart-3), Notifications (lucide:bell), Collaboration (lucide:users), Security (lucide:shield-check)",
              "Progress indicator: flex gap-2 justify-center mb-6 - 4 dots, second one is active (larger, glowing)",
              "Next button: w-full rounded-full px-8 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xl",
              "NO bottom navigation on this screen",
            ].join(" "),
          });
        }
        if (desiredOnboarding > 2) {
          extraOnboardingPlans.push({
            id: "onboarding-permissions",
            name: "Onboarding Permissions",
            purpose:
              "Ask for optional permissions like notifications, location, camera with clear explanations of why they're helpful.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)] flex flex-col p-6",
              "Header area: text-2xl font-bold mb-2 'Personalize Experience' + subtitle explaining permissions are optional",
              "Permission cards: space-y-3 - each card is rounded-xl bg-[var(--card)] border border-[var(--border)] p-5 flex items-start gap-4",
              "Card layout: lucide icon (32px) in colored circle bg + text column (title + benefit description) + toggle button on right",
              "Permissions list: Notifications (lucide:bell, yellow bg), Location (lucide:map-pin, blue bg), Camera (lucide:camera, purple bg), Health Data (lucide:heart, red bg)",
              "Toggle style: rounded-full border-2 w-12 h-7 with sliding circle inside, active state has bg-[var(--primary)]",
              "Privacy note: flex items-center gap-2 bg-[var(--muted)] rounded-lg p-4 mt-6 with lucide:shield-check and reassuring text about data protection",
              "Progress dots: centered, 3rd dot active",
              "Continue button: w-full rounded-full bg-[var(--primary)] at bottom",
              "Skip link: text-center text-sm below button",
              "NO bottom navigation on this screen",
            ].join(" "),
          });
        }

        const paywallPlan = includePaywall
          ? {
              id: "onboarding-paywall",
              name: "Onboarding Paywall",
              purpose:
                "Show pricing tiers with features, highlight the best value plan, offer free trial, and provide option to continue free.",
              visualDescription: [
                "Root: relative w-full min-h-screen bg-[var(--background)] overflow-y-auto [&::-webkit-scrollbar]:hidden",
                "Hero section: text-center pt-8 pb-6 px-6 - lucide:zap icon (48px) in gradient circle, 'Unlock Premium' headline (text-3xl font-bold), subtitle about benefits",
                "Pricing cards container: px-6 space-y-4 mb-6",
                "Card 1 - Free: rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-6 - 'Free' title, '$0' price (text-2xl font-bold), 'Forever' billing, feature list with 3 lucide:check items and 2 lucide:x grayed items",
                "Card 2 - Pro (HIGHLIGHTED): rounded-2xl border-2 border-[var(--primary)] bg-gradient-to-br from-[var(--accent)] shadow-2xl p-6 relative - 'Most Popular' badge (absolute -top-3 right-4 bg-[var(--primary)] text-white px-3 py-1 rounded-full text-xs), '$9.99' price (text-3xl font-bold), '/month' billing, full feature list all with lucide:check",
                "Card 3 - Premium: similar to Free style - '$19.99/month', extra features",
                "Features comparison: each tier shows 5-6 features like 'Unlimited access', 'Advanced analytics', 'Priority support', 'Custom themes', 'API access'",
                "Trust indicators: flex justify-center gap-6 px-6 mb-6 - star ratings '4.9★ 10k+ reviews', '30-day guarantee' with badge icons",
                "Primary CTA: w-full max-w-md mx-auto rounded-full px-10 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-bold text-lg shadow-2xl mb-3 'Start 7-Day Free Trial'",
                "Secondary option: text-center text-[var(--muted-foreground)] underline 'Continue with Free Plan'",
                "Fine print: text-xs text-center text-[var(--muted-foreground)] px-6 pb-6 about subscription terms",
                "NO bottom navigation on this screen",
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
            purpose:
              "Show comprehensive analytics with charts, KPIs, trends, and data insights for tracking performance metrics.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)]",
              "Scrollable content: pb-24 [&::-webkit-scrollbar]:hidden overflow-y-auto px-6",
              "Header: sticky top-0 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)] py-4 flex justify-between items-center z-10 - 'Analytics' title (text-2xl font-bold) + date range picker button + filter icon",
              "Top KPI row: grid grid-cols-2 gap-3 mb-6 - 4 mini cards with icon, label, large number, trend percentage with arrow",
              "Main chart card: rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 mb-6 - title 'Revenue Trend' + SVG area chart (h-64) with gradient fill, smooth curve, grid lines, axis labels, hoverable data points",
              "Chart colors: use stroke-[var(--primary)] for line, fill gradient from var(--primary) to transparent",
              "Secondary charts row: grid grid-cols-2 gap-4 mb-6 - donut chart showing category breakdown + horizontal bar chart for comparisons",
              "Data table: rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 - headers in text-xs font-semibold text-[var(--muted-foreground)] + rows with ranking number, label, value, progress bar",
              "Bottom navigation: lucide:bar-chart-2 is ACTIVE (has ring, glow, accent bg)",
            ].join(" "),
          },
          {
            id: "transactions-list",
            name: "Transactions",
            purpose:
              "Display transaction history with search, category filters, and detailed information for each transaction.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)]",
              "Header: sticky top-0 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)] px-6 py-4 z-10",
              "Search bar: rounded-full bg-[var(--muted)] px-4 py-3 flex items-center gap-2 mb-3 - lucide:search icon + input placeholder 'Search transactions...' + clear button",
              "Filter chips: flex gap-2 overflow-x-auto pb-2 - chips are rounded-full px-4 py-2 text-sm, active chip has bg-[var(--primary)] text-white, inactive has border and text-[var(--muted-foreground)]",
              "Chip options: 'All', 'Income', 'Expenses', 'Pending', 'Completed'",
              "Transaction list: px-6 pb-24 space-y-4",
              "Date section headers: sticky py-2 text-xs font-semibold text-[var(--muted-foreground)] bg-[var(--background)] 'Today', 'Yesterday', 'Last Week'",
              "Transaction item: rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition",
              "Item structure: merchant icon/logo circle (48px bg with brand color or lucide fallback) + text column (merchant name font-semibold, category badge text-xs, timestamp text-sm text-muted) + amount on right (color coded: text-green-600 for income +$50.00, text-red-600 for expense -$30.50)",
              "Category badges: rounded-full px-2 py-0.5 bg-[var(--accent)] text-xs",
              "Empty state: centered lucide:inbox (64px) text-[var(--muted-foreground)] with 'No transactions found' message if filtered list is empty",
              "Bottom navigation: lucide:list or lucide:receipt ACTIVE",
            ].join(" "),
          },
          {
            id: "messages-center",
            name: "Messages",
            purpose:
              "Central inbox for all conversations, support messages, and notifications with search and filtering.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)]",
              "Header: fixed top-0 w-full backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)] px-6 py-4 z-10 flex justify-between items-center",
              "Header content: 'Messages' title (text-xl font-bold) + compose button (lucide:edit-3 or lucide:plus in rounded-full bg-[var(--primary)] text-white p-2)",
              "Tab bar: flex border-b border-[var(--border)] px-6 - tabs for 'All', 'Unread', 'Archived' with active tab having border-b-2 border-[var(--primary)] and font-semibold",
              "Message list: px-6 pt-4 pb-24 space-y-2",
              "Thread item: rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 flex gap-3 items-start hover:bg-[var(--accent)]/50 transition",
              "Item layout: avatar (rounded-full 44px https://i.pravatar.cc/150?u=user1) + text column (sender name font-semibold, message preview text-sm text-[var(--muted-foreground)] truncate max-w-[200px]) + right column (timestamp text-xs, unread badge)",
              "Unread styling: unread threads have slightly bolder text, subtle bg tint, blue dot or count bubble",
              "Unread badge: rounded-full bg-[var(--primary)] text-white text-xs w-6 h-6 flex items-center justify-center",
              "Example threads: 'Support Team', 'John Doe', 'Team Update', 'Alice Chen'",
              "Bottom navigation: lucide:message-circle or lucide:mail ACTIVE",
            ].join(" "),
          },
          {
            id: "profile",
            name: "Profile",
            purpose:
              "User profile displaying personal information, stats, achievements, connected accounts, and settings access.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)]",
              "Scrollable: pb-24 [&::-webkit-scrollbar]:hidden overflow-y-auto",
              "Profile header: bg-gradient-to-b from-[var(--accent)] pt-12 pb-6 px-6 relative",
              "Settings button: absolute top-4 right-4 lucide:settings icon in rounded-full p-2 border border-[var(--border)] backdrop-blur",
              "Avatar: mx-auto rounded-full w-24 h-24 ring-4 ring-[var(--background)] shadow-xl (https://i.pravatar.cc/150?u=currentuser)",
              "Name: text-2xl font-bold text-center mt-3",
              "Handle/email: text-base text-[var(--muted-foreground)] text-center mb-4",
              "Stats row: grid grid-cols-3 gap-4 px-6 -mt-6 mb-6",
              "Stat card: rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 text-center shadow-lg - number (text-2xl font-bold), label (text-xs text-[var(--muted-foreground)])",
              "Stats: 'Followers 1.2K', 'Following 843', 'Points 5,420'",
              "Content sections: px-6 space-y-4",
              "Section card: rounded-xl bg-[var(--card)] border border-[var(--border)] p-5",
              "Personal info section: title (font-semibold mb-3) + rows with lucide icons (mail, phone, map-pin) + labels and values",
              "Achievements section: title + grid of badge icons with progress bars showing completion percentages",
              "Connected accounts: title + list of social/payment logos with status indicators and chevron-right for navigation",
              "Privacy toggles: title + list items with shield icons, toggle switches",
              "Action buttons at bottom: 'Sign Out' (rounded-xl border-2 border-[var(--destructive)] text-[var(--destructive)] py-3) + small 'Delete Account' text link",
              "Bottom navigation: lucide:user ACTIVE",
            ].join(" "),
          },
          {
            id: "settings",
            name: "Settings",
            purpose:
              "Comprehensive settings panel for app configuration including theme, notifications, privacy, and account preferences.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)]",
              "Header: sticky top-0 bg-[var(--background)] border-b border-[var(--border)] px-6 py-4 flex items-center gap-3 - back button (lucide:arrow-left) + 'Settings' title (text-xl font-bold)",
              "Content: px-6 py-4 pb-24 space-y-6",
              "Setting groups: each has section header (text-sm font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-wide)",
              "Appearance section: rounded-xl bg-[var(--card)] border border-[var(--border)] divide-y divide-[var(--border)]",
              "Theme selector: p-4 flex justify-between items-center - 'Theme' label with lucide:palette icon + segmented control (Light/Dark/Auto) in rounded-full bg-[var(--muted)] with active state in bg-[var(--primary)]",
              "Accent color: p-4 - label + row of color circles (rounded-full w-10 h-10) with ring on selected",
              "Notifications section: similar card with toggle rows - 'Push Notifications', 'Email Updates', 'SMS Alerts' each with lucide:bell icon, description, toggle switch",
              "Toggle switch: w-11 h-6 rounded-full border-2 with sliding circle, ON state has bg-[var(--primary)]",
              "Privacy section: list items with chevron-right indicating deeper navigation - 'Privacy Policy', 'Data Usage', 'Manage Permissions'",
              "About section: app version, help center link, social media icons, Terms & Privacy links",
              "List item style: p-4 flex items-center gap-3 - lucide icon (20px) + text column (title + optional subtitle text-sm text-muted) + chevron-right",
              "Bottom navigation: lucide:settings or lucide:sliders ACTIVE",
            ].join(" "),
          },
          {
            id: "notifications",
            name: "Notifications",
            purpose:
              "Notification center showing all alerts, updates, and important messages in chronological order with status indicators.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)]",
              "Header: sticky top-0 backdrop-blur-xl bg-[var(--background)]/90 border-b border-[var(--border)] px-6 py-4 flex justify-between items-center z-10",
              "Header content: 'Notifications' title (text-xl font-bold) + 'Mark all read' text button (text-sm text-[var(--primary)])",
              "Content: px-6 py-4 pb-24",
              "Date sections: 'Today', 'Earlier', 'This Week' - text-xs font-semibold text-[var(--muted-foreground)] mb-3",
              "Notification items: space-y-3",
              "Notification card: rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 flex gap-3 items-start relative",
              "Unread state: add border-l-4 border-[var(--primary)] and subtle bg-[var(--accent)]/20 tint",
              "Card layout: lucide icon circle (bell/check-circle/alert-triangle/info 32px in colored bg) + text column (title font-semibold, message text-sm text-[var(--muted-foreground)], timestamp text-xs) + status chip on top-right",
              "Status chips: rounded-full px-2 py-1 text-xs - 'New' (bg-[var(--primary)] text-white), 'Read' (bg-[var(--muted)]), 'Action Required' (bg-amber-500 text-white)",
              "Icon colors: Notifications (yellow bg), Success (green bg), Warnings (orange bg), Info (blue bg)",
              "Swipe actions: reveal background with archive/delete options on swipe",
              "Empty state: centered lucide:bell-off (64px) + 'You're all caught up!' message with checkmark",
              "Bottom navigation: lucide:bell or lucide:zap ACTIVE",
            ].join(" "),
          },
          {
            id: "explore",
            name: "Explore",
            purpose:
              "Content discovery page with curated recommendations, trending items, categories, and browsable grid of content.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)]",
              "Header: px-6 py-4 flex justify-between items-center border-b border-[var(--border)]",
              "Header content: 'Explore' title (text-2xl font-bold) + search icon button (lucide:search in rounded-full p-2 hover:bg-[var(--accent)])",
              "Category tabs: horizontal scroll px-6 py-3 flex gap-2 - tabs are rounded-full px-4 py-2 text-sm font-medium, active has bg-[var(--primary)] text-white, inactive has border",
              "Tab options: 'For You', 'Trending', 'Popular', 'New', 'Bookmarked'",
              "Content grid: px-6 pb-24 grid grid-cols-2 gap-4",
              "Content card: rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-md hover:shadow-xl transition",
              "Card structure: image/thumbnail (aspect-[4/3] object-cover with gradient overlay at bottom) + overlay text (absolute bottom-0 p-3 title text-white font-semibold drop-shadow) + bookmark icon (absolute top-2 right-2 lucide:bookmark in rounded-full bg-black/30 backdrop-blur p-1.5)",
              "Card metadata: below image p-3 - secondary info (views count with lucide:eye, likes with lucide:heart, date) in text-xs text-[var(--muted-foreground)] flex gap-3",
              "Loading state: skeleton cards with pulse animation",
              "Infinite scroll indicator: spinner or 'Loading more...' at bottom",
              "Bottom navigation: lucide:compass or lucide:globe ACTIVE",
            ].join(" "),
          },
          {
            id: "search",
            name: "Search",
            purpose:
              "Universal search with filters, recent searches, trending queries, and organized results across different content types.",
            visualDescription: [
              "Root: relative w-full min-h-screen bg-[var(--background)]",
              "Search header: sticky top-0 bg-[var(--background)] border-b border-[var(--border)] px-6 py-4 z-10",
              "Search input: rounded-full bg-[var(--muted)] px-4 py-3 flex items-center gap-3 shadow-inner - lucide:search icon + input (text-base) + clear button (lucide:x) + voice button (lucide:mic)",
              "Filter chips: mt-3 flex gap-2 overflow-x-auto pb-2 - 'All', 'People', 'Content', 'Tags', 'Recent' in rounded-full style",
              "Content sections: px-6 py-4 pb-24 space-y-6",
              "Recent searches section: 'Recent' header (text-sm font-semibold) + list of past queries",
              "Recent item: flex justify-between items-center py-2 - lucide:clock icon + query text + remove button (lucide:x text-[var(--muted-foreground)])",
              "Trending section: 'Trending' header + list with trending indicators",
              "Trending item: flex items-center gap-3 py-2 - lucide:trending-up icon + query + popularity badge (small pill showing search count)",
              "Results section (when searching): mixed content types",
              "Result card: rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 flex gap-3 mb-3",
              "Result types: User profile (avatar + name + bio), Content (thumbnail + title + description), Tag (# icon + name + post count)",
              "Match highlighting: searched terms in results have bg-yellow-200/30 highlight",
              "Loading skeleton: animated pulse placeholders while searching",
              "Empty state: lucide:search-x (64px) + 'No results found' + suggestions to try different terms",
              "Bottom navigation: lucide:search ACTIVE",
            ].join(" "),
          },
        ];

        while (rest.length < 20 && rest.length < desiredTotal * 2) {
          const next = fillerCatalog[rest.length % fillerCatalog.length];
          rest.push(next as any);
        }

        // desiredTotal counts non-onboarding screens including Home
        const allowedRestCount = Math.max(0, desiredTotal - 1);
        const finalScreens = [...onboardingSequence, homePlan, ...rest.slice(0, allowedRestCount)];
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
    const generatedFrames: typeof frames = isExistingGeneration ? [...frames] : [];

    for (let i = 0; i < analysis.screens.length; i++) {
      const screenPlan = analysis.screens[i];
      const selectedTheme = THEME_LIST.find((t) => t.id === analysis.themeToUse);

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
          model: process.env.OPENROUTER_API_KEY
            ? openrouter.chat("google/gemini-2.5-flash")
            : ("google/gemini-3-pro-preview" as any),
          system: GENERATION_SYSTEM_PROMPT,
          tools: {
            searchUnsplash: unsplashTool,
          },
          stopWhen: stepCountIs(5),
          prompt: `
YOU ARE GENERATING SCREEN ${i + 1} OF ${analysis.screens.length}

SCREEN INFORMATION:
- ID: ${screenPlan.id}
- Name: ${screenPlan.name}
- Purpose: ${screenPlan.purpose}

DETAILED VISUAL SPECIFICATION:
${screenPlan.visualDescription}

${
  previousFramesContext
    ? `
PREVIOUS SCREENS HTML CODE (CRITICAL - STUDY THIS CAREFULLY):
${previousFramesContext}

🎯 YOUR PRIMARY TASK: Make this new screen match the existing ones EXACTLY.

STEP 1 - ANALYZE EXISTING CODE:
Look at the HTML above and extract:
- The EXACT bottom navigation div structure (copy all classes verbatim)
- Common card patterns (what rounded-* values? what padding? what shadows?)
- Header structure (is it sticky? what blur effects? what height?)
- Spacing patterns (gap-4 or gap-6? p-4 or p-6?)
- Icon usage (what size? what positioning?)
- Color variable usage (which --variables are used where?)

STEP 2 - COPY THE PATTERNS:
- If bottom nav exists in previous screens, copy its entire structure including all classes
- Use the same card styling (same rounded-*, same padding, same shadow)
- Match the header style exactly
- Use the same spacing scale throughout
- Follow the same icon patterns and sizes
- Use colors the same way

STEP 3 - MAINTAIN CONSISTENCY:
- Visual density must match (don't make this screen more or less crowded)
- Typography hierarchy must match (same text-* sizes for similar elements)
- Interactive states must match (same hover/active effects)
- Layout rhythm must match (same spacing between sections)
`
    : `
NO PREVIOUS SCREENS - YOU ARE ESTABLISHING THE DESIGN FOUNDATION.

Create a polished, modern mobile interface that will serve as the template for future screens.
`
}

THEME CSS VARIABLES (available for use, already defined in parent scope):
${fullThemeCSS}

═══════════════════════════════════════════════════════════════════
GENERATION RULES - FOLLOW EXACTLY
═══════════════════════════════════════════════════════════════════

📱 OUTPUT FORMAT:
- Generate ONLY raw HTML markup
- Start directly with <div> tag
- NO markdown, NO code fences, NO comments
- NO <html>, <body>, or <head> tags
- Just the HTML for this screen component

🎨 STYLING RULES:
- Use Tailwind utility classes for ALL styling (layout, spacing, typography, effects)
- Use CSS variables ONLY for colors: bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], bg-[var(--primary)], etc.
- Available color variables: --background, --foreground, --card, --card-foreground, --primary, --primary-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground, --accent, --accent-foreground, --destructive, --destructive-foreground, --border, --ring
- Never hardcode colors like bg-white, text-black unless absolutely necessary
- Never define custom CSS - use only Tailwind classes

📐 LAYOUT STRUCTURE:
1. Root div options:
   - Standard content: <div class="relative w-full min-h-screen bg-[var(--background)]">
   - Full screen overlay/modal: <div class="relative w-full h-screen bg-[var(--background)]">
   
2. Scrollable content:
   - NEVER put overflow classes on root div
   - Create inner container for scrolling: <div class="w-full pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
   - Always add pb-24 to accommodate bottom navigation
   
3. Height management:
   - Root: use min-h-screen (lets content grow)
   - Avoid h-screen on inner content (it breaks iframe scrolling)
   - Let content height grow naturally with elements

🧩 COMPONENT PATTERNS:
- Icons: use lucide:icon-name prefix (lucide:home, lucide:user, lucide:settings, etc.)
- Cards: rounded-xl to rounded-3xl with bg-[var(--card)] border border-[var(--border)] p-4 to p-6 shadow-lg
- Buttons: 
  * Primary: rounded-full px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xl
  * Secondary: rounded-full px-6 py-3 border-2 border-[var(--border)] text-[var(--foreground)]
  * Ghost: rounded-full px-6 py-3 hover:bg-[var(--accent)] text-[var(--foreground)]
- Avatars: rounded-full with ring-2 ring-[var(--ring)]
- Inputs: rounded-full or rounded-xl bg-[var(--muted)] border border-[var(--border)] px-4 py-3 focus:ring-2 focus:ring-[var(--ring)]
- Badges: rounded-full px-3 py-1 text-xs bg-[var(--accent)] text-[var(--accent-foreground)]

🎭 GLASSMORPHISM EFFECTS:
- Headers: backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)]
- Cards: backdrop-blur-md bg-[var(--card)]/80 border border-[var(--border)]/50
- Bottom nav: backdrop-blur-xl bg-[var(--background)]/90 border-t border-[var(--border)]

🔍 BOTTOM NAVIGATION (if screen needs it):
Structure:
<div class="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-[var(--background)]/90 border-t border-[var(--border)] px-6 py-3 z-20">
  <div class="flex justify-around items-center max-w-md mx-auto">
    <button class="flex flex-col items-center gap-1 group">
      <div class="p-2 rounded-full group-hover:bg-[var(--accent)] transition">
        <i class="lucide:home w-6 h-6 text-[var(--muted-foreground)] group-hover:text-[var(--primary)]"></i>
      </div>
      <span class="text-xs text-[var(--muted-foreground)]">Home</span>
    </button>
    <!-- repeat for other nav items -->
  </div>
</div>

Active state (one icon should have this if it's the current screen):
<button class="flex flex-col items-center gap-1">
  <div class="p-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--ring)]">
    <i class="lucide:home w-6 h-6 text-[var(--primary)]"></i>
  </div>
  <span class="text-xs font-semibold text-[var(--primary)]">Home</span>
</button>

📊 CHARTS & DATA VISUALIZATION:
- Use inline SVG for charts
- Keep it simple: line charts, area charts, donut charts, bar charts
- Use CSS variables for colors: stroke="var(--primary)" fill="var(--accent)"
- Include grid lines, axis labels, data points
- Add hover states with opacity changes

✨ POLISH & DETAILS:
- Shadows: shadow-sm (subtle), shadow-md (moderate), shadow-lg (pronounced), shadow-xl (floating), shadow-2xl (dramatic)
- Transitions: transition-all duration-200 ease-in-out on interactive elements
- Hover states: hover:shadow-lg, hover:bg-[var(--accent)]/50, hover:scale-105
- Active states: active:scale-95 for buttons
- Loading skeletons: rounded blocks with animate-pulse bg-[var(--muted)]
- Empty states: centered icon (64px) + message with soft colors

🎯 SPECIFIC ELEMENT SIZING:
- Touch targets: minimum h-11 (44px) for buttons and interactive elements
- Text: text-base (16px) minimum for body, text-sm (14px) for secondary, text-xs (12px) for captions
- Icons: w-6 h-6 (24px) for nav, w-5 h-5 (20px) for inline, w-12 h-12 (48px) for hero
- Avatars: w-10 h-10 (40px) small, w-12 h-12 (48px) medium, w-16 h-16 (64px) large, w-24 h-24 (96px) profile
- Spacing: gap-4 p-4 for tight, gap-6 p-6 for comfortable, gap-8 p-8 for spacious

⚠️ CRITICAL IFRAME COMPATIBILITY:
- All content must be visible in iframe
- Height must grow with content (never clip)
- Scrolling happens in inner container, not root
- No fixed positioning except for headers/bottom nav
- Test that scrollHeight reflects full content height

═══════════════════════════════════════════════════════════════════
NOW GENERATE THE COMPLETE HTML FOR THIS SCREEN
═══════════════════════════════════════════════════════════════════

Remember:
✅ Raw HTML only, starting with <div>
✅ Tailwind classes for everything except color variables
✅ Match existing screens exactly if they exist
✅ Modern, polished, professional design
✅ Mobile-first responsive layout
✅ Iframe-friendly structure
❌ No markdown, no code fences, no comments
❌ No hardcoded colors (use variables)
❌ No custom CSS or style tags
❌ No overflow on root div

Generate now:
          `.trim(),
        });

        let finalHtml = result.text ?? "";
        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
        finalHtml = match ? match[0] : finalHtml;
        finalHtml = finalHtml.replace(/\x60{3}/g, "");

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
