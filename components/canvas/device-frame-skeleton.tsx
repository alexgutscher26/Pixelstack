import React, { CSSProperties } from "react";
import { Skeleton } from "../ui/skeleton";

type PropsType = {
  style: CSSProperties;
  platform?: "mobile" | "website";
};
const DeviceFrameSkeleton = ({ style, platform = "mobile" }: PropsType) => {
  if (platform === "website") {
    return (
      <div
        className="absolute origin-center overflow-hidden shadow-sm ring"
        style={{
          background: "#fff",
          ...style,
        }}
      >
        {/* Website Header */}
        <div className="flex items-center justify-between border-b p-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        {/* Hero Section */}
        <div className="space-y-4 p-8">
          <Skeleton className="h-12 w-2/3 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <div className="flex gap-3 justify-center mt-6">
            <Skeleton className="h-11 w-32 rounded-md" />
            <Skeleton className="h-11 w-32 rounded-md" />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-4 p-8">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute origin-center overflow-hidden shadow-sm ring"
      style={{
        background: "#fff",
        ...style,
      }}
    >
      <div className="flex items-center gap-2 border-b p-3">
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />

        <Skeleton className="h-48 w-full rounded-xl" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
};

export default DeviceFrameSkeleton;
