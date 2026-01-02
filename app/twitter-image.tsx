import { ImageResponse } from "next/og";
import { messages } from "@/constant/messages";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0ea5e9 100%)",
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
          background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            fontSize: 68,
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
            fontSize: 30,
            fontWeight: 500,
            color: "#e5e7eb",
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
            color: "#93c5fd",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Flowkit
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
