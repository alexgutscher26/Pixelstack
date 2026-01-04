import { NextRequest, NextResponse } from "next/server";

/**
 * Dribbble OAuth Initiation Endpoint
 * 
 * This endpoint initiates the OAuth flow by redirecting the user
 * to Dribbble's authorization page.
 * 
 * Usage: GET /api/dribbble/connect
 */

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.DRIBBBLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/dribbble/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: "Dribbble Client ID not configured" },
        { status: 500 }
      );
    }

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(7);

    // Store state in session/cookie for verification (optional but recommended)
    // For now, we'll just pass it through

    // Build authorization URL
    const authUrl = new URL("https://dribbble.com/oauth/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", "public"); // Request public scope
    authUrl.searchParams.set("state", state);

    // Redirect to Dribbble authorization page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
