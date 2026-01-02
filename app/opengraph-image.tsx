 import { ImageResponse } from "next/og";
 import { messages } from "@/constant/messages";
 
 export const size = {
   width: 1200,
   height: 630,
 };
 
 export const contentType = "image/png";
 
 export default function OpengraphImage() {
   return new ImageResponse(
     (
       <div
         style={{
           width: "100%",
           height: "100%",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           background:
             "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)",
           padding: 48,
         }}
       >
         <div
           style={{
             width: "100%",
             height: "100%",
             display: "flex",
             flexDirection: "column",
             justifyContent: "space-between",
             borderRadius: 32,
             padding: 48,
             background:
               "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
             boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
           }}
         >
           <div
             style={{
               fontSize: 72,
               fontWeight: 800,
               lineHeight: 1.1,
               color: "#ffffff",
               textShadow: "0 8px 24px rgba(0,0,0,0.35)",
             }}
           >
             Flowkit – AI Mobile Design Agent
           </div>
           <div
             style={{
               fontSize: 32,
               fontWeight: 500,
               color: "#f8fafc",
               maxWidth: 980,
               textShadow: "0 4px 16px rgba(0,0,0,0.35)",
             }}
           >
             {messages.layout.description}
           </div>
           <div
             style={{
               display: "flex",
               alignItems: "center",
               gap: 16,
               color: "#ffffff",
               fontSize: 24,
               fontWeight: 600,
             }}
           >
             <div
               style={{
                 width: 40,
                 height: 40,
                 borderRadius: 10,
                 background: "#ffffff",
               }}
             />
             Flowkit
           </div>
         </div>
       </div>
     ),
     {
       ...size,
     }
   );
 }
