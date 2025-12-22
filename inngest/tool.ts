import { tool } from "ai";
import { z } from "zod";

export const unsplashTool = tool({
  description:
    "Search for high-quality, royalty-free images from Unsplash. Returns maximum quality image URLs, attribution info, and alt text. Use when you need visual content for <img> tags or image references.",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe("Descriptive image search query (e.g., 'sunset over mountains', 'modern office workspace', 'data visualization chart')"),
    orientation: z
      .enum(["landscape", "portrait", "squarish"])
      .optional()
      .default("landscape")
      .describe("Preferred image orientation"),
    count: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .default(1)
      .describe("Number of images to return (1-10)"),
    quality: z
      .enum(["raw", "full", "regular"])
      .optional()
      .default("full")
      .describe("Image quality level: 'raw' (original), 'full' (2000px), 'regular' (1080px)"),
  }),
  execute: async ({ query, orientation, count = 1, quality = "full" }) => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!accessKey) {
      return {
        success: false,
        error: "Unsplash API key not configured",
        images: []
      };
    }

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        orientation: orientation || "landscape",
        per_page: String(count),
        client_id: accessKey,
        order_by: "relevant", // Get most relevant high-quality results
      });

      const res = await fetch(
        `https://api.unsplash.com/search/photos?${params}`,
        {
          headers: {
            "Accept-Version": "v1",
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          error: `Unsplash API error (${res.status}): ${errorText}`,
          images: []
        };
      }

      const data = await res.json();
      
      if (!data.results || data.results.length === 0) {
        return {
          success: false,
          error: `No images found for query: "${query}"`,
          images: []
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const images = data.results.map((result: any) => {
        // Select the highest quality URL based on preference
        const highQualityUrl = result.urls?.[quality] || result.urls?.full || result.urls?.raw;
        
        return {
          // Primary high-quality URL
          url: highQualityUrl,
          
          // Alternative quality options
          raw: result.urls?.raw,        // Original uncompressed
          full: result.urls?.full,      // Max 2000px (best for web)
          regular: result.urls?.regular, // 1080px width
          small: result.urls?.small,    // 400px width
          thumb: result.urls?.thumb,    // 200px width
          
          // Image metadata
          alt: result.alt_description || result.description || query,
          width: result.width,
          height: result.height,
          aspectRatio: result.width && result.height ? (result.width / result.height).toFixed(2) : null,
          color: result.color,
          
          // Attribution (required by Unsplash)
          photographer: result.user?.name,
          photographerUrl: result.user?.links?.html,
          photographerUsername: result.user?.username,
          
          // Additional info
          downloads: result.downloads,
          likes: result.likes,
          downloadLink: result.links?.download_location,
          unsplashUrl: result.links?.html,
        };
      });

      return {
        success: true,
        images,
        total: data.total,
        query,
        quality: quality,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        images: []
      };
    }
  },
});