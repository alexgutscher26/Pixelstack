/**
 * Design Inspiration System
 *
 * Fetches design trends and patterns from Dribbble API for inspiration only.
 * IMPORTANT: This system extracts metadata and patterns, NOT actual designs.
 * We never copy, display, or store actual design images - only use as conceptual inspiration.
 *
 * Legal Compliance:
 * - Uses official Dribbble API
 * - Extracts only metadata (colors, tags, descriptions)
 * - Provides text-based inspiration to AI
 * - Never replicates specific designs
 * - Respects rate limits and terms of service
 */

type DribbbleShot = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  colors?: string[];
  html_url: string;
};

type DesignPattern = {
  layoutType: string;
  colorScheme: string[];
  styleKeywords: string[];
  commonElements: string[];
};

type DesignInspiration = {
  trendingStyles: string[];
  popularColors: string[];
  commonPatterns: string[];
  layoutSuggestions: string[];
  inspirationText: string;
};

/**
 * Get Dribbble access token from database
 */
async function getDribbbleAccessToken(): Promise<string | null> {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const setting = await prisma.setting.findUnique({
      where: { key: "dribbble_access_token" },
    });
    return setting?.value || null;
  } catch (error) {
    console.error("Error fetching Dribbble token:", error);
    return null;
  }
}

/**
 * Fetch trending shots from Dribbble API
 */
async function fetchDribbbleShots(perPage: number = 12): Promise<DribbbleShot[]> {
  try {
    const accessToken = await getDribbbleAccessToken();

    if (!accessToken) {
      console.log("No Dribbble access token found, using curated trends");
      return [];
    }

    const response = await fetch(
      `https://api.dribbble.com/v2/shots?per_page=${perPage}&sort=popular`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Dribbble API error:", response.status, response.statusText);
      return [];
    }

    const shots = await response.json();

    // Extract only metadata we need
    return shots.map((shot: any) => ({
      id: shot.id,
      title: shot.title,
      description: shot.description || "",
      tags: shot.tags || [],
      colors: shot.images?.colors || [],
      html_url: shot.html_url,
    }));
  } catch (error) {
    console.error("Error fetching Dribbble shots:", error);
    return [];
  }
}

/**
 * Fetch design inspiration from multiple sources
 * Tries Dribbble API first, falls back to curated trends
 */
async function fetchDesignTrends(): Promise<DribbbleShot[]> {
  // Try to fetch from Dribbble API
  const dribbbleShots = await fetchDribbbleShots(12);

  if (dribbbleShots.length > 0) {
    console.log(`Fetched ${dribbbleShots.length} shots from Dribbble API`);
    return dribbbleShots;
  }

  // Fall back to curated trends
  console.log("Using curated design trends");
  return getCuratedDesignTrends();
}

/**
 * Curated design trends based on current industry standards
 * Updated regularly to reflect modern design practices
 */
function getCuratedDesignTrends(): DribbbleShot[] {
  return [
    {
      id: 1,
      title: "Modern SaaS Landing Page",
      description:
        "Clean hero section with gradient backgrounds, bold typography, and glassmorphism effects",
      tags: ["saas", "landing", "hero", "gradient", "glassmorphism", "modern"],
      colors: ["#6366F1", "#8B5CF6", "#EC4899"],
      html_url: "",
    },
    {
      id: 2,
      title: "Minimalist Dashboard Design",
      description:
        "Card-based layout with data visualization, clean navigation, and subtle shadows",
      tags: ["dashboard", "minimalist", "cards", "data-viz", "clean"],
      colors: ["#3B82F6", "#10B981", "#F59E0B"],
      html_url: "",
    },
    {
      id: 3,
      title: "Bold E-commerce Homepage",
      description: "Large product images, vibrant colors, clear CTAs, and modern grid layouts",
      tags: ["ecommerce", "bold", "colorful", "grid", "product"],
      colors: ["#EF4444", "#F59E0B", "#10B981"],
      html_url: "",
    },
    {
      id: 4,
      title: "Dark Mode Portfolio",
      description: "Dark theme with neon accents, smooth animations, and bento grid layout",
      tags: ["portfolio", "dark-mode", "neon", "animations", "bento"],
      colors: ["#1F2937", "#6366F1", "#EC4899"],
      html_url: "",
    },
    {
      id: 5,
      title: "Feature-Rich Pricing Page",
      description: "Three-tier pricing cards with feature comparisons, toggle for monthly/yearly",
      tags: ["pricing", "cards", "comparison", "toggle", "features"],
      colors: ["#8B5CF6", "#EC4899", "#F59E0B"],
      html_url: "",
    },
    {
      id: 6,
      title: "Testimonial Section Design",
      description: "Customer testimonials with avatars, ratings, and carousel layout",
      tags: ["testimonials", "carousel", "social-proof", "avatars"],
      colors: ["#3B82F6", "#10B981", "#F59E0B"],
      html_url: "",
    },
    {
      id: 7,
      title: "Hero with Video Background",
      description: "Full-screen hero with video background, overlay text, and scroll indicator",
      tags: ["hero", "video", "full-screen", "overlay", "scroll"],
      colors: ["#1F2937", "#6366F1", "#FFFFFF"],
      html_url: "",
    },
    {
      id: 8,
      title: "Feature Grid Layout",
      description: "Six-column feature grid with icons, titles, descriptions, and hover effects",
      tags: ["features", "grid", "icons", "hover", "six-column"],
      colors: ["#6366F1", "#8B5CF6", "#EC4899"],
      html_url: "",
    },
    {
      id: 9,
      title: "Mobile App Landing",
      description: "App showcase with phone mockups, feature highlights, and app store buttons",
      tags: ["mobile", "app", "mockup", "showcase", "app-store"],
      colors: ["#3B82F6", "#8B5CF6", "#EC4899"],
      html_url: "",
    },
    {
      id: 10,
      title: "Blog Layout Design",
      description: "Article grid with featured images, categories, read time, and author info",
      tags: ["blog", "articles", "grid", "featured", "author"],
      colors: ["#1F2937", "#6366F1", "#10B981"],
      html_url: "",
    },
    {
      id: 11,
      title: "Contact Form Section",
      description: "Split layout with form on left, contact info and map on right",
      tags: ["contact", "form", "split", "map", "info"],
      colors: ["#3B82F6", "#10B981", "#F59E0B"],
      html_url: "",
    },
    {
      id: 12,
      title: "Footer Design Patterns",
      description: "Four-column footer with links, newsletter signup, and social icons",
      tags: ["footer", "columns", "newsletter", "social", "links"],
      colors: ["#1F2937", "#6366F1", "#8B5CF6"],
      html_url: "",
    },
  ];
}

/**
 * Extract design patterns from shot metadata
 * This analyzes text descriptions and tags to identify common patterns
 */
function extractDesignPatterns(shots: DribbbleShot[]): DesignPattern[] {
  const patterns: DesignPattern[] = [];

  for (const shot of shots) {
    const text = `${shot.title} ${shot.description} ${shot.tags.join(" ")}`.toLowerCase();

    // Identify layout types
    const layoutType =
      text.includes("hero") || text.includes("landing")
        ? "hero-section"
        : text.includes("dashboard")
          ? "dashboard"
          : text.includes("card") || text.includes("grid")
            ? "card-grid"
            : text.includes("form")
              ? "form-layout"
              : text.includes("pricing")
                ? "pricing-table"
                : "general";

    // Extract style keywords
    const styleKeywords: string[] = [];
    const styleTerms = [
      "minimalist",
      "bold",
      "gradient",
      "glassmorphism",
      "neumorphism",
      "dark mode",
      "light",
      "colorful",
      "monochrome",
      "vibrant",
      "modern",
      "clean",
      "elegant",
      "playful",
      "professional",
    ];

    for (const term of styleTerms) {
      if (text.includes(term)) {
        styleKeywords.push(term);
      }
    }

    // Extract common elements
    const commonElements: string[] = [];
    const elements = [
      "navigation",
      "hero",
      "cta",
      "button",
      "card",
      "icon",
      "illustration",
      "photo",
      "typography",
      "animation",
      "chart",
    ];

    for (const element of elements) {
      if (text.includes(element)) {
        commonElements.push(element);
      }
    }

    patterns.push({
      layoutType,
      colorScheme: shot.colors || [],
      styleKeywords,
      commonElements,
    });
  }

  return patterns;
}

/**
 * Analyze patterns and generate inspiration text for AI
 */
function generateInspirationText(patterns: DesignPattern[]): DesignInspiration {
  // Count occurrences
  const layoutCounts = new Map<string, number>();
  const styleCounts = new Map<string, number>();
  const elementCounts = new Map<string, number>();
  const allColors: string[] = [];

  for (const pattern of patterns) {
    // Count layouts
    layoutCounts.set(pattern.layoutType, (layoutCounts.get(pattern.layoutType) || 0) + 1);

    // Count styles
    for (const style of pattern.styleKeywords) {
      styleCounts.set(style, (styleCounts.get(style) || 0) + 1);
    }

    // Count elements
    for (const element of pattern.commonElements) {
      elementCounts.set(element, (elementCounts.get(element) || 0) + 1);
    }

    // Collect colors
    allColors.push(...pattern.colorScheme);
  }

  // Get top items
  const topStyles = Array.from(styleCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([style]) => style);

  const topElements = Array.from(elementCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([element]) => element);

  const topLayouts = Array.from(layoutCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([layout]) => layout);

  // Get popular colors (most frequent)
  const colorCounts = new Map<string, number>();
  for (const color of allColors) {
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
  }
  const popularColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([color]) => color);

  // Generate inspiration text
  const inspirationText = `
CURRENT DESIGN TRENDS (for inspiration only):
- Popular styles: ${topStyles.join(", ")}
- Common layouts: ${topLayouts.join(", ")}
- Trending elements: ${topElements.join(", ")}
- Popular color palette: ${popularColors.join(", ")}

DESIGN DIRECTION:
Use these trends as conceptual inspiration to create original designs.
Focus on modern, professional aesthetics that incorporate trending styles
while maintaining uniqueness and following the user's specific requirements.
`.trim();

  return {
    trendingStyles: topStyles,
    popularColors,
    commonPatterns: topElements,
    layoutSuggestions: topLayouts,
    inspirationText,
  };
}

/**
 * Main function to get design inspiration
 * Returns text-based inspiration that can be added to AI prompts
 */
export async function getDesignInspiration(
  category?: "website" | "mobile" | "dashboard"
): Promise<string> {
  try {
    // Fetch curated design trends
    const shots = await fetchDesignTrends();

    if (shots.length === 0) {
      return getFallbackInspiration(category === "mobile" ? "mobile" : "website");
    }

    // Extract patterns
    const patterns = extractDesignPatterns(shots);

    // Generate inspiration text
    const inspiration = generateInspirationText(patterns);

    return inspiration.inspirationText;
  } catch (error) {
    console.error("Error generating design inspiration:", error);
    return getFallbackInspiration(category === "mobile" ? "mobile" : "website");
  }
}

/**
 * Get inspiration for specific design type
 */
export async function getWebsiteInspiration(): Promise<string> {
  return getDesignInspiration("website");
}

export async function getMobileInspiration(): Promise<string> {
  return getDesignInspiration("mobile");
}

/**
 * Fallback inspiration when API is unavailable
 * Based on general design best practices
 */
export function getFallbackInspiration(platform: "mobile" | "website"): string {
  if (platform === "website") {
    return `
DESIGN BEST PRACTICES:
- Popular styles: minimalist, gradient backgrounds, glassmorphism, bold typography
- Common layouts: hero-section, card-grid, pricing-table
- Trending elements: large hero images, feature cards, testimonials, CTA sections
- Modern color palettes: Use complementary colors with good contrast

DESIGN DIRECTION:
Create modern, professional designs with clean layouts, ample whitespace,
and strong visual hierarchy. Focus on user experience and accessibility.
`.trim();
  } else {
    return `
DESIGN BEST PRACTICES:
- Popular styles: minimalist, dark mode, card-based, modern
- Common layouts: dashboard, card-grid, list views
- Trending elements: bottom navigation, floating action buttons, charts
- Modern color palettes: Use theme colors with good contrast

DESIGN DIRECTION:
Create mobile-optimized designs with touch-friendly elements, clear navigation,
and efficient use of screen space.
`.trim();
  }
}
