"use client";

import { useEffect, useRef, useState } from "react";
import { BusinessPageHeader } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { formatMoney, formatNumber, orderStatusLabel } from "@/lib/demo-format";
import type { Order } from "@/types/demo";

type Verification = { kind: "idle" | "valid" | "invalid" | "used" | "wrong_status" | "expired"; order?: Order };
type ScannerState = "closed" | "requesting" | "active" | "denied" | "unsupported" | "error";
type BarcodeDetectorInstance = { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

export function PickupPage() {
  const { verifyPickup, transitionOrder } = useDemo();
  const { can, notify } = useBusinessUi();
  const [code, setCode] = useState("");
  const [verification, setVerification] = useState<Verification>({ kind: "idle" });
  const [scanner, setScanner] = useState<ScannerState>("closed");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef(0);

  const stopScanner = () => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanner("closed");
  };

  useEffect(() => () => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const verify = (value = code) => {
    const match = value.match(/\d{6}/);
    const normalized = (match?.[0] ?? value).replace(/\D/g, "").slice(0, 6);
    setCode(normalized);
    if (normalized.length !== 6) return setVerification({ kind: "invalid" });
    setVerification(verifyPickup(normalized));
  };

  const scanFrames = (detector: BarcodeDetectorInstance) => {
    const tick = async () => {
      const video = videoRef.current;
      if (!video || !streamRef.current) return;
      try {
        const rawValue = (await detector.detect(video))[0]?.rawValue;
        if (rawValue) {
          stopScanner();
          verify(rawValue);
          notify("کد QR خوانده شد.");
          return;
        }
      } catch {
        /* A moving frame can be temporarily unreadable. */
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
  };

  const startScanner = async () => {
    setVerification({ kind: "idle" });
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanner("unsupported");
      return;
    }
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!Detector) {
      setScanner("unsupported");
      return;
    }
    setScanner("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setScanner("active");
      window.setTimeout(async () => {
        if (!videoRef.current || !streamRef.current) return;
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
        scanFrames(new Detector({ formats: ["qr_code"] }));
      }, 0);
    } catch (error) {
      setScanner(
        error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "PermissionDeniedError")
          ? "denied"
          : "error"
      );
    }
  };

  const change = (status: "completed" | "no_show") => {
    const order = verification.order;
    if (!order) return;
    if (!can("pickup:write")) return notify("نقش فعال اجازه ثبت تحویل را ندارد.", "error");
    const result = transitionOrder(order.id, status);
    if (!result.ok) return notify(result.error, "error");
    setVerification({ kind: status === "completed" ? "used" : "wrong_status", order: result.value });
    notify(status === "completed" ? "تحویل تأیید شد؛ کد دیگر قابل استفاده نیست." : "عدم مراجعه ثبت شد.");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <BusinessPageHeader
        eyebrow="تحویل حضوری"
        title="بررسی کد دریافت"
        description="کد شش‌رقمی را وارد کنید یا کد QR مشتری را با دوربین بخوانید."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl border border-line bg-surface shadow-xs">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand-2 [&>svg]:w-6 [&>svg]:h-6">
            <Icon name="check" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-ink">کد دریافت را بررسی کنید</h2>
          <p className="mt-1 mb-5 text-xs sm:text-sm text-muted">کد را از صفحه سفارش مشتری بخوانید.</p>

          <form
            className="flex flex-col gap-3 w-full max-w-sm"
            onSubmit={(event) => {
              event.preventDefault();
              verify();
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="sr-only">کد شش رقمی دریافت</span>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                dir="ltr"
                aria-describedby="pickup-help"
                className="w-full h-16 rounded-2xl border-2 border-line bg-surface-raised px-4 text-center font-mono text-2xl sm:text-3xl tracking-[0.25em] font-black text-ink focus:border-brand-2 focus:outline-none transition-colors"
              />
            </label>
            <small id="pickup-help" className="text-[0.7rem] text-muted">
              هر کد فقط یک‌بار و برای سفارش آمادهٔ تحویل قابل استفاده است.
            </small>
            <button
              className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-brand font-bold text-white text-sm hover:opacity-95 disabled:opacity-50 cursor-pointer transition-opacity"
              type="submit"
              disabled={code.length !== 6}
            >
              بررسی کد
            </button>
          </form>

          <div className="relative w-full max-w-sm my-5 flex items-center justify-center before:absolute before:inset-x-0 before:h-px before:bg-line">
            <span className="relative z-10 bg-surface px-3 text-xs text-muted font-bold">یا</span>
          </div>

          <button
            className="flex min-h-[44px] w-full max-w-sm items-center justify-center gap-2 rounded-xl border border-line bg-surface-raised text-xs sm:text-sm font-bold text-ink hover:bg-canvas-soft cursor-pointer transition-colors disabled:opacity-50"
            type="button"
            onClick={startScanner}
            disabled={scanner === "requesting" || scanner === "active"}
          >
            {scanner === "requesting" ? (
              <span>در انتظار اجازه دوربین…</span>
            ) : (
              <>
                <span className="[&>svg]:w-4 [&>svg]:h-4 text-brand-2"><Icon name="camera" /></span>
                <span>اسکن کد QR</span>
              </>
            )}
          </button>

          {scanner !== "closed" && (
            <div className="mt-4 w-full max-w-sm flex flex-col items-center gap-3 p-4 rounded-2xl bg-canvas-soft border border-line text-xs" role="status">
              {scanner === "active" && (
                <>
                  <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-black">
                    <video ref={videoRef} playsInline muted aria-label="پیش‌نمایش دوربین برای اسکن کد QR" className="w-full h-full object-cover" />
                    <span className="absolute inset-8 border-2 border-brand-2 rounded-xl pointer-events-none animate-pulse" />
                  </div>
                  <p className="text-muted">کد QR را داخل قاب نگه دارید.</p>
                  <button type="button" className="text-danger font-bold cursor-pointer" onClick={stopScanner}>
                    بستن دوربین
                  </button>
                </>
              )}
              {scanner === "denied" && (
                <>
                  <span className="text-danger [&>svg]:w-5 [&>svg]:h-5"><Icon name="info" /></span>
                  <strong className="text-ink font-bold">دسترسی دوربین داده نشد</strong>
                  <p className="text-muted text-center">از تنظیمات مرورگر اجازهٔ دوربین را فعال کنید یا کد را دستی وارد کنید.</p>
                  <button type="button" className="text-brand-2 font-bold cursor-pointer" onClick={() => setScanner("closed")}>ورود دستی</button>
                </>
              )}
              {scanner === "unsupported" && (
                <>
                  <span className="text-amber-500 [&>svg]:w-5 [&>svg]:h-5"><Icon name="info" /></span>
                  <strong className="text-ink font-bold">اسکن QR در این مرورگر پشتیبانی نمی‌شود</strong>
                  <p className="text-muted text-center">کد شش‌رقمی را از مشتری بگیرید و در کادر بالا وارد کنید.</p>
                  <button type="button" className="text-brand-2 font-bold cursor-pointer" onClick={() => setScanner("closed")}>ورود دستی</button>
                </>
              )}
              {scanner === "error" && (
                <>
                  <span className="text-danger [&>svg]:w-5 [&>svg]:h-5"><Icon name="info" /></span>
                  <strong className="text-ink font-bold">دوربین آماده نشد</strong>
                  <p className="text-muted text-center">دوربین را در برنامه دیگری ببندید و دوباره تلاش کنید، یا کد را دستی وارد کنید.</p>
                  <button type="button" className="text-brand-2 font-bold cursor-pointer" onClick={() => setScanner("closed")}>ورود دستی</button>
                </>
              )}
            </div>
          )}
        </section>

        <section className="flex flex-col p-6 sm:p-8 rounded-3xl border border-line bg-surface shadow-xs text-start" aria-live="polite">
          {verification.kind === "idle" && (
            <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center">
              <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-canvas-soft text-muted [&>svg]:w-7 [&>svg]:h-7">
                <Icon name="route" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ink">منتظر کد دریافت</h2>
              <p className="mt-1 text-xs sm:text-sm text-muted max-w-xs">
                پس از بررسی، جزئیات سفارش و امکان تأیید تحویل اینجا نمایش داده می‌شود.
              </p>
            </div>
          )}
          {verification.kind === "invalid" && (
            <VerificationMessage icon="close" title="کد معتبر نیست" text="کد را دوباره با مشتری بررسی کنید. سفارشی تغییر نکرده است." tone="danger" />
          )}
          {verification.kind === "used" && (
            <VerificationMessage icon="info" title="این کد قبلاً استفاده شده" text="تحویل تکراری مسدود است. برای بررسی بیشتر به سفارش مراجعه کنید." tone="warning" />
          )}
          {verification.kind === "expired" && (
            <VerificationMessage icon="clock" title="اعتبار کد پایان یافته" text="این سفارش دیگر در بازه مجاز تحویل نیست. وضعیت سفارش را بررسی کنید." tone="warning" />
          )}
          {verification.kind === "wrong_status" && (
            <VerificationMessage
              icon="info"
              title="سفارش آماده تحویل نیست"
              text={`وضعیت فعلی: ${verification.order ? orderStatusLabel[verification.order.status] : "نامشخص"}. ابتدا وضعیت سفارش را اصلاح کنید.`}
              tone="warning"
            />
          )}
          {verification.kind === "valid" && verification.order && (
            <div className="flex flex-col gap-4 text-start">
              <span className="inline-flex items-center gap-1.5 self-start rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="[&>svg]:w-3.5 [&>svg]:h-3.5"><Icon name="check" /></span>
                <span>کد معتبر است</span>
              </span>

              <div>
                <h2 className="text-xl font-bold text-ink">{verification.order.customerName}</h2>
                <p className="text-xs text-muted font-mono">{verification.order.code}</p>
              </div>

              <dl className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-canvas-soft border border-line text-xs">
                <div>
                  <dt className="text-[0.65rem] text-muted font-bold">پیشنهاد</dt>
                  <dd className="font-bold text-ink mt-0.5">{verification.order.items[0].title}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] text-muted font-bold">تعداد</dt>
                  <dd className="font-bold text-ink mt-0.5">{formatNumber(verification.order.items[0].quantity)}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] text-muted font-bold">مبلغ</dt>
                  <dd className="font-mono font-bold text-brand-2 mt-0.5">{formatMoney(verification.order.total)}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] text-muted font-bold">پرداخت</dt>
                  <dd className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">پرداخت‌شده</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] text-muted font-bold">بازه دریافت</dt>
                  <dd className="font-bold text-ink mt-0.5">{verification.order.pickupStart}–{verification.order.pickupEnd}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] text-muted font-bold">وضعیت</dt>
                  <dd className="font-bold text-ink mt-0.5">{orderStatusLabel[verification.order.status]}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line text-xs font-bold">
                <button
                  className="flex-1 min-h-[42px] rounded-xl bg-brand text-white hover:opacity-95 cursor-pointer transition-opacity"
                  type="button"
                  onClick={() => change("completed")}
                >
                  تأیید نهایی تحویل
                </button>
                <button
                  className="min-h-[42px] px-4 rounded-xl border border-line bg-surface text-ink hover:bg-canvas-soft cursor-pointer transition-colors"
                  type="button"
                  onClick={() => {
                    setVerification({ kind: "idle" });
                    setCode("");
                    notify("تحویل رد شد؛ وضعیت سفارش تغییر نکرد.", "error");
                  }}
                >
                  رد تحویل
                </button>
                <button
                  className="text-danger hover:underline px-2 cursor-pointer"
                  type="button"
                  onClick={() => change("no_show")}
                >
                  ثبت عدم مراجعه
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function VerificationMessage({
  icon,
  title,
  text,
  tone = "danger",
}: {
  icon: "close" | "info" | "clock";
  title: string;
  text: string;
  tone?: "danger" | "warning";
}) {
  const isDanger = tone === "danger";
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center gap-2.5">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${isDanger ? "bg-danger-soft text-danger" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"} [&>svg]:w-6 [&>svg]:h-6`}>
        <Icon name={icon} />
      </span>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <p className="text-xs text-muted max-w-xs">{text}</p>
    </div>
  );
}
