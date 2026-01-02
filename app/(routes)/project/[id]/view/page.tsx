 "use client";
 import React, { useEffect, useMemo, useState } from "react";
 import { useParams } from "next/navigation";
 import Header from "../_common/header";
 import { useGetProjectById } from "@/features/use-project-id";
 import { THEME_LIST } from "@/lib/themes";
 import { getHTMLWrapper } from "@/lib/frame-wrapper";
 import { Spinner } from "@/components/ui/spinner";
 import { FrameType } from "@/types/project";
 import { Button } from "@/components/ui/button";
 import Link from "next/link";
 import { X } from "lucide-react";
 
 const Page = () => {
   const params = useParams();
   const id = params.id as string;
   const { data: project, isPending } = useGetProjectById(id);
   const themeStyle = useMemo(() => {
     const t = THEME_LIST.find((x) => x.id === project?.theme);
     return t?.style;
   }, [project?.theme]);
 
   const [heights, setHeights] = useState<Record<string, number>>({});
 
   useEffect(() => {
     const onMessage = (event: MessageEvent) => {
       const d = event.data as { type?: string; frameId?: string; height?: number };
       if (d?.type === "FRAME_HEIGHT" && d.frameId) {
         setHeights((prev) => ({
           ...prev,
           [d.frameId!]: Math.max(700, Number(d.height || 0)),
         }));
       }
     };
     window.addEventListener("message", onMessage);
     return () => window.removeEventListener("message", onMessage);
   }, []);
 
   if (!isPending && !project) {
     return <div className="p-6">Project not found</div>;
   }
 
   const frames: FrameType[] = project?.frames || [];
 
  return (
    <div className="relative flex h-screen w-full flex-col">
      <Header projectName={project?.name} />

      <div className="hidden md:flex fixed top-20 right-4 z-40">
        <Link href={`/project/${id}`}>
          <Button variant="outline" size="sm" className="rounded-full">
            <X className="mr-1 size-4" />
            Close View Only
          </Button>
        </Link>
      </div>

      <div className="bg-background flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md px-4 py-4 md:max-w-lg">
          <div className="mb-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
               View Only
             </div>
           </div>
 
           {isPending ? (
             <div className="flex items-center justify-center py-10">
               <Spinner />
             </div>
           ) : frames.length === 0 ? (
             <div className="text-muted-foreground py-10 text-center text-sm">
               No frames to preview
             </div>
           ) : (
             <div className="flex flex-col gap-6">
               {frames.map((f: FrameType) => {
                 const fullHtml = getHTMLWrapper(f.htmlContent, f.title, themeStyle, f.id);
                 const h = heights[f.id] || 800;
                 return (
                   <div
                     key={f.id}
                     className="rounded-[28px] border shadow-sm"
                     style={{ overflow: "hidden" }}
                   >
                     <iframe
                       title={f.title}
                       srcDoc={fullHtml}
                       sandbox="allow-scripts allow-same-origin"
                       style={{
                         width: "100%",
                         height: `${h}px`,
                         border: "none",
                         display: "block",
                         background: "transparent",
                       }}
                     />
                   </div>
                 );
               })}
             </div>
           )}
         </div>
       </div>
     </div>
   );
 };
 
 export default Page;
