"use client";

import { useMemo, useState } from "react";
import { BusinessPageHeader, MetricCard, MiniBarChart } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { useDemo } from "@/demo/DemoProvider";
import { formatDecimal, formatMoney, formatNumber, orderStatusLabel } from "@/lib/demo-format";
import type { OrderStatus } from "@/types/demo";

type Range = 1 | 7 | 30 | "custom";

export function AnalyticsPage() {
  const { state } = useDemo();
  const { branchId, setBranchId } = useBusinessUi();
  const [range, setRange] = useState<Range>(30);
  const [customStart, setCustomStart] = useState(state.analytics.at(-7)?.date ?? "");
  const [customEnd, setCustomEnd] = useState(state.analytics.at(-1)?.date ?? "");
  const days = useMemo(() => range === "custom" ? state.analytics.filter((item) => item.date >= customStart && item.date <= customEnd) : state.analytics.slice(-range), [customEnd, customStart, range, state.analytics]);
  const orders = state.orders.filter((item) => item.businessId === state.business.id && item.branchId === branchId);
  const offers = state.offers.filter((item) => item.businessId === state.business.id && item.branchId === branchId);
  const revenue = days.reduce((sum, item) => sum + item.revenue, 0);
  const orderCount = days.reduce((sum, item) => sum + item.orders, 0);
  const saved = days.reduce((sum, item) => sum + item.savedPackages, 0);
  const noShows = days.reduce((sum, item) => sum + item.noShows, 0);
  const refunds = days.reduce((sum, item) => sum + item.refunds, 0);
  const rating = days.length ? days.reduce((sum, item) => sum + item.rating, 0) / days.length : 0;
  const sold = offers.reduce((sum, item) => sum + item.soldQuantity, 0);
  const total = offers.reduce((sum, item) => sum + item.totalQuantity, 0);
  const complaintCount = state.complaints.filter((item) => item.branchId === branchId).length;
  const chartDays = days.length > 10 ? days.filter((_, index) => index % Math.ceil(days.length / 8) === 0 || index === days.length - 1) : days;
  const statusCounts = Object.entries(orderStatusLabel).map(([status, label]) => ({ status: status as OrderStatus, label, value: orders.filter((order) => order.status === status).length })).filter((item) => item.value);

  return (
    <div className="business-page analytics-page">
      <BusinessPageHeader eyebrow="داده‌های قطعی و نمایشی" title="گزارش‌ها" description="شاخص‌های عملیاتی از seed ثابت محاسبه می‌شوند و با فیلترها تغییر می‌کنند." />
      <section className="analytics-filters"><div className="business-segments" role="group" aria-label="بازه گزارش">{([1, 7, 30] as const).map((item) => <button key={item} type="button" className={range === item ? "active" : ""} onClick={() => setRange(item)}>{item === 1 ? "امروز" : `${formatNumber(item)} روز گذشته`}</button>)}<button type="button" className={range === "custom" ? "active" : ""} onClick={() => setRange("custom")}>بازه سفارشی</button></div><label><span>شعبه</span><select value={branchId} onChange={(event) => setBranchId(event.target.value)}>{state.branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></label>{range === "custom" && <div className="custom-date-fields"><label><span>از</span><input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} /></label><label><span>تا</span><input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} /></label></div>}</section>
      <section className="business-metrics analytics-metrics"><MetricCard label="درآمد" value={formatMoney(revenue)} hint="فروش ناخالص نمایشی" tone="brand" /><MetricCard label="سفارش" value={formatNumber(orderCount)} hint="در بازه انتخابی" /><MetricCard label="نرخ فروش" value={`${formatNumber(total ? Math.round(sold / total * 100) : 0)}٪`} hint={`${formatNumber(sold)} از ${formatNumber(total)} بسته`} /><MetricCard label="بسته نجات‌یافته" value={formatNumber(saved)} hint={`${formatDecimal(saved * 0.78)} کیلو غذای برآوردی`} /><MetricCard label="میانگین سفارش" value={formatMoney(orderCount ? Math.round(revenue / orderCount) : 0)} hint="بر پایه فروش نمایشی" /><MetricCard label="عدم مراجعه" value={`${formatDecimal(orderCount ? noShows / orderCount * 100 : 0)}٪`} hint={`${formatNumber(noShows)} مورد`} /><MetricCard label="بازپرداخت" value={`${formatDecimal(orderCount ? refunds / orderCount * 100 : 0)}٪`} hint={`${formatNumber(refunds)} مورد`} /><MetricCard label="میانگین امتیاز" value={formatDecimal(rating)} hint="از ۵" /><MetricCard label="نرخ پیگیری" value={`${formatDecimal(orders.length ? complaintCount / orders.length * 100 : 0)}٪`} hint={`${formatNumber(complaintCount)} مورد`} /></section>
      <div className="analytics-grid">
        <section className="business-panel chart-card wide"><h2>درآمد در طول زمان</h2><p>تومان · داده دمو</p><MiniBarChart money values={chartDays.map((item) => item.revenue)} labels={chartDays.map((item) => item.date.slice(8))} /></section>
        <section className="business-panel chart-card"><h2>سفارش در طول زمان</h2><p>تعداد سفارش</p><MiniBarChart values={chartDays.map((item) => item.orders)} labels={chartDays.map((item) => item.date.slice(8))} /></section>
        <section className="business-panel chart-card"><h2>فروش بر اساس پیشنهاد</h2><p>تعداد بسته</p><MiniBarChart values={offers.map((item) => item.soldQuantity)} labels={offers.map((item) => item.title.slice(0, 8))} /></section>
        <section className="business-panel chart-card"><h2>سفارش بر اساس زمان دریافت</h2><p>بازه شروع</p><MiniBarChart values={[19, 20, 21].map((hour) => orders.filter((item) => Number(item.pickupStart.slice(0, 2)) === hour).length)} labels={["۱۹", "۲۰", "۲۱"]} /></section>
        <section className="business-panel chart-card"><h2>نرخ فروش پیشنهادها</h2><p>درصد از موجودی کل</p><MiniBarChart values={offers.map((item) => item.totalQuantity ? item.soldQuantity / item.totalQuantity * 100 : 0)} labels={offers.map((item) => item.title.slice(0, 8))} /></section>
        <section className="business-panel chart-card"><h2>توزیع امتیاز</h2><p>نظر مشتریان</p><MiniBarChart values={[1, 2, 3, 4, 5].map((ratingValue) => state.reviews.filter((item) => item.branchId === branchId && item.rating === ratingValue).length)} labels={["۱★", "۲★", "۳★", "۴★", "۵★"]} /></section>
        <section className="business-panel chart-card wide"><h2>توزیع وضعیت سفارش‌ها</h2><div className="status-distribution">{statusCounts.map((item) => <div key={item.status}><span><i className={item.status} />{item.label}</span><strong>{formatNumber(item.value)}</strong><em><i style={{ width: `${orders.length ? item.value / orders.length * 100 : 0}%` }} /></em></div>)}</div></section>
      </div>
      <p className="analytics-disclaimer">اعداد گزارش‌ها برای نمایش قابلیت‌های محصول تولید شده‌اند و ادعای اثر زیست‌محیطی یا مالی قطعی نیستند.</p>
    </div>
  );
}
