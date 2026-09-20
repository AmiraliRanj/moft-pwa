import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dibz!",
    short_name: "Dibz!",
    description: "جعبه‌های غافلگیرکنندهٔ غذای سالم برای دریافت حضوری در بازهٔ مشخص.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#14532D",
    theme_color: "#14532D",
    dir: "rtl",
    lang: "fa",
    icons: [
      { src: "/icons/dibz-ios-default-180-v2.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/icons/dibz-ios-default-192-v2.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/dibz-ios-default-512-v2.png", sizes: "512x512", type: "image/png", purpose: "any" }
    ],
    shortcuts: [
      { name: "کشف جعبه‌ها", short_name: "کشف", url: "/customer/offers", icons: [{ src: "/icons/dibz-ios-default-192-v2.png", sizes: "192x192", type: "image/png" }] },
      { name: "رزروهای من", short_name: "رزروها", url: "/customer/orders", icons: [{ src: "/icons/dibz-ios-default-192-v2.png", sizes: "192x192", type: "image/png" }] }
      // [BUSINESS SHORTCUT TEMPORARILY COMMENTED - SEPARATE APP - DO NOT DELETE]
      // { name: "پنل کسب‌وکار", short_name: "کسب‌وکار", url: "/business", icons: [{ src: "/icons/dibz-ios-default-192-v2.png", sizes: "192x192", type: "image/png" }] }
    ]
  };
}
