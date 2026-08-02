import type { ReactNode } from "react";
import { formatMoney, formatNumber } from "@/lib/demo-format";

export function BusinessPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="business-page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action && <div className="business-page-action">{action}</div>}</header>;
}

export function MetricCard({ label, value, hint, tone = "default" }: { label: string; value: string; hint: string; tone?: "default" | "brand" | "accent" }) {
  return <article className={`business-metric ${tone}`}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}

export function MiniBarChart({ values, labels, money = false }: { values: number[]; labels: string[]; money?: boolean }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mini-bar-chart" role="img" aria-label={`نمودار ${values.map((value, index) => `${labels[index]}: ${money ? formatMoney(value) : formatNumber(value)}`).join("، ")}`}>
      {values.map((value, index) => <span key={`${labels[index]}-${index}`}><i style={{ height: `${Math.max(8, value / max * 100)}%` }} title={`${labels[index]}: ${money ? formatMoney(value) : formatNumber(value)}`} /><small>{labels[index]}</small></span>)}
    </div>
  );
}

export function EmptyBusinessState({ title, text }: { title: string; text: string }) {
  return <div className="business-empty"><span>م</span><h2>{title}</h2><p>{text}</p></div>;
}

export function BusinessSkeleton() {
  return <div className="business-skeleton" aria-label="در حال بارگذاری"><i /><i /><i /><i /><span /></div>;
}
