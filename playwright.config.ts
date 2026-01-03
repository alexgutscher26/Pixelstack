import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "__checks__",
  timeout: 30000,
  use: {
    baseURL:
      process.env.BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.danube-web.shop",
    viewport: { width: 1280, height: 720 },
  },
});
