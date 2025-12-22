"use server";
import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";

export async function generateProjectName(prompt: string) {
  if (!prompt?.trim()) {
    return "Untitled Project";
  }

  try {
    const { text } = await generateText({
      model: openrouter.chat("google/gemini-2.5-flash-lite"),
      system: `You are a creative project naming assistant. Generate a concise, memorable project name based on the user's description.

Rules:
- Maximum 4 words (prefer 2-3 words)
- Use Title Case capitalization
- Be descriptive and specific to the project's purpose
- Avoid generic words like "App", "Project", "System" unless essential
- No special characters, numbers, or punctuation
- Make it professional yet engaging
- Focus on the core functionality or value proposition

Examples:
- "a todo list app" → "Task Manager"
- "ecommerce store for shoes" → "Sole Market"
- "real-time chat application" → "Live Connect"
- "fitness tracking dashboard" → "Fit Tracker"
- "recipe sharing platform" → "Recipe Hub"

Return ONLY the project name, nothing else.`,
      prompt: `Generate a project name for: ${prompt.trim()}`,
      maxOutputTokens: 30,
      temperature: 0.8, // More creative naming
    });

    const projectName = text?.trim();
    
    // Validation
    if (!projectName || projectName.length === 0) {
      return "Untitled Project";
    }

    // Clean up any potential formatting issues
    const cleaned = projectName
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special chars
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();

    // Ensure it's not too long
    const words = cleaned.split(" ");
    if (words.length > 4) {
      return words.slice(0, 4).join(" ");
    }

    return cleaned || "Untitled Project";
  } catch (error) {
    console.error("Error generating project name:", error);
    return "Untitled Project";
  }
}
