"use client";

import { useState } from "react";
import Image from "next/image";
import { MerchantLogo } from "@/components/moft/MerchantLogo";
import { Icon } from "@/components/moft/Icon";
import { Checkbox } from "@/components/ui/checkbox";
import { discountPercent, formatPickupDate, money, numberFa } from "@/lib/moft-format";
import type { Offer, Reservation } from "@/types/moft";
import type { OrderStatus } from "@/types/demo";

export interface CartItem {
  offer: Offer;
  quantity: number;
}

interface CartPipelinePageProps {
  cartItems?: CartItem[];
  onUpdateQuantity?: (offerId: string, quantity: number) => void;
  onRemoveItem?: (offerId: string) => void;
  onClearCart?: () => void;
  onConfirmOrder: (items: CartItem[]) => {
    succeededItems: CartItem[];
    failedItems: Array<{ item: CartItem; error: string }>;
  };
  pendingOffer?: Offer | null;
  activeReservations?: Reservation[];
  reservations?: Reservation[];
  quantity?: number;
  setQuantity?: (q: number) => void;
  onTransitionOrder?: (orderId: string, status: OrderStatus) => void;
  onDirections?: () => void;
  onDiscover: () => void;
  onGoToOrders: () => void;
  onClearPending?: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

type CheckoutPhase = "cart" | "payment_method" | "confirm" | "success";


export function CartPipelinePage({
  cartItems = [],
  onRemoveItem,
  onClearCart,
  pendingOffer,
  quantity = 1,
  onConfirmOrder,
  onDirections,
  onDiscover,
  onGoToOrders,
  onClearPending,
  showToast,
}: CartPipelinePageProps) {
  const [phase, setPhase] = useState<CheckoutPhase>("cart");
  const [selectedPayment, setSelectedPayment] = useState<"wallet" | "gateway" | "in_person">("wallet");
  const [allergiesAcknowledged, setAllergiesAcknowledged] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newlyCreatedReservation, setNewlyCreatedReservation] = useState<Reservation | null>(null);
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);

  // Selected reservation to track if user taps track from the active orders list
  const [trackingReservation, setTrackingReservation] = useState<Reservation | null>(null);

  // Effective list of items in the current cart session
  const effectiveItems: CartItem[] =
    cartItems.length > 0
      ? cartItems
      : pendingOffer
      ? [{ offer: pendingOffer, quantity }]
      : [];

  // Calculations for all items in the current order session
  const totalAmount = effectiveItems.reduce((acc, it) => acc + it.offer.price * it.quantity, 0);
  const originalTotal = effectiveItems.reduce((acc, it) => acc + it.offer.originalPrice * it.quantity, 0);
  const discount = originalTotal > 0 ? discountPercent(originalTotal, totalAmount) : 0;

  // Handle final checkout confirmation
  const handlePayAndConfirm = () => {
    if (effectiveItems.length === 0) return;
    if (!allergiesAcknowledged) {
      showToast("لطفاً تأیید بررسی محتویات جعبه را علامت بزنید.", "warning");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const outcome = onConfirmOrder(effectiveItems);
      setIsProcessing(false);

      if (outcome.succeededItems.length === 0) {
        setPhase("cart");
        showToast(outcome.failedItems[0]?.error || "سفارشی ثبت نشد؛ سبد خرید حفظ شد.", "error");
        return;
      }

      setOrderedItems(outcome.succeededItems);
      
      const firstItem = outcome.succeededItems[0];
      const hasMultiple = outcome.succeededItems.length > 1;
      const titleSummary = hasMultiple
        ? `${firstItem.offer.title} (+${numberFa(outcome.succeededItems.length - 1)} قلم دیگر)`
        : firstItem.offer.title;
      const merchantSummary = hasMultiple
        ? `${firstItem.offer.merchantName} و ...`
        : firstItem.offer.merchantName;

      // Create a simulated confirmed reservation object for the immediate success screen
      const simulatedRes: Reservation = {
        id: `ord-${Date.now()}`,
        offerId: firstItem.offer.id,
        merchantName: merchantSummary,
        category: firstItem.offer.category,
        image: firstItem.offer.image,
        title: titleSummary,
        pickup: firstItem.offer.pickup,
        address: firstItem.offer.address,
        code: `${Math.floor(100000 + Math.random() * 900000)}`.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]),
        quantity: outcome.succeededItems.reduce((acc, it) => acc + it.quantity, 0),
        total: outcome.succeededItems.reduce((sum, it) => sum + it.offer.price * it.quantity, 0),
        status: "active",
        orderStatus: "paid",
        hasReview: false,
        createdAt: new Date().toISOString(),
      };
      setNewlyCreatedReservation(simulatedRes);
      setPhase("success");
      if (outcome.failedItems.length > 0) {
        showToast(`${numberFa(outcome.failedItems.length)} قلم ناموفق در سبد باقی ماند. ${outcome.failedItems[0].error}`, "warning");
      } else {
        showToast("پرداخت با موفقیت انجام و سفارش ثبت شد.", "success");
      }
    }, 450);
  };

  const paymentMethods = [
    {
      id: "wallet" as const,
      title: "کیف پول اعتباری",
      desc: "کسر از موجودی پیش‌فرض (سریع و بدون رمز)",
      icon: "bag" as const,
      badge: "پیشنهادی",
    },
    {
      id: "gateway" as const,
      title: "درگاه پرداخت اینترنتی",
      desc: "شبیه‌سازی اتصال به درگاه بانکی شتاب",
      icon: "receipt" as const,
    },
    {
      id: "in_person" as const,
      title: "پرداخت هنگام دریافت",
      desc: "نقدی یا کارت‌خوان در محل فروشگاه",
      icon: "store" as const,
    },
  ];

  // Helper to determine active step in tracking
  const getStageIndex = (orderStatus?: OrderStatus) => {
    if (orderStatus === "completed") return 3;
    if (orderStatus === "ready_for_pickup") return 3;
    if (orderStatus === "preparing" || orderStatus === "reviewed") return 2;
    return 1;
  };

  // -------------------------------------------------------------
  // VIEW: Tracking Modal / Sheet for a specific order
  // -------------------------------------------------------------
  if (trackingReservation) {
    const stage = getStageIndex(trackingReservation.orderStatus);
    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        <header className="flex items-center justify-between pb-2 border-b border-line/60">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-brand-soft text-brand-2 grid place-items-center">
              <Icon name="route" className="w-4 h-4" />
            </span>
            <h1 className="text-base font-black text-ink">مراحل و وضعیت سفارش</h1>
          </div>
          <button
            type="button"
            onClick={() => setTrackingReservation(null)}
            className="text-xs font-bold text-muted hover:text-ink px-3 py-1.5 rounded-xl bg-canvas border border-line cursor-pointer"
          >
            بازگشت
          </button>
        </header>

        {/* Order Details Header */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-line/60 shrink-0">
              <MerchantLogo name={trackingReservation.merchantName} category={trackingReservation.category} size="md" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-black text-ink truncate">{trackingReservation.merchantName}</h2>
              <p className="text-xs text-muted truncate mt-0.5">{trackingReservation.title} · {numberFa(trackingReservation.quantity || 1)} عدد</p>
            </div>
          </div>

          {/* Bold Delivery Code Voucher */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-brand-soft/40 border border-dashed border-brand-2/30">
            <span className="text-xs font-bold text-muted">کد تحویل به متصدی:</span>
            <span className="font-[family-name:var(--font-vazirmatn)] font-black text-xl text-brand-2 select-all tracking-wide">
              {trackingReservation.code}
            </span>
          </div>
        </div>

        {/* 3 Clear Pipeline Steps */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-muted">مراحل انجام سفارش</h3>
          <div className="space-y-3">
            {[
              {
                step: 1,
                title: "پرداخت و ثبت سفارش",
                desc: "سفارش ثبت و اطلاعات برای فروشگاه ارسال شد.",
                isDone: true,
                isCurrent: stage === 1,
              },
              {
                step: 2,
                title: "آماده‌سازی بسته در فروشگاه",
                desc: "فروشگاه در حال آماده‌سازی جعبهٔ غافلگیرکننده است.",
                isDone: stage >= 2,
                isCurrent: stage === 2,
              },
              {
                step: 3,
                title: "تحویل حضوری به مشتری",
                desc: `در بازه ${formatPickupDate(trackingReservation.pickup)} با ارائه کد تحویل بسته را دریافت کنید.`,
                isDone: stage >= 3,
                isCurrent: stage === 3,
              },
            ].map((st) => (
              <div
                key={st.step}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                  st.isCurrent
                    ? "bg-brand-soft/60 border-brand-2/40 shadow-2xs"
                    : st.isDone
                    ? "bg-brand-soft/40 border-brand-2/20"
                    : "bg-canvas/50 border-line/60 opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full grid place-items-center text-xs font-black shrink-0 mt-0.5 ${
                    st.isDone
                      ? "bg-brand-2 text-white"
                      : "bg-surface border border-line text-muted"
                  }`}
                >
                  {st.isDone ? <Icon name="check" className="w-3.5 h-3.5 text-white" /> : numberFa(st.step)}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <strong className={`block text-xs font-black ${st.isCurrent ? "text-brand-2" : "text-ink"}`}>
                    {st.title}
                  </strong>
                  <p className="text-[11px] text-muted leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {onDirections && (
          <button
            type="button"
            onClick={onDirections}
            className="w-full min-h-[46px] rounded-2xl bg-canvas hover:bg-surface-raised border border-line text-ink text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="route" className="w-4 h-4 text-brand-2" />
            <span>مسیریابی به فروشگاه</span>
          </button>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Payment Simulation Steps (When user taps "پرداخت")
  // -------------------------------------------------------------
  if (phase === "payment_method" || phase === "confirm") {
    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Header & Step Breadcrumbs */}
        <header className="p-3.5 sm:p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-black text-ink">مراحل پرداخت سفارش</h1>
            <span className="text-xs font-bold text-muted">
              {phase === "payment_method" ? "مرحله ۱ از ۲" : "مرحله ۲ از ۲"}
            </span>
          </div>

          {/* 2-Step Indicator */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                phase === "payment_method" || phase === "confirm" ? "bg-brand-2" : "bg-line"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                phase === "confirm" ? "bg-brand-2" : "bg-line"
              }`}
            />
          </div>
        </header>

        {/* STEP 1: Select Payment Method */}
        {phase === "payment_method" && (
          <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="space-y-0.5">
              <h2 className="text-sm font-black text-ink">انتخاب روش پرداخت</h2>
              <p className="text-[11px] text-muted">روش تسویهٔ این سفارش را انتخاب کنید.</p>
            </div>

            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const isSelected = selectedPayment === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-soft/60 border-brand-2 shadow-2xs"
                        : "bg-canvas border-line hover:border-brand-2/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${
                          isSelected ? "bg-brand-2 text-white" : "bg-surface border border-line text-muted"
                        }`}
                      >
                        <Icon name={method.icon} className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-ink">{method.title}</strong>
                          {method.badge && (
                            <span className="text-[10px] font-bold text-brand-2 bg-brand-soft px-1.5 py-0.2 rounded-full">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-muted truncate mt-0.5">{method.desc}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border grid place-items-center shrink-0 ${
                        isSelected ? "border-brand-2 bg-brand-2 text-white" : "border-line bg-surface"
                      }`}
                    >
                      {isSelected && <Icon name="check" className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>


            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-line/60">
              <button
                type="button"
                onClick={() => setPhase("cart")}
                className="px-4 py-2.5 min-h-[44px] rounded-2xl bg-canvas border border-line text-xs font-bold text-ink hover:bg-surface transition-colors cursor-pointer"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={() => setPhase("confirm")}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-2xl bg-brand-2 hover:bg-brand-2/90 text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
              >
                <span>مرحله بعد: بررسی نهایی</span>
                <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Review and Confirm Payment */}
        {phase === "confirm" && effectiveItems.length > 0 && (
          <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="space-y-0.5">
              <h2 className="text-sm font-black text-ink">بررسی نهایی و پرداخت</h2>
              <p className="text-[11px] text-muted">جزئیات سفارش را مرور و پرداخت آزمایشی را تأیید کنید.</p>
            </div>

            {/* Concise Summary of All Items */}
            <div className="p-3.5 rounded-2xl bg-canvas border border-line/70 space-y-2.5 text-xs">
              <div className="space-y-2 pb-2.5 border-b border-line/60">
                <span className="text-muted block font-bold text-[11px]">اقلام سفارش ({numberFa(effectiveItems.length)} مورد):</span>
                {effectiveItems.map(({ offer, quantity: itQty }) => (
                  <div key={offer.id} className="flex items-center justify-between text-xs py-0.5">
                    <div className="min-w-0 flex-1 truncate pe-2">
                      <span className="text-ink font-bold">{offer.title}</span>
                      <span className="text-muted text-[11px] ms-1">({numberFa(itQty)} عدد · {offer.merchantName})</span>
                    </div>
                    <span className="font-bold text-ink shrink-0">{money(offer.price * itQty)}</span>
                  </div>
                ))}
              </div>

              {originalTotal > totalAmount && (
                <div className="flex items-center justify-between text-muted text-[11.5px]">
                  <span>مجموع قیمت اصلی:</span>
                  <del className="line-through">{money(originalTotal)}</del>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-sm">
                <span className="font-black text-ink">مبلغ کل قابل پرداخت:</span>
                <span className="font-black text-base text-brand-2">{money(totalAmount)}</span>
              </div>
            </div>

            {/* Allergy Acknowledgement Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 cursor-pointer">
              <Checkbox
                className="mt-0.5"
                checked={allergiesAcknowledged}
                onCheckedChange={(val) => setAllergiesAcknowledged(Boolean(val))}
              />
              <p className="text-[11px] leading-relaxed select-none">
                می‌دانم محتوای جعبهٔ نجات غافلگیرکننده است و هشدارهای آلرژی را در نظر گرفته‌ام.
              </p>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-line/60">
              <button
                type="button"
                onClick={() => setPhase("payment_method")}
                disabled={isProcessing}
                className="px-4 py-2.5 min-h-[44px] rounded-2xl bg-canvas border border-line text-xs font-bold text-ink hover:bg-surface transition-colors cursor-pointer"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={handlePayAndConfirm}
                disabled={isProcessing}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-2xl bg-brand-2 hover:bg-brand-2/90 text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>در حال انجام پرداخت...</span>
                ) : (
                  <>
                    <span>تأیید و پرداخت شبیه‌سازی‌شده</span>
                    <Icon name="check" className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Payment Success Screen (RTL, Restaurant Info, Items & Drinks Breakdown)
  // -------------------------------------------------------------
  if (phase === "success" && newlyCreatedReservation) {
    const successItems: CartItem[] =
      orderedItems.length > 0
        ? orderedItems
        : effectiveItems.length > 0
        ? effectiveItems
        : [
            {
              offer: {
                id: newlyCreatedReservation.offerId,
                merchantName: newlyCreatedReservation.merchantName,
                category: newlyCreatedReservation.category || "cafe",
                categoryLabel: "کافه و رستوران",
                title: newlyCreatedReservation.title,
                description: newlyCreatedReservation.description || "",
                address: newlyCreatedReservation.address,
                neighborhood: "ونک",
                coordinates: { lat: 35.759, lng: 51.402 },
                distanceKm: 0.8,
                rating: 4.8,
                reviewCount: 120,
                pickup: newlyCreatedReservation.pickup,
                pickupPeriod: "evening",
                quantityLeft: 1,
                originalPrice: newlyCreatedReservation.originalPrice || newlyCreatedReservation.total * 1.5,
                price: newlyCreatedReservation.total,
                allergens: [],
                image: newlyCreatedReservation.image || "/images/products/dibz-dessert-box-cutout.png",
              },
              quantity: newlyCreatedReservation.quantity || 1,
            },
          ];

    const primaryOffer = successItems[0]?.offer;
    const primaryMerchantName = primaryOffer?.merchantName || newlyCreatedReservation.merchantName;
    const primaryCategory = primaryOffer?.category || newlyCreatedReservation.category;
    const primaryCategoryLabel = primaryOffer?.categoryLabel || "کافه و رستوران";
    const primaryAddress = primaryOffer?.address || newlyCreatedReservation.address;
    const primaryNeighborhood = primaryOffer?.neighborhood;
    const totalOrderedPacks = successItems.reduce((acc, it) => acc + it.quantity, 0);

    return (
      <div className="space-y-4 pt-2 sm:pt-3 pb-24 animate-in fade-in duration-200 text-start" dir="rtl">
        <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
          {/* 1. Header: Checkmark badge + Title + Subtitle (RTL Aligned) */}
          <div className="flex items-start gap-3 pb-3 border-b border-line">
            <span className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 border border-emerald-500/20 shadow-2xs">
              <Icon name="check" className="w-6 h-6" />
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <h1 className="text-base sm:text-lg font-black text-ink font-morabba leading-tight">
                پرداخت با موفقیت انجام شد!
              </h1>
            </div>
          </div>

          {/* 2. Delivery Code Box (RTL Aligned, High Affordance) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-brand-soft/50 dark:bg-brand-soft/20 border border-dashed border-brand-2/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">کد تحویل به فروشگاه:</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-[family-name:var(--font-vazirmatn)] font-black text-3xl sm:text-4xl text-brand-2 dark:text-[#FDA74D] tracking-wider select-all">
                {newlyCreatedReservation.code}
              </span>
              <span className="text-[11px] font-bold text-muted shrink-0 flex items-center gap-1">
                <Icon name="clock" className="w-3.5 h-3.5 text-muted" />
                <span>{newlyCreatedReservation.pickup}</span>
              </span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed pt-1 border-t border-brand-2/20">
              هنگام مراجعه به <strong className="text-ink font-bold">{primaryMerchantName}</strong> این کد ۶ رقمی را جهت تحویل بسته نشان دهید.
            </p>
          </div>

          {/* 3. Restaurant Information & Order Items Merged in One Container */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-canvas border border-line space-y-3">
            {/* Header: Restaurant name & category (right) + Compact Location button (left in one line) */}
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <MerchantLogo name={primaryMerchantName} category={primaryCategory} size="sm" />
                <div className="min-w-0 flex-1">
                  <strong className="block text-sm sm:text-base font-black text-ink truncate leading-tight">
                    {primaryMerchantName}
                  </strong>
                  <span className="block text-[11px] text-muted font-medium mt-0.5 truncate">
                    {primaryNeighborhood ? `${primaryNeighborhood} · ` : ""}{primaryCategoryLabel}
                  </span>
                </div>
              </div>

              {primaryAddress && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${primaryMerchantName} ${primaryAddress}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-soft/80 dark:bg-brand-soft/20 border border-brand-2/30 text-xs font-bold text-brand-2 dark:text-[#FDA74D] hover:bg-brand-soft transition-all cursor-pointer active:scale-95 shrink-0"
                  aria-label="مسیریابی روی نقشه"
                >
                  <Icon name="pin" className="w-3.5 h-3.5 text-brand-2 dark:text-[#FDA74D]" />
                  <span>مسیریابی</span>
                  <Icon name="arrow" className="w-3 h-3 rtl:rotate-180 opacity-70" />
                </a>
              )}
            </div>

            {/* Address */}
            {primaryAddress && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Icon name="pin" className="w-3.5 h-3.5 text-brand-2 shrink-0" />
                <span className="truncate">{primaryAddress}</span>
              </div>
            )}

            {/* Order Items inside same container */}
            <div className="pt-3 border-t border-line/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="bag" className="w-4 h-4 text-brand-2" />
                  <h2 className="text-xs sm:text-sm font-black text-ink">
                    اقلام سفارش ({numberFa(totalOrderedPacks)} بسته)
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-line/60 space-y-3">
                {successItems.map((item, idx) => (
                  <div key={item.offer.id || idx} className="pt-3 first:pt-0">
                    <div className="flex items-start gap-2.5">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface border border-line/60 shrink-0">
                        <Image
                          src={item.offer.image || "/images/products/dibz-dessert-box-cutout.png"}
                          alt={item.offer.title}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-ink truncate leading-tight">
                            {item.offer.title}
                          </h3>
                          <span className="text-xs font-black text-ink shrink-0">
                            {money(item.offer.price * item.quantity)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted mt-1">
                          <span className="font-bold text-brand-2 bg-brand-soft/60 px-2 py-0.5 rounded-md">
                            تعداد: {numberFa(item.quantity)} عدد
                          </span>
                          {item.quantity > 1 && (
                            <span>مبلغ واحد: {money(item.offer.price)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Paid Row */}
              <div className="pt-2.5 border-t border-line/60 flex items-center justify-between text-xs">
                <span className="font-bold text-muted">مبلغ کل پرداخت‌شده:</span>
                <span className="text-sm sm:text-base font-black text-brand-2 dark:text-[#FDA74D]">
                  {money(newlyCreatedReservation.total)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Action Buttons (RTL) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-line/60">
            <button
              type="button"
              onClick={() => {
                setPhase("cart");
                onGoToOrders();
              }}
              className="w-full min-h-[48px] rounded-2xl bg-brand-2 text-white text-xs sm:text-sm font-black hover:brightness-105 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
            >
              <span>مشاهده در بخش سفارش‌ها</span>
              <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPhase("cart");
                onDiscover();
              }}
              className="w-full min-h-[48px] rounded-2xl bg-canvas hover:bg-surface border border-line text-ink text-xs sm:text-sm font-bold transition-all flex items-center justify-center cursor-pointer active:scale-[0.99]"
            >
              بازگشت به کاوش جعبه‌ها
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Main Cart Screen (Clean, Minimal & Synced to App Style)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">

      {/* SECTION 1: Pending Cart Items (All in ONE single container despite various items) */}
      {effectiveItems.length > 0 ? (
        <section className="p-3.5 sm:p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
          {/* Header of the container: Order Items Count & Clear action */}
          <div className="flex items-center justify-between pb-2 border-b border-line/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-2" />
              <h2 className="text-xs sm:text-sm font-black text-ink font-morabba">اقلام سفارش ({numberFa(effectiveItems.length)} مورد)</h2>
            </div>
            {onClearCart && effectiveItems.length > 1 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] font-bold text-muted hover:text-rose-500 transition-colors cursor-pointer"
              >
                حذف همه
              </button>
            )}
          </div>

          {/* List of items inside this ONE container */}
          <div className="divide-y divide-line/60 space-y-3.5">
            {effectiveItems.map(({ offer, quantity: itQty }) => {
              const itemTotal = offer.price * itQty;
              const itemOriginal = offer.originalPrice * itQty;
              const itemDiscount = discountPercent(offer.originalPrice, offer.price);

              return (
                <div key={offer.id} className="pt-3.5 first:pt-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    {/* Store & Cutout Info */}
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-canvas border border-line/60 shrink-0">
                        <Image
                          src={offer.image || "/images/products/dibz-dessert-box-cutout.png"}
                          alt={offer.title}
                          fill
                          sizes="72px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="text-xs font-bold text-ink truncate block">{offer.merchantName}</span>
                        <h3 className="text-xs sm:text-sm font-black text-ink truncate leading-tight">{offer.title}</h3>
                        <p className="text-[11px] text-muted flex items-center gap-1 pt-0.5 truncate">
                          <Icon name="clock" className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span>{formatPickupDate(offer.pickup)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Trash button for this item */}
                    <button
                      type="button"
                      onClick={() => (onRemoveItem ? onRemoveItem(offer.id) : onClearPending?.())}
                      aria-label={`حذف ${offer.title} از سبد خرید`}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pricing Row for this item */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <div className="flex items-center gap-2">
                      <del className="text-muted line-through text-[11px]">{money(itemOriginal)}</del>
                      {itemDiscount > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                          {numberFa(itemDiscount)}٪ تخفیف
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-muted text-[11px]">مبلغ:</span>
                      <strong className="font-bold text-xs text-ink">{money(itemTotal)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Summary of the entire order session */}
          <div className="pt-3 border-t border-line space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted font-medium">مجموع قیمت اصلی:</span>
              <del className="text-muted font-bold line-through">{money(originalTotal)}</del>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-xs text-rose-600 font-bold">
                <span>تخفیف کل سفارش:</span>
                <span>{money(originalTotal - totalAmount)} ({numberFa(discount)}٪)</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-line/60">
              <span className="font-black text-ink">مبلغ قابل پرداخت:</span>
              <strong className="font-black text-base text-brand-2">{money(totalAmount)}</strong>
            </div>
          </div>

          {/* EXACTLY 1 PRIMARY CTA BUTTON FOR THE WHOLE ORDER */}
          <button
            type="button"
            onClick={() => setPhase("payment_method")}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl bg-brand-2 hover:bg-brand-2/90 active:scale-[0.99] text-white text-xs sm:text-sm font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ادامه و پرداخت</span>
            <Icon name="arrow" className="w-4 h-4 rtl:rotate-180 shrink-0" />
          </button>
        </section>
      ) : (
        /* Empty State when no pending item in cart */
        <div className="p-8 rounded-3xl bg-surface border border-line text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-canvas text-muted grid place-items-center mx-auto border border-line">
            <Icon name="bag" className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink font-morabba">سبد خرید شما خالی است</h3>
            <p className="text-xs text-muted">جعبه‌های پایان روز را با تخفیف ویژه رزرو کنید.</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={onDiscover}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-2 text-white text-xs font-bold hover:bg-brand-2/95 transition-all shadow-xs cursor-pointer"
            >
              <span>مشاهده پیشنهادها</span>
              <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={onGoToOrders}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-canvas border border-line text-ink text-xs font-bold hover:bg-surface transition-all cursor-pointer"
            >
              <span>مشاهده سفارش‌های من</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
