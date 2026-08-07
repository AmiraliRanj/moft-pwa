"use client";

import { useMemo, useState } from "react";
import { BusinessPageHeader, EmptyBusinessState, MetricCard } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { financeService } from "@/demo/services";
import { formatDate, formatMoney, formatNumber } from "@/lib/demo-format";

export function FinancePage() {
  const { state } = useDemo();
  const { branchId, can, notify } = useBusinessUi();
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [date, setDate] = useState("all");
  const orderIds = state.orders.filter((order) => order.businessId === state.business.id && order.branchId === branchId).map((order) => order.id);
  const transactions = useMemo(() => {
    const referenceTime = new Date(`${state.analytics.at(-1)?.date ?? "2026-08-02"}T23:59:59.000Z`).getTime();
    return state.finance.filter((item) => orderIds.includes(item.orderId) && (status === "all" || item.status === status) && (type === "all" || item.type === type) && (date === "all" || (referenceTime - new Date(item.createdAt).getTime()) / 86400000 <= Number(date)));
  }, [date, orderIds, state.analytics, state.finance, status, type]);
  const gross = transactions.reduce((sum, item) => sum + item.gross, 0);
  const commission = transactions.reduce((sum, item) => sum + item.commission, 0);
  const refunds = transactions.reduce((sum, item) => sum + item.refund, 0);
  const net = transactions.reduce((sum, item) => sum + item.net, 0);
  const nextSettlement = state.settlements.find((item) => item.status === "scheduled");

  const downloadCsv = () => {
    const csv = `\uFEFF${financeService.toCsv(state, transactions.map((item) => item.id))}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "dibz-transactions.csv"; link.click(); URL.revokeObjectURL(url);
    notify("فایل CSV تراکنش‌های فیلترشده آماده شد.");
  };

  if (!can("finance:read")) return <div className="business-page"><BusinessPageHeader eyebrow="دسترسی محدود" title="امور مالی" description="این بخش فقط برای مالک و حسابدار در دسترس است." /><EmptyBusinessState title="دسترسی مالی ندارید" text="نقش فعال را از پایین نوار کناری تغییر دهید یا با مالک مجموعه هماهنگ کنید." /></div>;

  return (
    <div className="business-page finance-page">
      <BusinessPageHeader eyebrow="امور مالی" title="فروش و تسویه" description="گردش تراکنش‌ها، بازپرداخت‌ها و دوره‌های تسویه را بررسی کنید." action={<button className="business-secondary" type="button" onClick={downloadCsv}><Icon name="share" /> دانلود CSV</button>} />
      <section className="demo-finance-banner"><Icon name="info" /><div><strong>حساب تسویه</strong><p>{state.business.demoBankIban}</p></div></section>
      <section className="business-metrics finance-metrics"><MetricCard label="فروش ناخالص" value={formatMoney(gross)} hint={`${formatNumber(transactions.length)} تراکنش`} tone="brand" /><MetricCard label="کمیسیون پلتفرم" value={formatMoney(commission)} hint="۱۲٪ از فروش" /><MetricCard label="بازپرداخت" value={formatMoney(refunds)} hint="تراکنش‌های بازگشتی" tone={refunds ? "accent" : "default"} /><MetricCard label="خالص قابل پرداخت" value={formatMoney(net)} hint="پس از کمیسیون و بازپرداخت" /><MetricCard label="تسویه بعدی" value={formatMoney(nextSettlement?.amount ?? 0)} hint={nextSettlement ? `${formatDate(nextSettlement.dueAt)} · برنامه‌ریزی‌شده` : "تسویه‌ای نیست"} /></section>
      <section className="business-filters finance-filters"><label><span>بازه زمانی</span><select value={date} onChange={(event) => setDate(event.target.value)}><option value="all">همه</option><option value="7">۷ روز اخیر</option><option value="30">۳۰ روز اخیر</option></select></label><label><span>وضعیت</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">همه وضعیت‌ها</option><option value="pending">در انتظار تسویه</option><option value="settled">تسویه‌شده</option><option value="refunded">بازپرداخت‌شده</option></select></label><label><span>نوع تراکنش</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">همه انواع</option><option value="sale">فروش</option><option value="refund">بازپرداخت</option><option value="adjustment">اصلاح</option></select></label></section>
      <section className="business-panel data-panel"><div className="business-panel-head"><div><p className="eyebrow">گردش مالی</p><h2>تراکنش‌ها</h2></div><span>{formatNumber(transactions.length)} ردیف</span></div><div className="business-table-wrap"><table className="business-table finance-table"><thead><tr><th>سفارش</th><th>ناخالص</th><th>کمیسیون</th><th>بازپرداخت</th><th>خالص</th><th>تاریخ</th><th>وضعیت</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id}><td><strong>{item.orderId}</strong></td><td>{formatMoney(item.gross)}</td><td>{formatMoney(item.commission)}</td><td>{formatMoney(item.refund)}</td><td><strong>{formatMoney(item.net)}</strong></td><td>{formatDate(item.createdAt)}</td><td><span className={`business-status finance-${item.status}`}>{item.status === "settled" ? "تسویه‌شده" : item.status === "pending" ? "در انتظار" : "بازپرداخت"}</span></td></tr>)}</tbody></table></div><div className="finance-mobile-list">{transactions.map((item) => <article key={item.id}><span><strong>{item.orderId}</strong><small>{formatDate(item.createdAt)}</small></span><dl><div><dt>ناخالص</dt><dd>{formatMoney(item.gross)}</dd></div><div><dt>کمیسیون</dt><dd>{formatMoney(item.commission)}</dd></div><div><dt>بازپرداخت</dt><dd>{formatMoney(item.refund)}</dd></div><div><dt>خالص</dt><dd>{formatMoney(item.net)}</dd></div></dl><span className={`business-status finance-${item.status}`}>{item.status === "settled" ? "تسویه‌شده" : item.status === "pending" ? "در انتظار" : "بازپرداخت"}</span></article>)}</div></section>
      <section className="business-panel settlement-panel"><div className="business-panel-head"><div><p className="eyebrow">سابقه تسویه</p><h2>دوره‌ها</h2></div></div>{state.settlements.map((item) => <div className="settlement-row" key={item.id}><span><strong>{item.period}</strong><small>{formatDate(item.dueAt)}</small></span><b>{formatMoney(item.amount)}</b><span className={`business-status settlement-${item.status}`}>{item.status === "paid" ? "واریزشده" : "برنامه‌ریزی‌شده"}</span></div>)}</section>
    </div>
  );
}
