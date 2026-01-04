import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateProjectName } from "@/app/action/action";
import { inngest } from "@/inngest/client";
import { moderateText } from "@/lib/moderation";

type Preferences = {
  platform?: "mobile" | "website";
  totalScreens?: number;
  onboardingScreens?: number;
  includePaywall?: boolean;
  negativePrompts?: string[];
  stylePreset?: string;
};

type BrandKit = {
  logoUrl?: string;
  primaryColor?: string;
  fontFamily?: string;
};

function parseNegatives(input: unknown): string[] | undefined {
  if (Array.isArray(input)) {
    const arr = input.map((s) => String(s).trim()).filter(Boolean);
    return arr.length > 0 ? arr : undefined;
  }
  if (typeof input === "string" && input.trim().length > 0) {
    const arr = input
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length > 0 ? arr : undefined;
  }
  return undefined;
}

function parsePreferences(body: Record<string, unknown>): Preferences {
  const platform =
    body.platform === "website" || body.platform === "mobile" ? body.platform : "mobile";
  const totalScreens =
    typeof body.totalScreens === "number"
      ? body.totalScreens
      : Number(body.totalScreens) || undefined;
  const onboardingScreens =
    typeof body.onboardingScreens === "number"
      ? body.onboardingScreens
      : Number(body.onboardingScreens) || undefined;
  const includePaywall =
    typeof body.includePaywall === "boolean"
      ? body.includePaywall
      : body.includePaywall !== undefined
        ? Boolean(body.includePaywall)
        : false;
  const stylePreset =
    typeof body.stylePreset === "string" && body.stylePreset.trim().length > 0
      ? body.stylePreset.trim()
      : undefined;
  const negativePrompts = parseNegatives(body.negativePrompts);
  return {
    platform,
    totalScreens,
    onboardingScreens,
    includePaywall,
    negativePrompts,
    stylePreset,
  };
}

function parseBrandKit(body: Record<string, unknown>): BrandKit {
  const logoUrl =
    typeof body.brandLogoUrl === "string" && body.brandLogoUrl.trim().length > 0
      ? body.brandLogoUrl
      : undefined;
  const primaryColor =
    typeof body.brandPrimaryColor === "string" && body.brandPrimaryColor.trim().length > 0
      ? body.brandPrimaryColor
      : undefined;
  const fontFamily =
    typeof body.brandFontFamily === "string" && body.brandFontFamily.trim().length > 0
      ? body.brandFontFamily
      : undefined;
  return { logoUrl, primaryColor, fontFamily };
}

async function getUser() {
  const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
  const session = await getKindeServerSession();
  const user = await session.getUser();
  return user;
}

export async function GET() {
  try {
    const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const body = raw as Record<string, unknown>;
    const prompt = typeof body.prompt === "string" ? body.prompt : undefined;
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prompt) throw new Error("Missing Prompt");

    const moderation = await moderateText(prompt);
    if (!moderation.allowed) {
      return NextResponse.json({ error: "Prompt violates content policy" }, { status: 400 });
    }

    const userId = user.id;
    const projectName = await generateProjectName(prompt);
    const brandKitInputs = parseBrandKit(body);
    const preferences = parsePreferences(body);
    const project = await prisma.project.create({
      data: {
        userId,
        name: projectName,
        platform: preferences.platform || "mobile",
        brandLogoUrl: brandKitInputs.logoUrl,
        brandPrimaryColor: brandKitInputs.primaryColor,
        brandFontFamily: brandKitInputs.fontFamily,
      },
    });

    await inngest.send({
      name: "ui/generate.screens",
      data: {
        userId,
        projectId: project.id,
        prompt,
        preferences,
        brandKit: {
          logoUrl: brandKitInputs.logoUrl,
          primaryColor: brandKitInputs.primaryColor,
          fontFamily: brandKitInputs.fontFamily,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to create project",
      },
      { status: 500 }
    );
  }
}
