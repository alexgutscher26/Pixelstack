import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateProjectName } from "@/app/action/action";
import { inngest } from "@/inngest/client";
import { moderateText } from "@/lib/moderation";

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
    const {
      prompt,
      totalScreens,
      onboardingScreens,
      includePaywall,
      negativePrompts,
      stylePreset,
    } =
      await request.json();
    const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prompt) throw new Error("Missing Prompt");

    const moderation = await moderateText(prompt);
    if (!moderation.allowed) {
      return NextResponse.json(
        { error: "Prompt violates content policy" },
        { status: 400 }
      );
    }

    const userId = user.id;

    const projectName = await generateProjectName(prompt);

    const project = await prisma.project.create({
      data: {
        userId,
        name: projectName,
      },
    });

    //Trigger the Inngest
    try {
      await inngest.send({
        name: "ui/generate.screens",
        data: {
          userId,
          projectId: project.id,
          prompt,
          preferences: {
            totalScreens: Number(totalScreens) || undefined,
            onboardingScreens: Number(onboardingScreens) || undefined,
            includePaywall: Boolean(includePaywall) || false,
            negativePrompts:
              Array.isArray(negativePrompts)
                ? negativePrompts.map((s) => String(s).trim()).filter(Boolean)
                : typeof negativePrompts === "string" && negativePrompts.trim().length > 0
                  ? negativePrompts
                      .split(/[,\n]/)
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : undefined,
            stylePreset:
              typeof stylePreset === "string" && stylePreset.trim().length > 0
                ? stylePreset.trim()
                : undefined,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }

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
