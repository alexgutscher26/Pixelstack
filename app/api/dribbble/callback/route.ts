import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Dribbble OAuth Callback Handler
 *
 * This endpoint receives the authorization code from Dribbble
 * and exchanges it for an access token.
 *
 * Flow:
 * 1. User clicks "Connect Dribbble" in admin settings
 * 2. User is redirected to Dribbble authorization page
 * 3. User authorizes the app
 * 4. Dribbble redirects back to this endpoint with a code
 * 5. We exchange the code for an access token
 * 6. We store the token in the database
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for errors from Dribbble
    if (error) {
      console.error("Dribbble OAuth error:", error);
      return NextResponse.redirect(new URL(`/admin/settings?error=${error}`, request.url));
    }

    // Validate code
    if (!code) {
      return NextResponse.redirect(new URL("/admin/settings?error=no_code", request.url));
    }

    // Validate state (CSRF protection)
    // In production, you should verify this matches the state you sent
    if (!state) {
      return NextResponse.redirect(new URL("/admin/settings?error=invalid_state", request.url));
    }

    // Exchange code for access token
    const clientId = process.env.DRIBBBLE_CLIENT_ID;
    const clientSecret = process.env.DRIBBBLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/dribbble/callback`;

    if (!clientId || !clientSecret) {
      console.error("Dribbble credentials not configured");
      return NextResponse.redirect(new URL("/admin/settings?error=not_configured", request.url));
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://dribbble.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL(`/admin/settings?error=token_exchange_failed`, request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const scope = tokenData.scope;

    // Store the token in database using upsert (MongoDB compatible)
    await prisma.setting.upsert({
      where: { key: "dribbble_access_token" },
      update: { value: accessToken },
      create: { key: "dribbble_access_token", value: accessToken },
    });

    // Also store the scope
    await prisma.setting.upsert({
      where: { key: "dribbble_scope" },
      update: { value: scope },
      create: { key: "dribbble_scope", value: scope },
    });

    console.log("Dribbble OAuth successful, token stored");

    // Redirect back to settings with success message
    return NextResponse.redirect(
      new URL("/admin/settings?success=dribbble_connected", request.url)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/admin/settings?error=unknown", request.url));
  }
}
