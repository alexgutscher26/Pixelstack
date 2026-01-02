import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MobileBlocker } from "@/components/mobile-blocker";
import { QueryProvider } from "@/context/query-provider";
import { SessionProvider } from "@/context/session-provider";

const jostSans = Jost({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Flowkit – AI Mobile Design Agent",
    template: "%s | Flowkit",
  },
  description:
    "Design beautiful mobile app screens in minutes. Generate, theme, and export PNG/HTML with an AI design agent.",
  applicationName: "Flowkit",
  keywords: ["AI design", "mobile UI", "mockups", "Tailwind CSS", "Next.js", "design agent"],
  authors: [{ name: "Flowkit" }],
  creator: "Flowkit",
  publisher: "Flowkit",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Flowkit – AI Mobile Design Agent",
    siteName: "Flowkit",
    description:
      "Generate polished mobile designs fast. Explore themes, export assets, and iterate with AI.",
    images: [
      {
        url: "/next.svg",
        width: 1200,
        height: 630,
        alt: "Flowkit preview",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowkit – AI Mobile Design Agent",
    description: "Create mobile app designs in minutes using AI. Theme, preview, export.",
    images: ["/next.svg"],
    creator: "@snackforcode",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jostSans.className} antialiased`}>
        <QueryProvider>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <MobileBlocker />
              <Toaster richColors position="bottom-right" />
            </ThemeProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
