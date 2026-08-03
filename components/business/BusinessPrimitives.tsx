"use client";

import { useState, type ReactNode } from "react";
import { formatMoney, formatNumber } from "@/lib/demo-format";

export function BusinessPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="business-page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action && <div className="business-page-action">{action}</div>}</header>;
}

export function MetricCard({ label, value, hint, tone = "default" }: { label: string; value: string; hint: string; tone?: "default" | "brand" | "accent" }) {
  return <article className={`business-metric ${tone}`}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}

export function MiniBarChart({ values, labels, money = false, title = "روند داده‌ها" }: { values: number[]; labels: string[]; money?: boolean; title?: string }) {
  const max = Math.max(...values, 1);
  const [selected, setSelected] = useState(Math.max(0, values.length - 1));
  const renderValue = (value: number) => money ? formatMoney(value) : formatNumber(value);
  return (
    <div className="chart-wrapper">
      <p className="chart-tooltip" role="status"><strong>{labels[selected]}</strong><span>{renderValue(values[selected] ?? 0)}</span></p>
      <div className="mini-bar-chart" aria-label={title}>
        {values.map((value, index) => <button type="button" className={selected === index ? "selected" : ""} onClick={() => setSelected(index)} key={`${labels[index]}-${index}`} aria-label={`${labels[index]}، ${renderValue(value)}`} aria-pressed={selected === index}><span>{renderValue(value)}</span><i style={{ height: `${Math.max(8, value / max * 100)}%` }} /><small>{labels[index]}</small></button>)}
      </div>
      <table className="sr-only"><caption>{title}</caption><thead><tr><th>بازه</th><th>مقدار</th></tr></thead><tbody>{values.map((value, index) => <tr key={`${labels[index]}-row`}><th>{labels[index]}</th><td>{renderValue(value)}</td></tr>)}</tbody></table>
    </div>
  );
}

export function EmptyBusinessState({ title, text }: { title: string; text: string }) {
  return <div className="business-empty"><span>م</span><h2>{title}</h2><p>{text}</p></div>;
}

export function BusinessSkeleton() {
  return <div className="business-skeleton" aria-label="در حال بارگذاری"><i /><i /><i /><i /><span /></div>;
}
