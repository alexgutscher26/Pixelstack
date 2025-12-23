/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { memo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import PromptInput from "@/components/prompt-input";
import Header from "./header";
import { useCreateProject, useGetProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Spinner } from "@/components/ui/spinner";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/navigation";
import { FolderOpenDotIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingSection = () => {
  const { user } = useKindeBrowserClient();
  const [promptText, setPromptText] = useState<string>("");
  const [totalScreens, setTotalScreens] = useState<number>(9);
  const [onboardingScreens, setOnboardingScreens] = useState<number>(1);
  const [includePaywall, setIncludePaywall] = useState<boolean>(false);
  const userId = user?.id;

  const { data: projects, isLoading, isError } = useGetProjects(userId);
  const { mutate, isPending } = useCreateProject();
  const carouselRef = useRef<HTMLDivElement>(null);

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
    <div className=" w-full min-h-screen">
      <div className="flex flex-col">
        <Header />

        <div className="relative overflow-hidden pt-28">
          <div
            className="max-w-6xl mx-auto flex flex-col
         items-center justify-center gap-8
        "
          >
            <div className="space-y-3">
              <h1
                className="text-center font-semibold text-4xl
            tracking-tight sm:text-5xl
            "
              >
                Design mobile apps <br className="md:hidden" />
                <span className="text-primary">in minutes</span>
              </h1>
              <div className="mx-auto max-w-2xl ">
                <p className="text-center font-medium text-foreground leading-relaxed sm:text-lg">
                  Go from idea to beautiful app mockups in minutes by chatting
                  with AI.
                </p>
              </div>
            </div>

            <div
              className="flex w-full max-w-3xl flex-col
            item-center gap-8 relative z-50
            "
            >
              <div className="w-full">
                <PromptInput
                  className="ring-2 ring-primary"
                  promptText={promptText}
                  setPromptText={setPromptText}
                  isLoading={isPending}
                  onSubmit={handleSubmit}
                />
              </div>
              <div className="w-full px-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Non-onboarding screens (incl. Home)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={totalScreens}
                      onChange={(e) =>
                        setTotalScreens(
                          Math.max(1, Math.min(10, Number(e.target.value)))
                        )
                      }
                      className="h-10 rounded-lg border bg-background px-3"
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
                        setOnboardingScreens(
                          Math.max(1, Math.min(5, Number(e.target.value)))
                        )
                      }
                      className="h-10 rounded-lg border bg-background px-3"
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
                <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 z-10">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="pointer-events-auto rounded-full bg-background/80 backdrop-blur border"
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
                <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 z-10">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="pointer-events-auto rounded-full bg-background/80 backdrop-blur border"
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
                      className="text-xs! h-8! px-3 pt-1.5!"
                      onClick={() => handleSuggestionClick(s.value)}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </Suggestion>
                  ))}
                </Suggestions>
              </div>
            </div>

            <div
              className="absolute -translate-x-1/2
             left-1/2 w-[5000px] h-[3000px] top-[80%]
             -z-10"
            >
              <div
                className="-translate-x-1/2 absolute
               bottom-[calc(100%-300px)] left-1/2
               h-[2000px] w-[2000px]
               opacity-20 bg-radial-primary"
              ></div>
              <div
                className="absolute -mt-2.5
              size-full rounded-[50%]
               bg-primary/20 opacity-70
               [box-shadow:0_-15px_24.8px_var(--primary)]"
              ></div>
              <div
                className="absolute z-0 size-full
               rounded-[50%] bg-background"
              ></div>
            </div>
          </div>
        </div>

        <div className="w-full py-10">
          <div className="mx-auto max-w-3xl">
            {userId && (
              <div>
                <h1
                  className="font-medium text-xl
              tracking-tight
              "
                >
                  Recent Projects
                </h1>

                {isLoading ? (
                  <div
                    className="flex items-center
                  justify-center py-2
                  "
                  >
                    <Spinner className="size-10" />
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2
                  md:grid-cols-3 gap-3 mt-3
                    "
                  >
                    {projects?.map((project: ProjectType) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
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
      className="w-full flex flex-col border rounded-xl cursor-pointer
    hover:shadow-md overflow-hidden
    "
      onClick={onRoute}
    >
      <div
        className="h-40 bg-[#eee] relative overflow-hidden
        flex items-center justify-center
        "
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            className="w-full h-full object-cover object-left
           scale-110
          "
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full bg-primary/20
              flex items-center justify-center text-primary
            "
          >
            <FolderOpenDotIcon />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col">
        <h3
          className="font-semibold
         text-sm truncate w-full mb-1 line-clamp-1"
        >
          {project.name}
        </h3>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default LandingSection;
