/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { fetchRealtimeSubscriptionToken } from "@/app/action/realtime";
import { THEME_LIST, ThemeType } from "@/lib/themes";
import { FrameType } from "@/types/project";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { hexToRgb } from "@/lib/utils";

export type LoadingStatusType = "idle" | "running" | "analyzing" | "generating" | "completed";

interface CanvasContextType {
  theme?: ThemeType;
  setTheme: (id: string) => void;
  themes: ThemeType[];
  themeStyle?: string;
  brandKit?: {
    logoUrl?: string;
    primaryColor?: string;
    fontFamily?: string;
  };
  setBrandKit?: (kit: { logoUrl?: string; primaryColor?: string; fontFamily?: string }) => void;

  frames: FrameType[];
  setFrames: (frames: FrameType[]) => void;
  updateFrame: (id: string, data: Partial<FrameType>) => void;
  addFrame: (frame: FrameType) => void;

  selectedFrameId: string | null;
  selectedFrame: FrameType | null;
  setSelectedFrameId: (id: string | null) => void;

  loadingStatus: LoadingStatusType | null;
  setLoadingStatus: (status: LoadingStatusType | null) => void;

  backgroundType: "dots" | "grid" | "solid";
  setBackgroundType: (type: "dots" | "grid" | "solid") => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  wireframeMode: boolean;
  setWireframeMode: (enabled: boolean) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({
  children,
  initialFrames,
  initialThemeId,
  hasInitialData,
  projectId,
  initialBrandKit,
}: {
  children: ReactNode;
  initialFrames: FrameType[];
  initialThemeId?: string;
  hasInitialData: boolean;
  projectId: string | null;
  initialBrandKit?: {
    logoUrl?: string;
    primaryColor?: string;
    fontFamily?: string;
  };
}) => {
  const [themeId, setThemeId] = useState<string>(initialThemeId || THEME_LIST[0].id);

  const [frames, setFrames] = useState<FrameType[]>(initialFrames);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType | null>(null);

  const [backgroundType, setBackgroundType] = useState<"dots" | "grid" | "solid">("dots");
  const [backgroundColor, setBackgroundColor] = useState<string>("#7c5cff");
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);

  const [prevProjectId, setPrevProjectId] = useState(projectId);
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);
    setLoadingStatus(hasInitialData ? "idle" : "running");
    setFrames(initialFrames);
    setThemeId(initialThemeId || THEME_LIST[0].id);
    setSelectedFrameId(null);
    setBackgroundType("dots");
    setBackgroundColor("#7c5cff");
    setWireframeMode(false);
  }

  const theme = THEME_LIST.find((t) => t.id === themeId);
  const [brandKit, setBrandKit] = useState<{
    logoUrl?: string;
    primaryColor?: string;
    fontFamily?: string;
  }>(initialBrandKit || {});
  const brandCssOverride = (() => {
    let css = "";
    if (brandKit?.primaryColor) {
      const rgb = hexToRgb(brandKit.primaryColor);
      css += `--primary: ${brandKit.primaryColor};`;
      if (rgb) css += `--primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`;
    }
    if (brandKit?.fontFamily && brandKit.fontFamily.trim().length > 0) {
      const ff = brandKit.fontFamily.trim();
      css += `--font-sans: "${ff}";--font-heading: "${ff}";`;
    }
    return css ? `\n${css}\n` : "";
  })();
  const themeStyle = `${theme?.style || ""}${brandCssOverride}`;
  const selectedFrame =
    selectedFrameId && frames.length !== 0
      ? frames.find((f) => f.id === selectedFrameId) || null
      : null;

  //Update the LoadingState Inngest Realtime event
  const { freshData } = useInngestSubscription({
    refreshToken: fetchRealtimeSubscriptionToken,
  });

  useEffect(() => {
    if (!freshData || freshData.length === 0) return;

    freshData.forEach((message) => {
      const { data, topic } = message;

      if (data.projectId !== projectId) return;

      switch (topic) {
        case "generation.start":
          const status = data.status;
          setLoadingStatus(status);
          break;
        case "analysis.start":
          setLoadingStatus("analyzing");
        case "analysis.complete":
          setLoadingStatus("generating");
          if (data.theme) setThemeId(data.theme);

          if (data.screens && data.screens.length > 0) {
            const skeletonFrames: FrameType[] = data.screens.map((s: any) => ({
              id: s.id,
              title: s.name,
              htmlContent: "",
              isLoading: true,
            }));
            setFrames((prev) => [...prev, ...skeletonFrames]);
          }
          break;
        case "frame.created":
          if (data.frame) {
            setFrames((prev) => {
              const newFrames = [...prev];
              const idx = newFrames.findIndex((f) => f.id === data.screenId);
              if (idx !== -1) newFrames[idx] = data.frame;
              else newFrames.push(data.frame);
              return newFrames;
            });
          }
          break;
        case "generation.complete":
          setLoadingStatus("completed");
          setTimeout(() => {
            setLoadingStatus("idle");
          }, 100);
          break;
        default:
          break;
      }
    });
  }, [projectId, freshData]);

  const addFrame = useCallback((frame: FrameType) => {
    setFrames((prev) => [...prev, frame]);
  }, []);

  const updateFrame = useCallback((id: string, data: Partial<FrameType>) => {
    setFrames((prev) => {
      return prev.map((frame) => (frame.id === id ? { ...frame, ...data } : frame));
    });
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        theme,
        setTheme: setThemeId,
        themes: THEME_LIST,
        themeStyle,
        brandKit,
        setBrandKit,
        frames,
        setFrames,
        selectedFrameId,
        selectedFrame,
        setSelectedFrameId,
        updateFrame,
        addFrame,
        loadingStatus,
        setLoadingStatus,
        backgroundType,
        setBackgroundType,
        backgroundColor,
        setBackgroundColor,
        wireframeMode,
        setWireframeMode,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside CanvasProvider");
  return ctx;
};
