import { NextResponse } from "next/server";
import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";
import { moderateText } from "@/lib/moderation";

function extractSvg(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ""))
    .replace(/<\/?xml[^>]*>/gi, "");
  const start = cleaned.indexOf("<svg");
  const end = cleaned.lastIndexOf("</svg>");
  if (start === -1 || end === -1) return null;
  let svg = cleaned.slice(start, end + 6);
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  svg = svg.replace(/\son\w+="[^"]*"/gi, "");
  svg = svg.replace(/\s(href|xlink:href)="javascript:[^"]*"/gi, "");
  return svg.trim();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const prompt = url.searchParams.get("prompt")?.trim() ?? "";
    const style = (url.searchParams.get("style") || "outline").trim();
    const sizeParam = url.searchParams.get("size");
    const size = sizeParam ? Math.max(16, Math.min(256, Number(sizeParam))) : 24;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const moderation = await moderateText(prompt);
    if (!moderation.allowed) {
      return NextResponse.json({ error: "Prompt violates content policy" }, { status: 400 });
    }

    const { text } = await generateText({
      model: openrouter.chat("google/gemini-2.5-flash-lite"),
      system:
        "You output only a single valid SVG element suitable as a UI icon. No explanations. No markdown.",
      prompt: `Design a minimal ${style} UI icon SVG for: "${prompt}".
Constraints:
- viewBox="0 0 24 24"
- width="${size}" height="${size}"
- stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
- fill="none" (unless ${style} requires small filled shapes, keep minimal)
- Use simple paths/shapes; avoid raster, filters, external references.`,
      temperature: 0.3,
      maxOutputTokens: 400,
    });

    const svg = extractSvg(text || "");
    if (!svg) {
      return NextResponse.json({ error: "Failed to generate SVG" }, { status: 500 });
    }

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.log("Icon generation error", error);
    return NextResponse.json({ error: "Failed to generate icon" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const style =
      typeof body?.style === "string" && body.style.trim().length > 0
        ? body.style.trim()
        : "outline";
    const sizeVal = typeof body?.size === "number" ? Math.max(16, Math.min(256, body.size)) : 24;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const moderation = await moderateText(prompt);
    if (!moderation.allowed) {
      return NextResponse.json({ error: "Prompt violates content policy" }, { status: 400 });
    }

    const { text } = await generateText({
      model: openrouter.chat("google/gemini-2.5-flash-lite"),
      system:
        "You output only a single valid SVG element suitable as a UI icon. No explanations. No markdown.",
      prompt: `Design a minimal ${style} UI icon SVG for: "${prompt}".
Constraints:
- viewBox="0 0 24 24"
- width="${sizeVal}" height="${sizeVal}"
- stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
- fill="none" (unless ${style} requires small filled shapes, keep minimal)
- Use simple paths/shapes; avoid raster, filters, external references.`,
      temperature: 0.3,
      maxOutputTokens: 400,
    });

    const svg = extractSvg(text || "");
    if (!svg) {
      return NextResponse.json({ error: "Failed to generate SVG" }, { status: 500 });
    }

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.log("Icon generation error", error);
    return NextResponse.json({ error: "Failed to generate icon" }, { status: 500 });
  }
}
