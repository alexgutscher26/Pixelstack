import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  className?: string;
};

const NoProjectsIllustration = ({ className }: Props) => {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="64" fill="currentColor" opacity="0.10" />
      <circle cx="80" cy="80" r="52" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.18" />
      <g transform="translate(0,2)">
        <rect
          x="38"
          y="74"
          width="84"
          height="52"
          rx="12"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="2"
        />
        <path
          d="M40 70h40a8 8 0 0 1 8 8v6H40a8 8 0 0 1 -8 -8v-2a4 4 0 0 1 4 -4z"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="2"
        />
        <rect
          x="48"
          y="88"
          width="64"
          height="28"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.35"
        />
        <path d="M52 96h28" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M52 102h44" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path
          d="M48 84h60"
          stroke="var(--muted-foreground)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 6"
          opacity="0.5"
        />
      </g>
      <g>
        <path d="M116 50v10M111 55h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 112v8M46 116h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        <circle cx="120" cy="116" r="3.5" fill="currentColor" opacity="0.75" />
        <circle cx="44" cy="50" r="3" fill="currentColor" opacity="0.55" />
      </g>
    </svg>
  );
};

export default NoProjectsIllustration;
