import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { DemoProvider } from "@/demo/DemoProvider";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import "./unified.css";

export const metadata: Metadata = {
  title: {
    default: "Dibz | غذای خوب، قبل از دورریز",
    template: "%s | Dibz"
  },
  description: "جعبه‌های غافلگیرکنندهٔ غذای سالمِ فروش‌نرفته با قیمت کمتر و دریافت حضوری.",
  applicationName: "Dibz",
  category: "food",
  keywords: ["کاهش دورریز غذا", "جعبه سورپرایزی", "دریافت حضوری", "Dibz"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Dibz"
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/dibz-logo.png", sizes: "1024x1024", type: "image/png" }
    ],
    apple: [{ url: "/dibz-logo.png", sizes: "1024x1024", type: "image/png" }]
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
    const saved = localStorage.getItem("moft-theme-v2");
    const resolved = saved === "dark" ? "dark" : "light";
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    const themeMeta = document.getElementById("theme-color");
    const statusMeta = document.getElementById("apple-status-bar-style");
    if (themeMeta) themeMeta.setAttribute("content", resolved === "dark" ? "#151816" : "#F4F8F3");
    if (statusMeta) statusMeta.setAttribute("content", resolved === "dark" ? "black-translucent" : "default");
  } catch {
    const resolved = "light";
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
