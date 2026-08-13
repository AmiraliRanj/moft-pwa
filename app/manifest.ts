import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dibz! | دیبز!",
    short_name: "Dibz! | دیبز!",
    description: "جعبه‌های غافلگیرکنندهٔ غذای سالمِ فروش‌نرفته با قیمت کمتر و دریافت حضوری.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#14532D",
    theme_color: "#14532D",
    dir: "rtl",
    lang: "fa",
    icons: [
      { src: "/icons/dibz-home-icon-180-v3.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/icons/dibz-home-icon-192-v3.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/dibz-home-icon-512-v3.png", sizes: "512x512", type: "image/png", purpose: "any" }
    ],
    shortcuts: [
      { name: "کشف جعبه‌ها", short_name: "کشف", url: "/customer/offers", icons: [{ src: "/icons/dibz-home-icon-192-v3.png", sizes: "192x192", type: "image/png" }] },
      { name: "رزروهای من", short_name: "رزروها", url: "/customer/orders", icons: [{ src: "/icons/dibz-home-icon-192-v3.png", sizes: "192x192", type: "image/png" }] },
      { name: "پنل کسب‌وکار", short_name: "کسب‌وکار", url: "/business", icons: [{ src: "/icons/dibz-home-icon-192-v3.png", sizes: "192x192", type: "image/png" }] }
    ]
  };
}
