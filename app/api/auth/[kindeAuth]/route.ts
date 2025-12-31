import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const handler = handleAuth();
    return await handler(request, { params });
  } catch (error) {
    console.error("Kinde Auth Error:", error);
    return NextResponse.redirect(new URL("/auth-error", request.url));
  }
}
