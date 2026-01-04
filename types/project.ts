export type ProjectType = {
  id: string;
  name: string;
  platform?: "mobile" | "website";
  theme: string;
  thumbnail?: string;
  brandLogoUrl?: string;
  brandPrimaryColor?: string;
  brandFontFamily?: string;
  frames: FrameType[];
  createdAt: Date;
  updatedAt?: Date;
};

export type FrameType = {
  id: string;
  title: string;
  htmlContent: string;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  isLoading?: boolean;
  lockedPaths?: string[];
};
