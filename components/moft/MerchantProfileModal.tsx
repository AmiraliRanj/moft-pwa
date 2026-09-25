"use client";

import { useMemo, useRef } from "react";
import { DialogShell } from "@/components/moft/DialogShell";
import { FoodImage } from "@/components/moft/FoodImage";
import { MerchantLogo } from "@/components/moft/MerchantLogo";
import { Icon } from "@/components/moft/Icon";
import { decimalFa, distanceFa, money, numberFa } from "@/lib/moft-format";
import type { Offer } from "@/types/moft";

interface MerchantProfileModalProps {
  merchant: Offer;
  allOffers: Offer[];
  onClose: () => void;
  onSelectOffer: (offer: Offer) => void;
  onDirections?: () => void;
}

export function MerchantProfileModal({
  merchant,
  allOffers,
  onClose,
  onSelectOffer,
  onDirections,
}: MerchantProfileModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Collect all offers belonging to this merchant
  const merchantPacks = useMemo(() => {
    const matching = allOffers.filter(
      (o) => o.merchantName === merchant.merchantName || o.id === merchant.id
    );

    if (matching.length >= 2) return matching;

    // If only one offer exists in mock data, create 2 realistic complementary surprise packs
    const base = merchant;
    const pack1: Offer = {
      ...base,
      id: `${base.id}-pack1`,
      title: base.title.includes("شگفت‌انگیز") ? base.title : `بسته شگفت‌انگیز ${base.merchantName}`,
      description: base.description,
      price: base.price,
      originalPrice: base.originalPrice,
      quantityLeft: base.quantityLeft,
      pickup: base.pickup,
      image: base.image,
    };

    const isBakeryOrCafe = base.category === "cafe" || base.category === "bakery" || base.category === "confectionery";

    const pack2: Offer = {
      ...base,
      id: `${base.id}-pack2`,
      title: isBakeryOrCafe ? "بسته نان و عصرانه روز" : "باکس غافلگیرکننده خوش‌خوراک",
      description: isBakeryOrCafe
        ? "مجموعه‌ای از نان‌ها و شیرینی‌های تازهٔ امروز مناسب میان‌وعده سالم."
        : "منتخبی از خوراک‌های تازه و آماده با بهترین کیفیت و بسته‌بندی ایمن.",
      price: Math.max(59000, Math.round((base.price * 0.85) / 1000) * 1000),
      originalPrice: Math.round((base.originalPrice * 0.9) / 1000) * 1000,
      quantityLeft: Math.max(1, base.quantityLeft - 1),
      pickup: base.pickup,
      image: "/images/offers/offer-02.webp",
    };

    const pack3: Offer = {
      ...base,
      id: `${base.id}-pack3`,
      title: "باکس سورپرایز اقتصادی",
      description: "بسته‌ای مقرون‌به‌صرفه از اقلام سالم روز با بیشترین درصد تخفیف.",
      price: Math.max(49000, Math.round((base.price * 0.7) / 1000) * 1000),
      originalPrice: Math.round((base.originalPrice * 0.8) / 1000) * 1000,
      quantityLeft: 1,
      pickup: base.pickup,
      image: "/images/offers/offer-03.webp",
    };

    return [pack1, pack2, pack3];
  }, [merchant, allOffers]);

  // Specific restaurant bios for authenticity
  const storeBio = useMemo(() => {
    const bios: Record<string, string> = {
      "کافه ویونا":
        "کافه و نانوایی ویونا از نام‌های شناخته‌شده در منطقه جردن و ونک است که با ارائه نان‌های تازه، کروسان‌های فرانسوی و قهوه‌های تخصصی شناخته می‌شود. در پایان روز کاری، جعبه‌های سالم و باکیفیت ما با تخفیف ویژه به دست علاقه‌مندان می‌رسد.",
      "کافه رادیو":
        "کافه رادیو در قلب خیابان ولیعصر پاتوقی برای دوست‌داران طعم‌های اصیل است. هر روز ساندویچ‌های سرد، کیک‌های دست‌ساز و سالادهای روز در بسته‌بندی بهداشتی برای دریافت حضوری عرضه می‌شوند.",
      "نانوایی خوشه":
        "نانوایی سنتی و مدرن خوشه در یوسف‌آباد با آرد مرغوب و روش‌های تخمیر طبیعی نان‌هایی مغذی و سبک تولید می‌کند. بسته‌های پایان شیفت شامل چند مدل نان تازه و باکیفیت روز است.",
      "برگر ذغالی":
        "برگر ذغالی سعادت‌آباد با گوشت تازه و سبزیجات روز، غذاهای گرم و باکیفیت را آماده می‌کند. بسته‌های نجات روزانه شامل برگر و ساندویچ‌های آمادهٔ باکیفیت تضمین‌شده هستند.",
    };
    return (
      bios[merchant.merchantName] ||
      `${merchant.merchantName} با تمرکز بر کیفیت، تازگی مواد اولیه و بسته‌بندی بهداشتی، بسته‌های مازاد همان‌روز را با تخفیف ویژه برای پیشگیری از اسراف غذا عرضه می‌کند.`
    );
  }, [merchant.merchantName]);

  const totalAvailableBoxes = merchantPacks.reduce((sum, p) => sum + p.quantityLeft, 0);

  return (
    <DialogShell titleId="merchant-title" onClose={onClose} size="fullscreen">
      <div ref={scrollRef} className="overflow-y-auto flex-1 h-full pb-8">
        {/* Hero Cover Banner */}
        <div className="relative w-full h-48 sm:h-56 bg-canvas overflow-hidden">
          <FoodImage
            src={merchant.image}
            alt={`نمای ${merchant.merchantName}`}
            sizes="(max-width: 700px) 100vw, 600px"
            priority
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        <div className="px-4 sm:px-6 relative -mt-12 space-y-4">
          {/* Logo & Live active boxes badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="p-1.5 rounded-3xl bg-surface border-2 border-surface shadow-lg shrink-0">
              <MerchantLogo name={merchant.merchantName} category={merchant.category} size="xl" />
            </div>

            <div className="pt-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border border-emerald-600/20 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{numberFa(totalAvailableBoxes)} جعبه فعال</span>
              </span>
            </div>
          </div>

          {/* Store Title & Category Badge */}
          <div className="space-y-1">
            <h1 id="merchant-title" className="text-xl sm:text-2xl font-black text-ink leading-tight">
              {merchant.merchantName}
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-block text-xs font-bold text-brand-2 bg-brand-soft/90 px-2.5 py-0.5 rounded-full">
                {merchant.categoryLabel}
              </span>
              <span className="text-xs text-muted font-medium">
                {merchant.neighborhood}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-canvas border border-line text-center">
            <div className="space-y-0.5">
              <span className="flex items-center justify-center gap-1 text-xs font-black text-ink">
                <Icon name="star" filled className="w-3.5 h-3.5 text-amber-500" />
                <span>{decimalFa(merchant.rating)}</span>
              </span>
              <small className="block text-[10px] text-muted font-medium">({numberFa(merchant.reviewCount)} نظر)</small>
            </div>
            <div className="space-y-0.5 border-x border-line/60">
              <span className="flex items-center justify-center gap-1 text-xs font-black text-ink">
                <Icon name="pin" className="w-3.5 h-3.5 text-brand-2" />
                <span>{distanceFa(merchant.distanceKm)}</span>
              </span>
              <small className="block text-[10px] text-muted font-medium">{merchant.neighborhood}</small>
            </div>
            <div className="space-y-0.5">
              <span className="flex items-center justify-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <Icon name="leaf" className="w-3.5 h-3.5 text-emerald-600" />
                <span>۹۸٪</span>
              </span>
              <small className="block text-[10px] text-muted font-medium">رضایت نجات غذا</small>
            </div>
          </div>

          {/* About the Place Section */}
          <section className="space-y-2">
            <h2 className="text-sm font-black text-ink">درباره این فروشگاه</h2>
            <p className="text-xs text-muted leading-relaxed text-justify">
              {storeBio}
            </p>
            {/* Features Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface border border-line text-[11px] font-bold text-ink">
                <Icon name="clock" className="w-3.5 h-3.5 text-brand-2" />
                <span>تحویل فقط حضوری</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface border border-line text-[11px] font-bold text-ink">
                <Icon name="check" className="w-3.5 h-3.5 text-emerald-600" />
                <span>بسته‌بندی بهداشتی</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface border border-line text-[11px] font-bold text-ink">
                <Icon name="spark" className="w-3.5 h-3.5 text-amber-500" />
                <span>تضمین کیفیت همان‌روز</span>
              </span>
            </div>
          </section>

          {/* Location & Address Card */}
          <section className="p-3.5 rounded-2xl bg-surface border border-line shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-canvas border border-line text-brand-2 grid place-items-center shrink-0 mt-0.5">
                <Icon name="pin" className="w-4 h-4 text-brand-2" />
              </div>
              <div className="min-w-0 flex-1">
                <small className="block text-[10px] font-bold text-muted">آدرس و محدوده دریافت</small>
                <strong className="block text-xs font-bold text-ink leading-snug mt-0.5 truncate">
                  {merchant.address}
                </strong>
                <span className="block text-[10.5px] text-muted mt-0.5">
                  بازه دریافت معمول: {merchant.pickup}
                </span>
              </div>
            </div>

            {onDirections && (
              <button
                type="button"
                onClick={onDirections}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-brand-soft text-brand-2 hover:bg-brand-2 hover:text-white transition-all text-xs font-bold shrink-0 cursor-pointer active:scale-95 shadow-xs"
              >
                <Icon name="route" className="w-4 h-4" />
                <span>مسیریابی</span>
              </button>
            )}
          </section>

          {/* Active Items Section */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-ink">جعبه‌های فعال برای دریافت</h2>
                <p className="text-[11px] text-muted">امروز می‌توانید این بسته‌ها را رزرو و تحویل بگیرید</p>
              </div>
              <span className="text-xs font-bold text-brand-2 bg-brand-soft/70 px-2.5 py-0.5 rounded-full">
                {numberFa(merchantPacks.length)} بسته
              </span>
            </div>

            {/* List of merchant's packs */}
            <div className="space-y-3">
              {merchantPacks.map((pack) => {
                const discount =
                  pack.originalPrice > pack.price
                    ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
                    : 0;

                return (
                  <article
                    key={pack.id}
                    className="p-3.5 rounded-2xl bg-surface border border-line shadow-xs hover:border-brand-2/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-canvas shrink-0 border border-line/60">
                        <FoodImage
                          src={pack.image}
                          sizes="80px"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {pack.quantityLeft > 0 && pack.quantityLeft <= 3 && (
                          <span className="absolute bottom-1 start-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/75 text-white">
                            {numberFa(pack.quantityLeft)} عدد
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-ink leading-snug truncate">
                            {pack.title}
                          </h3>
                          {discount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-[10px] font-black shrink-0">
                              {numberFa(discount)}٪ تخفیف
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-muted pt-0.5">
                          <Icon name="clock" className="w-3.5 h-3.5 text-brand-2 shrink-0" />
                          <span>دریافت: {pack.pickup}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/50 shrink-0">
                      <div className="text-start sm:text-end">
                        <del className="block text-[10px] text-muted line-through">
                          {money(pack.originalPrice)}
                        </del>
                        <strong className="block text-xs sm:text-sm font-black text-ink">
                          {money(pack.price)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectOffer(pack);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-brand-soft hover:bg-brand-2 hover:text-white text-brand-2 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <span>مشاهده بسته</span>
                        <Icon name="chevron" className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Customer Reviews Section */}
          <section className="space-y-2.5 pt-2">
            <h2 className="text-sm font-black text-ink">نظرات خریداران این فروشگاه</h2>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-canvas/70 border border-line text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-ink">سارا م.</strong>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Icon name="star" filled className="w-3 h-3" />
                    <Icon name="star" filled className="w-3 h-3" />
                    <Icon name="star" filled className="w-3 h-3" />
                    <Icon name="star" filled className="w-3 h-3" />
                    <Icon name="star" filled className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  «بسته‌ای که گرفتم واقعاً تازه و عالی بود. طعم کروسان‌ها مثل این بود که تازه از فر درآمده باشند. حتماً دوباره رزرو می‌کنم.»
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-canvas/70 border border-line text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-ink">امیرحسین ک.</strong>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Icon name="star" filled className="w-3 h-3" />
                    <Icon name="star" filled className="w-3 h-3" />
                    <Icon name="star" filled className="w-3 h-3" />
                    <Icon name="star" filled className="w-3 h-3" />
                    <Icon name="star" className="w-3 h-3 text-muted/40" />
                  </div>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  «برخورد پرسنل موقع تحویل حضوری بسیار محترمانه بود و بسته تمیز و مرتب تحویل داده شد.»
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DialogShell>
  );
}
