"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
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
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-4 sm:p-5 shadow-sm h-[160px] sm:h-[170px] max-h-[170px] flex items-center justify-between gap-3">
                <div className="space-y-1.5 z-10 max-w-[65%] flex flex-col justify-center min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">دیبز برای امروز</p>
                  <h1 className="text-sm sm:text-base font-black leading-snug">{slide.title}</h1>
                  <p className="text-[11px] sm:text-xs text-emerald-100/80 line-clamp-2 leading-relaxed">{slide.text}</p>
                  <button
                    type="button"
                    onClick={onDiscover}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shadow-xs w-fit mt-1 cursor-pointer active:scale-95"
                  >
                    <span>{slide.action}</span>
                    <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 relative flex items-center justify-center overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={112}
                    height={112}
                    className="w-full h-full max-w-[112px] max-h-[112px] object-contain drop-shadow-md select-none pointer-events-none"
                    priority={index === 0}
                  />
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex items-center justify-center gap-1" role="tablist" aria-label="اسلایدهای پیشنهاد ویژه">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            role="tab"
            aria-label={`نمایش اسلاید ${index + 1}`}
            aria-selected={selected === index}
            className="h-8 px-1.5 flex items-center cursor-pointer"
            onClick={() => api?.scrollTo(index)}
          >
            <span
              className={`h-1.5 rounded-full transition-all ${
                selected === index ? "w-6 bg-brand-2" : "w-1.5 bg-line hover:bg-muted"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
