"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/moft/Icon";
import { SelectField, UploadField } from "@/components/shared/FormControls";

type SupportScope = "customer" | "business";
type TicketStatus = "open" | "in_progress" | "answered" | "closed";
type TicketMessage = { id: string; author: "user" | "support"; text: string; at: string };
type SupportTicket = {
  id: string;
  scope: SupportScope;
  category: string;
  relatedId: string;
  priority: string;
  subject: string;
  description: string;
  attachment: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  history: Array<{ status: TicketStatus; at: string }>;
};

const STORAGE_KEY = "moft-support-v1";
const statusLabel: Record<TicketStatus, string> = {
  open: "ثبت‌شده",
  in_progress: "در حال بررسی",
  answered: "پاسخ داده‌شده",
  closed: "بسته‌شده",
};

const getStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case "answered":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    case "in_progress":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20";
    case "open":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    case "closed":
      return "bg-canvas text-muted border border-line";
  }
};

const faq = [
  ["چطور زمان دریافت را تغییر بدهم؟", "در جزئیات سفارش، بازهٔ دریافت ثبت شده است. اگر امکان تغییر وجود داشته باشد از همان سفارش درخواست پشتیبانی ثبت کنید."],
  ["اگر محتویات جعبه متفاوت بود چه کنم؟", "ترکیب جعبهٔ غافلگیرکننده ممکن است تغییر کند؛ اما سلامت، آلرژن‌ها و شرایط مصرف باید مطابق توضیحات باشد."],
  ["کد دریافت کجاست؟", "کد شش‌رقمی و QR در جزئیات سفارش فعال نمایش داده می‌شود و هنگام تحویل فقط یک‌بار قابل استفاده است."],
  ["چه محصولی در دیبز قابل عرضه است؟", "فقط غذای سالمِ آمادهٔ دریافت همان روز یا کالای نزدیک به پایان مهلت فروش؛ محصول تاریخ‌گذشته یا نامناسب قابل عرضه نیست."],
];

function nowFa() {
  return new Date().toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" });
}

export function SupportCenter({
  scope,
  relatedOptions = [],
  initialRelatedId = "",
}: {
  scope: SupportScope;
  relatedOptions?: Array<{ value: string; label: string; description?: string }>;
  initialRelatedId?: string;
}) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({
    category: scope === "customer" ? "order" : "operations",
    relatedId: initialRelatedId,
    priority: "normal",
    subject: "",
    description: "",
    attachment: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setTickets(JSON.parse(saved) as SupportTicket[]);
      } catch {
        /* Keep an empty local inbox. */
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = (next: SupportTicket[]) => {
    setTickets(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* Keep current-session tickets available. */
    }
  };

  const visibleTickets = useMemo(() => tickets.filter((ticket) => ticket.scope === scope), [scope, tickets]);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const stamp = nowFa();
    const id = `MF-${String(Date.now()).slice(-6)}`;
    const ticket: SupportTicket = {
      id,
      scope,
      ...form,
      subject: form.subject.trim(),
      description: form.description.trim(),
      status: "open",
      createdAt: stamp,
      updatedAt: stamp,
      messages: [],
      history: [{ status: "open", at: stamp }],
    };
    persist([ticket, ...tickets]);
    setForm({
      category: scope === "customer" ? "order" : "operations",
      relatedId: "",
      priority: "normal",
      subject: "",
      description: "",
      attachment: "",
    });
    setCreatedId(id);
    setSelectedId(id);
  };

  const sendReply = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    const stamp = nowFa();
    const nextStatus: TicketStatus = selected.status === "closed" ? "open" : selected.status;
    persist(
      tickets.map((ticket) =>
        ticket.id === selected.id
          ? {
              ...ticket,
              status: nextStatus,
              updatedAt: stamp,
              messages: [
                ...ticket.messages,
                { id: `message-${Date.now()}`, author: "user", text: reply.trim(), at: stamp },
              ],
              history:
                nextStatus !== ticket.status
                  ? [...ticket.history, { status: nextStatus, at: stamp }]
                  : ticket.history,
            }
          : ticket
      )
    );
    setReply("");
  };

  if (selected) {
    return (
      <div className="space-y-5">
        <header className="flex items-center justify-between gap-3 pb-3 border-b border-line">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-2 hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedId(null);
              setCreatedId(null);
            }}
          >
            <Icon name="arrow" className="w-4 h-4 rtl:rotate-180" />
            <span>بازگشت</span>
          </button>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(selected.status)}`}>
            {statusLabel[selected.status]}
          </span>
        </header>

        {createdId === selected.id && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300" role="status">
            <Icon name="check" className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <strong className="block text-xs font-bold">درخواست شما ثبت شد</strong>
              <p className="text-[11px] mt-0.5 opacity-90">
                شماره پیگیری <b dir="ltr" className="font-mono font-bold">{selected.id}</b> است و ادامهٔ گفتگو در همین صفحه نگه‌داری می‌شود.
              </p>
            </div>
          </div>
        )}

        <section className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">{selected.id}</p>
          <h1 className="text-lg font-black text-ink mt-1 mb-2">{selected.subject}</h1>
          <p className="text-xs text-muted leading-relaxed">{selected.description}</p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
            <div className="p-3 rounded-xl bg-canvas/50 border border-line">
              <dt className="text-[10px] text-muted">دسته‌بندی</dt>
              <dd className="text-xs font-bold text-ink mt-1">{selected.category}</dd>
            </div>
            <div className="p-3 rounded-xl bg-canvas/50 border border-line">
              <dt className="text-[10px] text-muted">شناسه مرتبط</dt>
              <dd className="text-xs font-bold text-ink mt-1 font-mono">{selected.relatedId || "—"}</dd>
            </div>
            <div className="p-3 rounded-xl bg-canvas/50 border border-line">
              <dt className="text-[10px] text-muted">اولویت</dt>
              <dd className="text-xs font-bold text-ink mt-1">
                {selected.priority === "urgent" ? "فوری" : selected.priority === "high" ? "زیاد" : "عادی"}
              </dd>
            </div>
            <div className="p-3 rounded-xl bg-canvas/50 border border-line">
              <dt className="text-[10px] text-muted">آخرین تغییر</dt>
              <dd className="text-xs font-bold text-ink mt-1">{selected.updatedAt}</dd>
            </div>
          </dl>
          {selected.attachment && (
            <a
              className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 text-xs font-semibold rounded-xl bg-canvas border border-line text-brand-2 hover:bg-surface-raised transition-colors"
              href={selected.attachment}
              download
            >
              <Icon name="share" className="w-3.5 h-3.5" />
              <span>دریافت پیوست</span>
            </a>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] gap-5">
          <section className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-black text-ink mb-4 pb-3 border-b border-line">گفتگو</h2>
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                <article className="max-w-[88%] p-3.5 rounded-2xl bg-canvas/50 border border-line space-y-1">
                  <strong className="block text-[11px] font-bold text-ink">شما</strong>
                  <p className="text-xs text-ink/90 leading-relaxed">{selected.description}</p>
                  <small className="block text-[10px] text-muted mt-1">{selected.createdAt}</small>
                </article>
                {selected.messages.map((message) => {
                  const isUser = message.author === "user";
                  return (
                    <article
                      key={message.id}
                      className={`max-w-[88%] p-3.5 rounded-2xl space-y-1 ${
                        isUser
                          ? "bg-canvas/50 border border-line"
                          : "ms-auto bg-brand-soft border border-brand-2/20 text-brand-2"
                      }`}
                    >
                      <strong className="block text-[11px] font-bold">
                        {isUser ? "شما" : "پشتیبانی دیبز"}
                      </strong>
                      <p className="text-xs text-ink/90 leading-relaxed">{message.text}</p>
                      <small className="block text-[10px] text-muted mt-1">{message.at}</small>
                    </article>
                  );
                })}
              </div>
            </div>

            <form className="mt-5 pt-4 border-t border-line space-y-3" onSubmit={sendReply}>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink">افزودن پیام</span>
                <textarea
                  rows={3}
                  required
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="پیام خود را بنویسید…"
                  className="p-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 resize-none"
                />
              </label>
              <button
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity"
                type="submit"
              >
                ثبت پیام
              </button>
            </form>
          </section>

          <section className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs">
            <h2 className="text-sm font-black text-ink mb-4 pb-3 border-b border-line">تاریخچه وضعیت</h2>
            <div className="space-y-4">
              {selected.history.map((item, index) => (
                <div key={`${item.at}-${index}`} className="flex items-start gap-3 relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-2 mt-1 shrink-0"></span>
                  <div>
                    <strong className="block text-xs font-bold text-ink">{statusLabel[item.status]}</strong>
                    <small className="block text-[11px] text-muted mt-0.5">{item.at}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-black text-ink">
            {scope === "customer" ? "چطور می‌توانیم کمک کنیم؟" : "مرکز پشتیبانی کسب‌وکار"}
          </h1>
          <p className="text-xs text-muted mt-1">پاسخ پرسش‌های رایج را ببینید یا یک درخواست قابل پیگیری ثبت کنید.</p>
        </div>
        {scope === "customer" && (
          <Link
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface border border-line text-ink hover:bg-surface-raised transition-colors shadow-xs"
            href="/customer/profile"
          >
            <span>بازگشت به پروفایل</span>
          </Link>
        )}
      </header>

      {/* FAQ Section */}
      <section className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs">
        <h2 className="text-base font-black text-ink mb-3">پرسش‌های رایج</h2>
        <div className="divide-y divide-line">
          {faq.map(([question, answer]) => (
            <details key={question} className="group py-3 first:pt-1 last:pb-1">
              <summary className="flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-ink cursor-pointer list-none select-none">
                <span>{question}</span>
                <Icon name="plus" className="w-4 h-4 text-muted group-open:rotate-45 transition-transform shrink-0" />
              </summary>
              <p className="text-xs text-muted leading-relaxed mt-2.5">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Layout for Ticket Form and Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-5 items-start">
        <form className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-4" onSubmit={submit}>
          <h2 className="text-base font-black text-ink">ثبت درخواست تازه</h2>
          <SelectField
            label="دسته‌بندی"
            value={form.category}
            onChange={(category) => setForm((current) => ({ ...current, category }))}
            options={
              scope === "customer"
                ? [
                    { value: "order", label: "سفارش و دریافت" },
                    { value: "quality", label: "کیفیت و سلامت" },
                    { value: "payment", label: "پرداخت و بازپرداخت" },
                    { value: "account", label: "حساب کاربری" },
                  ]
                : [
                    { value: "operations", label: "عملیات سفارش" },
                    { value: "settlement", label: "تسویه و امور مالی" },
                    { value: "offer", label: "پیشنهاد و موجودی" },
                    { value: "account", label: "دسترسی و حساب" },
                  ]
            }
          />
          {relatedOptions.length > 0 && (
            <SelectField
              label={scope === "customer" ? "سفارش مرتبط" : "سفارش یا تسویه مرتبط"}
              value={form.relatedId}
              onChange={(relatedId) => setForm((current) => ({ ...current, relatedId }))}
              options={[{ value: "", label: "بدون مورد مرتبط" }, ...relatedOptions]}
            />
          )}
          {scope === "business" && (
            <SelectField
              label="اولویت"
              value={form.priority}
              onChange={(priority) => setForm((current) => ({ ...current, priority }))}
              options={[
                { value: "normal", label: "عادی" },
                { value: "high", label: "زیاد" },
                { value: "urgent", label: "فوری" },
              ]}
            />
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">موضوع *</span>
            <input
              required
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              placeholder="موضوع را کوتاه و روشن بنویسید"
              className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">شرح درخواست *</span>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="جزئیات لازم برای بررسی را وارد کنید"
              className="p-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 resize-none"
            />
          </label>
          <UploadField
            label="پیوست اختیاری"
            value={form.attachment}
            onChange={(attachment) => setForm((current) => ({ ...current, attachment }))}
            hint="تصویر رسید یا مشکل تا ۲ مگابایت"
          />
          <button
            className="w-full h-11 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity shadow-xs"
            type="submit"
          >
            ثبت درخواست
          </button>
        </form>

        <section className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs">
          <h2 className="text-base font-black text-ink mb-3 pb-3 border-b border-line">درخواست‌های من</h2>
          {!ready ? (
            <p className="text-xs text-muted py-6 text-center">در حال بارگذاری…</p>
          ) : visibleTickets.length ? (
            <div className="divide-y divide-line">
              {visibleTickets.map((ticket) => (
                <button
                  type="button"
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className="w-full min-h-[64px] flex items-center justify-between gap-3 py-3 text-start hover:opacity-80 transition-opacity group"
                >
                  <div className="min-w-0 flex-1">
                    <strong className="block text-xs font-bold text-ink truncate">{ticket.subject}</strong>
                    <small className="block text-[11px] text-muted mt-0.5 font-mono">{ticket.id} · {ticket.updatedAt}</small>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getStatusBadge(ticket.status)}`}>
                    {statusLabel[ticket.status]}
                  </span>
                  <Icon name="chevron" className="w-3.5 h-3.5 text-muted rtl:rotate-180 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center py-12 text-center text-muted space-y-2">
              <Icon name="info" className="w-7 h-7 text-muted/60" />
              <strong className="block text-xs font-bold text-ink">هنوز درخواستی ثبت نشده</strong>
              <p className="text-xs text-muted max-w-xs">درخواست‌های تازه و پاسخ‌ها در همین بخش نمایش داده می‌شوند.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
