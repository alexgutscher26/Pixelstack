import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Disconnect Dribbble (remove stored token)
 */
export async function POST() {
  try {
    await prisma.setting.deleteMany({
      where: {
        key: {
          in: ["dribbble_access_token", "dribbble_scope"],
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Dribbble:", error);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}
