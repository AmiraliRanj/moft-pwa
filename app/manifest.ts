import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مفت | نجات غذای خوب",
    short_name: "مفت",
    description: "جعبه‌های غافلگیرکنندهٔ غذای سالمِ فروش‌نرفته با قیمت کمتر و دریافت حضوری.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F4F8F3",
    theme_color: "#14532D",
    dir: "rtl",
    lang: "fa",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      { name: "کشف جعبه‌ها", short_name: "کشف", url: "/customer/offers", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "رزروهای من", short_name: "رزروها", url: "/customer/orders", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "پنل کسب‌وکار", short_name: "کسب‌وکار", url: "/business", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] }
    ]
  };
}
