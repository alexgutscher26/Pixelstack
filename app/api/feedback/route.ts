import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(request: Request) {
  try {
    const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { projectId, message } = await request.json();
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
    }
    try {
      await inngest.send({
        name: "ui/feedback.submit",
        data: {
          userId: user.id,
          projectId: typeof projectId === "string" ? projectId : undefined,
          message: message.trim(),
          createdAt: Date.now(),
        },
      });
    } catch (error) {
      console.log("Failed to send feedback event", error);
    }
    console.log("Feedback:", {
      userId: user.id,
      projectId,
      message: message.trim(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Feedback error", error);
    return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 });
  }
}
