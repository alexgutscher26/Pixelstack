import { NextResponse } from "next/server";
import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";
import { moderateText } from "@/lib/moderation";

type ParsedBody = {
  prompt: string;
  totalScreens?: number;
  onboardingScreens?: number;
  includePaywall?: boolean;
  negatives: string[];
  stylePreset?: string;
  platform?: "mobile" | "website";
};

function parseNegatives(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((s: unknown) => String(s).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[,\n]/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseBody(body: unknown): ParsedBody {
  const b = body as Record<string, unknown>;
  const prompt = typeof b?.prompt === "string" ? b.prompt.trim() : "";
  const totalScreens = typeof b?.totalScreens === "number" ? (b.totalScreens as number) : undefined;
  const onboardingScreens =
    typeof b?.onboardingScreens === "number" ? (b.onboardingScreens as number) : undefined;
  const includePaywall =
    typeof b?.includePaywall === "boolean" ? (b.includePaywall as boolean) : undefined;
  const stylePreset =
    typeof b?.stylePreset === "string" && (b.stylePreset as string).trim().length > 0
      ? (b.stylePreset as string).trim()
      : undefined;
  const negatives = parseNegatives(b?.negativePrompts);
  const platform =
    b?.platform === "website" ? "website" : b?.platform === "mobile" ? "mobile" : undefined;
  return {
    prompt,
    totalScreens,
    onboardingScreens,
    includePaywall,
    negatives,
    stylePreset,
    platform,
  };
}

function buildConstraintsText({
  totalScreens,
  onboardingScreens,
  includePaywall,
  negatives,
  stylePreset,
}: ParsedBody): string {
  const constraints: string[] = [];
  if (typeof totalScreens === "number") {
    constraints.push(`Non-onboarding screens: ${totalScreens}`);
  }
  if (typeof onboardingScreens === "number") {
    constraints.push(`Onboarding screens: ${onboardingScreens}`);
  }
  if (typeof includePaywall === "boolean") {
    constraints.push(`Include paywall: ${includePaywall ? "Yes" : "No"}`);
  }
  if (negatives.length > 0) {
    constraints.push(`Negative prompts (strictly avoid): ${negatives.join("; ")}`);
  }
  if (stylePreset) {
    constraints.push(`Design style preset: ${stylePreset}`);
  }
  if (constraints.length === 0) return "";
  return `\n\nSCREEN GENERATION CONSTRAINTS\n- ${constraints.join("\n- ")}\n`;
}

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = parseBody(raw);
    const { prompt, platform } = parsed;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const moderation = await moderateText(prompt);
    if (!moderation.allowed) {
      return NextResponse.json({ error: "Prompt violates content policy" }, { status: 400 });
    }

    const constraintsText = buildConstraintsText(parsed);

    const isWebsite = platform === "website";
    const systemText = isWebsite
      ? `You are a senior web product designer.
Rewrite the user's brief into a production-ready website design specification.
Use plain text only (no Markdown). 180–300 words.

Output as labeled sections in this order:
Overview
Flows
Pages
Visual
Layout
Components
Icons
Data
Navigation
Constraints (only if constraints are provided)

Include:
- Site overview and target user
- Core user flows
- Page list with names and purposes
- Visual direction and theme guidance (colors, tone, typography hints)
- Layout and components per page (headers, hero, sections, cards, tables, forms)
- Icons to use (Lucide icon names where relevant)
- Realistic data examples with units, ranges, prices, durations
- Primary navigation, secondary navigation, and footer content
- Explicit constraints applied verbatim if provided

Requirements:
- Avoid placeholders, generic text, or lorem ipsum
- Prefer web-first patterns and concise language
- Keep content self-contained and implementable`
      : `You are a senior mobile product designer.
Rewrite the user's brief into a production-ready mobile UI design specification.
Use plain text only (no Markdown). 180–300 words.

Output as labeled sections in this order:
Overview
Flows
Screens
Visual
Layout
Icons
Data
Navigation
Constraints (only if constraints are provided)

Include:
- App overview and target user
- Core user flows
- Screen list with names and purposes
- Visual direction and theme guidance (colors, tone, typography hints)
- Layout and components per screen (headers, cards, charts, lists, inputs, nav)
- Icons to use (Lucide icon names where relevant)
- Realistic data examples with units, ranges, prices, durations
- Bottom navigation mapping with active tab per screen
- Explicit constraints applied verbatim if provided

Requirements:
- Avoid placeholders, generic text, or lorem ipsum
- Prefer mobile-first patterns and concise language
- Keep content self-contained and implementable`;

    const { text } = await generateText({
      model: openrouter.chat("google/gemini-2.5-flash-lite"),
      system: systemText,
      prompt: `${prompt}${constraintsText}`,
      temperature: 0.7,
      maxOutputTokens: 600,
    });

    const enhancedPrompt = text?.trim();
    if (!enhancedPrompt) {
      return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 });
    }
    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.log("Enhance prompt error", error);
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 });
  }
}
