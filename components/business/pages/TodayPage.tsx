"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { BusinessPageHeader, MetricCard, MiniBarChart } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { useDemo } from "@/demo/DemoProvider";
import { formatDate, formatDecimal, formatMoney, formatNumber, offerStatusLabel, orderStatusLabel, remainingQuantity } from "@/lib/demo-format";

export function TodayPage() {
  const { state, adjustStock, setOfferStatus, duplicateOffer } = useDemo();
  const { branchId, can, notify } = useBusinessUi();
  const [range, setRange] = useState<1 | 7 | 30>(7);
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");
  const branch = state.branches.find((item) => item.id === branchId);
  const offers = state.offers.filter((item) => item.businessId === state.business.id && item.branchId === branchId);
  const activeOffers = offers.filter((item) => ["active", "paused", "sold_out"].includes(item.status));
  const orders = state.orders.filter((item) => item.businessId === state.business.id && item.branchId === branchId);
  const recentOrders = orders.slice(0, 5);
  const revenue = state.finance.filter((item) => orders.some((order) => order.id === item.orderId)).reduce((sum, item) => sum + item.net, 0);
  const remaining = offers.reduce((sum, offer) => sum + remainingQuantity(offer), 0);
  const sold = offers.reduce((sum, offer) => sum + offer.soldQuantity, 0);
  const openComplaints = state.complaints.filter((item) => item.branchId === branchId && !["closed", "responded"].includes(item.status)).length;
  const chart = useMemo(() => state.analytics.slice(-range), [range, state.analytics]);
  const chartValues = range === 30 ? chart.filter((_, index) => index % 5 === 0 || index === chart.length - 1) : chart;

  const stock = (id: string, delta: number) => {
    if (!can("offers:write")) return notify("نقش فعال اجازه تغییر موجودی را ندارد.", "error");
    const result = adjustStock(id, delta);
    notify(result.ok ? "موجودی به‌روز شد و در نسخه مشتری هم اعمال شد." : result.error, result.ok ? "success" : "error");
  };

  const status = (id: string, next: "active" | "paused") => {
    if (!can("offers:write")) return notify("نقش فعال اجازه تغییر پیشنهاد را ندارد.", "error");
    const result = setOfferStatus(id, next);
    notify(result.ok ? (next === "active" ? "پیشنهاد دوباره فعال شد." : "پیشنهاد برای مشتریان متوقف شد.") : result.error, result.ok ? "success" : "error");
  };

  const duplicate = (id: string) => {
    if (!can("offers:write")) return notify("نقش فعال اجازه ساخت پیشنهاد را ندارد.", "error");
    const result = duplicateOffer(id);
    notify(result.ok ? "یک پیش‌نویس تازه ساخته شد." : result.error, result.ok ? "success" : "error");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <BusinessPageHeader
        eyebrow={formatDate(new Date())}
        title={`صبح بخیر، ${state.business.ownerName}`}
        description={`${branch?.name ?? "شعبه"} · وضعیت سفارش‌گیری ${branch?.acceptsOrders ? "روشن" : "خاموش"}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-xs sm:text-sm font-bold text-ink hover:bg-surface-raised cursor-pointer transition-colors no-underline"
              href="/business/pickup"
            >
              <span className="[&>svg]:w-4 [&>svg]:h-4 text-brand-2"><Icon name="check" /></span>
              <span>تحویل سریع</span>
            </Link>
            <Link
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 py-2 text-xs sm:text-sm font-bold hover:opacity-95 cursor-pointer transition-opacity no-underline shadow-xs"
              href="/business/offers"
            >
              <span className="[&>svg]:w-4 [&>svg]:h-4"><Icon name="plus" /></span>
              <span>ساخت پیشنهاد</span>
            </Link>
          </div>
        }
      />

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="شاخص‌های امروز">
        <MetricCard label="فروش امروز" value={formatMoney(revenue)} hint="مجموع سفارش‌های ثبت‌شده" tone="brand" />
        <MetricCard label="سفارش‌های امروز" value={formatNumber(orders.length)} hint={`${formatNumber(orders.filter((item) => item.status === "ready_for_pickup").length)} آماده تحویل`} />
        <MetricCard label="بسته‌های نجات‌یافته" value={formatNumber(sold)} hint="برآورد از فروش ثبت‌شده" />
        <MetricCard label="موجودی باقی‌مانده" value={formatNumber(remaining)} hint={`${formatNumber(offers.filter((item) => remainingQuantity(item) <= 2).length)} هشدار کمبود`} tone="accent" />
        <MetricCard label="بازه تحویل بعدی" value="۱۹:۳۰–۲۰:۳۰" hint={branch?.name ?? "شعبه"} />
        <MetricCard label="میانگین امتیاز" value={formatDecimal(state.business.rating)} hint={`${formatNumber(state.reviews.length)} نظر ثبت‌شده`} />
        <MetricCard label="پیگیری باز" value={formatNumber(openComplaints)} hint="نظرات و کیفیت" tone={openComplaints ? "accent" : "default"} />
      </section>

      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
          <div>
            <p className="text-xs font-bold text-brand-2 mb-1">وضعیت امروز</p>
            <h2 className="text-base sm:text-lg font-bold text-ink">پیشنهادهای در حال اجرا</h2>
          </div>
          <Link href="/business/offers" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-2 hover:underline no-underline">
            <span>مدیریت همه</span>
            <span className="rotate-180 [&>svg]:w-3.5 [&>svg]:h-3.5"><Icon name="arrow" /></span>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {activeOffers.map((offer) => (
            <article className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl border border-line bg-surface-raised transition-all hover:border-line-strong" key={offer.id}>
              <div className="flex items-center gap-3.5">
                <span className="relative block h-16 w-16 overflow-hidden rounded-xl border border-line shrink-0">
                  <FoodImage src={offer.image} sizes="80px" />
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[0.7rem] font-bold ${
                      offer.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : offer.status === "paused" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                    }`}>
                      {offerStatusLabel[offer.status]}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-ink">{offer.title}</h3>
                  </div>
                  <p className="text-xs text-muted">
                    {offer.pickupStart} تا {offer.pickupEnd} · {formatNumber(offer.soldQuantity)} فروخته · {formatNumber(remainingQuantity(offer))} مانده
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-line">
                <strong className="text-sm sm:text-base font-black text-brand-2 font-mono">{formatMoney(offer.soldQuantity * offer.salePrice)}</strong>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] h-11 w-11 grid place-items-center rounded-xl border border-line bg-surface text-ink hover:bg-canvas-soft cursor-pointer transition-colors [&>svg]:w-4 [&>svg]:h-4"
                    onClick={() => stock(offer.id, 1)}
                    aria-label={`افزایش موجودی ${offer.title}`}
                  >
                    <Icon name="plus" />
                  </button>
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] h-11 w-11 grid place-items-center rounded-xl border border-line bg-surface text-ink hover:bg-canvas-soft cursor-pointer transition-colors [&>svg]:w-4 [&>svg]:h-4"
                    onClick={() => stock(offer.id, -1)}
                    aria-label={`کاهش موجودی ${offer.title}`}
                  >
                    <Icon name="minus" />
                  </button>
                  <button
                    type="button"
                    className="min-h-[44px] h-11 px-3 rounded-xl border border-line bg-surface text-xs font-bold text-ink hover:bg-canvas-soft cursor-pointer transition-colors"
                    onClick={() => status(offer.id, offer.status === "paused" ? "active" : "paused")}
                  >
                    {offer.status === "paused" ? "ادامه" : "توقف"}
                  </button>
                  <button
                    type="button"
                    className="min-h-[44px] h-11 px-3 rounded-xl border border-line bg-surface text-xs font-bold text-ink hover:bg-canvas-soft cursor-pointer transition-colors"
                    onClick={() => duplicate(offer.id)}
                  >
                    کپی
                  </button>
                  <Link
                    href="/business/orders"
                    className="min-h-[44px] h-11 inline-flex items-center px-3 rounded-xl bg-surface-raised border border-line text-xs font-bold text-muted hover:text-ink no-underline transition-colors"
                  >
                    سفارش‌ها
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line mb-4 gap-2">
            <div>
              <p className="text-xs font-bold text-brand-2 mb-1">روند روزانه</p>
              <h2 className="text-base sm:text-lg font-bold text-ink">{chartMetric === "revenue" ? "فروش بسته‌ها" : "تعداد سفارش‌ها"}</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl bg-canvas-soft p-1 border border-line text-xs font-bold" role="group" aria-label="شاخص نمودار">
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${chartMetric === "revenue" ? "bg-surface text-ink font-bold shadow-xs" : "text-muted hover:text-ink"}`}
                  onClick={() => setChartMetric("revenue")}
                >
                  فروش
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${chartMetric === "orders" ? "bg-surface text-ink font-bold shadow-xs" : "text-muted hover:text-ink"}`}
                  onClick={() => setChartMetric("orders")}
                >
                  سفارش
                </button>
              </div>
              <div className="inline-flex rounded-xl bg-canvas-soft p-1 border border-line text-xs font-bold" role="group" aria-label="بازه نمودار">
                {([1, 7, 30] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${range === item ? "bg-surface text-ink font-bold shadow-xs" : "text-muted hover:text-ink"}`}
                    onClick={() => setRange(item)}
                  >
                    {item === 1 ? "امروز" : `${formatNumber(item)} روز`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <MiniBarChart
            title={chartMetric === "revenue" ? "فروش روزانه" : "سفارش‌های روزانه"}
            money={chartMetric === "revenue"}
            values={chartValues.map((item) => (chartMetric === "revenue" ? item.revenue : item.orders))}
            labels={chartValues.map((item) => item.date.slice(8))}
          />
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
            <div>
              <p className="text-xs font-bold text-brand-2 mb-1">سفارش‌ها</p>
              <h2 className="text-base sm:text-lg font-bold text-ink">آخرین فعالیت‌ها</h2>
            </div>
            <Link href="/business/orders" className="text-xs sm:text-sm font-bold text-brand-2 hover:underline no-underline">
              دیدن همه
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentOrders.map((order) => (
              <Link
                href="/business/orders"
                key={order.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-line bg-surface-raised hover:border-line-strong transition-colors no-underline text-start"
              >
                <div className="flex flex-col">
                  <strong className="text-xs sm:text-sm font-bold text-ink">{order.code}</strong>
                  <small className="text-xs text-muted">
                    {order.customerName} · {order.items[0].title}
                  </small>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[0.7rem] font-bold ${
                    order.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : order.status === "ready_for_pickup" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  }`}>
                    {orderStatusLabel[order.status]}
                  </span>
                  <b className="text-xs sm:text-sm font-bold font-mono text-ink">{formatMoney(order.total)}</b>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-xs text-start flex flex-col gap-3">
          <div>
            <p className="text-xs font-bold text-accent mb-1">هشدار موجودی</p>
            <h2 className="text-sm sm:text-base font-bold text-ink">نیاز به توجه</h2>
          </div>
          <div className="flex flex-col gap-2">
            {offers
              .filter((item) => remainingQuantity(item) <= 2)
              .slice(0, 4)
              .map((offer) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => stock(offer.id, 1)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-surface-raised hover:bg-canvas-soft transition-colors cursor-pointer text-start"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-accent shrink-0 [&>svg]:w-4 [&>svg]:h-4"><Icon name="info" /></span>
                    <div className="flex flex-col truncate">
                      <strong className="text-xs font-bold text-ink truncate">{offer.title}</strong>
                      <small className="text-[0.65rem] text-muted">{formatNumber(remainingQuantity(offer))} بسته مانده</small>
                    </div>
                  </div>
                  <em className="not-italic text-xs font-bold text-brand-2 px-1.5 py-0.5 rounded-md bg-brand-soft">
                    +۱
                  </em>
                </button>
              ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-xs text-start flex flex-col gap-3">
          <div>
            <p className="text-xs font-bold text-brand-2 mb-1">تحویل‌های نزدیک</p>
            <h2 className="text-sm sm:text-base font-bold text-ink">صف دریافت</h2>
          </div>
          <div className="flex flex-col gap-2">
            {orders
              .filter((item) => item.status === "ready_for_pickup")
              .slice(0, 4)
              .map((order) => (
                <Link
                  href="/business/pickup"
                  key={order.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-line bg-surface-raised hover:bg-canvas-soft transition-colors text-start no-underline"
                >
                  <span className="text-brand-2 shrink-0 [&>svg]:w-4 [&>svg]:h-4"><Icon name="clock" /></span>
                  <div className="flex flex-col truncate">
                    <strong className="text-xs font-bold text-ink truncate">{order.pickupStart} · {order.customerName}</strong>
                    <small className="text-[0.65rem] text-muted font-mono">{order.code}</small>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-xs text-start flex flex-col gap-3">
          <div>
            <p className="text-xs font-bold text-brand-2 mb-1">اعلان‌های اخیر</p>
            <h2 className="text-sm sm:text-base font-bold text-ink">چه خبر است؟</h2>
          </div>
          <div className="flex flex-col gap-2">
            {state.notifications.slice(0, 4).map((item) => (
              <Link
                href={item.href}
                key={item.id}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-line bg-surface-raised hover:bg-canvas-soft transition-colors text-start no-underline"
              >
                <span className="text-muted shrink-0 [&>svg]:w-4 [&>svg]:h-4"><Icon name="bell" /></span>
                <div className="flex flex-col truncate">
                  <strong className="text-xs font-bold text-ink truncate">{item.title}</strong>
                  <small className="text-[0.65rem] text-muted truncate">{item.text}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
