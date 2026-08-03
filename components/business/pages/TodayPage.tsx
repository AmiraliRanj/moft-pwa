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
    <div className="business-page">
      <BusinessPageHeader eyebrow={formatDate(new Date())} title={`صبح بخیر، ${state.business.ownerName}`} description={`${branch?.name ?? "شعبه"} · وضعیت سفارش‌گیری ${branch?.acceptsOrders ? "روشن" : "خاموش"}`} action={<><Link className="business-secondary" href="/business/pickup"><Icon name="check" /> تحویل سریع</Link><Link className="business-primary" href="/business/offers"><Icon name="plus" /> ساخت پیشنهاد</Link></>} />

      <section className="business-metrics" aria-label="شاخص‌های امروز">
        <MetricCard label="فروش امروز" value={formatMoney(revenue)} hint="مجموع سفارش‌های ثبت‌شده" tone="brand" />
        <MetricCard label="سفارش‌های امروز" value={formatNumber(orders.length)} hint={`${formatNumber(orders.filter((item) => item.status === "ready_for_pickup").length)} آماده تحویل`} />
        <MetricCard label="بسته‌های نجات‌یافته" value={formatNumber(sold)} hint="برآورد از فروش ثبت‌شده" />
        <MetricCard label="موجودی باقی‌مانده" value={formatNumber(remaining)} hint={`${formatNumber(offers.filter((item) => remainingQuantity(item) <= 2).length)} هشدار کمبود`} tone="accent" />
        <MetricCard label="بازه تحویل بعدی" value="۱۹:۳۰–۲۰:۳۰" hint={branch?.name ?? "شعبه"} />
        <MetricCard label="میانگین امتیاز" value={formatDecimal(state.business.rating)} hint={`${formatNumber(state.reviews.length)} نظر ثبت‌شده`} />
        <MetricCard label="پیگیری باز" value={formatNumber(openComplaints)} hint="نظرات و کیفیت" tone={openComplaints ? "accent" : "default"} />
      </section>

      <section className="business-panel today-status">
        <div className="business-panel-head"><div><p className="eyebrow">وضعیت امروز</p><h2>پیشنهادهای در حال اجرا</h2></div><Link href="/business/offers">مدیریت همه <Icon name="arrow" /></Link></div>
        <div className="today-offer-list">
          {activeOffers.map((offer) => <article className="today-offer" key={offer.id}>
            <span className="today-offer-image"><FoodImage src={offer.image} sizes="80px" /></span>
            <div className="today-offer-main"><span className={`business-status ${offer.status}`}>{offerStatusLabel[offer.status]}</span><h3>{offer.title}</h3><p>{offer.pickupStart} تا {offer.pickupEnd} · {formatNumber(offer.soldQuantity)} فروخته · {formatNumber(remainingQuantity(offer))} مانده</p></div>
            <strong>{formatMoney(offer.soldQuantity * offer.salePrice)}</strong>
            <div className="today-offer-actions">
              <button type="button" onClick={() => stock(offer.id, 1)} aria-label={`افزایش موجودی ${offer.title}`}><Icon name="plus" /></button>
              <button type="button" onClick={() => stock(offer.id, -1)} aria-label={`کاهش موجودی ${offer.title}`}><Icon name="minus" /></button>
              <button type="button" onClick={() => status(offer.id, offer.status === "paused" ? "active" : "paused")}>{offer.status === "paused" ? "ادامه" : "توقف"}</button>
              <button type="button" onClick={() => duplicate(offer.id)}>کپی</button>
              <Link href="/business/orders">سفارش‌ها</Link>
            </div>
          </article>)}
        </div>
      </section>

      <div className="business-two-column">
        <section className="business-panel revenue-panel">
          <div className="business-panel-head"><div><p className="eyebrow">روند روزانه</p><h2>{chartMetric === "revenue" ? "فروش بسته‌ها" : "تعداد سفارش‌ها"}</h2></div><div className="chart-controls"><div className="business-segments" role="group" aria-label="شاخص نمودار"><button type="button" className={chartMetric === "revenue" ? "active" : ""} onClick={() => setChartMetric("revenue")}>فروش</button><button type="button" className={chartMetric === "orders" ? "active" : ""} onClick={() => setChartMetric("orders")}>سفارش</button></div><div className="business-segments" role="group" aria-label="بازه نمودار">{([1, 7, 30] as const).map((item) => <button key={item} type="button" className={range === item ? "active" : ""} onClick={() => setRange(item)}>{item === 1 ? "امروز" : `${formatNumber(item)} روز`}</button>)}</div></div></div>
          <MiniBarChart title={chartMetric === "revenue" ? "فروش روزانه" : "سفارش‌های روزانه"} money={chartMetric === "revenue"} values={chartValues.map((item) => chartMetric === "revenue" ? item.revenue : item.orders)} labels={chartValues.map((item) => item.date.slice(8))} />
        </section>
        <section className="business-panel">
          <div className="business-panel-head"><div><p className="eyebrow">سفارش‌ها</p><h2>آخرین فعالیت‌ها</h2></div><Link href="/business/orders">دیدن همه</Link></div>
          <div className="compact-order-list">{recentOrders.map((order) => <Link href="/business/orders" key={order.id}><span><strong>{order.code}</strong><small>{order.customerName} · {order.items[0].title}</small></span><span className={`business-status ${order.status}`}>{orderStatusLabel[order.status]}</span><b>{formatMoney(order.total)}</b></Link>)}</div>
        </section>
      </div>

      <div className="business-three-column">
        <section className="business-panel small-panel"><p className="eyebrow">هشدار موجودی</p><h2>نیاز به توجه</h2>{offers.filter((item) => remainingQuantity(item) <= 2).slice(0, 4).map((offer) => <button key={offer.id} type="button" onClick={() => stock(offer.id, 1)}><Icon name="info" /><span><strong>{offer.title}</strong><small>{formatNumber(remainingQuantity(offer))} بسته مانده</small></span><em>+۱</em></button>)}</section>
        <section className="business-panel small-panel"><p className="eyebrow">تحویل‌های نزدیک</p><h2>صف دریافت</h2>{orders.filter((item) => item.status === "ready_for_pickup").slice(0, 4).map((order) => <Link href="/business/pickup" key={order.id}><Icon name="clock" /><span><strong>{order.pickupStart} · {order.customerName}</strong><small>{order.code}</small></span></Link>)}</section>
        <section className="business-panel small-panel"><p className="eyebrow">اعلان‌های اخیر</p><h2>چه خبر است؟</h2>{state.notifications.slice(0, 4).map((item) => <Link href={item.href} key={item.id}><Icon name="bell" /><span><strong>{item.title}</strong><small>{item.text}</small></span></Link>)}</section>
      </div>
    </div>
  );
}
