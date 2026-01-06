import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        userId: user.id,
        id: id,
      },
      include: {
        frames: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "Fail to fetch project",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { prompt } = await request.json();
    const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prompt) {
      return NextResponse.json({ error: "Missing Prompt" }, { status: 400 });
    }

    const userId = user.id;
    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
      include: { frames: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    //Trigger the Inngest
    try {
      await inngest.send({
        name: "ui/generate.screens",
        data: {
          userId,
          projectId: id,
          prompt,
          frames: project.frames,
          theme: project.theme,
          brandKit: {
            logoUrl: project.brandLogoUrl,
            primaryColor: project.brandPrimaryColor,
            fontFamily: project.brandFontFamily,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to generate frame",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { themeId, name, brandLogoUrl, brandPrimaryColor, brandFontFamily } =
      await request.json();
    const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const hasValidName = trimmedName.length > 0;
    const hasTheme = themeId !== undefined;
    const hasBrandLogo = typeof brandLogoUrl === "string";
    const hasBrandPrimaryColor = typeof brandPrimaryColor === "string";
    const hasBrandFontFamily = typeof brandFontFamily === "string";
    if (
      !hasValidName &&
      !hasTheme &&
      !hasBrandLogo &&
      !hasBrandPrimaryColor &&
      !hasBrandFontFamily
    ) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const userId = user.id;

    const data: Record<string, unknown> = {};
    if (hasTheme) data.theme = themeId;
    if (hasValidName) data.name = trimmedName;
    if (hasBrandLogo) data.brandLogoUrl = brandLogoUrl;
    if (hasBrandPrimaryColor) data.brandPrimaryColor = brandPrimaryColor;
    if (hasBrandFontFamily) data.brandFontFamily = brandFontFamily;

    const project = await prisma.project.update({
      where: { id, userId },
      data,
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to update project",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;
    const project = await prisma.project.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    await prisma.frame.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to delete project",
      },
      { status: 500 }
    );
  }
}
