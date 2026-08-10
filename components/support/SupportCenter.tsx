"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/moft/Icon";
import { SelectField, UploadField } from "@/components/shared/FormControls";

type SupportScope = "customer" | "business";
type TicketStatus = "open" | "in_progress" | "answered" | "closed";
type TicketMessage = { id: string; author: "user" | "support"; text: string; at: string };
type SupportTicket = {
  id: string; scope: SupportScope; category: string; relatedId: string; priority: string; subject: string; description: string;
  attachment: string; status: TicketStatus; createdAt: string; updatedAt: string; messages: TicketMessage[];
  history: Array<{ status: TicketStatus; at: string }>;
};

const STORAGE_KEY = "moft-support-v1";
const statusLabel: Record<TicketStatus, string> = { open: "ثبت‌شده", in_progress: "در حال بررسی", answered: "پاسخ داده‌شده", closed: "بسته‌شده" };
const faq = [
  ["چطور زمان دریافت را تغییر بدهم؟", "در جزئیات سفارش، بازهٔ دریافت ثبت شده است. اگر امکان تغییر وجود داشته باشد از همان سفارش درخواست پشتیبانی ثبت کنید."],
  ["اگر محتویات جعبه متفاوت بود چه کنم؟", "ترکیب جعبهٔ غافلگیرکننده ممکن است تغییر کند؛ اما سلامت، آلرژن‌ها و شرایط مصرف باید مطابق توضیحات باشد."],
  ["کد دریافت کجاست؟", "کد شش‌رقمی و QR در جزئیات سفارش فعال نمایش داده می‌شود و هنگام تحویل فقط یک‌بار قابل استفاده است."],
  ["چه محصولی در دیبز قابل عرضه است؟", "فقط غذای سالمِ فروش‌نرفته یا کالای نزدیک به پایان مهلت فروش؛ محصول تاریخ‌گذشته یا نامناسب قابل عرضه نیست."],
];

function nowFa() { return new Date().toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" }); }

export function SupportCenter({ scope, relatedOptions = [], initialRelatedId = "" }: { scope: SupportScope; relatedOptions?: Array<{ value: string; label: string; description?: string }>; initialRelatedId?: string }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ category: scope === "customer" ? "order" : "operations", relatedId: initialRelatedId, priority: "normal", subject: "", description: "", attachment: "" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setTickets(JSON.parse(saved) as SupportTicket[]); } catch { /* Keep an empty local inbox. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = (next: SupportTicket[]) => {
    setTickets(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep current-session tickets available. */ }
  };

  const visibleTickets = useMemo(() => tickets.filter((ticket) => ticket.scope === scope), [scope, tickets]);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const stamp = nowFa();
    const id = `MF-${String(Date.now()).slice(-6)}`;
    const ticket: SupportTicket = { id, scope, ...form, subject: form.subject.trim(), description: form.description.trim(), status: "open", createdAt: stamp, updatedAt: stamp, messages: [], history: [{ status: "open", at: stamp }] };
    persist([ticket, ...tickets]);
    setForm({ category: scope === "customer" ? "order" : "operations", relatedId: "", priority: "normal", subject: "", description: "", attachment: "" });
    setCreatedId(id);
    setSelectedId(id);
  };

  const sendReply = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    const stamp = nowFa();
    const nextStatus: TicketStatus = selected.status === "closed" ? "open" : selected.status;
    persist(tickets.map((ticket) => ticket.id === selected.id ? { ...ticket, status: nextStatus, updatedAt: stamp, messages: [...ticket.messages, { id: `message-${Date.now()}`, author: "user", text: reply.trim(), at: stamp }], history: nextStatus !== ticket.status ? [...ticket.history, { status: nextStatus, at: stamp }] : ticket.history } : ticket));
    setReply("");
  };

  if (selected) return <div className="support-center support-detail">
    <header className="support-page-header"><button type="button" onClick={() => { setSelectedId(null); setCreatedId(null); }}><Icon name="arrow" /> بازگشت</button><span className={`support-status ${selected.status}`}>{statusLabel[selected.status]}</span></header>
    {createdId === selected.id && <div className="support-confirmation" role="status"><Icon name="check" /><div><strong>درخواست شما ثبت شد</strong><p>شماره پیگیری <b dir="ltr">{selected.id}</b> است و ادامهٔ گفتگو در همین صفحه نگه‌داری می‌شود.</p></div></div>}
    <section className="business-panel support-ticket-detail"><p className="eyebrow">{selected.id}</p><h1>{selected.subject}</h1><p>{selected.description}</p><dl><div><dt>دسته‌بندی</dt><dd>{selected.category}</dd></div><div><dt>شناسه مرتبط</dt><dd>{selected.relatedId || "—"}</dd></div><div><dt>اولویت</dt><dd>{selected.priority === "urgent" ? "فوری" : selected.priority === "high" ? "زیاد" : "عادی"}</dd></div><div><dt>آخرین تغییر</dt><dd>{selected.updatedAt}</dd></div></dl>{selected.attachment && <a className="support-attachment" href={selected.attachment} download><Icon name="share" /> دریافت پیوست</a>}</section>
    <div className="support-detail-grid"><section className="business-panel"><h2>گفتگو</h2><div className="support-messages"><article><strong>شما</strong><p>{selected.description}</p><small>{selected.createdAt}</small></article>{selected.messages.map((message) => <article className={message.author} key={message.id}><strong>{message.author === "user" ? "شما" : "پشتیبانی"}</strong><p>{message.text}</p><small>{message.at}</small></article>)}</div><form className="support-reply" onSubmit={sendReply}><label><span>افزودن پیام</span><textarea rows={4} required value={reply} onChange={(event) => setReply(event.target.value)} placeholder="پیام خود را بنویسید…" /></label><button className="business-primary" type="submit">ثبت پیام</button></form></section><section className="business-panel support-history"><h2>تاریخچه وضعیت</h2>{selected.history.map((item, index) => <div key={`${item.at}-${index}`}><i /><span><strong>{statusLabel[item.status]}</strong><small>{item.at}</small></span></div>)}</section></div>
  </div>;

  return <div className="support-center">
    <header className="business-page-header"><div><p className="eyebrow">راهنما و پشتیبانی</p><h1>{scope === "customer" ? "چطور می‌توانیم کمک کنیم؟" : "مرکز پشتیبانی کسب‌وکار"}</h1><p>پاسخ پرسش‌های رایج را ببینید یا یک درخواست قابل پیگیری ثبت کنید.</p></div>{scope === "customer" && <Link className="business-secondary" href="/customer/profile">بازگشت به پروفایل</Link>}</header>
    <section className="support-faq"><h2>پرسش‌های رایج</h2><div>{faq.map(([question, answer]) => <details key={question}><summary>{question}<Icon name="plus" /></summary><p>{answer}</p></details>)}</div></section>
    <div className="support-layout"><form className="business-panel support-form" onSubmit={submit}><h2>ثبت درخواست تازه</h2><SelectField label="دسته‌بندی" value={form.category} onChange={(category) => setForm((current) => ({ ...current, category }))} options={(scope === "customer" ? [{ value: "order", label: "سفارش و دریافت" }, { value: "quality", label: "کیفیت و سلامت" }, { value: "payment", label: "پرداخت و بازپرداخت" }, { value: "account", label: "حساب کاربری" }] : [{ value: "operations", label: "عملیات سفارش" }, { value: "settlement", label: "تسویه و امور مالی" }, { value: "offer", label: "پیشنهاد و موجودی" }, { value: "account", label: "دسترسی و حساب" }])} />
      {relatedOptions.length > 0 && <SelectField label={scope === "customer" ? "سفارش مرتبط" : "سفارش یا تسویه مرتبط"} value={form.relatedId} onChange={(relatedId) => setForm((current) => ({ ...current, relatedId }))} options={[{ value: "", label: "بدون مورد مرتبط" }, ...relatedOptions]} />}
      {scope === "business" && <SelectField label="اولویت" value={form.priority} onChange={(priority) => setForm((current) => ({ ...current, priority }))} options={[{ value: "normal", label: "عادی" }, { value: "high", label: "زیاد" }, { value: "urgent", label: "فوری" }]} />}
      <label><span>موضوع *</span><input required value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="موضوع را کوتاه و روشن بنویسید" /></label><label><span>شرح درخواست *</span><textarea required rows={6} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="جزئیات لازم برای بررسی را وارد کنید" /></label><UploadField label="پیوست اختیاری" value={form.attachment} onChange={(attachment) => setForm((current) => ({ ...current, attachment }))} hint="تصویر رسید یا مشکل تا ۲ مگابایت" /><button className="business-primary full" type="submit">ثبت درخواست</button></form>
      <section className="business-panel support-list"><h2>درخواست‌های من</h2>{!ready ? <p>در حال بارگذاری…</p> : visibleTickets.length ? visibleTickets.map((ticket) => <button type="button" key={ticket.id} onClick={() => setSelectedId(ticket.id)}><span><strong>{ticket.subject}</strong><small>{ticket.id} · {ticket.updatedAt}</small></span><span className={`support-status ${ticket.status}`}>{statusLabel[ticket.status]}</span><Icon name="chevron" /></button>) : <div className="support-empty"><Icon name="info" /><strong>هنوز درخواستی ثبت نشده</strong><p>درخواست‌های تازه و پاسخ‌ها در همین بخش نمایش داده می‌شوند.</p></div>}</section></div>
  </div>;
}
