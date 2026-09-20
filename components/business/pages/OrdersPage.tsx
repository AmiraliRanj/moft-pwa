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
  { id: "all", label: "همه" },
  { id: "paid", label: "پرداخت‌شده" },
  { id: "preparing", label: "در حال آماده‌سازی" },
  { id: "ready_for_pickup", label: "آماده تحویل" },
  { id: "completed", label: "تحویل‌شده" },
  { id: "cancelled", label: "لغوشده" },
  { id: "no_show", label: "عدم مراجعه" },
  { id: "under_review", label: "نیازمند بررسی" },
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
    return filtered.sort((a, b) => (sort === "amount" ? b.total - a.total : sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
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
    try {
      await navigator.clipboard.writeText(order.code);
      notify("کد سفارش کپی شد.");
    } catch {
      notify(`کد سفارش: ${order.code}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <BusinessPageHeader eyebrow="عملیات سفارش" title="سفارش‌ها" description="سفارش مشتری را از پرداخت تا تحویل حضوری پیگیری کنید." />

      <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="وضعیت سفارش‌ها">
        {tabs.map((item) => {
          const count = item.id === "all" ? sourceOrders.length : sourceOrders.filter((order) => order.status === item.id).length;
          const isSelected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                isSelected ? "bg-brand text-white shadow-xs" : "bg-surface text-muted hover:text-ink"
              }`}
              onClick={() => setTab(item.id)}
            >
              <span>{item.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[0.65rem] ${isSelected ? "bg-white/20 text-white" : "bg-canvas-soft text-muted"}`}>
                {formatNumber(count)}
              </span>
            </button>
          );
        })}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-3xl border border-line bg-surface text-start text-xs" aria-label="فیلتر سفارش‌ها">
        <label className="relative flex items-center col-span-1 sm:col-span-2 lg:col-span-1">
          <span className="absolute start-3 text-muted [&>svg]:w-4 [&>svg]:h-4 pointer-events-none"><Icon name="search" /></span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="نام مشتری یا کد سفارش"
            className="w-full h-10 ps-9 pe-8 rounded-xl border border-line bg-surface-raised text-xs text-ink placeholder:text-muted focus:outline-focus"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute end-2.5 text-muted hover:text-ink cursor-pointer [&>svg]:w-4 [&>svg]:h-4" aria-label="پاک کردن جست‌وجو">
              <Icon name="close" />
            </button>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-bold text-muted">پیشنهاد</span>
          <select value={offerId} onChange={(event) => setOfferId(event.target.value)} className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus cursor-pointer">
            <option value="all">همه پیشنهادها</option>
            {businessOffers.map((offer) => (
              <option value={offer.id} key={offer.id}>{offer.title}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-bold text-muted">تاریخ</span>
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus cursor-pointer">
            <option value="all">همه تاریخ‌ها</option>
            <option value="today">امروز</option>
            <option value="week">۷ روز اخیر</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-bold text-muted">زمان دریافت</span>
          <select value={pickup} onChange={(event) => setPickup(event.target.value)} className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus cursor-pointer">
            <option value="all">همه بازه‌ها</option>
            <option value="19">۱۹ تا ۲۰</option>
            <option value="20">۲۰ تا ۲۱</option>
            <option value="21">۲۱ به بعد</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-bold text-muted">مرتب‌سازی</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus cursor-pointer">
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="amount">بیشترین مبلغ</option>
          </select>
        </label>
      </section>

      {orders.length ? (
        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs text-start">
          <div className="flex items-center justify-between pb-3 border-b border-line mb-3 text-xs">
            <span className="font-bold text-ink">{formatNumber(orders.length)} سفارش</span>
            <small className="text-muted">شعبه انتخاب‌شده</small>
          </div>

          <div className="hidden md:block overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-canvas-soft text-muted border-b border-line text-start">
                  <th className="px-4 py-3 font-bold text-start">سفارش</th>
                  <th className="px-4 py-3 font-bold text-start">مشتری</th>
                  <th className="px-4 py-3 font-bold text-start">پیشنهاد</th>
                  <th className="px-4 py-3 font-bold text-start">مبلغ</th>
                  <th className="px-4 py-3 font-bold text-start">بازه دریافت</th>
                  <th className="px-4 py-3 font-bold text-start">وضعیت</th>
                  <th className="px-4 py-3 font-bold text-start"><span className="sr-only">عملیات</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-raised/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-ink">
                      <div className="flex flex-col">
                        <span>{order.code}</span>
                        <small className="text-[0.65rem] text-muted font-normal">{formatDate(order.createdAt)}</small>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink">{order.customerName}</td>
                    <td className="px-4 py-3 text-ink">
                      <div className="flex flex-col">
                        <strong className="font-bold">{order.items[0].title}</strong>
                        <small className="text-[0.65rem] text-muted font-normal">{formatNumber(order.items[0].quantity)} عدد</small>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-ink">{formatMoney(order.total)}</td>
                    <td className="px-4 py-3 text-muted">{order.pickupStart}–{order.pickupEnd}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[0.7rem] font-bold ${
                        order.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : order.status === "ready_for_pickup" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}>
                        {orderStatusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        className="px-3 py-1 rounded-lg border border-line bg-surface hover:bg-canvas-soft text-xs font-bold text-ink cursor-pointer transition-colors"
                        type="button"
                        onClick={() => setSelected(order)}
                      >
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2.5 md:hidden">
            {orders.map((order) => (
              <button
                type="button"
                key={order.id}
                onClick={() => setSelected(order)}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-line bg-surface-raised hover:border-line-strong text-start transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <strong className="text-sm font-bold text-ink">{order.code}</strong>
                  <small className="text-xs text-muted">{order.customerName}</small>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <b className="text-xs font-mono font-bold text-ink">{formatMoney(order.total)}</b>
                  <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[0.65rem] font-bold ${
                    order.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : order.status === "ready_for_pickup" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  }`}>
                    {orderStatusLabel[order.status]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <EmptyBusinessState title="سفارشی با این فیلتر نیست" text="فیلترها یا عبارت جست‌وجو را تغییر دهید." />
      )}

      {selected && (
        <DialogShell titleId="order-detail-title" onClose={() => setSelected(null)} size="detail">
          <div className="flex flex-col gap-4 text-start">
            <div>
              <p className="text-xs font-bold text-brand-2">جزئیات سفارش</p>
              <h2 id="order-detail-title" className="text-xl font-black text-ink">{selected.code}</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-canvas-soft border border-line text-xs">
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">مشتری</small>
                <strong className="font-bold text-ink">{selected.customerName}</strong>
              </span>
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">پیشنهاد</small>
                <strong className="font-bold text-ink">{selected.items[0].title}</strong>
              </span>
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">تعداد و مبلغ</small>
                <strong className="font-bold text-ink">{formatNumber(selected.items[0].quantity)} · {formatMoney(selected.total)}</strong>
              </span>
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">پرداخت</small>
                <strong className="font-bold text-ink">
                  {selected.paymentStatus === "simulated_paid" ? "پرداخت‌شده" : selected.paymentStatus === "simulated_refunded" ? "بازپرداخت‌شده" : "پرداخت‌نشده"}
                </strong>
              </span>
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">زمان دریافت</small>
                <strong className="font-bold text-ink">{selected.pickupDate} · {selected.pickupStart}–{selected.pickupEnd}</strong>
              </span>
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">کد تحویل</small>
                <strong dir="ltr" className="font-mono font-bold text-brand-2">{selected.pickupCode.value}</strong>
              </span>
            </div>

            <section className="flex flex-col gap-2 my-2">
              <h3 className="text-xs font-bold text-ink">تاریخچه وضعیت</h3>
              <div className="flex flex-col gap-2 ps-3 border-s-2 border-brand-2/30 ms-1">
                {selected.history.map((entry, index) => (
                  <div key={`${entry.at}-${index}`} className="flex flex-col text-xs">
                    <strong className="font-bold text-ink">{orderStatusLabel[entry.status]}</strong>
                    <small className="text-muted text-[0.65rem]">{formatDate(entry.at)} · {entry.note}</small>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line text-xs font-bold">
              {selected.status === "paid" && (
                <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas-soft cursor-pointer" onClick={() => changeStatus(selected, "reviewed")}>
                  علامت بررسی‌شده
                </button>
              )}
              {["paid", "reviewed"].includes(selected.status) && (
                <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas-soft cursor-pointer" onClick={() => changeStatus(selected, "preparing")}>
                  شروع آماده‌سازی
                </button>
              )}
              {selected.status === "preparing" && (
                <button className="px-3 py-2 rounded-xl bg-brand text-white hover:opacity-95 cursor-pointer" type="button" onClick={() => changeStatus(selected, "ready_for_pickup")}>
                  آماده تحویل
                </button>
              )}
              {selected.status === "ready_for_pickup" && (
                <button className="px-3 py-2 rounded-xl bg-brand text-white hover:opacity-95 cursor-pointer" type="button" onClick={() => changeStatus(selected, "completed")}>
                  تأیید تحویل
                </button>
              )}
              {selected.status === "ready_for_pickup" && (
                <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-amber-600 hover:bg-canvas-soft cursor-pointer" onClick={() => setConfirmAction({ order: selected, status: "no_show" })}>
                  عدم مراجعه
                </button>
              )}
              {["paid", "reviewed", "preparing", "ready_for_pickup"].includes(selected.status) && (
                <button className="px-3 py-2 rounded-xl text-danger hover:bg-danger-soft cursor-pointer" type="button" onClick={() => setConfirmAction({ order: selected, status: "cancelled" })}>
                  لغو سفارش
                </button>
              )}
              {!["cancelled", "refunded"].includes(selected.status) && (
                <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas-soft cursor-pointer" onClick={() => changeStatus(selected, "under_review")}>
                  باز کردن پیگیری
                </button>
              )}
              <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas-soft cursor-pointer ms-auto" onClick={() => copyCode(selected)}>
                کپی کد
              </button>
              <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas-soft cursor-pointer" onClick={() => window.print()}>
                چاپ رسید
              </button>
            </div>
          </div>
        </DialogShell>
      )}

      {confirmAction && (
        <DialogShell label="تأیید تغییر وضعیت سفارش" onClose={() => setConfirmAction(null)} size="center">
          <div className="flex flex-col items-center justify-center text-center p-6 gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger [&>svg]:w-6 [&>svg]:h-6">
              <Icon name="info" />
            </span>
            <h2 className="text-base font-bold text-ink">
              {confirmAction.status === "cancelled" ? "سفارش لغو شود؟" : "عدم مراجعه ثبت شود؟"}
            </h2>
            <p className="text-xs text-muted max-w-xs">
              {confirmAction.status === "cancelled"
                ? "در صورت مجاز بودن، موجودی برگردانده و تراکنش بازپرداخت می‌شود."
                : "این وضعیت نشان می‌دهد مشتری در بازه دریافت مراجعه نکرده است."}
            </p>
            <div className="flex items-center gap-3 mt-3 w-full">
              <button
                className="flex-1 min-h-[40px] rounded-xl border border-line bg-surface text-xs font-bold text-ink hover:bg-canvas-soft cursor-pointer"
                type="button"
                onClick={() => setConfirmAction(null)}
              >
                انصراف
              </button>
              <button
                className="flex-1 min-h-[40px] rounded-xl bg-danger text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                type="button"
                onClick={() => {
                  changeStatus(confirmAction.order, confirmAction.status);
                  setConfirmAction(null);
                }}
              >
                تأیید
              </button>
            </div>
          </div>
        </DialogShell>
      )}
    </div>
  );
}
