import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dibz | نجات غذای خوب",
    short_name: "Dibz",
    description: "جعبه‌های غافلگیرکنندهٔ غذای سالمِ فروش‌نرفته با قیمت کمتر و دریافت حضوری.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F4F8F3",
    theme_color: "#14532D",
    dir: "rtl",
    lang: "fa",
    icons: [
      { src: "/dibz-logo.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
      { src: "/dibz-logo.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      { name: "کشف جعبه‌ها", short_name: "کشف", url: "/customer/offers", icons: [{ src: "/dibz-logo.png", sizes: "1024x1024" }] },
      { name: "رزروهای من", short_name: "رزروها", url: "/customer/orders", icons: [{ src: "/dibz-logo.png", sizes: "1024x1024" }] },
      { name: "پنل کسب‌وکار", short_name: "کسب‌وکار", url: "/business", icons: [{ src: "/dibz-logo.png", sizes: "1024x1024" }] }
    ]
  };
}
