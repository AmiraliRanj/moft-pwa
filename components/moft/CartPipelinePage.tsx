"use client";

import { useMemo, useState } from "react";
import { FoodImage } from "@/components/moft/FoodImage";
import { MerchantLogo } from "@/components/moft/MerchantLogo";
import { Icon } from "@/components/moft/Icon";
import { AnimatedNumber } from "@/components/moft/AnimatedNumber";
import { Checkbox } from "@/components/ui/checkbox";
import { money, numberFa } from "@/lib/moft-format";
import { orderStatusLabel } from "@/lib/demo-format";
import type { Offer, Reservation } from "@/types/moft";
import type { OrderStatus } from "@/types/demo";

interface CartPipelinePageProps {
  pendingOffer: Offer | null;
  activeReservations: Reservation[];
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

type CheckoutStep = "review" | "pay" | "tracking";

export function CartPipelinePage({
  pendingOffer,
  activeReservations,
  quantity,
  setQuantity,
  onConfirmOrder,
  onTransitionOrder,
  onDirections,
  onDiscover,
  onGoToOrders,
  onClearPending,
  showToast,
}: CartPipelinePageProps) {
  // If there's an active reservation and no pending cart item, start directly on tracking
  const [step, setStep] = useState<CheckoutStep>(pendingOffer ? "review" : "tracking");
  const [selectedPayment, setSelectedPayment] = useState<"wallet" | "gateway" | "in_person">("wallet");
  const [allergiesAcknowledged, setAllergiesAcknowledged] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Selected reservation to track if in tracking mode
  const latestActiveReservation = useMemo(() => {
    return activeReservations.length > 0 ? activeReservations[0] : null;
  }, [activeReservations]);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    latestActiveReservation?.id || null
  );

  const currentTrackingReservation = useMemo(() => {
    if (!activeReservations.length) return null;
    return activeReservations.find((r) => r.id === selectedOrderId) || activeReservations[0];
  }, [activeReservations, selectedOrderId]);

  // Total calculation
  const totalAmount = pendingOffer ? pendingOffer.price * quantity : 0;
  const originalTotal = pendingOffer ? pendingOffer.originalPrice * quantity : 0;
  const savedAmount = originalTotal - totalAmount;

  const handlePayAndConfirm = () => {
    if (!pendingOffer) return;
    if (!allergiesAcknowledged) {
      showToast("لطفاً تایید هشدار آلرژی را علامت بزنید.", "warning");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmOrder(pendingOffer, quantity);
      setIsProcessing(false);
      setStep("tracking");
      showToast("سفارش با موفقیت ثبت شد و وارد خط لوله شد.", "success");
    }, 450);
  };

  // Determine stage index for order pipeline stepper
  // Stages: 1: Paid, 2: Preparing, 3: Ready for pickup, 4: Completed
  const getPipelineStageIndex = (orderStatus?: OrderStatus, status?: string) => {
    if (orderStatus === "completed" || status === "collected") return 4;
    if (orderStatus === "ready_for_pickup") return 3;
    if (orderStatus === "preparing" || orderStatus === "reviewed") return 2;
    return 1; // "paid" or "active"
  };

  const currentStageIndex = currentTrackingReservation
    ? getPipelineStageIndex(currentTrackingReservation.orderStatus, currentTrackingReservation.status)
    : 1;

  return (
    <div className="space-y-4 pb-20">
      {/* Visual Pipeline Header Banner */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-brand-soft text-brand-2 grid place-items-center">
              <Icon name="bag" className="w-4.5 h-4.5" />
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-black text-ink">خط لوله و مراحل سفارش</h1>
              <p className="text-[11px] text-muted">فرآیند شفاف انتخاب، پرداخت و مراحل تحویل حضوری</p>
            </div>
          </div>
          {pendingOffer && (
            <span className="text-[11px] font-bold text-brand-2 bg-brand-soft/80 px-2.5 py-0.5 rounded-full">
              ۱ جعبه در سبد
            </span>
          )}
        </div>

        {/* 4 Pipeline Stages Indicator */}
        <div className="grid grid-cols-4 gap-1.5 pt-1" aria-label="مراحل فرآیند سفارش">
          {[
            { id: "review", label: "۱. سبد خرید", icon: "cart" as const, active: step === "review" },
            { id: "pay", label: "۲. پرداخت", icon: "receipt" as const, active: step === "pay" },
            { id: "preparing", label: "۳. آماده‌سازی", icon: "spark" as const, active: step === "tracking" && currentStageIndex <= 2 },
            { id: "deliver", label: "۴. تحویل حضوری", icon: "pin" as const, active: step === "tracking" && currentStageIndex >= 3 },
          ].map((pipelineStep, idx) => {
            const isCompleted =
              step === "tracking"
                ? idx < 2 || (idx === 2 && currentStageIndex >= 3) || (idx === 3 && currentStageIndex >= 4)
                : step === "pay"
                ? idx < 1
                : false;
            return (
              <div
                key={pipelineStep.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
                  pipelineStep.active
                    ? "bg-brand-soft text-brand-2 border border-brand-2/30 shadow-2xs font-bold"
                    : isCompleted
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "bg-canvas text-muted font-medium"
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                  {isCompleted ? (
                    <Icon name="check" className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Icon name={pipelineStep.icon} className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate">{pipelineStep.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: Cart Review */}
      {step === "review" && pendingOffer && (
        <section className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-canvas border border-line/60 shrink-0">
                  <FoodImage src={pendingOffer.image} sizes="80px" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <MerchantLogo name={pendingOffer.merchantName} category={pendingOffer.category} size="sm" />
                    <strong className="text-xs font-bold text-ink truncate">{pendingOffer.merchantName}</strong>
                  </div>
                  <h3 className="text-sm font-black text-ink truncate leading-tight">{pendingOffer.title}</h3>
                  <p className="text-[11px] text-muted flex items-center gap-1 pt-0.5">
                    <Icon name="clock" className="w-3 h-3 text-brand-2 shrink-0" />
                    <span>دریافت: {pendingOffer.pickup}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClearPending}
                className="w-8 h-8 rounded-full bg-canvas text-muted hover:text-rose-500 hover:bg-rose-50 transition-colors grid place-items-center cursor-pointer shrink-0"
                aria-label="حذف این مورد از سبد"
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-canvas border border-line">
              <div>
                <span className="block text-xs font-bold text-ink">تعداد جعبه نجات غذا</span>
                <small className="text-[10px] text-muted">حداکثر موجودی: {numberFa(pendingOffer.quantityLeft)} عدد</small>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-surface border border-line grid place-items-center text-ink disabled:opacity-40 hover:bg-surface-raised transition-colors cursor-pointer"
                  aria-label="کاهش تعداد"
                >
                  <Icon name="minus" className="w-4 h-4" />
                </button>
                <strong className="text-sm font-black min-w-[20px] text-center">
                  <AnimatedNumber value={quantity} />
                </strong>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(Math.min(3, pendingOffer.quantityLeft), quantity + 1))}
                  disabled={quantity >= Math.min(3, pendingOffer.quantityLeft)}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-surface border border-line grid place-items-center text-ink disabled:opacity-40 hover:bg-surface-raised transition-colors cursor-pointer"
                  aria-label="افزایش تعداد"
                >
                  <Icon name="plus" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Allergy Acknowledgement */}
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 cursor-pointer">
              <Checkbox
                className="mt-0.5"
                checked={allergiesAcknowledged}
                onCheckedChange={(val) => setAllergiesAcknowledged(Boolean(val))}
              />
              <p className="text-[11px] leading-relaxed">
                می‌دانم ترکیب جعبهٔ غافلگیرکننده متغیر است و هشدارهای آلرژی فروشگاه را بررسی کرده‌ام.
              </p>
            </label>

            {/* Financial Summary */}
            <div className="space-y-2 pt-1 border-t border-line/60 text-xs">
              <div className="flex items-center justify-between text-muted">
                <span>ارزش اصلی اقلام</span>
                <del>{money(originalTotal)}</del>
              </div>
              {savedAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>سود شما از نجات غذا</span>
                  <span>{money(savedAmount)} تخفیف</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-black text-ink pt-1 border-t border-line/40">
                <span>مبلغ نهایی</span>
                <span className="text-brand-2">{money(totalAmount)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("pay")}
              className="w-full min-h-[46px] py-3 px-4 rounded-2xl bg-brand-2 hover:bg-brand-2/90 active:scale-[0.99] text-white text-xs font-black transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>ادامه به مرحله پرداخت</span>
              <Icon name="arrow" className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </section>
      )}

      {/* STAGE 2: Payment Simulation */}
      {step === "pay" && pendingOffer && (
        <section className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-ink">انتخاب روش پرداخت شبیه‌سازی‌شده</h2>
              <p className="text-[11px] text-muted">تراکنش در محیط پیش‌نمایش به صورت آزمایشی انجام می‌شود.</p>
            </div>

            {/* Payment Method Cards */}
            <div className="space-y-2">
              {[
                {
                  id: "wallet" as const,
                  title: "کیف پول اعتباری دیبز",
                  desc: "کسر از موجودی هدیهٔ خوش‌آمدگویی (موجودی کافی)",
                  icon: "bag" as const,
                },
                {
                  id: "gateway" as const,
                  title: "درگاه پرداخت الکترونیک شتاب (آزمایشی)",
                  desc: "شبیه‌سازی اتصال به درگاه بانکی بدون کسر پول واقعی",
                  icon: "receipt" as const,
                },
                {
                  id: "in_person" as const,
                  title: "پرداخت هنگام تحویل حضوری",
                  desc: "کارت‌خوان یا نقدی در محل فروشگاه هنگام تحویل",
                  icon: "store" as const,
                },
              ].map((method) => {
                const isSelected = selectedPayment === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-soft/70 border-brand-2 shadow-2xs"
                        : "bg-canvas border-line hover:border-brand-2/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 ${
                          isSelected ? "bg-brand-2 text-white" : "bg-surface border border-line text-muted"
                        }`}
                      >
                        <Icon name={method.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-ink">{method.title}</strong>
                        <small className="block text-[10.5px] text-muted mt-0.5">{method.desc}</small>
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
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs">
              <Icon name="info" className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p className="leading-relaxed text-[11px]">
                <strong>پیش‌نمایش دانشگاهی:</strong> هیچ درگاه مالی واقعی به این سامانه متصل نیست و وجهی از حساب شما کسر نخواهد شد.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep("review")}
                className="px-4 py-3 min-h-[46px] rounded-2xl bg-canvas border border-line text-ink hover:bg-surface transition-colors text-xs font-bold cursor-pointer"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={handlePayAndConfirm}
                disabled={isProcessing}
                className="flex-1 min-h-[46px] py-3 px-4 rounded-2xl bg-brand-2 hover:bg-brand-2/90 active:scale-[0.99] text-white text-xs font-black transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>در حال ثبت و صدور کد تحویل...</span>
                ) : (
                  <>
                    <span>تأیید پرداخت و صدور کد تحویل</span>
                    <Icon name="check" className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 3 & 4: Live Order Pipeline Tracking */}
      {(step === "tracking" || (!pendingOffer && activeReservations.length > 0)) && (
        <section className="space-y-4 animate-in fade-in duration-200">
          {activeReservations.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {activeReservations.map((res) => {
                const isSelected = (currentTrackingReservation?.id || "") === res.id;
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setSelectedOrderId(res.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-brand-2 text-white shadow-xs"
                        : "bg-surface border border-line text-muted hover:text-ink"
                    }`}
                  >
                    <span>{res.merchantName}</span>
                    <span className="text-[10px] font-mono opacity-80">{res.code}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentTrackingReservation ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
              {/* Top Order Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-line/60">
                <div>
                  <span className="text-[11px] font-bold text-muted">سفارش فعال در حال پیگیری</span>
                  <h2 className="text-base font-black text-ink mt-0.5">{currentTrackingReservation.merchantName}</h2>
                  <p className="text-xs text-muted">{currentTrackingReservation.title} · {numberFa(currentTrackingReservation.quantity)} عدد</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-soft text-brand-2 border border-brand-2/20">
                  <span className="w-2 h-2 rounded-full bg-brand-2 animate-pulse" />
                  <span>
                    {currentTrackingReservation.orderStatus
                      ? orderStatusLabel[currentTrackingReservation.orderStatus]
                      : "در جریان"}
                  </span>
                </span>
              </div>

              {/* Secret Pickup Ticket */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-900 text-white text-center space-y-2 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 end-0 transform translate-x-4 -translate-y-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
                <span className="text-[11px] text-emerald-200/90 font-bold block">کد اختصاصی تحویل به فروشگاه</span>
                <strong className="block text-2xl sm:text-3xl font-mono font-black tracking-widest text-emerald-400 select-all">
                  {currentTrackingReservation.code}
                </strong>
                <p className="text-[10.5px] text-emerald-100/70">
                  هنگام مراجعه حضوری، این کد را به متصدی {currentTrackingReservation.merchantName} اعلام کنید.
                </p>
              </div>

              {/* Live Order Stage Stepper */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-ink">مراحل زندهٔ آماده‌سازی و تحویل</h3>

                <div className="space-y-2.5">
                  {[
                    {
                      stage: 1,
                      status: "paid" as OrderStatus,
                      title: "۱. پرداخت و ثبت قطعی",
                      desc: "سفارش شما در سیستم ثبت و به فروشگاه اعلام شد.",
                      icon: "check" as const,
                    },
                    {
                      stage: 2,
                      status: "preparing" as OrderStatus,
                      title: "۲. در حال آماده‌سازی جعبه",
                      desc: "پرسنل فروشگاه در حال چینش اقلام سالم و بهداشتی پایان شیفت هستند.",
                      icon: "spark" as const,
                    },
                    {
                      stage: 3,
                      status: "ready_for_pickup" as OrderStatus,
                      title: "۳. آماده تحویل حضوری",
                      desc: "بستهٔ شما آماده است. در بازه مشخص‌شده جهت دریافت مراجعه کنید.",
                      icon: "pin" as const,
                    },
                    {
                      stage: 4,
                      status: "completed" as OrderStatus,
                      title: "۴. تحویل حضوری و اتمام",
                      desc: "جعبه دریافت شد و نجات غذا با موفقیت به پایان رسید.",
                      icon: "leaf" as const,
                    },
                  ].map((pipe) => {
                    const isDone = currentStageIndex > pipe.stage;
                    const isCurrent = currentStageIndex === pipe.stage;

                    return (
                      <div
                        key={pipe.stage}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                          isCurrent
                            ? "bg-brand-soft/60 border-brand-2 shadow-2xs"
                            : isDone
                            ? "bg-canvas border-line/80 text-muted"
                            : "bg-canvas/50 border-line/40 opacity-60"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl grid place-items-center shrink-0 mt-0.5 text-xs font-black ${
                            isCurrent
                              ? "bg-brand-2 text-white shadow-2xs"
                              : isDone
                              ? "bg-emerald-600 text-white"
                              : "bg-surface border border-line text-muted"
                          }`}
                        >
                          {isDone ? (
                            <Icon name="check" className="w-3.5 h-3.5" />
                          ) : (
                            <span>{numberFa(pipe.stage)}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <strong
                              className={`text-xs font-bold leading-tight ${
                                isCurrent ? "text-brand-2 dark:text-emerald-400 font-black" : isDone ? "text-ink" : "text-muted"
                              }`}
                            >
                              {pipe.title}
                            </strong>
                            {isCurrent && (
                              <span className="text-[10px] font-black text-brand-2 bg-brand-soft px-2 py-0.2 rounded-full">
                                مرحله کنونی
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{pipe.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Logistics: Time & Address */}
              <div className="p-3.5 rounded-2xl bg-canvas border border-line space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-ink">
                    <Icon name="clock" className="w-4 h-4 text-brand-2 shrink-0" />
                    <span className="font-bold">بازه تحویل: {currentTrackingReservation.pickup}</span>
                  </div>
                  {onDirections && (
                    <button
                      type="button"
                      onClick={onDirections}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-2 hover:underline cursor-pointer"
                    >
                      <Icon name="route" className="w-3.5 h-3.5" />
                      <span>مسیریابی</span>
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-2 text-muted text-[11.5px]">
                  <Icon name="pin" className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                  <span>{currentTrackingReservation.address}</span>
                </div>
              </div>

              {/* Interactive Demo Pipeline Stage Transitions */}
              {onTransitionOrder && currentStageIndex < 4 && (
                <div className="p-3 rounded-2xl bg-surface border border-line/80 space-y-2">
                  <span className="block text-[11px] font-bold text-muted">کنترل پیش‌نمایش دانشگاهی (تغییر مرحله خط لوله):</span>
                  <div className="flex flex-wrap gap-2">
                    {currentStageIndex === 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          onTransitionOrder(currentTrackingReservation.id, "preparing");
                          showToast("وضعیت به «در حال آماده‌سازی» تغییر یافت.", "info");
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-soft text-brand-2 hover:bg-brand-2 hover:text-white transition-all cursor-pointer"
                      >
                        شبیه‌سازی: آغاز آماده‌سازی در فروشگاه
                      </button>
                    )}
                    {currentStageIndex === 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          onTransitionOrder(currentTrackingReservation.id, "ready_for_pickup");
                          showToast("وضعیت به «آماده تحویل حضوری» تغییر یافت.", "info");
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-soft text-brand-2 hover:bg-brand-2 hover:text-white transition-all cursor-pointer"
                      >
                        شبیه‌سازی: جعبه آماده تحویل شد
                      </button>
                    )}
                    {currentStageIndex === 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          onTransitionOrder(currentTrackingReservation.id, "completed");
                          showToast("تحویل حضوری با موفقیت انجام شد!", "success");
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                      >
                        شبیه‌سازی: تایید دریافت و تحویل حضوری
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-line/60">
                <button
                  type="button"
                  onClick={onGoToOrders}
                  className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-surface border border-line text-ink hover:bg-surface-raised transition-colors text-xs font-bold text-center cursor-pointer"
                >
                  مشاهده همه سفارش‌ها
                </button>
                <button
                  type="button"
                  onClick={onDiscover}
                  className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-brand-2 text-white hover:bg-brand-2/90 transition-all text-xs font-black text-center cursor-pointer shadow-xs"
                >
                  نجات یک جعبه دیگر
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-surface border border-line space-y-3">
              <span className="w-12 h-12 rounded-2xl bg-brand-soft text-brand-2 grid place-items-center mx-auto">
                <Icon name="check" className="w-6 h-6" />
              </span>
              <h2 className="text-base font-black text-ink">سفارش فعالی در خط لوله نیست</h2>
              <p className="text-xs text-muted max-w-xs mx-auto">
                تمام سفارش‌های قبلی شما با موفقیت تحویل داده شده‌اند. برای امشب یک جعبه تازه نجات بدهید!
              </p>
              <button
                type="button"
                onClick={onDiscover}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-2 text-white font-black text-xs hover:bg-brand-2/90 transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
              >
                <span>مشاهده پیشنهادهای تازه</span>
                <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Empty State when cart is empty and no active orders */}
      {!pendingOffer && activeReservations.length === 0 && (
        <div className="p-8 text-center rounded-3xl bg-surface border border-line space-y-3.5">
          <span className="w-14 h-14 rounded-2xl bg-canvas border border-line text-muted grid place-items-center mx-auto">
            <Icon name="cart" className="w-7 h-7" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-black text-ink">سبد خرید شما خالی است</h2>
            <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
              هنوز جعبه‌ای را برای رزرو انتخاب نکرده‌اید. فروشگاه‌های محله را ببینید و یک جعبه نجات دهید.
            </p>
          </div>
          <button
            type="button"
            onClick={onDiscover}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-2 text-white font-black text-xs hover:bg-brand-2/90 transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>کشف جعبه‌های اطراف</span>
            <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
