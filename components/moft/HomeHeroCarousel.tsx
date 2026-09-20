"use client";

import { useCallback, useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";

const slides = [
  {
    title: "امشب خوش‌طعم‌تر انتخاب کن",
    text: "جعبه‌های امروزِ نزدیکت را با قیمت بهتر رزرو کن و در زمان مشخص تحویل بگیر.",
    image: "/images/products/dibz-dessert-box-cutout.png",
    action: "دیدن گزینه‌های نزدیک",
  },
  {
    title: "یک قرار خوش‌مزه نزدیک تو",
    text: "کافه‌ها و فروشگاه‌های محله، جعبه‌های روزشان را برای دریافت حضوری آماده کرده‌اند.",
    image: "/images/products/dibz-persian-meal-cutout.png",
    action: "کشف فروشگاه‌ها",
  },
  {
    title: "جعبهٔ غافلگیرکننده، انتخاب آسان",
    text: "قیمت، بازهٔ دریافت و اطلاعات آلرژی را شفاف ببین؛ باقی‌اش را به یک سورپرایز خوش‌طعم بسپار.",
    image: "/images/products/dibz-pizza-cutout.png",
    action: "شروع کن",
  },
];

export function HomeHeroCarousel({ onDiscover }: { onDiscover: () => void }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const sync = useCallback((nextApi: CarouselApi) => {
    if (nextApi) setSelected(nextApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", sync);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = reducedMotion ? undefined : window.setInterval(() => api.scrollNext(), 6200);
    return () => {
      api.off("select", sync);
      if (timer) window.clearInterval(timer);
    };
  }, [api, sync]);

  return (
    <div className="space-y-2">
      <Carousel setApi={setApi} opts={{ direction: "rtl", loop: true }} className="w-full" aria-label="پیشنهادهای ویژهٔ دیبز">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.title} aria-label={`${index + 1} از ${slides.length}`}>
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-5 sm:p-6 shadow-sm min-h-[160px] flex items-center justify-between gap-4">
                <div className="space-y-2 z-10 max-w-[65%]">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">دیبز برای امروز</p>
                  <h1 className="text-base sm:text-lg font-black leading-snug">{slide.title}</h1>
                  <p className="text-xs text-emerald-100/80 line-clamp-2 leading-relaxed">{slide.text}</p>
                  <button
                    type="button"
                    onClick={onDiscover}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shadow-xs"
                  >
                    <span>{slide.action}</span>
                    <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
                <div className="relative w-28 h-28 shrink-0">
                  <FoodImage
                    src={slide.image}
                    sizes="120px"
                    className="w-full h-full object-contain drop-shadow-md"
                    priority={index === 0}
                    loading="eager"
                  />
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="اسلایدهای پیشنهاد ویژه">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            role="tab"
            aria-label={`نمایش اسلاید ${index + 1}`}
            aria-selected={selected === index}
            className={`h-1.5 rounded-full transition-all ${selected === index ? "w-6 bg-brand-2" : "w-1.5 bg-line hover:bg-muted"}`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
