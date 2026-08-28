"use client";

import { useCallback, useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";

const slides = [
  { title: "امشب خوش‌طعم‌تر انتخاب کن", text: "جعبه‌های تازهٔ نزدیکت را با قیمت بهتر رزرو کن و در زمان مشخص تحویل بگیر.", image: "/images/offers/offer-16.webp", action: "دیدن گزینه‌های نزدیک" },
  { title: "یک قرار خوش‌مزه نزدیک تو", text: "کافه‌ها و فروشگاه‌های محله، جعبه‌های روزشان را برای دریافت حضوری آماده کرده‌اند.", image: "/images/offers/offer-03.webp", action: "کشف فروشگاه‌ها" },
  { title: "جعبهٔ غافلگیرکننده، انتخاب آسان", text: "قیمت، بازهٔ دریافت و اطلاعات آلرژی را شفاف ببین؛ باقی‌اش را به یک سورپرایز خوش‌طعم بسپار.", image: "/images/offers/offer-09.webp", action: "شروع کن" },
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
    const timer = window.setInterval(() => api.scrollNext(), 6200);
    return () => { api.off("select", sync); window.clearInterval(timer); };
  }, [api, sync]);

  return (
    <Carousel setApi={setApi} opts={{ direction: "rtl", loop: true }} className="home-hero-carousel" aria-label="پیشنهادهای ویژهٔ دیبز">
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={slide.title} aria-label={`${index + 1} از ${slides.length}`}>
            <section className="hero-card">
              <div className="hero-copy"><p className="hero-kicker">دیبز برای امروز</p><h1>{slide.title}</h1><p>{slide.text}</p><button type="button" onClick={onDiscover}>{slide.action} <Icon name="arrow" /></button></div>
              <div className="hero-image"><FoodImage src={slide.image} sizes="(max-width: 700px) 92vw, 440px" priority={index === 0} /></div>
            </section>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="hero-pagination" role="tablist" aria-label="اسلایدهای پیشنهاد ویژه">
        {slides.map((slide, index) => <button key={slide.title} type="button" role="tab" aria-label={`نمایش اسلاید ${index + 1}`} aria-selected={selected === index} className={selected === index ? "active" : ""} onClick={() => api?.scrollTo(index)} />)}
      </div>
    </Carousel>
  );
}
