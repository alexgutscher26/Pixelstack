"use server";

import { inngest } from "@/inngest/client";
import { getSubscriptionToken } from "@inngest/realtime";

export async function fetchRealtimeSubscriptionToken() {
  const { getKindeServerSession } = await import("@kinde-oss/kinde-auth-nextjs/server");
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) return null;

  // This creates a token using the Inngest API that is bound to the channel and topic:
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: `user:${user.id}`,
      topics: [
        "generation.start",
        "analysis.start",
        "analysis.complete",
        "frame.created",
        "generation.complete",
      ],
    });
    return token;
  } catch {
    return null;
  }
}
