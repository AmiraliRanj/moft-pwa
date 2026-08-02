"use client";

import { useState } from "react";
import { BusinessPageHeader } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { formatMoney, formatNumber, orderStatusLabel } from "@/lib/demo-format";
import type { Order } from "@/types/demo";

type Verification = { kind: "idle" | "valid" | "invalid" | "used" | "wrong_status"; order?: Order };

export function PickupPage() {
  const { verifyPickup, transitionOrder } = useDemo();
  const { can, notify } = useBusinessUi();
  const [code, setCode] = useState("");
  const [verification, setVerification] = useState<Verification>({ kind: "idle" });
  const [scanning, setScanning] = useState(false);

  const verify = (value = code) => {
    const normalized = value.replace(/\D/g, "").slice(0, 6);
    setCode(normalized);
    if (normalized.length !== 6) return setVerification({ kind: "invalid" });
    setVerification(verifyPickup(normalized));
  };

  const simulateScan = () => {
    setScanning(true); setVerification({ kind: "idle" });
    window.setTimeout(() => { setScanning(false); verify("482913"); notify("کد QR نمایشی خوانده شد."); }, 900);
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
    <div className="business-page pickup-page">
      <BusinessPageHeader eyebrow="تحویل حضوری" title="بررسی کد دریافت" description="کد شش‌رقمی مشتری را بررسی کنید یا اسکن QR را در محیط دمو شبیه‌سازی کنید." />
      <div className="pickup-layout">
        <section className="business-panel pickup-entry"><div className="pickup-entry-icon"><Icon name="check" /></div><h2>کد دریافت را وارد کنید</h2><p>کد نمونه معتبر برای ارائه: <strong dir="ltr">482913</strong></p><form onSubmit={(event) => { event.preventDefault(); verify(); }}><label><span className="sr-only">کد شش رقمی دریافت</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="_ _ _ _ _ _" dir="ltr" aria-describedby="pickup-help" /></label><small id="pickup-help">کد فقط یک‌بار و برای سفارش آماده تحویل قابل استفاده است.</small><button className="business-primary full" type="submit" disabled={code.length !== 6}>بررسی کد</button></form><div className="scan-divider"><span>یا</span></div><button className="simulate-scan" type="button" onClick={simulateScan} disabled={scanning}>{scanning ? <><span className="spinner" /> در حال شبیه‌سازی اسکن…</> : <><Icon name="spark" /> شبیه‌سازی اسکن QR</>}</button></section>

        <section className={`business-panel verification-result ${verification.kind}`} aria-live="polite">
          {verification.kind === "idle" && <div className="verification-placeholder"><span><Icon name="route" /></span><h2>منتظر کد دریافت</h2><p>پس از بررسی، جزئیات سفارش و وضعیت مجاز تحویل اینجا دیده می‌شود.</p></div>}
          {verification.kind === "invalid" && <VerificationMessage icon="close" title="کد معتبر نیست" text="کد را دوباره با مشتری بررسی کنید. هیچ تغییری در سفارش ایجاد نشد." />}
          {verification.kind === "used" && <VerificationMessage icon="info" title="این کد قبلاً استفاده شده" text="تحویل تکراری مسدود است. برای بررسی بیشتر به سفارش مراجعه کنید." />}
          {verification.kind === "wrong_status" && <VerificationMessage icon="info" title="سفارش آماده تحویل نیست" text={`وضعیت فعلی: ${verification.order ? orderStatusLabel[verification.order.status] : "نامشخص"}. ابتدا وضعیت سفارش را اصلاح کنید.`} />}
          {verification.kind === "valid" && verification.order && <div className="verified-order"><span className="verified-badge"><Icon name="check" /> کد معتبر است</span><h2>{verification.order.customerName}</h2><p>{verification.order.code}</p><dl><div><dt>پیشنهاد</dt><dd>{verification.order.items[0].title}</dd></div><div><dt>تعداد</dt><dd>{formatNumber(verification.order.items[0].quantity)}</dd></div><div><dt>مبلغ</dt><dd>{formatMoney(verification.order.total)}</dd></div><div><dt>پرداخت</dt><dd>پرداخت نمایشی موفق</dd></div><div><dt>بازه دریافت</dt><dd>{verification.order.pickupStart}–{verification.order.pickupEnd}</dd></div><div><dt>وضعیت</dt><dd>{orderStatusLabel[verification.order.status]}</dd></div></dl><div className="verified-actions"><button className="business-primary" type="button" onClick={() => change("completed")}>تأیید تحویل</button><button type="button" onClick={() => { setVerification({ kind: "idle" }); setCode(""); notify("تحویل رد شد؛ وضعیت سفارش تغییر نکرد.", "error"); }}>رد تحویل</button><button className="danger-text" type="button" onClick={() => change("no_show")}>ثبت عدم مراجعه</button></div></div>}
        </section>
      </div>
    </div>
  );
}

function VerificationMessage({ icon, title, text }: { icon: "close" | "info"; title: string; text: string }) {
  return <div className="verification-message"><span><Icon name={icon} /></span><h2>{title}</h2><p>{text}</p></div>;
}
