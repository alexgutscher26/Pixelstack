"use server";
import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";

const DEFAULT_PROJECT_NAME = "Untitled Project";
const MAX_WORDS = 4;
const MAX_RETRIES = 2;

interface GenerateProjectNameOptions {
  prompt: string;
  maxWords?: number;
  temperature?: number;
}

/**
 * Validates and cleans a generated project name
 */
function validateAndCleanName(name: string, maxWords: number): string {
  if (!name?.trim()) {
    return DEFAULT_PROJECT_NAME;
  }

  // Remove quotes, special characters, and normalize spaces
  const cleaned = name
    .replace(/^["']|["']$/g, "") // Remove surrounding quotes
    .replace(/[^a-zA-Z0-9\s&-]/g, "") // Keep alphanumeric, spaces, ampersand, hyphen
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return DEFAULT_PROJECT_NAME;
  }

  // Enforce word limit
  const words = cleaned.split(" ");
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ");
  }

  // Ensure Title Case
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}

/**
 * Generates a creative project name based on user input
 */
export async function generateProjectName(
  promptOrOptions: string | GenerateProjectNameOptions
): Promise<string> {
  // Handle both string and options object
  const options: GenerateProjectNameOptions =
    typeof promptOrOptions === "string" ? { prompt: promptOrOptions } : promptOrOptions;

  const { prompt, maxWords = MAX_WORDS, temperature = 0.8 } = options;

  if (!prompt?.trim()) {
    return DEFAULT_PROJECT_NAME;
  }

  let lastError: Error | null = null;

  // Retry logic for better reliability
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { text } = await generateText({
        model: openrouter.chat("google/gemini-2.5-flash-lite"),
        system: `You are a creative project naming expert. Generate a concise, memorable project name based on the description provided.

STRICT RULES:
- Maximum ${maxWords} words (prefer 2-3 words)
- Use Title Case (e.g., "Task Manager", "Recipe Hub")
- Be specific and descriptive
- Avoid generic suffixes like "App", "Project", "System" unless essential
- No special characters except hyphens or ampersands when necessary
- Professional yet engaging tone
- Focus on core value or functionality

EXAMPLES:
Input: "a todo list app" → Output: Task Flow
Input: "ecommerce store for handmade jewelry" → Output: Artisan Market
Input: "real-time collaboration tool" → Output: Sync Space
Input: "AI-powered recipe generator" → Output: Smart Chef
Input: "budget tracking dashboard" → Output: Money Wise

Return ONLY the project name. No quotes, no explanation, no extra text.`,
        prompt: prompt.trim(),
        maxOutputTokens: 30,
        temperature: attempt === 0 ? temperature : temperature + 0.1, // Slightly increase creativity on retries
      });

      const projectName = validateAndCleanName(text, maxWords);

      // Success - return the name
      if (projectName !== DEFAULT_PROJECT_NAME) {
        return projectName;
      }

      // If validation failed, retry
      lastError = new Error("Generated name failed validation");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Error generating project name (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
        error
      );

      // Don't retry on the last attempt
      if (attempt === MAX_RETRIES) {
        break;
      }

      // Brief delay before retry
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // All attempts failed
  console.error("Failed to generate project name after retries:", lastError);
  return DEFAULT_PROJECT_NAME;
}

/**
 * Generates multiple project name suggestions
 */
export async function generateProjectNameSuggestions(prompt: string, count = 3): Promise<string[]> {
  if (!prompt?.trim() || count < 1) {
    return [DEFAULT_PROJECT_NAME];
  }

  const suggestions = await Promise.allSettled(
    Array.from({ length: count }, (_, i) =>
      generateProjectName({
        prompt,
        temperature: 0.8 + i * 0.1, // Vary temperature for diversity
      })
    )
  );

  const names = suggestions
    .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((name) => name !== DEFAULT_PROJECT_NAME);

  // Remove duplicates and return
  const uniqueNames = [...new Set(names)];
  return uniqueNames.length > 0 ? uniqueNames : [DEFAULT_PROJECT_NAME];
}
