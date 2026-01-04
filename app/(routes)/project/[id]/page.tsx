"use client";

import { useGetProjectById } from "@/features/use-project-id";
import { useParams } from "next/navigation";
import Header from "./_common/header";
import Canvas from "@/components/canvas";
import { CanvasProvider } from "@/context/canvas-context";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const Page = () => {
  const params = useParams();
  const id = params.id as string;

  const { data: project, isPending } = useGetProjectById(id);
  // const frames = project?.frames || [];
  // const themeId = project?.theme || "";

  const hasInitialData = (project?.frames?.length ?? 0) > 0;

  if (!isPending && !project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="relative flex h-screen w-full flex-col">
      <Header
        projectName={project?.name}
        brandLogoUrl={project?.brandLogoUrl}
        brandPrimaryColor={project?.brandPrimaryColor}
        brandFontFamily={project?.brandFontFamily}
      />

      <CanvasProvider
        initialFrames={project?.frames ?? []}
        initialThemeId={project?.theme ?? undefined}
        hasInitialData={hasInitialData}
        projectId={project?.id ?? null}
        initialBrandKit={{
          logoUrl: project?.brandLogoUrl ?? undefined,
          primaryColor: project?.brandPrimaryColor ?? undefined,
          fontFamily: project?.brandFontFamily ?? undefined,
        }}
      >
        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1">
            <ErrorBoundary>
              <Canvas
                projectId={project?.id}
                projectName={project?.name}
                isPending={isPending}
                platform={project?.platform as "mobile" | "website" | undefined}
              />
            </ErrorBoundary>
          </div>
        </div>
      </CanvasProvider>
    </div>
  );
};

export default Page;
