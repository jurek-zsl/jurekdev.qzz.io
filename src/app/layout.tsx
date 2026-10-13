import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSiteData } from "@/lib/store-server";
import { getLightModeAccent, getContrastTextColor } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jurekdev.qzz.io"),
  title: {
    default: "Jurek · Distributed Systems & Engineering",
    template: "%s | Jurek",
  },
  description:
    "Personal engineering portfolio and technical blog of Jurek. Designing distributed Raft storage, Linux kernel I/O engines, and tactile modern web applications.",
  keywords: [
    "Jurek",
    "Distributed Systems",
    "Go",
    "Golang",
    "Raft Consensus",
    "Linux",
    "io_uring",
    "Next.js 15",
    "TypeScript",
    "Portfolio",
    "Software Engineer",
  ],
  authors: [{ name: "Jurek", url: "https://github.com/jurek-zsl" }],
  creator: "Jurek",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jurekdev.qzz.io",
    title: "Jurek · Distributed Systems & Modern Web Craft",
    description:
      "Personal engineering portfolio and technical blog of Jurek. Designing distributed Raft storage, Linux kernel I/O engines, and tactile modern web applications.",
    siteName: "jurekdev.qzz.io",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jurek · Distributed Systems & Modern Web Craft",
    description:
      "Personal engineering portfolio and technical blog of Jurek. Designing distributed Raft storage, Linux kernel I/O engines, and tactile modern web applications.",
  },
  alternates: {
    canonical: "https://jurekdev.qzz.io",
    types: {
      "application/rss+xml": "https://jurekdev.qzz.io/feed.xml",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = getSiteData();
  const accentColor = profile?.accentColor || "#38bdf8";
  const lightAccent = getLightModeAccent(accentColor);
  const contrastText = getContrastTextColor(lightAccent);

  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full dark`}
      style={
        {
          "--accent": accentColor,
          "--accent-light": lightAccent,
          "--accent-contrast": contrastText,
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                // Clear any legacy client-side accent overrides so all users
                // strictly inherit the site author's canonical server accent color
                localStorage.removeItem("theme_accent");

                var savedMode = localStorage.getItem("theme_mode");
                if (savedMode === "light") {
                  document.documentElement.classList.remove("dark");
                  document.documentElement.classList.add("light");
                } else {
                  document.documentElement.classList.add("dark");
                  document.documentElement.classList.remove("light");
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#000000] text-[#e5e5e5] font-mono antialiased relative">
        <SmoothScrollProvider>
          <Navbar />
          <main className="flex-1 mx-auto max-w-5xl px-3 sm:px-6 w-full">
            {children}
          </main>
          <Footer />
          <ToasterProvider />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
