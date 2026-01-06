import { NextResponse } from "next/server";
import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";
import { moderateText } from "@/lib/moderation";
import { JSDOM } from "jsdom";

function defaultIcon(size: number, title: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}"`,
    `  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" role="img" aria-label="${title}">`,
    `  <rect x="3" y="3" width="18" height="18" rx="4"/>`,
    `  <path d="M8 12h8M12 8v8"/>`,
    `</svg>`,
  ].join("");
}

function sanitizeSvg(svg: string): string {
  // Wrap SVG in an HTML document so jsdom can parse it reliably
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${svg}</body></html>`);
  const document = dom.window.document;
  const svgElement = document.querySelector("svg");
  if (!svgElement) {
    return svg.trim();
  }

  // Remove all <script> elements inside the SVG
  const scripts = svgElement.querySelectorAll("script");
  scripts.forEach((script) => {
    script.remove();
  });

  // Remove event handler attributes and javascript: URLs
  const elements = svgElement.querySelectorAll("*");
  elements.forEach((el) => {
    // Copy attributes first to avoid issues while mutating
    const attrs = Array.from(el.attributes);
    attrs.forEach((attr) => {
      const name = attr.name;
      const value = attr.value;
      // Remove inline event handlers like onclick, onload, etc.
      if (/^on/i.test(name)) {
        el.removeAttribute(name);
        return;
      }
      // Remove javascript: URLs in href and xlink:href
      if (/^(href|xlink:href)$/i.test(name) && /^javascript:/i.test(value.trim())) {
        el.removeAttribute(name);
      }
    });
  });

  return svgElement.outerHTML.trim();
}

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

  // Iteratively strip event handler attributes (on*) and javascript: hrefs
  let previous: string;
  do {
    previous = svg;
    svg = svg.replace(/\son\w+\s*=\s*"[^"]*"/gi, "");
    svg = svg.replace(/\s(href|xlink:href)="javascript:[^"]*"/gi, "");
  } while (svg !== previous);

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
      const safe = defaultIcon(size, "icon");
      return new NextResponse(sanitizeSvg(safe), {
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store",
        },
      });
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
    const safe = sanitizeSvg(svg || defaultIcon(size, "icon"));

    return new NextResponse(safe, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.log("Icon generation error", error);
    const safe = sanitizeSvg(defaultIcon(24, "icon"));
    return new NextResponse(safe, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
      status: 200,
    });
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
      const safe = sanitizeSvg(defaultIcon(sizeVal, "icon"));
      return new NextResponse(safe, {
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store",
        },
      });
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
    const safe = sanitizeSvg(svg || defaultIcon(sizeVal, "icon"));

    return new NextResponse(safe, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.log("Icon generation error", error);
    const safe = sanitizeSvg(defaultIcon(24, "icon"));
    return new NextResponse(safe, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
      status: 200,
    });
  }
}
