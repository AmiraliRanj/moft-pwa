"use client";

import { useMemo, useState } from "react";
import { BusinessPageHeader, EmptyBusinessState } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { DialogShell } from "@/components/moft/DialogShell";
import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { formatMoney, formatNumber, offerStatusLabel, remainingQuantity } from "@/lib/demo-format";
import type { MarketplaceOffer, OfferDraft, OfferStatus } from "@/types/demo";
import { SelectField, UploadField } from "@/components/shared/FormControls";

type OfferTab = "active" | "draft" | "scheduled" | "sold_out" | "expired" | "paused" | "all";
type OfferFormValues = Omit<OfferDraft, "originalValue" | "salePrice" | "totalQuantity"> & {
  originalValue: number | "";
  salePrice: number | "";
  totalQuantity: number | "";
};
const tabs: Array<{ id: OfferTab; label: string }> = [
  { id: "active", label: "فعال" },
  { id: "draft", label: "پیش‌نویس" },
  { id: "scheduled", label: "زمان‌بندی‌شده" },
  { id: "sold_out", label: "فروخته‌شده" },
  { id: "expired", label: "منقضی‌شده" },
  { id: "paused", label: "متوقف‌شده" },
  { id: "all", label: "همه" },
];

const emptyDraft = (branchId: string): OfferFormValues => ({
  offerType: "surprise_box",
  title: "",
  description: "",
  image: "",
  originalValue: "",
  salePrice: "",
  totalQuantity: "",
  branchId,
  pickupDate: "",
  pickupStart: "",
  pickupEnd: "",
  allergens: [],
  dietaryLabels: [],
  expiryInfo: "",
  publishAt: "",
  expiresAt: "",
});

const toOfferDraft = (values: OfferFormValues): OfferDraft => ({
  ...values,
  originalValue: Number(values.originalValue),
  salePrice: Number(values.salePrice),
  totalQuantity: Number(values.totalQuantity),
});

export function OffersPage() {
  const { state, createOffer, updateOffer, setOfferStatus, adjustStock, duplicateOffer, removeDraft, createTemplate } = useDemo();
  const { branchId, can, notify } = useBusinessUi();
  const [tab, setTab] = useState<OfferTab>("active");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferFormValues>(() => emptyDraft(branchId));
  const [confirmDelete, setConfirmDelete] = useState<MarketplaceOffer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const allOffers = state.offers.filter((offer) => offer.businessId === state.business.id && offer.branchId === branchId);
  const offers = useMemo(
    () =>
      allOffers.filter(
        (offer) =>
          (tab === "all" || offer.status === tab) &&
          (!query.trim() || `${offer.title} ${offer.description}`.includes(query.trim()))
      ),
    [allOffers, query, tab]
  );
  const originalValue = Number(form.originalValue);
  const salePrice = Number(form.salePrice);
  const discount = originalValue > 0 ? Math.max(0, Math.round((1 - salePrice / originalValue) * 100)) : 0;

  const ensurePermission = () => {
    if (can("offers:write")) return true;
    notify("نقش فعال اجازه مدیریت پیشنهادها را ندارد.", "error");
    return false;
  };

  const openCreate = () => {
    if (!ensurePermission()) return;
    setEditId(null);
    setForm(emptyDraft(branchId));
    setFormOpen(true);
  };

  const openEdit = (offer: MarketplaceOffer) => {
    if (!ensurePermission()) return;
    setEditId(offer.id);
    setForm({
      offerType: offer.offerType,
      title: offer.title,
      description: offer.description,
      image: offer.image,
      originalValue: offer.originalValue,
      salePrice: offer.salePrice,
      totalQuantity: offer.totalQuantity,
      branchId: offer.branchId,
      pickupDate: offer.pickupDate,
      pickupStart: offer.pickupStart,
      pickupEnd: offer.pickupEnd,
      allergens: offer.allergens,
      dietaryLabels: offer.dietaryLabels,
      expiryInfo: offer.expiryInfo,
      publishAt: offer.publishAt,
      expiresAt: offer.expiresAt,
    });
    setFormOpen(true);
  };

  const save = (mode: "draft" | "active" | "scheduled") => {
    if (!ensurePermission() || submitting) return;
    if (mode !== "draft" && !form.image) return notify("برای انتشار، تصویر پیشنهاد را انتخاب کنید.", "error");
    setSubmitting(true);
    const draft = toOfferDraft(form);
    const result = editId ? updateOffer(editId, { ...draft, status: mode }) : createOffer(draft, mode);
    setSubmitting(false);
    if (!result.ok) return notify(result.error, "error");
    setFormOpen(false);
    notify(
      mode === "active"
        ? "پیشنهاد منتشر شد و اکنون در نسخه مشتری دیده می‌شود."
        : mode === "scheduled"
        ? "پیشنهاد زمان‌بندی شد."
        : "پیش‌نویس ذخیره شد."
    );
  };

  const saveTemplate = () => {
    if (!ensurePermission()) return;
    const result = createTemplate(toOfferDraft(form));
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <BusinessPageHeader
        eyebrow="پیشنهاد و موجودی"
        title="پیشنهادها"
        description="موجودی، قیمت و بازه دریافت را مدیریت کنید؛ تغییرات فعال فوراً در نسخه مشتری دیده می‌شوند."
        action={
          <button
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 py-2 text-xs sm:text-sm font-bold hover:opacity-95 cursor-pointer transition-opacity shadow-xs"
            type="button"
            onClick={openCreate}
          >
            <span className="[&>svg]:w-4 [&>svg]:h-4"><Icon name="plus" /></span>
            <span>پیشنهاد تازه</span>
          </button>
        }
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="وضعیت پیشنهادها">
        {tabs.map((item) => {
          const count = item.id === "all" ? allOffers.length : allOffers.filter((offer) => offer.status === item.id).length;
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

      <label className="relative flex items-center max-w-md">
        <span className="absolute start-3 text-muted [&>svg]:w-4 [&>svg]:h-4 pointer-events-none"><Icon name="search" /></span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جست‌وجو در عنوان یا توضیحات"
          className="w-full h-10 ps-9 pe-8 rounded-xl border border-line bg-surface text-xs text-ink placeholder:text-muted focus:outline-focus"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute end-2.5 text-muted hover:text-ink cursor-pointer [&>svg]:w-4 [&>svg]:h-4" aria-label="پاک کردن">
            <Icon name="close" />
          </button>
        )}
      </label>

      {offers.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {offers.map((offer) => {
            const discountPct = Math.round((1 - offer.salePrice / offer.originalValue) * 100);
            const soldPct = Math.min(100, Math.round((offer.soldQuantity / Math.max(offer.totalQuantity, 1)) * 100));
            return (
              <article className="flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface shadow-xs transition-all hover:border-line-strong hover:shadow-md text-start" key={offer.id}>
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-canvas-soft">
                    <FoodImage src={offer.image} sizes="(max-width: 700px) 100vw, 360px" />
                    <span className={`absolute top-3 end-3 inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold shadow-xs ${
                      offer.status === "active" ? "bg-emerald-600 text-white"
                      : offer.status === "paused" ? "bg-amber-600 text-white"
                      : "bg-zinc-700 text-white"
                    }`}>
                      {offerStatusLabel[offer.status]}
                    </span>
                    {discountPct > 0 && (
                      <em className="not-italic absolute bottom-3 end-3 rounded-lg bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                        {discountPct.toLocaleString("fa-IR")}٪ تخفیف
                      </em>
                    )}
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-2.5">
                    <small className="text-xs font-bold text-muted">
                      {offer.offerType === "surprise_box" ? "جعبه غافلگیرکننده" : "محصول مشخص"}
                    </small>
                    <h2 className="text-base font-bold text-ink leading-snug">{offer.title}</h2>
                    <p className="text-xs text-muted">
                      {offer.pickupDate} · {offer.pickupStart} تا {offer.pickupEnd}
                    </p>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-canvas-soft text-xs my-1">
                      <span className="flex flex-col">
                        <small className="text-muted text-[0.65rem]">فروخته</small>
                        <strong className="font-bold text-ink">{formatNumber(offer.soldQuantity)}</strong>
                      </span>
                      <span className="flex flex-col items-end">
                        <small className="text-muted text-[0.65rem]">باقی‌مانده</small>
                        <strong className="font-bold text-ink">{formatNumber(remainingQuantity(offer))}</strong>
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" aria-label={`${formatNumber(soldPct)} درصد فروخته‌شده`}>
                      <div className="h-full bg-brand-2 rounded-full transition-all" style={{ width: `${soldPct}%` }} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-line text-xs">
                      <span className="flex flex-col">
                        <small className="text-muted text-[0.65rem]">درآمد</small>
                        <strong className="font-mono font-bold text-brand-2">{formatMoney(offer.soldQuantity * offer.salePrice)}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <del className="text-muted text-[0.7rem] font-mono">{formatMoney(offer.originalValue)}</del>
                        <strong className="text-sm font-mono font-bold text-ink">{formatMoney(offer.salePrice)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-line bg-surface-raised/50 flex flex-col divide-y divide-line text-xs font-bold">
                  <div className="flex flex-wrap items-center gap-1.5 p-3" aria-label="مدیریت پیشنهاد">
                    <button type="button" className="px-2.5 py-1 rounded-lg bg-surface border border-line hover:bg-canvas-soft cursor-pointer text-ink" onClick={() => openEdit(offer)}>
                      ویرایش
                    </button>
                    <button type="button" className="px-2.5 py-1 rounded-lg bg-surface border border-line hover:bg-canvas-soft cursor-pointer text-ink" onClick={() => duplicate(offer)}>
                      کپی
                    </button>
                    {offer.status === "draft" && (
                      <button className="px-2.5 py-1 rounded-lg bg-brand text-white hover:opacity-95 cursor-pointer" type="button" onClick={() => changeStatus(offer, "active")}>
                        انتشار
                      </button>
                    )}
                    {offer.status === "active" && (
                      <button type="button" className="px-2.5 py-1 rounded-lg bg-surface border border-line text-amber-600 hover:bg-canvas-soft cursor-pointer" onClick={() => changeStatus(offer, "paused")}>
                        توقف
                      </button>
                    )}
                    {["paused", "sold_out"].includes(offer.status) && (
                      <button className="px-2.5 py-1 rounded-lg bg-brand text-white hover:opacity-95 cursor-pointer" type="button" onClick={() => changeStatus(offer, "active")}>
                        ادامه
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3" aria-label="کنترل موجودی">
                    <span className="text-muted text-xs">کنترل موجودی:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-line bg-surface text-ink hover:bg-canvas-soft cursor-pointer"
                        onClick={() => stock(offer, -1)}
                      >
                        <span className="[&>svg]:w-3 [&>svg]:h-3"><Icon name="minus" /></span>
                        <span>کاهش</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-line bg-surface text-brand-2 hover:bg-canvas-soft cursor-pointer"
                        onClick={() => stock(offer, 1)}
                      >
                        <span className="[&>svg]:w-3 [&>svg]:h-3"><Icon name="plus" /></span>
                        <span>افزایش</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 p-3">
                    {offer.status === "draft" && (
                      <button className="text-danger hover:underline cursor-pointer" type="button" onClick={() => setConfirmDelete(offer)}>
                        حذف
                      </button>
                    )}
                    {offer.status !== "archived" && (
                      <button className="text-muted hover:text-ink cursor-pointer" type="button" onClick={() => changeStatus(offer, "archived")}>
                        بایگانی
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyBusinessState title="پیشنهادی در این بخش نیست" text="یک پیشنهاد تازه بسازید یا فیلتر وضعیت را تغییر دهید." />
      )}

      {formOpen && (
        <DialogShell titleId="offer-form-title" onClose={() => setFormOpen(false)} size="detail">
          <form
            className="flex flex-col gap-4 text-start"
            onSubmit={(event) => {
              event.preventDefault();
              save("active");
            }}
          >
            <header className="border-b border-line pb-3">
              <p className="text-xs font-bold text-brand-2">{editId ? "ویرایش پیشنهاد" : "پیشنهاد تازه"}</p>
              <h2 id="offer-form-title" className="text-xl font-black text-ink">اطلاعات بسته را کامل کنید</h2>
            </header>

            <div className="max-h-[68vh] overflow-y-auto pe-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <SelectField
                  label="نوع پیشنهاد"
                  value={form.offerType}
                  onChange={(value) => setForm((current) => ({ ...current, offerType: value as OfferDraft["offerType"] }))}
                  options={[
                    { value: "surprise_box", label: "جعبه غافلگیرکننده", description: "ترکیب روز ممکن است متغیر باشد" },
                    { value: "specific_product", label: "محصول مشخص", description: "محصول با عنوان و ترکیب مشخص" },
                  ]}
                />

                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-ink">عنوان *</span>
                  <input
                    required
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    placeholder="مثلاً بسته نان و شیرینی پایان روز"
                    className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                  />
                </label>

                <label className="sm:col-span-2 flex flex-col gap-1.5">
                  <span className="font-bold text-ink">توضیحات *</span>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="محتویات احتمالی، شرایط نگهداری و بازه دریافت را بنویسید."
                    className="p-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus resize-none"
                  />
                </label>

                <div className="sm:col-span-2">
                  <UploadField value={form.image} onChange={(image) => setForm((current) => ({ ...current, image }))} required />
                </div>

                <fieldset className="sm:col-span-2 p-3.5 rounded-2xl border border-line bg-canvas-soft grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <legend className="px-2 text-xs font-bold text-muted">قیمت‌گذاری</legend>
                  <label className="flex flex-col gap-1">
                    <span className="font-bold text-ink">ارزش اصلی *</span>
                    <input
                      required
                      min="1"
                      type="number"
                      value={form.originalValue}
                      onChange={(event) => setForm({ ...form, originalValue: event.target.value === "" ? "" : Number(event.target.value) })}
                      placeholder="مثلاً ۳۹۰٬۰۰۰"
                      className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-bold text-ink">قیمت رزرو *</span>
                    <input
                      required
                      min="1"
                      type="number"
                      value={form.salePrice}
                      onChange={(event) => setForm({ ...form, salePrice: event.target.value === "" ? "" : Number(event.target.value) })}
                      placeholder="مثلاً ۱۲۵٬۰۰۰"
                      className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                    />
                  </label>
                  <output className="flex h-10 items-center justify-center rounded-xl bg-brand-soft font-bold text-brand-2 text-xs">
                    {formatNumber(discount)}٪ تخفیف
                  </output>
                </fieldset>

                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-ink">تعداد *</span>
                  <input
                    required
                    min="1"
                    type="number"
                    value={form.totalQuantity}
                    onChange={(event) => setForm({ ...form, totalQuantity: event.target.value === "" ? "" : Number(event.target.value) })}
                    placeholder="مثلاً ۸"
                    className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                  />
                </label>

                <SelectField
                  label="شعبه"
                  required
                  value={form.branchId}
                  onChange={(value) => setForm((current) => ({ ...current, branchId: value }))}
                  options={state.branches.map((branch) => ({ value: branch.id, label: branch.name, description: branch.area }))}
                />

                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-ink">تاریخ دریافت *</span>
                  <input
                    required
                    type="date"
                    value={form.pickupDate}
                    onChange={(event) => setForm({ ...form, pickupDate: event.target.value })}
                    className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-bold text-ink">شروع دریافت *</span>
                    <input
                      required
                      type="time"
                      value={form.pickupStart}
                      onChange={(event) => setForm({ ...form, pickupStart: event.target.value })}
                      className="h-10 px-2 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-bold text-ink">پایان دریافت *</span>
                    <input
                      required
                      type="time"
                      value={form.pickupEnd}
                      onChange={(event) => setForm({ ...form, pickupEnd: event.target.value })}
                      className="h-10 px-2 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-ink">زمان انتشار *</span>
                  <input
                    required
                    type="datetime-local"
                    value={form.publishAt.slice(0, 16)}
                    onChange={(event) => setForm({ ...form, publishAt: event.target.value })}
                    className="h-10 px-2 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-ink">زمان انقضا *</span>
                  <input
                    required
                    type="datetime-local"
                    value={form.expiresAt.slice(0, 16)}
                    onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
                    className="h-10 px-2 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                  />
                </label>

                <label className="sm:col-span-2 flex flex-col gap-1.5">
                  <span className="font-bold text-ink">آلرژن‌ها</span>
                  <input
                    value={form.allergens.join("، ")}
                    onChange={(event) =>
                      setForm({ ...form, allergens: event.target.value.split("،").map((item) => item.trim()).filter(Boolean) })
                    }
                    className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                  />
                </label>

                <label className="sm:col-span-2 flex flex-col gap-1.5">
                  <span className="font-bold text-ink">برچسب‌های غذایی</span>
                  <input
                    value={form.dietaryLabels.join("، ")}
                    onChange={(event) =>
                      setForm({ ...form, dietaryLabels: event.target.value.split("،").map((item) => item.trim()).filter(Boolean) })
                    }
                    className="h-10 px-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus"
                  />
                </label>

                <label className="sm:col-span-2 flex flex-col gap-1.5">
                  <span className="font-bold text-ink">اطلاعات مصرف و نگهداری *</span>
                  <textarea
                    required
                    rows={2}
                    value={form.expiryInfo}
                    onChange={(event) => setForm({ ...form, expiryInfo: event.target.value })}
                    placeholder="زمان مناسب مصرف و شرایط نگهداری را بنویسید."
                    className="p-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus resize-none"
                  />
                </label>
              </div>

              <p className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4"><Icon name="info" /></span>
                <span>فقط غذای سالم و قابل‌مصرف قابل انتشار است؛ محصولات تاریخ‌گذشته در دیبز عرضه نمی‌شوند.</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-line text-xs font-bold">
              <button
                className="px-4 py-2 rounded-xl border border-line bg-surface text-ink hover:bg-canvas-soft cursor-pointer"
                type="button"
                onClick={() => save("draft")}
              >
                ذخیره پیش‌نویس
              </button>
              <button
                className="px-4 py-2 rounded-xl border border-line bg-surface text-ink hover:bg-canvas-soft cursor-pointer"
                type="button"
                onClick={saveTemplate}
              >
                ذخیره به‌عنوان قالب
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-brand text-white hover:opacity-95 cursor-pointer disabled:opacity-50"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "در حال ذخیره…" : "انتشار پیشنهاد"}
              </button>
            </div>
          </form>
        </DialogShell>
      )}

      {confirmDelete && (
        <DialogShell label="تأیید حذف پیش‌نویس" onClose={() => setConfirmDelete(null)} size="center">
          <div className="flex flex-col items-center justify-center text-center p-6 gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger [&>svg]:w-6 [&>svg]:h-6">
              <Icon name="trash" />
            </span>
            <h2 className="text-base font-bold text-ink">پیش‌نویس حذف شود؟</h2>
            <p className="text-xs text-muted max-w-xs">این پیشنهاد هنوز برای مشتریان منتشر نشده است.</p>
            <div className="flex items-center gap-3 mt-3 w-full">
              <button
                className="flex-1 min-h-[40px] rounded-xl border border-line bg-surface text-xs font-bold text-ink hover:bg-canvas-soft cursor-pointer"
                type="button"
                onClick={() => setConfirmDelete(null)}
              >
                انصراف
              </button>
              <button
                className="flex-1 min-h-[40px] rounded-xl bg-danger text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                type="button"
                onClick={() => {
                  const result = removeDraft(confirmDelete.id);
                  notify(result.ok ? "پیش‌نویس حذف شد." : result.error, result.ok ? "success" : "error");
                  setConfirmDelete(null);
                }}
              >
                حذف
              </button>
            </div>
          </div>
        </DialogShell>
      )}
    </div>
  );
}
