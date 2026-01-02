export type ModerationResult = {
  allowed: boolean;
  flagged?: boolean;
  categories?: Record<string, boolean>;
  scores?: Record<string, number>;
};

export async function moderateText(input: string): Promise<ModerationResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !input?.trim()) {
    return { allowed: true };
  }
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input,
      }),
    });
    if (!res.ok) {
      return { allowed: true };
    }
    const json = await res.json();
    const result = json?.results?.[0];
    const flagged = Boolean(result?.flagged);
    const categories = result?.categories ?? undefined;
    const scores = result?.category_scores ?? undefined;
    return { allowed: !flagged, flagged, categories, scores };
  } catch {
    return { allowed: true };
  }
}
