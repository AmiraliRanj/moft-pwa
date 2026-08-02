"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { BusinessPageHeader, EmptyBusinessState } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { DialogShell } from "@/components/moft/DialogShell";
import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { formatMoney, formatNumber, offerStatusLabel, remainingQuantity } from "@/lib/demo-format";
import type { MarketplaceOffer, OfferDraft, OfferStatus } from "@/types/demo";

type OfferTab = "active" | "draft" | "scheduled" | "sold_out" | "expired" | "paused" | "all";
const tabs: Array<{ id: OfferTab; label: string }> = [
  { id: "active", label: "فعال" }, { id: "draft", label: "پیش‌نویس" }, { id: "scheduled", label: "زمان‌بندی‌شده" },
  { id: "sold_out", label: "فروخته‌شده" }, { id: "expired", label: "منقضی‌شده" }, { id: "paused", label: "متوقف‌شده" }, { id: "all", label: "همه" },
];

const today = new Date().toISOString().slice(0, 10);
const defaultDraft = (branchId: string): OfferDraft => ({
  offerType: "surprise_box", title: "", description: "", image: "/images/offers/offer-01.webp", originalValue: 390000,
  salePrice: 125000, totalQuantity: 8, branchId, pickupDate: today, pickupStart: "20:00", pickupEnd: "21:00",
  allergens: ["گلوتن"], dietaryLabels: ["ترکیب متغیر"], expiryInfo: "محصولات سالم همان روز؛ مصرف در بازه اعلام‌شده",
  publishAt: `${today}T08:00:00.000Z`, expiresAt: `${today}T23:00:00.000Z`,
});

export function OffersPage() {
  const { state, createOffer, updateOffer, setOfferStatus, adjustStock, duplicateOffer, removeDraft, createTemplate } = useDemo();
  const { branchId, can, notify } = useBusinessUi();
  const [tab, setTab] = useState<OfferTab>("active");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferDraft>(() => defaultDraft(branchId));
  const [confirmDelete, setConfirmDelete] = useState<MarketplaceOffer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const allOffers = state.offers.filter((offer) => offer.businessId === state.business.id && offer.branchId === branchId);
  const offers = useMemo(() => allOffers.filter((offer) => (tab === "all" || offer.status === tab) && (!query.trim() || `${offer.title} ${offer.description}`.includes(query.trim()))), [allOffers, query, tab]);
  const discount = form.originalValue > 0 ? Math.max(0, Math.round((1 - form.salePrice / form.originalValue) * 100)) : 0;

  const ensurePermission = () => {
    if (can("offers:write")) return true;
    notify("نقش فعال اجازه مدیریت پیشنهادها را ندارد.", "error");
    return false;
  };

  const openCreate = () => {
    if (!ensurePermission()) return;
    setEditId(null); setForm(defaultDraft(branchId)); setFormOpen(true);
  };

  const openEdit = (offer: MarketplaceOffer) => {
    if (!ensurePermission()) return;
    setEditId(offer.id);
    setForm({ offerType: offer.offerType, title: offer.title, description: offer.description, image: offer.image, originalValue: offer.originalValue, salePrice: offer.salePrice, totalQuantity: offer.totalQuantity, branchId: offer.branchId, pickupDate: offer.pickupDate, pickupStart: offer.pickupStart, pickupEnd: offer.pickupEnd, allergens: offer.allergens, dietaryLabels: offer.dietaryLabels, expiryInfo: offer.expiryInfo, publishAt: offer.publishAt, expiresAt: offer.expiresAt });
    setFormOpen(true);
  };

  const save = (mode: "draft" | "active" | "scheduled") => {
    if (!ensurePermission() || submitting) return;
    setSubmitting(true);
    const result = editId ? updateOffer(editId, { ...form, status: mode }) : createOffer(form, mode);
    setSubmitting(false);
    if (!result.ok) return notify(result.error, "error");
    setFormOpen(false);
    notify(mode === "active" ? "پیشنهاد منتشر شد و اکنون در نسخه مشتری دیده می‌شود." : mode === "scheduled" ? "پیشنهاد زمان‌بندی شد." : "پیش‌نویس ذخیره شد.");
  };

  const saveTemplate = () => {
    if (!ensurePermission()) return;
    const result = createTemplate(form);
    if (result.ok) setFormOpen(false);
    notify(result.message, result.ok ? "success" : "error");
  };

  const changeStatus = (offer: MarketplaceOffer, status: OfferStatus) => {
    if (!ensurePermission()) return;
    const result = setOfferStatus(offer.id, status);
    notify(result.ok ? `وضعیت به «${offerStatusLabel[status]}» تغییر کرد.` : result.error, result.ok ? "success" : "error");
  };

  const stock = (offer: MarketplaceOffer, delta: number) => {
    if (!ensurePermission()) return;
    const result = adjustStock(offer.id, delta);
    notify(result.ok ? "موجودی به‌روز شد." : result.error, result.ok ? "success" : "error");
  };

  const duplicate = (offer: MarketplaceOffer) => {
    if (!ensurePermission()) return;
    const result = duplicateOffer(offer.id);
    notify(result.ok ? "کپی پیشنهاد به پیش‌نویس‌ها اضافه شد." : result.error, result.ok ? "success" : "error");
  };

  const uploadPreview = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2_000_000) return notify("یک تصویر کمتر از ۲ مگابایت انتخاب کنید.", "error");
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="business-page offers-page">
      <BusinessPageHeader eyebrow="پیشنهاد و موجودی" title="پیشنهادها" description="موجودی، قیمت و بازه دریافت را مدیریت کنید؛ تغییرات فعال فوراً در نسخه مشتری دیده می‌شوند." action={<button className="business-primary" type="button" onClick={openCreate}><Icon name="plus" /> پیشنهاد تازه</button>} />
      <div className="business-tabs" role="tablist" aria-label="وضعیت پیشنهادها">{tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}<span>{formatNumber(item.id === "all" ? allOffers.length : allOffers.filter((offer) => offer.status === item.id).length)}</span></button>)}</div>
      <label className="business-search standalone"><Icon name="search" /><span className="sr-only">جست‌وجوی پیشنهاد</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در عنوان یا توضیحات" />{query && <button type="button" onClick={() => setQuery("")} aria-label="پاک کردن"><Icon name="close" /></button>}</label>
      {offers.length ? <div className="business-offer-grid">{offers.map((offer) => <article className="business-offer-card" key={offer.id}>
        <div className="business-offer-image"><FoodImage src={offer.image} sizes="(max-width: 700px) 100vw, 360px" /><span className={`business-status ${offer.status}`}>{offerStatusLabel[offer.status]}</span><em>{Math.round((1 - offer.salePrice / offer.originalValue) * 100).toLocaleString("fa-IR")}٪ تخفیف</em></div>
        <div className="business-offer-body"><small>{offer.offerType === "surprise_box" ? "جعبه غافلگیرکننده" : "محصول مشخص"}</small><h2>{offer.title}</h2><p>{offer.pickupDate} · {offer.pickupStart} تا {offer.pickupEnd}</p><div className="offer-inventory"><span><small>کل</small><strong>{formatNumber(offer.totalQuantity)}</strong></span><span><small>فروخته</small><strong>{formatNumber(offer.soldQuantity)}</strong></span><span><small>مانده</small><strong>{formatNumber(remainingQuantity(offer))}</strong></span></div><div className="offer-price"><del>{formatMoney(offer.originalValue)}</del><strong>{formatMoney(offer.salePrice)}</strong></div></div>
        <div className="business-offer-actions"><button type="button" onClick={() => openEdit(offer)}>ویرایش</button><button type="button" onClick={() => duplicate(offer)}>کپی</button><button type="button" onClick={() => stock(offer, 1)} aria-label="افزایش موجودی"><Icon name="plus" /></button><button type="button" onClick={() => stock(offer, -1)} aria-label="کاهش موجودی"><Icon name="minus" /></button>{offer.status === "draft" && <button className="primary-inline" type="button" onClick={() => changeStatus(offer, "active")}>انتشار</button>}{offer.status === "active" && <button type="button" onClick={() => changeStatus(offer, "paused")}>توقف</button>}{["paused", "sold_out"].includes(offer.status) && <button type="button" onClick={() => changeStatus(offer, "active")}>ادامه</button>}{offer.status === "draft" && <button className="danger-text" type="button" onClick={() => setConfirmDelete(offer)}>حذف</button>}{offer.status !== "archived" && <button type="button" onClick={() => changeStatus(offer, "archived")}>بایگانی</button>}</div>
      </article>)}</div> : <EmptyBusinessState title="پیشنهادی در این بخش نیست" text="یک پیشنهاد تازه بسازید یا فیلتر وضعیت را تغییر دهید." />}

      {formOpen && <DialogShell titleId="offer-form-title" onClose={() => setFormOpen(false)} size="detail"><form className="business-dialog offer-form" onSubmit={(event) => { event.preventDefault(); save("active"); }}><p className="eyebrow">{editId ? "ویرایش پیشنهاد" : "پیشنهاد تازه"}</p><h2 id="offer-form-title">اطلاعات بسته را کامل کنید</h2><div className="offer-form-grid">
        <label><span>نوع پیشنهاد</span><select value={form.offerType} onChange={(event) => setForm({ ...form, offerType: event.target.value as OfferDraft["offerType"] })}><option value="surprise_box">جعبه غافلگیرکننده</option><option value="specific_product">محصول مشخص</option></select></label>
        <label><span>عنوان *</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="مثلاً بسته پایان روز" /></label>
        <label className="full-field"><span>توضیحات *</span><textarea required rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="محتوا، شرایط سلامت و متغیر بودن ترکیب را شفاف بنویسید." /></label>
        <label className="image-upload-field"><span>تصویر نمونه</span><input type="file" accept="image/*" onChange={uploadPreview} /><span className="image-preview"><FoodImage src={form.image} sizes="160px" /></span><small>حداکثر ۲ مگابایت؛ تصویر فقط نماینده حال‌وهوای بسته است.</small></label>
        <fieldset className="price-fields"><legend>قیمت‌گذاری</legend><label><span>ارزش اصلی *</span><input required min="1" type="number" value={form.originalValue} onChange={(event) => setForm({ ...form, originalValue: Number(event.target.value) })} /></label><label><span>قیمت رزرو *</span><input required min="1" type="number" value={form.salePrice} onChange={(event) => setForm({ ...form, salePrice: Number(event.target.value) })} /></label><output>{formatNumber(discount)}٪ تخفیف</output></fieldset>
        <label><span>تعداد *</span><input required min="1" type="number" value={form.totalQuantity} onChange={(event) => setForm({ ...form, totalQuantity: Number(event.target.value) })} /></label>
        <label><span>شعبه *</span><select value={form.branchId} onChange={(event) => setForm({ ...form, branchId: event.target.value })}>{state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        <label><span>تاریخ دریافت *</span><input required type="date" value={form.pickupDate} onChange={(event) => setForm({ ...form, pickupDate: event.target.value })} /></label>
        <label><span>شروع دریافت *</span><input required type="time" value={form.pickupStart} onChange={(event) => setForm({ ...form, pickupStart: event.target.value })} /></label>
        <label><span>پایان دریافت *</span><input required type="time" value={form.pickupEnd} onChange={(event) => setForm({ ...form, pickupEnd: event.target.value })} /></label>
        <label><span>زمان انتشار *</span><input required type="datetime-local" value={form.publishAt.slice(0, 16)} onChange={(event) => setForm({ ...form, publishAt: event.target.value })} /></label>
        <label><span>زمان انقضا *</span><input required type="datetime-local" value={form.expiresAt.slice(0, 16)} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} /></label>
        <label className="full-field"><span>آلرژن‌ها</span><input value={form.allergens.join("، ")} onChange={(event) => setForm({ ...form, allergens: event.target.value.split("،").map((item) => item.trim()).filter(Boolean) })} /></label>
        <label className="full-field"><span>برچسب‌های غذایی</span><input value={form.dietaryLabels.join("، ")} onChange={(event) => setForm({ ...form, dietaryLabels: event.target.value.split("،").map((item) => item.trim()).filter(Boolean) })} /></label>
        <label className="full-field"><span>اطلاعات مصرف و نگهداری *</span><textarea required rows={2} value={form.expiryInfo} onChange={(event) => setForm({ ...form, expiryInfo: event.target.value })} /></label>
      </div><p className="form-safety-note"><Icon name="info" /> فقط غذای سالم و قابل‌مصرف قابل انتشار است؛ محصولات تاریخ‌گذشته در «مفت» عرضه نمی‌شوند.</p><div className="offer-form-actions"><button className="secondary-button" type="button" onClick={() => save("draft")}>ذخیره پیش‌نویس</button><button className="secondary-button" type="button" onClick={saveTemplate}>ذخیره به‌عنوان قالب</button><button className="business-primary" type="submit" disabled={submitting}>{submitting ? "در حال ذخیره…" : "انتشار پیشنهاد"}</button></div></form></DialogShell>}

      {confirmDelete && <DialogShell label="تأیید حذف پیش‌نویس" onClose={() => setConfirmDelete(null)} size="center"><div className="cancel-dialog"><span className="danger-icon"><Icon name="trash" /></span><h2>پیش‌نویس حذف شود؟</h2><p>این پیشنهاد هنوز برای مشتریان منتشر نشده است.</p><div><button className="secondary-button" type="button" onClick={() => setConfirmDelete(null)}>انصراف</button><button className="danger-button" type="button" onClick={() => { const result = removeDraft(confirmDelete.id); notify(result.ok ? "پیش‌نویس حذف شد." : result.error, result.ok ? "success" : "error"); setConfirmDelete(null); }}>حذف</button></div></div></DialogShell>}
    </div>
  );
}
