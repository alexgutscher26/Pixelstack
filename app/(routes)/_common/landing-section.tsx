"use client";
import { memo, useRef, useState, useMemo, useCallback, Suspense } from "react";
import { formatDistanceToNow } from "date-fns";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import PromptInput from "@/components/prompt-input";
import Header from "./header";
import { useCreateProject, useGetProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ImageIcon,
  MicIcon,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FallbackImage } from "@/components/ui/fallback-image";
import NoProjectsIllustration from "@/components/illustrations/no-projects-illustration";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

// Extract suggestions to constant to prevent recreation
const SUGGESTIONS = [
  {
    label: "Finance Tracker",
    icon: "💸",
    value:
      "Finance app statistics screen. Current balance at top with dollar amount, bar chart showing spending over months (Oct-Mar) with month selector pills below, transaction list with app icons, amounts, and categories. Bottom navigation bar. Mobile app, single screen. Style: Dark theme, chunky rounded cards, playful but professional, modern sans-serif typography, Gen Z fintech vibe. Fun and fresh, not corporate.",
  },
  {
    label: "Fitness Activity",
    icon: "🔥",
    value:
      "Fitness tracker summary screen. Large central circular progress ring showing steps and calories with neon glow. Line graph showing heart rate over time. Bottom section with grid of health metrics (Sleep, Water, SpO2). Mobile app, single screen. Style: Deep Dark Mode (OLED friendly). Pitch black background with electric neon green and vibrant blue accents. High contrast, data-heavy but organized, sleek and sporty aesthetic.",
  },
  {
    label: "Food Delivery",
    icon: "🍔",
    value:
      "Food delivery home feed. Top search bar with location pin. Horizontal scrolling hero carousel of daily deals. Vertical list of restaurants with large delicious food thumbnails, delivery time badges, and rating stars. Floating Action Button (FAB) for cart. Mobile app, single screen. Style: Vibrant and Appetizing. Warm colors (orange, red, yellow), rounded card corners, subtle drop shadows to create depth. Friendly and inviting UI.",
  },
  {
    label: "Travel Booking",
    icon: "✈️",
    value:
      'Travel destination detail screen. Full-screen immersive photography of a tropical beach. Bottom sheet overlay with rounded top corners containing hotel title, star rating, price per night, and a large "Book Now" button. Horizontal scroll of amenity icons. Mobile app, single screen. Style: Minimalist Luxury. ample whitespace, elegant serif typography for headings, clean sans-serif for body text. Sophisticated, airy, high-end travel vibe.',
  },
  {
    label: "E-Commerce",
    icon: "👟",
    value:
      'Sneaker product page. Large high-quality product image on a light gray background. Color selector swatches, size selector grid, and a sticky "Add to Cart" button at the bottom. Title and price in bold, oversized typography. Mobile app, single screen. Style: Neo-Brutalism. High contrast, thick black outlines on buttons and cards, hard shadows (no blur), unrefined geometry, bold solid colors (yellow and black). Trendy streetwear aesthetic.',
  },
  {
    label: "Meditation",
    icon: "🧘",
    value:
      "Meditation player screen. Central focus is a soft, abstract breathing bubble animation. Play/Pause controls and a time slider below. Background is a soothing solid pastel sage green. Mobile app, single screen. Style: Soft Minimal. Rounded corners on everything, low contrast text for relaxation, pastel color palette, very little UI clutter. Zen, calming, and therapeutic atmosphere.",
  },
  {
    label: "Crypto Portfolio",
    icon: "📈",
    value:
      "Crypto portfolio dashboard. Top summary with total balance and 24h change. Asset list with coin icons, prices, % change chips (green/red), and mini sparklines. Tabs for Overview, Markets, Wallet. Mobile app, single screen. Style: Dark neon. Deep charcoal background with cyan/magenta accents, glassy cards, sleek data visuals.",
  },
  {
    label: "Smart Home",
    icon: "🏠",
    value:
      "Smart home control center. Rooms grid with large tiles showing temperature, lights, and security status. Quick actions row (Lock Doors, Turn Off Lights). Bottom navigation with Home, Scenes, Energy, Settings. Mobile app, single screen. Style: Cozy modern. Warm neutrals, rounded tiles, subtle shadows, simple icons.",
  },
  {
    label: "Music Player",
    icon: "🎧",
    value:
      "Music player now playing screen. Large album art, track title and artist, progress slider, playback controls (shuffle, previous, play/pause, next, repeat). Queue button. Mobile app, single screen. Style: Minimal vibrant. White background, bold typography, accent color matching album art.",
  },
  {
    label: "Course Library",
    icon: "📚",
    value:
      "E-learning course library. Search bar, category chips, vertical list of courses with thumbnail, title, duration, and progress bar. CTA to continue last course. Mobile app, single screen. Style: Clean academic. Off-white background, muted colors, structured card layout, clear hierarchy.",
  },
  {
    label: "News Reader",
    icon: "📰",
    value:
      "News home feed. Featured hero article with image and badge, list of headlines with source and time, topic filters (World, Tech, Sports). Save and share buttons. Mobile app, single screen. Style: Editorial modern. Serif headlines, sans-serif body, high contrast, ample whitespace.",
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
  const [negativeText] = useState<string>("");
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
          <div
            className="fixed inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: "radial-gradient(rgba(255, 0, 0, 0.07) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none blur-3xl"
            style={{ background: "linear-gradient(to bottom, rgba(255, 0, 0, 0.2), transparent)" }}
          ></div>
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-4 relative z-10">
            <div className="space-y-4">
              <h1 className="text-center text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Unlock your{" "}
                <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  Creative Flow
                </span>
              </h1>
              <div className="mx-auto max-w-2xl">
                <p className="text-muted-foreground text-center text-base sm:text-lg">
                  Generate stunning mobile interfaces in seconds with our AI explorer.
                </p>
              </div>
            </div>

            <div className="item-center relative z-50 flex w-full max-w-4xl flex-col gap-6">
              <div className="w-full px-5">
                <div className="flex flex-wrap justify-center gap-3">
                  {STYLE_PRESETS.map((p) => {
                    const colorClass =
                      p === "Futuristic"
                        ? "from-blue-400 to-blue-600"
                        : p === "Neo‑Brutalism"
                          ? "from-pink-400 to-pink-600"
                          : p === "Nature"
                            ? "from-emerald-400 to-emerald-600"
                            : p === "Playful"
                              ? "from-orange-400 to-orange-600"
                              : p === "Minimal"
                                ? "from-purple-400 to-purple-600"
                                : "from-yellow-400 to-yellow-600";
                    const borderColor =
                      p === "Futuristic"
                        ? "hover:border-blue-400/50"
                        : p === "Neo‑Brutalism"
                          ? "hover:border-pink-400/50"
                          : p === "Nature"
                            ? "hover:border-emerald-400/50"
                            : p === "Playful"
                              ? "hover:border-orange-400/50"
                              : p === "Minimal"
                                ? "hover:border-purple-400/50"
                                : "hover:border-yellow-400/50";
                    const active = stylePreset === p;
                    return (
                      <Button
                        key={p}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`hover:bg-card group relative h-auto gap-2 rounded-full border px-5 py-2 transition-all hover:-translate-y-1 hover:scale-105 ${
                          active ? "border-primary/50 bg-card" : "border-white/5 bg-card"
                        } ${borderColor}`}
                        onClick={() => setStylePreset(active ? undefined : p)}
                      >
                        <span
                          className={`size-2.5 rounded-full bg-gradient-to-tr shadow-sm ${colorClass}`}
                        />
                        <span className="text-sm font-bold text-gray-300 transition-colors group-hover:text-white">
                          {p}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="w-full">
                <div className="group relative mt-4">
                  <div className="bg-primary-dark via-primary to-primary-dark absolute -inset-0.5 rounded-[2.1rem] bg-gradient-to-r opacity-30 blur-xl transition duration-500 group-hover:opacity-60" />
                  <div className="border-border relative w-full rounded-[2rem] border border-white/10 bg-card p-2 shadow-2xl">
                    <PromptInput
                      className="border-0 bg-transparent ring-0 shadow-none"
                      promptText={promptText}
                      setPromptText={setPromptText}
                      isLoading={isPending}
                      onSubmit={handleSubmit}
                      placeholder="Describe your app idea here... e.g. 'A meditation tracker with forest sounds, using a calming green palette and rounded cards.'"
                      onEnhance={handleEnhance}
                      isEnhancing={isEnhancing}
                      bottomLeftAddon={
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Upload image"
                            className="rounded-xl bg-card border border-white/5 p-2.5 text-muted-foreground hover:text-white hover:border-primary/30 transition-all"
                          >
                            <ImageIcon className="size-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Voice input"
                            className="rounded-xl bg-card border border-white/5 p-2.5 text-muted-foreground hover:text-white hover:border-primary/30 transition-all"
                          >
                            <MicIcon className="size-5" />
                          </Button>
                          <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label="Open design options"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <SlidersHorizontal className="size-4" />
                                <span>Settings</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-3">
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex flex-col gap-1.5">
                                  <label
                                    htmlFor="total-screens-pop"
                                    className="text-xs font-medium"
                                  >
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
                                  <label
                                    htmlFor="paywall-toggle-pop"
                                    className="text-xs font-medium"
                                  >
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
                        </>
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="relative w-full px-5">
                <div className="pointer-events-none absolute top-1/2 -left-4 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="bg-background hover:bg-accent pointer-events-auto h-10 w-10 rounded-full border-2 shadow-md transition-all hover:scale-110"
                    onClick={() => handleScroll("left")}
                    aria-label="Previous suggestions"
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                </div>
                <div className="pointer-events-none absolute top-1/2 -right-4 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="bg-background hover:bg-accent pointer-events-auto h-10 w-10 rounded-full border-2 shadow-md transition-all hover:scale-110"
                    onClick={() => handleScroll("right")}
                    aria-label="Next suggestions"
                  >
                    <ChevronRight className="size-5" />
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
              <div className="bg-radial-primary absolute bottom-[calc(100%-300px)] left-1/2 h-500 w-500 -translate-x-1/2 opacity-20" />
              <div className="bg-primary/20 absolute -mt-2.5 size-full rounded-[50%] opacity-70 [box-shadow:0_-15px_24.8px_var(--primary)]" />
              <div className="bg-background absolute z-0 size-full rounded-[50%]" />
            </div>
          </div>
        </div>

        {userId && (
          <section className="w-full py-16" aria-label="Recent projects">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-primary" /> Recent Projects
                </h2>
                <InputGroup className="w-[260px] md:w-[320px]">
                  <InputGroupAddon aria-hidden="true">
                    <Search className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search recent projects"
                  />
                  {searchQuery && (
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        variant="ghost"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                      >
                        Clear
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>

              {isLoading ? (
                <div className="flex overflow-x-auto gap-6 pb-10 snap-x snap-mandatory px-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="snap-start shrink-0 w-[240px] md:w-[280px] flex flex-col overflow-hidden rounded-2xl border"
                    >
                      <div className="bg-background aspect-[9/14]">
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
                <div className="flex overflow-x-auto gap-6 pb-10 snap-x snap-mandatory px-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-card">
                  <div className="snap-start shrink-0 w-[240px] md:w-[280px]">
                    <div
                      role="button"
                      tabIndex={0}
                      className="aspect-[9/14] rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer group"
                      onClick={handleStartNewProject}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleStartNewProject();
                        }
                      }}
                      aria-label="Create new project"
                    >
                      <div className="h-16 w-16 rounded-full bg-card flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <FolderOpen className="text-3xl text-primary" />
                      </div>
                      <span className="font-bold text-white">New Project</span>
                    </div>
                  </div>
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
    <div className="snap-start shrink-0 w-[240px] md:w-[280px] group cursor-pointer">
      <div
        role="button"
        tabIndex={0}
        className="aspect-[9/14] rounded-2xl bg-card border border-white/5 overflow-hidden relative shadow-lg group-hover:shadow-glow-hover transition-all duration-300 transform group-hover:-translate-y-2"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Open project: ${project.name}`}
      >
        <div className="absolute inset-0">
          {project.thumbnail ? (
            <FallbackImage
              src={project.thumbnail}
              alt={`${project.name} thumbnail`}
              className="h-full w-full object-cover"
              fallbackType="folder"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="bg-primary/20 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                <FolderOpen aria-hidden="true" className="size-8" />
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <Button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            Open
          </Button>
        </div>
      </div>
      <div className="mt-4 px-1">
        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <time
          className="text-xs text-muted-foreground"
          dateTime={new Date(project.createdAt).toISOString()}
        >
          Edited {timeAgo}
        </time>
      </div>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default LandingSection;
