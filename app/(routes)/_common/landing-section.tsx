/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import { memo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import PromptInput from "@/components/prompt-input";
import Header from "./header";
import { useCreateProject, useGetProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/navigation";
import { FolderOpenDotIcon, ChevronLeft, ChevronRight, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Input } from "@/components/ui/input";
import NoProjectsIllustration from "@/components/illustrations/no-projects-illustration";

const LandingSection = () => {
  const { user } = useKindeBrowserClient();
  const [promptText, setPromptText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalScreens, setTotalScreens] = useState<number>(9);
  const [onboardingScreens, setOnboardingScreens] = useState<number>(1);
  const [includePaywall, setIncludePaywall] = useState<boolean>(false);
  const userId = user?.id;

  const { data: projects, isLoading, isError } = useGetProjects(userId);
  const { mutate, isPending } = useCreateProject();
  const carouselRef = useRef<HTMLDivElement>(null);

  const filteredProjects = projects?.filter((project: { name: string }) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestions = [
    {
      label: "Finance Tracker",
      icon: "💸",
      value: `Finance app statistics screen. Current balance at top with dollar amount, bar chart showing spending over months (Oct-Mar) with month selector pills below, transaction list with app icons, amounts, and categories. Bottom navigation bar. Mobile app, single screen. Style: Dark theme, chunky rounded cards, playful but professional, modern sans-serif typography, Gen Z fintech vibe. Fun and fresh, not corporate.`,
    },
    {
      label: "Fitness Activity",
      icon: "🔥",
      value: `Fitness tracker summary screen. Large central circular progress ring showing steps and calories with neon glow. Line graph showing heart rate over time. Bottom section with grid of health metrics (Sleep, Water, SpO2). Mobile app, single screen. Style: Deep Dark Mode (OLED friendly). Pitch black background with electric neon green and vibrant blue accents. High contrast, data-heavy but organized, sleek and sporty aesthetic.`,
    },
    {
      label: "Food Delivery",
      icon: "🍔",
      value: `Food delivery home feed. Top search bar with location pin. Horizontal scrolling hero carousel of daily deals. Vertical list of restaurants with large delicious food thumbnails, delivery time badges, and rating stars. Floating Action Button (FAB) for cart. Mobile app, single screen. Style: Vibrant and Appetizing. Warm colors (orange, red, yellow), rounded card corners, subtle drop shadows to create depth. Friendly and inviting UI.`,
    },
    {
      label: "Travel Booking",
      icon: "✈️",
      value: `Travel destination detail screen. Full-screen immersive photography of a tropical beach. Bottom sheet overlay with rounded top corners containing hotel title, star rating, price per night, and a large "Book Now" button. Horizontal scroll of amenity icons. Mobile app, single screen. Style: Minimalist Luxury. ample whitespace, elegant serif typography for headings, clean sans-serif for body text. Sophisticated, airy, high-end travel vibe.`,
    },
    {
      label: "E-Commerce",
      icon: "👟",
      value: `Sneaker product page. Large high-quality product image on a light gray background. Color selector swatches, size selector grid, and a sticky "Add to Cart" button at the bottom. Title and price in bold, oversized typography. Mobile app, single screen. Style: Neo-Brutalism. High contrast, thick black outlines on buttons and cards, hard shadows (no blur), unrefined geometry, bold solid colors (yellow and black). Trendy streetwear aesthetic.`,
    },
    {
      label: "Meditation",
      icon: "🧘",
      value: `Meditation player screen. Central focus is a soft, abstract breathing bubble animation. Play/Pause controls and a time slider below. Background is a soothing solid pastel sage green. Mobile app, single screen. Style: Soft Minimal. Rounded corners on everything, low contrast text for relaxation, pastel color palette, very little UI clutter. Zen, calming, and therapeutic atmosphere.`,
    },
    {
      label: "Crypto Portfolio",
      icon: "📈",
      value: `Crypto portfolio dashboard. Top summary with total balance and 24h change. Asset list with coin icons, prices, % change chips (green/red), and mini sparklines. Tabs for Overview, Markets, Wallet. Mobile app, single screen. Style: Dark neon. Deep charcoal background with cyan/magenta accents, glassy cards, sleek data visuals.`,
    },
    {
      label: "Smart Home",
      icon: "🏠",
      value: `Smart home control center. Rooms grid with large tiles showing temperature, lights, and security status. Quick actions row (Lock Doors, Turn Off Lights). Bottom navigation with Home, Scenes, Energy, Settings. Mobile app, single screen. Style: Cozy modern. Warm neutrals, rounded tiles, subtle shadows, simple icons.`,
    },
    {
      label: "Music Player",
      icon: "🎧",
      value: `Music player now playing screen. Large album art, track title and artist, progress slider, playback controls (shuffle, previous, play/pause, next, repeat). Queue button. Mobile app, single screen. Style: Minimal vibrant. White background, bold typography, accent color matching album art.`,
    },
    {
      label: "Course Library",
      icon: "📚",
      value: `E-learning course library. Search bar, category chips, vertical list of courses with thumbnail, title, duration, and progress bar. CTA to continue last course. Mobile app, single screen. Style: Clean academic. Off-white background, muted colors, structured card layout, clear hierarchy.`,
    },
    {
      label: "News Reader",
      icon: "📰",
      value: `News home feed. Featured hero article with image and badge, list of headlines with source and time, topic filters (World, Tech, Sports). Save and share buttons. Mobile app, single screen. Style: Editorial modern. Serif headlines, sans-serif body, high contrast, ample whitespace.`,
    },
  ];

  const handleSuggestionClick = (val: string) => {
    setPromptText(val);
  };

  const handleSubmit = () => {
    if (!promptText) return;
    mutate({
      prompt: promptText,
      totalScreens,
      onboardingScreens,
      includePaywall,
    });
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-col">
        <Header />

        <div className="relative overflow-hidden pt-28">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8">
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
              <div className="w-full">
                <PromptInput
                  className="ring-primary ring-2"
                  promptText={promptText}
                  setPromptText={setPromptText}
                  isLoading={isPending}
                  onSubmit={handleSubmit}
                />
              </div>
              <div className="w-full px-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Non-onboarding screens (incl. Home)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={totalScreens}
                      onChange={(e) =>
                        setTotalScreens(Math.max(1, Math.min(10, Number(e.target.value))))
                      }
                      className="bg-background h-10 rounded-lg border px-3"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Onboarding screens</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={onboardingScreens}
                      onChange={(e) =>
                        setOnboardingScreens(Math.max(1, Math.min(5, Number(e.target.value))))
                      }
                      className="bg-background h-10 rounded-lg border px-3"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Include paywall</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`h-10 flex-1 rounded-lg border px-3 ${
                          includePaywall ? "bg-primary text-primary-foreground" : "bg-background"
                        }`}
                        onClick={() => setIncludePaywall((v) => !v)}
                      >
                        {includePaywall ? "Yes" : "No"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative w-full px-5">
                <div className="pointer-events-none absolute top-1/2 left-0 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="bg-background/80 pointer-events-auto rounded-full border backdrop-blur"
                    onClick={() => {
                      const viewport = carouselRef.current?.querySelector(
                        '[data-slot="scroll-area-viewport"]'
                      ) as HTMLDivElement | null;
                      viewport?.scrollBy({ left: -320, behavior: "smooth" });
                    }}
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
                    className="bg-background/80 pointer-events-auto rounded-full border backdrop-blur"
                    onClick={() => {
                      const viewport = carouselRef.current?.querySelector(
                        '[data-slot="scroll-area-viewport"]'
                      ) as HTMLDivElement | null;
                      viewport?.scrollBy({ left: 320, behavior: "smooth" });
                    }}
                    aria-label="Next suggestions"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <Suggestions ref={carouselRef} className="py-1">
                  {suggestions.map((s) => (
                    <Suggestion
                      key={s.label}
                      suggestion={s.label}
                      className="!h-8 px-3 !pt-1.5 !text-xs"
                      onClick={() => handleSuggestionClick(s.value)}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </Suggestion>
                  ))}
                </Suggestions>
              </div>
            </div>

            <div className="absolute top-[80%] left-1/2 -z-10 h-[3000px] w-[5000px] -translate-x-1/2">
              <div className="bg-radial-primary absolute bottom-[calc(100%-300px)] left-1/2 h-500 w-500 -translate-x-1/2 opacity-20"></div>
              <div className="bg-primary/20 absolute -mt-2.5 size-full rounded-[50%] opacity-70 [box-shadow:0_-15px_24.8px_var(--primary)]"></div>
              <div className="bg-background absolute z-0 size-full rounded-[50%]"></div>
            </div>
          </div>
        </div>

        <div className="w-full py-10">
          <div className="mx-auto max-w-3xl">
            {userId && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h1 className="text-xl font-medium tracking-tight">Recent Projects</h1>
                  <div className="relative w-full max-w-xs">
                    <SearchIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex w-full flex-col overflow-hidden rounded-xl border"
                      >
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
                ) : filteredProjects && filteredProjects.length > 0 ? (
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
                      <NoProjectsIllustration className="h-28 w-28 text-primary" />
                    </div>
                    <div className="space-y-1 text-center">
                      <h2 className="text-lg font-semibold tracking-tight">No projects yet</h2>
                      <p className="text-muted-foreground text-sm">
                        Kickstart your first design by using a suggested prompt.
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="px-6"
                      onClick={() => {
                        const starter =
                          suggestions[0]?.value ?? "Create a modern mobile app home screen";
                        mutate({
                          prompt: starter,
                          totalScreens,
                          onboardingScreens,
                          includePaywall,
                        });
                      }}
                    >
                      Start a new project
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isError && <p className="text-red-500">Failed to load projects</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = memo(({ project }: { project: ProjectType }) => {
  const router = useRouter();
  const createdAtDate = new Date(project.createdAt);
  const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
  const thumbnail = project.thumbnail || null;

  const onRoute = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    <div
      role="button"
      className="flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border hover:shadow-md"
      onClick={onRoute}
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#eee]">
        {thumbnail ? (
          <FallbackImage
            src={thumbnail}
            alt={project.name}
            className="h-full w-full scale-110 object-cover object-left"
            fallbackType="folder"
          />
        ) : (
          <div className="bg-primary/20 text-primary flex h-16 w-16 items-center justify-center rounded-full">
            <FolderOpenDotIcon />
          </div>
        )}
      </div>

      <div className="flex flex-col p-4">
        <h3 className="mb-1 line-clamp-1 w-full truncate text-sm font-semibold">{project.name}</h3>
        <p className="text-muted-foreground text-xs">{timeAgo}</p>
      </div>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default LandingSection;
