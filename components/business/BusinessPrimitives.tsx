"use client";

import { useState, type ReactNode } from "react";
import { formatMoney, formatNumber } from "@/lib/demo-format";

export function BusinessPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-start">
      <div>
        <p className="mb-1 text-xs font-bold tracking-wide text-brand-2">{eyebrow}</p>
        <h1 className="text-2xl sm:text-3xl font-black text-ink">{title}</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted">{description}</p>
      </div>
      {action && <div className="flex w-full sm:w-auto items-center gap-2">{action}</div>}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "brand" | "accent";
}) {
  const toneClasses =
    tone === "brand"
      ? "border-brand-2/20 bg-brand-soft/30 text-brand-2"
      : tone === "accent"
      ? "border-accent/20 bg-accent-soft/30 text-accent"
      : "border-line bg-surface text-ink";

  return (
    <article className={`flex flex-col justify-between min-h-[110px] sm:min-h-[125px] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-xs transition-all text-start ${toneClasses}`}>
      <span className="text-xs font-semibold text-muted">{label}</span>
      <strong className="my-1.5 block text-xl sm:text-2xl font-black text-ink">{value}</strong>
      <small className="text-[0.7rem] text-muted">{hint}</small>
    </article>
  );
}

export function MiniBarChart({
  values,
  labels,
  money = false,
  title = "روند داده‌ها",
}: {
  values: number[];
  labels: string[];
  money?: boolean;
  title?: string;
}) {
  const max = Math.max(...values, 1);
  const [selected, setSelected] = useState(Math.max(0, values.length - 1));
  const renderValue = (value: number) => (money ? formatMoney(value) : formatNumber(value));

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="flex items-center justify-between rounded-xl bg-surface-raised px-3 py-1.5 border border-line text-xs" role="status">
        <strong className="font-bold text-ink">{labels[selected]}</strong>
        <span className="font-mono font-bold text-brand-2">{renderValue(values[selected] ?? 0)}</span>
      </p>
      <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-36 pt-4 pb-2" aria-label={title}>
        {values.map((value, index) => {
          const isSelected = selected === index;
          const heightPercent = Math.max(8, (value / max) * 100);
          return (
            <button
              type="button"
              className="group flex flex-1 flex-col items-center justify-end h-full gap-1.5 cursor-pointer focus:outline-none"
              onClick={() => setSelected(index)}
              key={`${labels[index]}-${index}`}
              aria-label={`${labels[index]}، ${renderValue(value)}`}
              aria-pressed={isSelected}
            >
              <span className="sr-only sm:not-sr-only text-[0.65rem] text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                {renderValue(value)}
              </span>
              <div className="w-full flex-1 flex items-end justify-center">
                <i
                  className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                    isSelected ? "bg-brand-2 shadow-xs" : "bg-brand-soft hover:bg-brand-2/50"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <small className={`text-[0.65rem] truncate ${isSelected ? "font-bold text-ink" : "text-muted"}`}>
                {labels[index]}
              </small>
            </button>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>بازه</th>
            <th>مقدار</th>
          </tr>
        </thead>
        <tbody>
          {values.map((value, index) => (
            <tr key={`${labels[index]}-row`}>
              <th>{labels[index]}</th>
              <td>{renderValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyBusinessState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl border border-dashed border-line bg-surface/40">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-lg font-black text-brand">
        م
      </span>
      <h2 className="text-base sm:text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted">{text}</p>
    </div>
  );
}

export function BusinessSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-3xl border border-line bg-surface animate-pulse" aria-label="در حال بارگذاری">
      <div className="h-5 w-1/3 rounded-lg bg-line-strong" />
      <div className="h-4 w-2/3 rounded-lg bg-line" />
      <div className="h-24 w-full rounded-2xl bg-line" />
      <div className="h-10 w-1/4 rounded-xl bg-line-strong" />
    </div>
  );
}
