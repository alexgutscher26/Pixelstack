import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter: FileRouter = {
  imageUploader: f({ image: { maxFileCount: 1, maxFileSize: "4MB" } }).onUploadComplete(
    async ({ file }) => {
      return { url: file.url };
    }
  ),
};

export type OurFileRouter = typeof ourFileRouter;
