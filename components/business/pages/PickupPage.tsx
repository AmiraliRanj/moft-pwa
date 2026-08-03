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
        if (rawValue) { stopScanner(); verify(rawValue); notify("کد QR خوانده شد."); return; }
      } catch { /* A moving frame can be temporarily unreadable. */ }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
  };

  const startScanner = async () => {
    setVerification({ kind: "idle" });
    if (!navigator.mediaDevices?.getUserMedia) { setScanner("unsupported"); return; }
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!Detector) { setScanner("unsupported"); return; }
    setScanner("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      setScanner("active");
      window.setTimeout(async () => {
        if (!videoRef.current || !streamRef.current) return;
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
        scanFrames(new Detector({ formats: ["qr_code"] }));
      }, 0);
    } catch (error) {
      setScanner(error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") ? "denied" : "error");
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

  return <div className="business-page pickup-page">
    <BusinessPageHeader eyebrow="تحویل حضوری" title="بررسی کد دریافت" description="کد شش‌رقمی را وارد کنید یا کد QR مشتری را با دوربین بخوانید." />
    <div className="pickup-layout">
      <section className="business-panel pickup-entry"><div className="pickup-entry-icon"><Icon name="check" /></div><h2>کد دریافت را بررسی کنید</h2><p>کد را از صفحه سفارش مشتری بخوانید.</p><form onSubmit={(event) => { event.preventDefault(); verify(); }}><label><span className="sr-only">کد شش رقمی دریافت</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="_ _ _ _ _ _" dir="ltr" aria-describedby="pickup-help" /></label><small id="pickup-help">هر کد فقط یک‌بار و برای سفارش آمادهٔ تحویل قابل استفاده است.</small><button className="business-primary full" type="submit" disabled={code.length !== 6}>بررسی کد</button></form><div className="scan-divider"><span>یا</span></div><button className="simulate-scan" type="button" onClick={startScanner} disabled={scanner === "requesting" || scanner === "active"}>{scanner === "requesting" ? <><span className="spinner" /> در انتظار اجازه دوربین…</> : <><Icon name="camera" /> اسکن کد QR</>}</button>
        {scanner !== "closed" && <div className={`camera-panel ${scanner}`} role="status">{scanner === "active" && <><video ref={videoRef} playsInline muted aria-label="پیش‌نمایش دوربین برای اسکن کد QR" /><span className="camera-frame" /><p>کد QR را داخل قاب نگه دارید.</p><button type="button" onClick={stopScanner}>بستن دوربین</button></>}{scanner === "denied" && <><Icon name="info" /><strong>دسترسی دوربین داده نشد</strong><p>از تنظیمات مرورگر اجازهٔ دوربین را فعال کنید یا کد را دستی وارد کنید.</p><button type="button" onClick={() => setScanner("closed")}>ورود دستی</button></>}{scanner === "unsupported" && <><Icon name="info" /><strong>اسکن QR در این مرورگر پشتیبانی نمی‌شود</strong><p>کد شش‌رقمی را از مشتری بگیرید و در کادر بالا وارد کنید.</p><button type="button" onClick={() => setScanner("closed")}>ورود دستی</button></>}{scanner === "error" && <><Icon name="info" /><strong>دوربین آماده نشد</strong><p>دوربین را در برنامه دیگری ببندید و دوباره تلاش کنید، یا کد را دستی وارد کنید.</p><button type="button" onClick={() => setScanner("closed")}>ورود دستی</button></>}</div>}
      </section>
      <section className={`business-panel verification-result ${verification.kind}`} aria-live="polite">
        {verification.kind === "idle" && <div className="verification-placeholder"><span><Icon name="route" /></span><h2>منتظر کد دریافت</h2><p>پس از بررسی، جزئیات سفارش و امکان تأیید تحویل اینجا نمایش داده می‌شود.</p></div>}
        {verification.kind === "invalid" && <VerificationMessage icon="close" title="کد معتبر نیست" text="کد را دوباره با مشتری بررسی کنید. سفارشی تغییر نکرده است." />}
        {verification.kind === "used" && <VerificationMessage icon="info" title="این کد قبلاً استفاده شده" text="تحویل تکراری مسدود است. برای بررسی بیشتر به سفارش مراجعه کنید." />}
        {verification.kind === "expired" && <VerificationMessage icon="clock" title="اعتبار کد پایان یافته" text="این سفارش دیگر در بازه مجاز تحویل نیست. وضعیت سفارش را بررسی کنید." />}
        {verification.kind === "wrong_status" && <VerificationMessage icon="info" title="سفارش آماده تحویل نیست" text={`وضعیت فعلی: ${verification.order ? orderStatusLabel[verification.order.status] : "نامشخص"}. ابتدا وضعیت سفارش را اصلاح کنید.`} />}
        {verification.kind === "valid" && verification.order && <div className="verified-order"><span className="verified-badge"><Icon name="check" /> کد معتبر است</span><h2>{verification.order.customerName}</h2><p>{verification.order.code}</p><dl><div><dt>پیشنهاد</dt><dd>{verification.order.items[0].title}</dd></div><div><dt>تعداد</dt><dd>{formatNumber(verification.order.items[0].quantity)}</dd></div><div><dt>مبلغ</dt><dd>{formatMoney(verification.order.total)}</dd></div><div><dt>پرداخت</dt><dd>پرداخت‌شده</dd></div><div><dt>بازه دریافت</dt><dd>{verification.order.pickupStart}–{verification.order.pickupEnd}</dd></div><div><dt>وضعیت</dt><dd>{orderStatusLabel[verification.order.status]}</dd></div></dl><div className="verified-actions"><button className="business-primary" type="button" onClick={() => change("completed")}>تأیید نهایی تحویل</button><button type="button" onClick={() => { setVerification({ kind: "idle" }); setCode(""); notify("تحویل رد شد؛ وضعیت سفارش تغییر نکرد.", "error"); }}>رد تحویل</button><button className="danger-text" type="button" onClick={() => change("no_show")}>ثبت عدم مراجعه</button></div></div>}
      </section>
    </div>
  </div>;
}

function VerificationMessage({ icon, title, text }: { icon: "close" | "info" | "clock"; title: string; text: string }) {
  return <div className="verification-message"><span><Icon name={icon} /></span><h2>{title}</h2><p>{text}</p></div>;
}
