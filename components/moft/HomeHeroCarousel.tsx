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
              <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#F87F45] via-[#EE7235] to-[#D96025] text-white p-3.5 sm:p-5 md:p-6 lg:p-8 shadow-sm h-[130px] sm:h-[145px] md:h-[185px] lg:h-[210px] flex items-center justify-between gap-4">
                <div className="space-y-1.5 md:space-y-2.5 z-10 max-w-[68%] flex flex-col justify-center min-w-0">
                  <p className="text-[9px] sm:text-[10px] md:text-xs uppercase font-bold tracking-wider text-orange-100">دیبز برای امروز</p>
                  <h1 className="text-xs sm:text-base md:text-xl lg:text-2xl font-black leading-tight truncate font-morabba">{slide.title}</h1>
                  <p className="text-[10px] sm:text-xs md:text-sm text-white/90 line-clamp-1 md:line-clamp-2 leading-normal">{slide.text}</p>
                  <button
                    type="button"
                    onClick={onDiscover}
                    className="inline-flex items-center gap-1.5 min-h-[36px] md:min-h-[42px] px-3 md:px-5 py-1 md:py-2 text-[11px] md:text-xs font-black rounded-xl bg-white text-[#D96025] hover:bg-[#FFF2EB] transition-colors shadow-2xs w-fit cursor-pointer active:scale-95 mt-0.5"
                  >
                    <span>{slide.action}</span>
                    <Icon name="arrow" className="w-3 md:w-3.5 h-3 md:h-3.5 rtl:rotate-180" />
                  </button>
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 lg:w-44 lg:h-44 shrink-0 relative flex items-center justify-center overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={180}
                    height={180}
                    className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
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
            className="h-5 px-1 flex items-center cursor-pointer"
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
