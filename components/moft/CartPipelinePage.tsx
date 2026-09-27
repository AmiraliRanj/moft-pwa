"use client";

import { useState } from "react";
import Image from "next/image";
import { MerchantLogo } from "@/components/moft/MerchantLogo";
import { Icon } from "@/components/moft/Icon";
import { AnimatedNumber } from "@/components/moft/AnimatedNumber";
import { Checkbox } from "@/components/ui/checkbox";
import { discountPercent, formatPickupDate, money, numberFa } from "@/lib/moft-format";
import type { Offer, Reservation } from "@/types/moft";
import type { OrderStatus } from "@/types/demo";

interface CartPipelinePageProps {
  pendingOffer: Offer | null;
  activeReservations?: Reservation[];
  reservations?: Reservation[];
  quantity: number;
  setQuantity: (q: number) => void;
  onConfirmOrder: (offer: Offer, quantity: number) => void;
  onTransitionOrder?: (orderId: string, status: OrderStatus) => void;
  onDirections?: () => void;
  onDiscover: () => void;
  onGoToOrders: () => void;
  onClearPending: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

type CheckoutPhase = "cart" | "payment_method" | "confirm" | "success";

export function CartPipelinePage({
  pendingOffer,
  quantity,
  setQuantity,
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

  // Selected reservation to track if user taps track from the active orders list
  const [trackingReservation, setTrackingReservation] = useState<Reservation | null>(null);


  // Calculations
  const totalAmount = pendingOffer ? pendingOffer.price * quantity : 0;
  const originalTotal = pendingOffer ? pendingOffer.originalPrice * quantity : 0;
  const discount = pendingOffer ? discountPercent(pendingOffer.originalPrice, pendingOffer.price) : 0;

  // Handle final checkout confirmation
  const handlePayAndConfirm = () => {
    if (!pendingOffer) return;
    if (!allergiesAcknowledged) {
      showToast("لطفاً تأیید بررسی محتویات جعبه را علامت بزنید.", "warning");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmOrder(pendingOffer, quantity);
      setIsProcessing(false);
      // Create a simulated confirmed reservation object for the immediate success screen
      const simulatedRes: Reservation = {
        id: `ord-${Date.now()}`,
        offerId: pendingOffer.id,
        merchantName: pendingOffer.merchantName,
        category: pendingOffer.category,
        image: pendingOffer.image,
        title: pendingOffer.title,
        pickup: pendingOffer.pickup,
        address: pendingOffer.address,
        code: `${Math.floor(100000 + Math.random() * 900000)}`.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]),
        quantity,
        total: totalAmount,
        status: "active",
        orderStatus: "paid",
        hasReview: false,
        createdAt: new Date().toISOString(),
      };
      setNewlyCreatedReservation(simulatedRes);
      setPhase("success");
      showToast("پرداخت با موفقیت انجام و سفارش ثبت شد.", "success");
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

            {/* University Preview Notice */}
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-brand-soft/40 border border-brand-2/20 text-xs text-ink/80">
              <Icon name="info" className="w-4 h-4 text-brand-2 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                این یک پیش‌نمایش دانشگاهی است و تمامی پرداخت‌ها شبیه‌سازی آزمایشی هستند.
              </p>
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
        {phase === "confirm" && pendingOffer && (
          <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="space-y-0.5">
              <h2 className="text-sm font-black text-ink">بررسی نهایی و پرداخت</h2>
              <p className="text-[11px] text-muted">جزئیات سفارش را مرور و پرداخت آزمایشی را تأیید کنید.</p>
            </div>

            {/* Concise Summary */}
            <div className="p-3 rounded-2xl bg-canvas border border-line/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted">فروشگاه:</span>
                <strong className="text-ink font-bold">{pendingOffer.merchantName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">محتوا:</span>
                <span className="text-ink">{pendingOffer.title} ({numberFa(quantity)} عدد)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">بازه تحویل:</span>
                <span className="text-ink font-medium">{formatPickupDate(pendingOffer.pickup)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-line/50">
                <span className="font-bold text-ink">مبلغ قابل پرداخت:</span>
                <span className="font-black text-sm text-brand-2">{money(totalAmount)}</span>
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
  // VIEW: Payment Success Screen
  // -------------------------------------------------------------
  if (phase === "success" && newlyCreatedReservation) {
    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-brand-soft text-brand-2 grid place-items-center mx-auto shadow-2xs">
            <Icon name="check" className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-base sm:text-lg font-black text-ink">پرداخت با موفقیت انجام شد!</h1>
            <p className="text-xs text-muted">سفارش شما در سیستم ثبت شد و کد تحویل اختصاصی صادر گردید.</p>
          </div>

          {/* Delivery Code Display */}
          <div className="p-3.5 rounded-2xl bg-brand-soft/50 border border-dashed border-brand-2/30 space-y-1">
            <span className="text-[11px] font-bold text-muted block">کد تحویل به فروشگاه:</span>
            <span className="block font-[family-name:var(--font-vazirmatn)] font-black text-2xl sm:text-3xl text-brand-2 tracking-wide select-all">
              {newlyCreatedReservation.code}
            </span>
            <span className="text-[10px] text-muted block pt-0.5">
              هنگام مراجعه به {newlyCreatedReservation.merchantName} این کد را نشان دهید.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-line/60">
            <button
              type="button"
              onClick={() => {
                setPhase("cart");
                onGoToOrders();
              }}
              className="w-full min-h-[44px] rounded-2xl bg-brand-2 text-white text-xs font-black hover:bg-brand-2/95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
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
              className="w-full min-h-[44px] rounded-2xl bg-canvas hover:bg-surface border border-line text-ink text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
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

      {/* SECTION 1: Pending Cart Item (If item exists in cart) */}
      {pendingOffer ? (
        <section className="p-3.5 sm:p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            {/* Store & Cutout Info */}
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-canvas border border-line/60 shrink-0">
                <Image
                  src={pendingOffer.image || "/images/products/dibz-dessert-box-cutout.png"}
                  alt={pendingOffer.title}
                  fill
                  sizes="72px"
                  className="object-contain p-1"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <MerchantLogo name={pendingOffer.merchantName} category={pendingOffer.category} size="sm" />
                  <span className="text-xs font-bold text-ink truncate">{pendingOffer.merchantName}</span>
                </div>
                <h2 className="text-sm font-black text-ink truncate leading-tight">{pendingOffer.title}</h2>
                <p className="text-[11px] text-muted flex items-center gap-1 pt-0.5 truncate">
                  <Icon name="clock" className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span>{formatPickupDate(pendingOffer.pickup)}</span>
                </p>
              </div>
            </div>

            {/* Trash button */}
            <button
              type="button"
              onClick={onClearPending}
              aria-label="حذف از سبد خرید"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>

          {/* Quantity Controls & Price Breakdown */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-canvas border border-line/70">
            <span className="text-xs font-bold text-muted">تعداد:</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-xl bg-surface border border-line flex items-center justify-center text-ink disabled:opacity-30 hover:bg-surface-raised transition-colors cursor-pointer"
                aria-label="کاهش تعداد"
              >
                <Icon name="minus" className="w-3.5 h-3.5" />
              </button>
              <strong className="text-sm font-black min-w-[18px] text-center font-[family-name:var(--font-vazirmatn)]">
                <AnimatedNumber value={quantity} />
              </strong>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(Math.min(3, pendingOffer.quantityLeft), quantity + 1))}
                disabled={quantity >= Math.min(3, pendingOffer.quantityLeft)}
                className="w-8 h-8 rounded-xl bg-surface border border-line flex items-center justify-center text-ink disabled:opacity-30 hover:bg-surface-raised transition-colors cursor-pointer"
                aria-label="افزایش تعداد"
              >
                <Icon name="plus" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-center justify-between pt-1 border-t border-line/50 text-xs">
            <div className="flex items-center gap-2">
              <del className="text-muted line-through">{money(originalTotal)}</del>
              {discount > 0 && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                  {numberFa(discount)}٪ تخفیف
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-muted text-[11px]">مبلغ:</span>
              <strong className="font-black text-sm text-brand-2">{money(totalAmount)}</strong>
            </div>
          </div>

          {/* Primary Pay Button */}
          <button
            type="button"
            onClick={() => setPhase("payment_method")}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-brand-2 hover:bg-brand-2/90 active:scale-[0.99] text-white text-xs sm:text-sm font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
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
            <h3 className="text-sm font-bold text-ink">سبد خرید شما خالی است</h3>
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
