import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { DemoProvider } from "@/demo/DemoProvider";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import "./unified.css";

export const metadata: Metadata = {
  title: {
    default: "مفت | غذای خوب، قبل از دورریز",
    template: "%s | مفت"
  },
  description: "جعبه‌های غافلگیرکنندهٔ غذای سالمِ فروش‌نرفته با قیمت کمتر و دریافت حضوری؛ نسخهٔ نمایشی دانشگاهی.",
  applicationName: "مفت",
  category: "food",
  keywords: ["کاهش دورریز غذا", "جعبه سورپرایزی", "دریافت حضوری", "مفت"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "مفت"
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

const themeBootScript = `
(() => {
  const root = document.documentElement;
  try {
    const preference = localStorage.getItem("moft-theme-v2") || "system";
    const hour = new Date().getHours();
    const automatic = hour >= 7 && hour < 19 ? "light" : "dark";
    const resolved = preference === "system" ? automatic : preference;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    const themeMeta = document.getElementById("theme-color");
    const statusMeta = document.getElementById("apple-status-bar-style");
    if (themeMeta) themeMeta.setAttribute("content", resolved === "dark" ? "#151816" : "#F4F8F3");
    if (statusMeta) statusMeta.setAttribute("content", resolved === "dark" ? "black-translucent" : "default");
  } catch {
    const resolved = new Date().getHours() >= 7 && new Date().getHours() < 19 ? "light" : "dark";
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta id="theme-color" name="theme-color" content="#F4F8F3" />
        <meta id="apple-status-bar-style" name="apple-mobile-web-app-status-bar-style" content="default" />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <DemoProvider>{children}</DemoProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
