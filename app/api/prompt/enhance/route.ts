import { NextResponse } from "next/server";
import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const totalScreens = typeof body?.totalScreens === "number" ? body.totalScreens : undefined;
    const onboardingScreens =
      typeof body?.onboardingScreens === "number" ? body.onboardingScreens : undefined;
    const includePaywall =
      typeof body?.includePaywall === "boolean" ? body.includePaywall : undefined;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

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
    const constraintsText =
      constraints.length > 0
        ? `\n\nSCREEN GENERATION CONSTRAINTS\n- ${constraints.join("\n- ")}\n`
        : "";

    const { text } = await generateText({
      model: openrouter.chat("google/gemini-2.5-flash-lite"),
      system: `You are a senior mobile product designer.
Rewrite the user's brief into a concise, structured design specification that is ready for generating mobile UI screens.
Focus on clarity, visual direction, component details, and realistic data.
Return plain text only. No markdown headers or lists with asterisks. 180–300 words.

Must include:
- App overview and target user
- Core user flows
- Screen list with names and purposes
- Visual direction and theme guidance (colors, tone, typography hints)
- Layout and components per screen (headers, cards, charts, lists, nav)
- Icons to use (lucide icon names where relevant)
- Realistic data examples (numbers, prices, durations)
- Bottom navigation mapping if appropriate (active tab per screen)
- Explicit constraints section if provided`,
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

