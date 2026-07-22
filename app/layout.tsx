import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

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
    title: "مفت",
    statusBarStyle: "black-translucent"
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
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#101814" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
