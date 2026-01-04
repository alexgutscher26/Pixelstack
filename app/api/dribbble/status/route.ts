import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Check Dribbble connection status
 */
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "dribbble_access_token" },
    });

    return NextResponse.json({
      connected: !!setting?.value,
    });
  } catch (error) {
    console.error("Error checking Dribbble status:", error);
    return NextResponse.json({ connected: false });
  }
}
