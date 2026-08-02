"use client";

import { useMemo, useState } from "react";
import { BusinessPageHeader, EmptyBusinessState } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { DialogShell } from "@/components/moft/DialogShell";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { formatDate, formatMoney, formatNumber, orderStatusLabel } from "@/lib/demo-format";
import type { Order, OrderStatus } from "@/types/demo";

type Tab = "all" | OrderStatus;
const tabs: Array<{ id: Tab; label: string }> = [
  { id: "all", label: "همه" }, { id: "paid", label: "پرداخت‌شده" }, { id: "preparing", label: "در حال آماده‌سازی" },
  { id: "ready_for_pickup", label: "آماده تحویل" }, { id: "completed", label: "تحویل‌شده" }, { id: "cancelled", label: "لغوشده" },
  { id: "no_show", label: "عدم مراجعه" }, { id: "under_review", label: "نیازمند بررسی" },
];

export function OrdersPage() {
  const { state, transitionOrder } = useDemo();
  const { branchId, can, notify } = useBusinessUi();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [offerId, setOfferId] = useState("all");
  const [pickup, setPickup] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Order | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ order: Order; status: "cancelled" | "no_show" } | null>(null);
  const businessOffers = state.offers.filter((offer) => offer.businessId === state.business.id);
  const sourceOrders = state.orders.filter((order) => order.businessId === state.business.id && order.branchId === branchId);

  const orders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const referenceTime = new Date(`${state.analytics.at(-1)?.date ?? "2026-08-02"}T23:59:59.000Z`).getTime();
    const filtered = sourceOrders.filter((order) => {
      const textMatch = !normalized || `${order.code} ${order.customerName} ${order.items.map((item) => item.title).join(" ")}`.toLowerCase().includes(normalized);
      const tabMatch = tab === "all" || order.status === tab;
      const offerMatch = offerId === "all" || order.items.some((item) => item.offerId === offerId);
      const pickupMatch = pickup === "all" || order.pickupStart.startsWith(pickup);
      const days = (referenceTime - new Date(order.createdAt).getTime()) / 86400000;
      const dateMatch = dateRange === "all" || (dateRange === "today" ? days <= 1 : days <= 7);
      return textMatch && tabMatch && offerMatch && pickupMatch && dateMatch;
    });
    return filtered.sort((a, b) => sort === "amount" ? b.total - a.total : sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt));
  }, [dateRange, offerId, pickup, query, sort, sourceOrders, state.analytics, tab]);

  const changeStatus = (order: Order, status: OrderStatus) => {
    if (!can("orders:write") && status !== "completed") return notify("نقش فعال اجازه تغییر سفارش را ندارد.", "error");
    if (status === "completed" && !can("pickup:write")) return notify("نقش فعال اجازه تأیید تحویل را ندارد.", "error");
    const result = transitionOrder(order.id, status);
    if (result.ok) {
      setSelected(result.value);
      notify(`وضعیت سفارش به «${orderStatusLabel[status]}» تغییر کرد.`);
    } else notify(result.error, "error");
  };

  const copyCode = async (order: Order) => {
    try { await navigator.clipboard.writeText(order.code); notify("کد سفارش کپی شد."); }
    catch { notify(`کد سفارش: ${order.code}`); }
  };

  return (
    <div className="business-page orders-page">
      <BusinessPageHeader eyebrow="عملیات سفارش" title="سفارش‌ها" description="سفارش مشتری را از پرداخت نمایشی تا تحویل حضوری پیگیری کنید." />
      <div className="business-tabs" role="tablist" aria-label="وضعیت سفارش‌ها">{tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}<span>{formatNumber(item.id === "all" ? sourceOrders.length : sourceOrders.filter((order) => order.status === item.id).length)}</span></button>)}</div>
      <section className="business-filters" aria-label="فیلتر سفارش‌ها">
        <label className="business-search"><Icon name="search" /><span className="sr-only">جست‌وجوی سفارش</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام مشتری یا کد سفارش" />{query && <button type="button" onClick={() => setQuery("")} aria-label="پاک کردن جست‌وجو"><Icon name="close" /></button>}</label>
        <label><span>پیشنهاد</span><select value={offerId} onChange={(event) => setOfferId(event.target.value)}><option value="all">همه پیشنهادها</option>{businessOffers.map((offer) => <option value={offer.id} key={offer.id}>{offer.title}</option>)}</select></label>
        <label><span>تاریخ</span><select value={dateRange} onChange={(event) => setDateRange(event.target.value)}><option value="all">همه تاریخ‌ها</option><option value="today">امروز</option><option value="week">۷ روز اخیر</option></select></label>
        <label><span>زمان دریافت</span><select value={pickup} onChange={(event) => setPickup(event.target.value)}><option value="all">همه بازه‌ها</option><option value="19">۱۹ تا ۲۰</option><option value="20">۲۰ تا ۲۱</option><option value="21">۲۱ به بعد</option></select></label>
        <label><span>مرتب‌سازی</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">جدیدترین</option><option value="oldest">قدیمی‌ترین</option><option value="amount">بیشترین مبلغ</option></select></label>
      </section>

      {orders.length ? <section className="business-panel data-panel">
        <div className="table-summary"><span>{formatNumber(orders.length)} سفارش</span><small>شعبه انتخاب‌شده</small></div>
        <div className="business-table-wrap"><table className="business-table"><thead><tr><th>سفارش</th><th>مشتری</th><th>پیشنهاد</th><th>مبلغ</th><th>بازه دریافت</th><th>وضعیت</th><th><span className="sr-only">عملیات</span></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.code}</strong><small>{formatDate(order.createdAt)}</small></td><td>{order.customerName}</td><td><strong>{order.items[0].title}</strong><small>{formatNumber(order.items[0].quantity)} عدد</small></td><td>{formatMoney(order.total)}</td><td>{order.pickupStart}–{order.pickupEnd}</td><td><span className={`business-status ${order.status}`}>{orderStatusLabel[order.status]}</span></td><td><button className="table-action" type="button" onClick={() => setSelected(order)}>جزئیات</button></td></tr>)}</tbody></table></div>
        <div className="order-mobile-list">{orders.map((order) => <button type="button" key={order.id} onClick={() => setSelected(order)}><span><strong>{order.code}</strong><small>{order.customerName}</small></span><span><b>{formatMoney(order.total)}</b><small>{order.pickupStart}–{order.pickupEnd}</small></span><span className={`business-status ${order.status}`}>{orderStatusLabel[order.status]}</span></button>)}</div>
      </section> : <EmptyBusinessState title="سفارشی با این فیلتر نیست" text="فیلترها یا عبارت جست‌وجو را تغییر دهید." />}

      {selected && <DialogShell titleId="order-detail-title" onClose={() => setSelected(null)} size="detail"><div className="business-dialog order-detail-dialog"><p className="eyebrow">جزئیات سفارش</p><h2 id="order-detail-title">{selected.code}</h2><div className="order-detail-grid"><span><small>مشتری</small><strong>{selected.customerName}</strong></span><span><small>پیشنهاد</small><strong>{selected.items[0].title}</strong></span><span><small>تعداد و مبلغ</small><strong>{formatNumber(selected.items[0].quantity)} · {formatMoney(selected.total)}</strong></span><span><small>پرداخت</small><strong>{selected.paymentStatus === "simulated_paid" ? "پرداخت نمایشی موفق" : selected.paymentStatus === "simulated_refunded" ? "بازپرداخت نمایشی" : "پرداخت‌نشده"}</strong></span><span><small>زمان دریافت</small><strong>{selected.pickupDate} · {selected.pickupStart}–{selected.pickupEnd}</strong></span><span><small>کد تحویل</small><strong dir="ltr">{selected.pickupCode.value}</strong></span></div>
        <section className="status-timeline"><h3>تاریخچه وضعیت</h3>{selected.history.map((entry, index) => <div key={`${entry.at}-${index}`}><i /><span><strong>{orderStatusLabel[entry.status]}</strong><small>{formatDate(entry.at)} · {entry.note}</small></span></div>)}</section>
        <div className="order-detail-actions">
          {selected.status === "paid" && <button type="button" onClick={() => changeStatus(selected, "reviewed")}>علامت بررسی‌شده</button>}
          {["paid", "reviewed"].includes(selected.status) && <button type="button" onClick={() => changeStatus(selected, "preparing")}>شروع آماده‌سازی</button>}
          {selected.status === "preparing" && <button className="business-primary" type="button" onClick={() => changeStatus(selected, "ready_for_pickup")}>آماده تحویل</button>}
          {selected.status === "ready_for_pickup" && <button className="business-primary" type="button" onClick={() => changeStatus(selected, "completed")}>تأیید تحویل</button>}
          {selected.status === "ready_for_pickup" && <button type="button" onClick={() => setConfirmAction({ order: selected, status: "no_show" })}>عدم مراجعه</button>}
          {["paid", "reviewed", "preparing", "ready_for_pickup"].includes(selected.status) && <button className="danger-text" type="button" onClick={() => setConfirmAction({ order: selected, status: "cancelled" })}>لغو سفارش</button>}
          {! ["cancelled", "refunded"].includes(selected.status) && <button type="button" onClick={() => changeStatus(selected, "under_review")}>باز کردن پیگیری</button>}
          <button type="button" onClick={() => copyCode(selected)}>کپی کد</button>
          <button type="button" onClick={() => window.print()}>چاپ رسید</button>
        </div>
      </div></DialogShell>}

      {confirmAction && <DialogShell label="تأیید تغییر وضعیت سفارش" onClose={() => setConfirmAction(null)} size="center"><div className="cancel-dialog"><span className="danger-icon"><Icon name="info" /></span><h2>{confirmAction.status === "cancelled" ? "سفارش لغو شود؟" : "عدم مراجعه ثبت شود؟"}</h2><p>{confirmAction.status === "cancelled" ? "در صورت مجاز بودن، موجودی برگردانده و تراکنش نمایشی بازپرداخت می‌شود." : "این وضعیت نشان می‌دهد مشتری در بازه دریافت مراجعه نکرده است."}</p><div><button className="secondary-button" type="button" onClick={() => setConfirmAction(null)}>انصراف</button><button className="danger-button" type="button" onClick={() => { changeStatus(confirmAction.order, confirmAction.status); setConfirmAction(null); }}>تأیید</button></div></div></DialogShell>}
    </div>
  );
}
