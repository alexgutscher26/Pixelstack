/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { safeLogger } from "@/lib/utils";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const handler = handleAuth();
    return await handler(request, { params });
  } catch (error) {
    safeLogger.error("Kinde Auth Error", error);
    return NextResponse.redirect(new URL("/auth-error", request.url));
  }
}
