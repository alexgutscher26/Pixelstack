import arcjet, { detectBot, shield, tokenBucket, validateEmail } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "CATEGORY:MONITOR", // Uptime monitoring services
        "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
        "GOOGLE_CRAWLER",
        "GOOGLE_CRAWLER_NEWS",
        "BING_CRAWLER",
        "CURL",
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
     validateEmail({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // block disposable, invalid, and email addresses with no MX records
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
});

export async function GET(req: Request) {
  const decision = await aj.protect(req, {
    requested: 5,
    email: ""
  }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too Many Requests", reason: decision.reason },
        { status: 429 }
      );
    } else if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "No bots allowed", reason: decision.reason },
        { status: 403 }
      );
    } else {
      return NextResponse.json({ error: "Forbidden", reason: decision.reason }, { status: 403 });
    }
  }

  // Requests from hosting IPs are likely from bots, so they can usually be
  // blocked. However, consider your use case - if this is an API endpoint
  // then hosting IPs might be legitimate.
  // https://docs.arcjet.com/blueprints/vpn-proxy-detection
  if (decision.ip.isHosting()) {
    return NextResponse.json({ error: "Forbidden", reason: decision.reason }, { status: 403 });
  }

  // Paid Arcjet accounts include additional verification checks using IP data.
  // Verification isn't always possible, so we recommend checking the decision
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofedBot)) {
    return NextResponse.json({ error: "Forbidden", reason: decision.reason }, { status: 403 });
  }

  return NextResponse.json({ message: "Hello world" });
}
