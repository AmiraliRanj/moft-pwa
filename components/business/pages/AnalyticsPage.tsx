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
  const days = useMemo(
    () =>
      range === "custom"
        ? state.analytics.filter((item) => item.date >= customStart && item.date <= customEnd)
        : state.analytics.slice(-range),
    [customEnd, customStart, range, state.analytics]
  );
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
  const chartDays =
    days.length > 10
      ? days.filter((_, index) => index % Math.ceil(days.length / 8) === 0 || index === days.length - 1)
      : days;
  const statusCounts = Object.entries(orderStatusLabel)
    .map(([status, label]) => ({
      status: status as OrderStatus,
      label,
      value: orders.filter((order) => order.status === status).length,
    }))
    .filter((item) => item.value);

  return (
    <div className="flex flex-col gap-6 w-full text-start">
      <BusinessPageHeader
        eyebrow="گزارش عملکرد"
        title="گزارش‌ها"
        description="شاخص‌های عملیاتی بر اساس شعبه و بازهٔ انتخابی محاسبه می‌شوند."
      />

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-canvas-soft p-1 border border-line text-xs font-bold" role="group" aria-label="بازه گزارش">
          {([1, 7, 30] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                range === item ? "bg-surface text-ink shadow-xs font-bold" : "text-muted hover:text-ink"
              }`}
              onClick={() => setRange(item)}
            >
              {item === 1 ? "امروز" : `${formatNumber(item)} روز گذشته`}
            </button>
          ))}
          <button
            type="button"
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              range === "custom" ? "bg-surface text-ink shadow-xs font-bold" : "text-muted hover:text-ink"
            }`}
            onClick={() => setRange("custom")}
          >
            بازه سفارشی
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs">
            <span className="font-bold text-muted">شعبه:</span>
            <select
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              className="h-9 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus cursor-pointer"
            >
              {state.branches.map((branch) => (
                <option value={branch.id} key={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>

          {range === "custom" && (
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1">
                <span className="text-muted">از</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="h-9 px-2 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                />
              </label>
              <label className="flex items-center gap-1">
                <span className="text-muted">تا</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="h-9 px-2 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                />
              </label>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard label="درآمد" value={formatMoney(revenue)} hint="فروش ناخالص" tone="brand" />
        <MetricCard label="سفارش" value={formatNumber(orderCount)} hint="در بازه انتخابی" />
        <MetricCard label="نرخ فروش" value={`${formatNumber(total ? Math.round((sold / total) * 100) : 0)}٪`} hint={`${formatNumber(sold)} از ${formatNumber(total)} بسته`} />
        <MetricCard label="بسته نجات‌یافته" value={formatNumber(saved)} hint={`${formatDecimal(saved * 0.78)} کیلو غذای برآوردی`} />
        <MetricCard label="میانگین سفارش" value={formatMoney(orderCount ? Math.round(revenue / orderCount) : 0)} hint="بر پایه فروش ثبت‌شده" />
        <MetricCard label="عدم مراجعه" value={`${formatDecimal(orderCount ? (noShows / orderCount) * 100 : 0)}٪`} hint={`${formatNumber(noShows)} مورد`} />
        <MetricCard label="بازپرداخت" value={`${formatDecimal(orderCount ? (refunds / orderCount) * 100 : 0)}٪`} hint={`${formatNumber(refunds)} مورد`} />
        <MetricCard label="میانگین امتیاز" value={formatDecimal(rating)} hint="از ۵" />
        <MetricCard label="نرخ پیگیری" value={`${formatDecimal(orders.length ? (complaintCount / orders.length) * 100 : 0)}٪`} hint={`${formatNumber(complaintCount)} مورد`} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <section className="md:col-span-2 rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-ink">درآمد در طول زمان</h2>
          <p className="text-xs text-muted">تومان</p>
          <MiniBarChart money title="درآمد در طول زمان" values={chartDays.map((item) => item.revenue)} labels={chartDays.map((item) => item.date.slice(8))} />
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-ink">سفارش در طول زمان</h2>
          <p className="text-xs text-muted">تعداد سفارش</p>
          <MiniBarChart values={chartDays.map((item) => item.orders)} labels={chartDays.map((item) => item.date.slice(8))} />
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-ink">فروش بر اساس پیشنهاد</h2>
          <p className="text-xs text-muted">تعداد بسته</p>
          <MiniBarChart values={offers.map((item) => item.soldQuantity)} labels={offers.map((item) => item.title.slice(0, 8))} />
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-ink">سفارش بر اساس زمان دریافت</h2>
          <p className="text-xs text-muted">بازه شروع</p>
          <MiniBarChart values={[19, 20, 21].map((hour) => orders.filter((item) => Number(item.pickupStart.slice(0, 2)) === hour).length)} labels={["۱۹", "۲۰", "۲۱"]} />
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-ink">نرخ فروش پیشنهادها</h2>
          <p className="text-xs text-muted">درصد از موجودی کل</p>
          <MiniBarChart values={offers.map((item) => (item.totalQuantity ? (item.soldQuantity / item.totalQuantity) * 100 : 0))} labels={offers.map((item) => item.title.slice(0, 8))} />
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-ink">توزیع امتیاز</h2>
          <p className="text-xs text-muted">نظر مشتریان</p>
          <MiniBarChart values={[1, 2, 3, 4, 5].map((ratingValue) => state.reviews.filter((item) => item.branchId === branchId && item.rating === ratingValue).length)} labels={["۱★", "۲★", "۳★", "۴★", "۵★"]} />
        </section>

        <section className="md:col-span-2 rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start flex flex-col gap-4">
          <h2 className="text-base sm:text-lg font-bold text-ink">توزیع وضعیت سفارش‌ها</h2>
          <div className="flex flex-col gap-3">
            {statusCounts.map((item) => {
              const pct = orders.length ? (item.value / orders.length) * 100 : 0;
              return (
                <div key={item.status} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{item.label}</span>
                    <strong className="font-mono text-muted">{formatNumber(item.value)} ({formatNumber(Math.round(pct))}٪)</strong>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div className="h-full bg-brand-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <p className="text-[0.7rem] text-muted text-center pt-2">
        اعداد گزارش‌ها برای نمایش قابلیت‌های محصول تولید شده‌اند و ادعای اثر زیست‌محیطی یا مالی قطعی نیستند.
      </p>
    </div>
  );
}
