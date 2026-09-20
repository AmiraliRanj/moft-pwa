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

  const orderIds = state.orders
    .filter((order) => order.businessId === state.business.id && order.branchId === branchId)
    .map((order) => order.id);

  const transactions = useMemo(() => {
    const referenceTime = new Date(`${state.analytics.at(-1)?.date ?? "2026-08-02"}T23:59:59.000Z`).getTime();
    return state.finance.filter(
      (item) =>
        orderIds.includes(item.orderId) &&
        (status === "all" || item.status === status) &&
        (type === "all" || item.type === type) &&
        (date === "all" || (referenceTime - new Date(item.createdAt).getTime()) / 86400000 <= Number(date))
    );
  }, [date, orderIds, state.analytics, state.finance, status, type]);

  const gross = transactions.reduce((sum, item) => sum + item.gross, 0);
  const commission = transactions.reduce((sum, item) => sum + item.commission, 0);
  const refunds = transactions.reduce((sum, item) => sum + item.refund, 0);
  const net = transactions.reduce((sum, item) => sum + item.net, 0);
  const nextSettlement = state.settlements.find((item) => item.status === "scheduled");

  const downloadCsv = () => {
    const csv = `\uFEFF${financeService.toCsv(state, transactions.map((item) => item.id))}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "dibz-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("فایل CSV تراکنش‌های فیلترشده آماده شد.");
  };

  if (!can("finance:read")) {
    return (
      <div className="space-y-6">
        <BusinessPageHeader
          eyebrow="دسترسی محدود"
          title="امور مالی"
          description="این بخش فقط برای مالک و حسابدار در دسترس است."
        />
        <EmptyBusinessState
          title="دسترسی مالی ندارید"
          text="نقش فعال را از پایین نوار کناری تغییر دهید یا با مالک مجموعه هماهنگ کنید."
        />
      </div>
    );
  }

  const getStatusBadge = (txStatus: string) => {
    if (txStatus === "settled") {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    }
    if (txStatus === "pending") {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    }
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
  };

  return (
    <div className="space-y-6">
      <BusinessPageHeader
        eyebrow="امور مالی"
        title="فروش و تسویه"
        description="گردش تراکنش‌ها، بازپرداخت‌ها و دوره‌های تسویه را بررسی کنید."
        action={
          <button
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface border border-line text-ink hover:bg-surface-raised transition-colors shadow-xs"
            type="button"
            onClick={downloadCsv}
          >
            <Icon name="share" className="w-4 h-4 text-muted" />
            <span>دانلود CSV</span>
          </button>
        }
      />

      <section className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
        <Icon name="info" className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <strong className="block text-xs font-bold">حساب تسویه شبا</strong>
          <p className="text-[11px] opacity-90 mt-0.5 font-mono tracking-wider">{state.business.demoBankIban}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard label="فروش ناخالص" value={formatMoney(gross)} hint={`${formatNumber(transactions.length)} تراکنش`} tone="brand" />
        <MetricCard label="کمیسیون پلتفرم" value={formatMoney(commission)} hint="۱۲٪ از فروش" />
        <MetricCard label="بازپرداخت" value={formatMoney(refunds)} hint="تراکنش‌های بازگشتی" tone={refunds ? "accent" : "default"} />
        <MetricCard label="خالص قابل پرداخت" value={formatMoney(net)} hint="پس از کمیسیون و بازپرداخت" />
        <MetricCard
          label="تسویه بعدی"
          value={formatMoney(nextSettlement?.amount ?? 0)}
          hint={nextSettlement ? `${formatDate(nextSettlement.dueAt)} · برنامه‌ریزی‌شده` : "تسویه‌ای نیست"}
        />
      </section>

      <section className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-surface border border-line">
        <label className="flex flex-col gap-1 text-xs text-muted min-w-[130px]">
          <span className="text-[11px] font-medium">بازه زمانی</span>
          <select
            className="h-9 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          >
            <option value="all">همه</option>
            <option value="7">۷ روز اخیر</option>
            <option value="30">۳۰ روز اخیر</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted min-w-[130px]">
          <span className="text-[11px] font-medium">وضعیت</span>
          <select
            className="h-9 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار تسویه</option>
            <option value="settled">تسویه‌شده</option>
            <option value="refunded">بازپرداخت‌شده</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted min-w-[130px]">
          <span className="text-[11px] font-medium">نوع تراکنش</span>
          <select
            className="h-9 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">همه انواع</option>
            <option value="sale">فروش</option>
            <option value="refund">بازپرداخت</option>
            <option value="adjustment">اصلاح</option>
          </select>
        </label>
      </section>

      <section className="rounded-2xl bg-surface border border-line shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-line bg-canvas/30">
          <div>
            <h2 className="text-base font-black text-ink">تراکنش‌ها</h2>
          </div>
          <span className="text-xs text-muted font-medium bg-canvas px-2.5 py-1 rounded-full border border-line">
            {formatNumber(transactions.length)} ردیف
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-line bg-canvas/60 text-muted font-semibold">
                <th className="py-3 px-4 text-start">سفارش</th>
                <th className="py-3 px-4 text-start">ناخالص</th>
                <th className="py-3 px-4 text-start">کمیسیون</th>
                <th className="py-3 px-4 text-start">بازپرداخت</th>
                <th className="py-3 px-4 text-start">خالص</th>
                <th className="py-3 px-4 text-start">تاریخ</th>
                <th className="py-3 px-4 text-start">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {transactions.map((item) => (
                <tr key={item.id} className="hover:bg-canvas/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-ink">{item.orderId}</td>
                  <td className="py-3 px-4 text-ink font-medium">{formatMoney(item.gross)}</td>
                  <td className="py-3 px-4 text-muted">{formatMoney(item.commission)}</td>
                  <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-medium">{formatMoney(item.refund)}</td>
                  <td className="py-3 px-4 font-black text-ink">{formatMoney(item.net)}</td>
                  <td className="py-3 px-4 text-muted">{formatDate(item.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(item.status)}`}>
                      {item.status === "settled" ? "تسویه‌شده" : item.status === "pending" ? "در انتظار" : "بازپرداخت"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden grid gap-2.5 p-3.5">
          {transactions.map((item) => (
            <article key={item.id} className="p-3.5 rounded-xl bg-surface-raised border border-line space-y-2.5">
              <div className="flex items-center justify-between">
                <strong className="font-mono font-bold text-xs text-ink">{item.orderId}</strong>
                <small className="text-[11px] text-muted">{formatDate(item.createdAt)}</small>
              </div>
              <dl className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-surface border border-line/60">
                  <dt className="text-[10px] text-muted">ناخالص</dt>
                  <dd className="text-xs font-bold text-ink mt-0.5">{formatMoney(item.gross)}</dd>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-line/60">
                  <dt className="text-[10px] text-muted">کمیسیون</dt>
                  <dd className="text-xs font-bold text-muted mt-0.5">{formatMoney(item.commission)}</dd>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-line/60">
                  <dt className="text-[10px] text-muted">بازپرداخت</dt>
                  <dd className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">{formatMoney(item.refund)}</dd>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-line/60">
                  <dt className="text-[10px] text-muted">خالص</dt>
                  <dd className="text-xs font-black text-ink mt-0.5">{formatMoney(item.net)}</dd>
                </div>
              </dl>
              <div className="flex justify-end pt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(item.status)}`}>
                  {item.status === "settled" ? "تسویه‌شده" : item.status === "pending" ? "در انتظار" : "بازپرداخت"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-surface border border-line shadow-xs overflow-hidden">
        <div className="p-4 border-b border-line bg-canvas/30">
          <h2 className="text-base font-black text-ink">دوره‌ها</h2>
        </div>
        <div className="divide-y divide-line">
          {state.settlements.map((item) => (
            <div
              key={item.id}
              className="min-h-[60px] grid grid-cols-1 sm:grid-cols-3 items-center gap-3 px-4 py-3 hover:bg-canvas/40 transition-colors"
            >
              <div>
                <strong className="block text-xs font-bold text-ink">{item.period}</strong>
                <small className="block text-[11px] text-muted mt-0.5">{formatDate(item.dueAt)}</small>
              </div>
              <b className="text-xs font-black text-ink sm:text-center">{formatMoney(item.amount)}</b>
              <div className="sm:text-end">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    item.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {item.status === "paid" ? "واریزشده" : "برنامه‌ریزی‌شده"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
