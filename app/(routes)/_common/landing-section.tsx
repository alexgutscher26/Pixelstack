"use client";
import { memo, useRef, useState, useMemo, useCallback, Suspense } from "react";
import { formatDistanceToNow } from "date-fns";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import PromptInput from "@/components/prompt-input";
import { InputGroupButton } from "@/components/ui/input-group";
import Header from "./header";
import { useCreateProject, useGetProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/navigation";
import { FolderOpen, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Input } from "@/components/ui/input";
import NoProjectsIllustration from "@/components/illustrations/no-projects-illustration";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// Extract suggestions to constant to prevent recreation
const SUGGESTIONS = [
  {
    label: "Finance Tracker",
    icon: "💸",
    value: "Finance app statistics screen. Current balance at top with dollar amount, bar chart showing spending over months (Oct-Mar) with month selector pills below, transaction list with app icons, amounts, and categories. Bottom navigation bar. Mobile app, single screen. Style: Dark theme, chunky rounded cards, playful but professional, modern sans-serif typography, Gen Z fintech vibe. Fun and fresh, not corporate.",
  },
  {
    label: "Fitness Activity",
    icon: "🔥",
    value: "Fitness tracker summary screen. Large central circular progress ring showing steps and calories with neon glow. Line graph showing heart rate over time. Bottom section with grid of health metrics (Sleep, Water, SpO2). Mobile app, single screen. Style: Deep Dark Mode (OLED friendly). Pitch black background with electric neon green and vibrant blue accents. High contrast, data-heavy but organized, sleek and sporty aesthetic.",
  },
  {
    label: "Food Delivery",
    icon: "🍔",
    value: "Food delivery home feed. Top search bar with location pin. Horizontal scrolling hero carousel of daily deals. Vertical list of restaurants with large delicious food thumbnails, delivery time badges, and rating stars. Floating Action Button (FAB) for cart. Mobile app, single screen. Style: Vibrant and Appetizing. Warm colors (orange, red, yellow), rounded card corners, subtle drop shadows to create depth. Friendly and inviting UI.",
  },
  {
    label: "Travel Booking",
    icon: "✈️",
    value: 'Travel destination detail screen. Full-screen immersive photography of a tropical beach. Bottom sheet overlay with rounded top corners containing hotel title, star rating, price per night, and a large "Book Now" button. Horizontal scroll of amenity icons. Mobile app, single screen. Style: Minimalist Luxury. ample whitespace, elegant serif typography for headings, clean sans-serif for body text. Sophisticated, airy, high-end travel vibe.',
  },
  {
    label: "E-Commerce",
    icon: "👟",
    value: 'Sneaker product page. Large high-quality product image on a light gray background. Color selector swatches, size selector grid, and a sticky "Add to Cart" button at the bottom. Title and price in bold, oversized typography. Mobile app, single screen. Style: Neo-Brutalism. High contrast, thick black outlines on buttons and cards, hard shadows (no blur), unrefined geometry, bold solid colors (yellow and black). Trendy streetwear aesthetic.',
  },
  {
    label: "Meditation",
    icon: "🧘",
    value: "Meditation player screen. Central focus is a soft, abstract breathing bubble animation. Play/Pause controls and a time slider below. Background is a soothing solid pastel sage green. Mobile app, single screen. Style: Soft Minimal. Rounded corners on everything, low contrast text for relaxation, pastel color palette, very little UI clutter. Zen, calming, and therapeutic atmosphere.",
  },
  {
    label: "Crypto Portfolio",
    icon: "📈",
    value: "Crypto portfolio dashboard. Top summary with total balance and 24h change. Asset list with coin icons, prices, % change chips (green/red), and mini sparklines. Tabs for Overview, Markets, Wallet. Mobile app, single screen. Style: Dark neon. Deep charcoal background with cyan/magenta accents, glassy cards, sleek data visuals.",
  },
  {
    label: "Smart Home",
    icon: "🏠",
    value: "Smart home control center. Rooms grid with large tiles showing temperature, lights, and security status. Quick actions row (Lock Doors, Turn Off Lights). Bottom navigation with Home, Scenes, Energy, Settings. Mobile app, single screen. Style: Cozy modern. Warm neutrals, rounded tiles, subtle shadows, simple icons.",
  },
  {
    label: "Music Player",
    icon: "🎧",
    value: "Music player now playing screen. Large album art, track title and artist, progress slider, playback controls (shuffle, previous, play/pause, next, repeat). Queue button. Mobile app, single screen. Style: Minimal vibrant. White background, bold typography, accent color matching album art.",
  },
  {
    label: "Course Library",
    icon: "📚",
    value: "E-learning course library. Search bar, category chips, vertical list of courses with thumbnail, title, duration, and progress bar. CTA to continue last course. Mobile app, single screen. Style: Clean academic. Off-white background, muted colors, structured card layout, clear hierarchy.",
  },
  {
    label: "News Reader",
    icon: "📰",
    value: "News home feed. Featured hero article with image and badge, list of headlines with source and time, topic filters (World, Tech, Sports). Save and share buttons. Mobile app, single screen. Style: Editorial modern. Serif headlines, sans-serif body, high contrast, ample whitespace.",
  },
];

const SCREEN_LIMITS = {
  total: { min: 1, max: 10 },
  onboarding: { min: 1, max: 5 },
};

const LandingSection = () => {
  const { user } = useKindeBrowserClient();
  const [promptText, setPromptText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalScreens, setTotalScreens] = useState<number>(9);
  const [onboardingScreens, setOnboardingScreens] = useState<number>(1);
  const [includePaywall, setIncludePaywall] = useState<boolean>(false);
  const [negativeText, setNegativeText] = useState<string>("");
  const STYLE_PRESETS = [
    "Futuristic",
    "Neo‑Brutalism",
    "Nature",
    "Playful",
    "Minimal",
    "Retro",
  ] as const;
  const [stylePreset, setStylePreset] = useState<(typeof STYLE_PRESETS)[number] | undefined>();
  const userId = user?.id;

  const { data: projects, isLoading, isError } = useGetProjects(userId);
  const { mutate, isPending } = useCreateProject();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Memoize filtered projects to prevent unnecessary recalculations
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return projects;
    return projects.filter((project: { name: string }) =>
      project.name.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Use callbacks to prevent function recreation
  const handleSuggestionClick = useCallback((val: string) => {
    setPromptText(val);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!promptText.trim()) return;
    mutate({
      prompt: promptText,
      totalScreens,
      onboardingScreens,
      includePaywall,
      negativePrompts: negativeText,
      stylePreset,
    });
  }, [
    promptText,
    totalScreens,
    onboardingScreens,
    includePaywall,
    negativeText,
    stylePreset,
    mutate,
  ]);

  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const handleEnhance = useCallback(async () => {
    const p = promptText.trim();
    if (!p) return;
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/prompt/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p,
          totalScreens,
          onboardingScreens,
          includePaywall,
          negativePrompts: negativeText,
          stylePreset,
        }),
      });
      const data = await res.json();
      if (res.ok && typeof data?.enhancedPrompt === "string") {
        setPromptText(data.enhancedPrompt);
      }
    } catch {}
    setIsEnhancing(false);
  }, [promptText, totalScreens, onboardingScreens, includePaywall, negativeText, stylePreset]);

  const handleScroll = useCallback((direction: "left" | "right") => {
    const viewport = carouselRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLDivElement | null;
    const scrollAmount = direction === "left" ? -320 : 320;
    viewport?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }, []);

  const handleStartNewProject = useCallback(() => {
    const starter = SUGGESTIONS[0]?.value ?? "Create a modern mobile app home screen";
    mutate({
      prompt: starter,
      totalScreens,
      onboardingScreens,
      includePaywall,
    });
  }, [mutate, totalScreens, onboardingScreens, includePaywall]);

  // Helper function for number input validation
  const clampValue = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-col">
        <Suspense fallback={null}>
          <Header />
        </Suspense>

        <div className="relative overflow-hidden pt-28">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-4">
            <div className="space-y-3">
              <h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
                Design mobile apps <br className="md:hidden" />
                <span className="text-primary">in minutes</span>
              </h1>
              <div className="mx-auto max-w-2xl">
                <p className="text-foreground text-center leading-relaxed font-medium sm:text-lg">
                  Go from idea to beautiful app mockups in minutes by chatting with AI.
                </p>
              </div>
            </div>

            <div className="item-center relative z-50 flex w-full max-w-3xl flex-col gap-8">
              <div className="w-full px-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {STYLE_PRESETS.map((p) => {
                    const color =
                      p === "Futuristic"
                        ? "bg-blue-500"
                        : p === "Neo‑Brutalism"
                          ? "bg-pink-600"
                          : p === "Nature"
                            ? "bg-green-600"
                            : p === "Playful"
                              ? "bg-purple-500"
                              : p === "Minimal"
                                ? "bg-gray-400"
                                : "bg-amber-500";
                    const active = stylePreset === p;
                    return (
                      <Button
                        key={p}
                        type="button"
                        variant={active ? "default" : "outline"}
                        size="sm"
                        className="h-8 gap-2 rounded-full px-3"
                        onClick={() => setStylePreset(active ? undefined : p)}
                      >
                        <span className={`size-2 rounded-full ${color}`}></span>
                        <span className="text-sm">{p}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="w-full">
                <PromptInput
                  className="ring-primary ring-2"
                  promptText={promptText}
                  setPromptText={setPromptText}
                  isLoading={isPending}
                  onSubmit={handleSubmit}
                  placeholder="Describe your app idea..."
                  onEnhance={handleEnhance}
                  isEnhancing={isEnhancing}
                  bottomLeftAddon={
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <InputGroupButton
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Open design options"
                            className="rounded-full"
                          >
                            <SlidersHorizontal className="size-4" />
                          </InputGroupButton>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label htmlFor="total-screens-pop" className="text-xs font-medium">
                                Non-onboarding screens
                              </label>
                              <input
                                id="total-screens-pop"
                                type="number"
                                min={SCREEN_LIMITS.total.min}
                                max={SCREEN_LIMITS.total.max}
                                value={totalScreens}
                                onChange={(e) =>
                                  setTotalScreens(
                                    clampValue(
                                      Number(e.target.value) || SCREEN_LIMITS.total.min,
                                      SCREEN_LIMITS.total.min,
                                      SCREEN_LIMITS.total.max
                                    )
                                  )
                                }
                                className="bg-background focus:ring-primary h-9 rounded-md border px-2 focus:ring-2 focus:outline-none"
                                aria-label="Number of non-onboarding screens"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label
                                htmlFor="onboarding-screens-pop"
                                className="text-xs font-medium"
                              >
                                Onboarding screens
                              </label>
                              <input
                                id="onboarding-screens-pop"
                                type="number"
                                min={SCREEN_LIMITS.onboarding.min}
                                max={SCREEN_LIMITS.onboarding.max}
                                value={onboardingScreens}
                                onChange={(e) =>
                                  setOnboardingScreens(
                                    clampValue(
                                      Number(e.target.value) || SCREEN_LIMITS.onboarding.min,
                                      SCREEN_LIMITS.onboarding.min,
                                      SCREEN_LIMITS.onboarding.max
                                    )
                                  )
                                }
                                className="bg-background focus:ring-primary h-9 rounded-md border px-2 focus:ring-2 focus:outline-none"
                                aria-label="Number of onboarding screens"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label htmlFor="paywall-toggle-pop" className="text-xs font-medium">
                                Include paywall
                              </label>
                              <Button
                                id="paywall-toggle-pop"
                                type="button"
                                variant={includePaywall ? "default" : "outline"}
                                className="h-9"
                                onClick={() => setIncludePaywall((v) => !v)}
                                aria-pressed={includePaywall}
                                aria-label="Toggle paywall inclusion"
                              >
                                {includePaywall ? "Yes" : "No"}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <InputGroupButton
                            size="sm"
                            variant="ghost"
                            aria-label="Open negative prompts"
                            className="rounded-full"
                          >
                            Negatives
                          </InputGroupButton>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 p-3">
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="negative-prompts-pop" className="text-xs font-medium">
                              Negative prompts
                            </label>
                            <textarea
                              id="negative-prompts-pop"
                              placeholder={"Examples: no red, no rounded corners, no gradients"}
                              value={negativeText}
                              onChange={(e) => setNegativeText(e.target.value)}
                              className="bg-background focus:ring-primary min-h-24 rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                              aria-label="Negative prompts"
                            />
                            <span className="text-muted-foreground text-xs">
                              Comma or newline separated. We will strictly avoid these in the
                              design.
                            </span>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  }
                />
              </div>

              <div className="relative w-full px-5">
                <div className="pointer-events-none absolute top-1/2 left-0 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="bg-background/80 hover:bg-background pointer-events-auto rounded-full border backdrop-blur"
                    onClick={() => handleScroll("left")}
                    aria-label="Previous suggestions"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </div>
                <div className="pointer-events-none absolute top-1/2 right-0 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="bg-background/80 hover:bg-background pointer-events-auto rounded-full border backdrop-blur"
                    onClick={() => handleScroll("right")}
                    aria-label="Next suggestions"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <Suggestions ref={carouselRef} className="py-1">
                  {SUGGESTIONS.map((s) => (
                    <Suggestion
                      key={s.label}
                      suggestion={s.label}
                      className="h-8! px-3 pt-1.5! text-xs!"
                      onClick={() => handleSuggestionClick(s.value)}
                    >
                      <span role="img" aria-label={s.label}>
                        {s.icon}
                      </span>
                      <span>{s.label}</span>
                    </Suggestion>
                  ))}
                </Suggestions>
              </div>
            </div>

            <div className="pointer-events-none absolute top-[80%] left-1/2 -z-10 h-750 w-1250 -translate-x-1/2">
              <div className="bg-radial-primary absolute bottom-[calc(100%-300px)] left-1/2 h-500 w-500 -translate-x-1/2 opacity-20"></div>
              <div className="bg-primary/20 absolute -mt-2.5 size-full rounded-[50%] opacity-70 [box-shadow:0_-15px_24.8px_var(--primary)]"></div>
              <div className="bg-background absolute z-0 size-full rounded-[50%]"></div>
            </div>
          </div>
        </div>

        {userId && (
          <section className="w-full py-10" aria-label="Recent projects">
            <div className="mx-auto max-w-3xl px-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-medium tracking-tight">Recent Projects</h2>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9"
                    aria-label="Search projects"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex w-full flex-col overflow-hidden rounded-xl border">
                      <div className="bg-background h-40">
                        <Skeleton className="h-full w-full rounded-none" />
                      </div>
                      <div className="space-y-2 p-4">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredProjects.map((project: ProjectType) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-muted-foreground mt-10 text-center">
                  No projects found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="bg-card text-card-foreground mt-3 flex flex-col items-center gap-4 rounded-xl border p-8">
                  <div className="flex items-center justify-center">
                    <NoProjectsIllustration className="text-primary h-28 w-28" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-lg font-semibold tracking-tight">No projects yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Kickstart your first design by using a suggested prompt.
                    </p>
                  </div>
                  <Button type="button" className="px-6" onClick={handleStartNewProject}>
                    Start a new project
                  </Button>
                </div>
              )}

              {isError && (
                <div className="text-destructive border-destructive/50 bg-destructive/10 mt-4 rounded-lg border p-4 text-center">
                  Failed to load projects. Please try again later.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const ProjectCard = memo(({ project }: { project: ProjectType }) => {
  const router = useRouter();
  const timeAgo = useMemo(() => {
    return formatDistanceToNow(new Date(project.createdAt), { addSuffix: true });
  }, [project.createdAt]);

  const handleClick = useCallback(() => {
    router.push(`/project/${project.id}`);
  }, [router, project.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(`/project/${project.id}`);
      }
    },
    [router, project.id]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className="focus:ring-primary flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md focus:ring-2 focus:outline-none"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open project: ${project.name}`}
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#eee]">
        {project.thumbnail ? (
          <FallbackImage
            src={project.thumbnail}
            alt={`${project.name} thumbnail`}
            className="h-full w-full scale-110 object-cover object-left"
            fallbackType="folder"
          />
        ) : (
          <div className="bg-primary/20 text-primary flex h-16 w-16 items-center justify-center rounded-full">
            <FolderOpen aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-col p-4">
        <h3 className="mb-1 line-clamp-1 w-full truncate text-sm font-semibold">{project.name}</h3>
        <time
          className="text-muted-foreground text-xs"
          dateTime={new Date(project.createdAt).toISOString()}
        >
          {timeAgo}
        </time>
      </div>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default LandingSection;
