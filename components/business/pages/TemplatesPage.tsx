"use client";

import { useState } from "react";
import { BusinessPageHeader } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { DialogShell } from "@/components/moft/DialogShell";
import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { formatMoney, formatNumber } from "@/lib/demo-format";
import type { OfferDraft, OfferTemplate } from "@/types/demo";

type TemplateFormValues = {
  templateName: string;
  title: string;
  description: string;
  salePrice: number | "";
};

const emptyTemplateValues: TemplateFormValues = { templateName: "", title: "", description: "", salePrice: "" };

export function TemplatesPage() {
  const { state, publishTemplate, duplicateTemplate, deleteTemplate, createTemplate, updateTemplate } = useDemo();
  const { branchId, can, notify } = useBusinessUi();
  const [publishing, setPublishing] = useState<OfferTemplate | null>(null);
  const [editing, setEditing] = useState<OfferTemplate | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<OfferTemplate | null>(null);
  const [publishValues, setPublishValues] = useState({
    quantity: 8,
    price: 125000,
    branchId,
    pickupDate: new Date().toISOString().slice(0, 10),
    pickupStart: "20:00",
    pickupEnd: "21:00",
  });
  const [editValues, setEditValues] = useState<TemplateFormValues>(emptyTemplateValues);

  const ensurePermission = () => {
    if (can("offers:write")) return true;
    notify("نقش فعال اجازه مدیریت قالب‌ها را ندارد.", "error");
    return false;
  };

  const openPublish = (template: OfferTemplate) => {
    if (!ensurePermission()) return;
    setPublishing(template);
    setPublishValues({
      quantity: template.totalQuantity,
      price: template.salePrice,
      branchId,
      pickupDate: new Date().toISOString().slice(0, 10),
      pickupStart: template.pickupStart,
      pickupEnd: template.pickupEnd,
    });
  };

  const openEdit = (template?: OfferTemplate) => {
    if (!ensurePermission()) return;
    setEditing(template ?? "new");
    setEditValues(
      template
        ? { templateName: template.templateName, title: template.title, description: template.description, salePrice: template.salePrice }
        : emptyTemplateValues
    );
  };

  const saveEdit = () => {
    const salePrice = Number(editValues.salePrice);
    if (editing === "new") {
      const base: OfferDraft = {
        offerType: "surprise_box",
        title: editValues.title,
        description: editValues.description,
        image: "/images/offers/offer-01.webp",
        originalValue: Math.round(salePrice * 3),
        salePrice,
        totalQuantity: 8,
        branchId,
        pickupDate: new Date().toISOString().slice(0, 10),
        pickupStart: "20:00",
        pickupEnd: "21:00",
        allergens: ["گلوتن"],
        dietaryLabels: ["ترکیب متغیر"],
        expiryInfo: "محصولات سالم همان روز",
        publishAt: new Date().toISOString(),
        expiresAt: `${new Date().toISOString().slice(0, 10)}T23:00:00.000Z`,
      };
      const result = createTemplate(base, editValues.templateName);
      notify(result.message, result.ok ? "success" : "error");
      if (result.ok) setEditing(null);
    } else if (editing) {
      const result = updateTemplate(editing.id, { ...editValues, salePrice });
      notify(result.message, result.ok ? "success" : "error");
      if (result.ok) setEditing(null);
    }
  };

  return (
    <div className="space-y-6">
      <BusinessPageHeader
        eyebrow="انتشار سریع"
        title="قالب‌های پیشنهاد"
        description="پیشنهادهای پرتکرار را نگه دارید و با موجودی و بازه جدید برای امروز منتشر کنید."
        action={
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity shadow-xs"
            type="button"
            onClick={() => openEdit()}
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>قالب تازه</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {state.templates.map((template) => (
          <article
            key={template.id}
            className="rounded-3xl bg-surface border border-line shadow-xs overflow-hidden flex flex-col hover:border-brand-2/30 transition-colors"
          >
            <div className="relative h-44 w-full overflow-hidden bg-canvas">
              <FoodImage src={template.image} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="w-full h-full object-cover" />
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <small className="text-[11px] font-bold text-brand-2 block">
                {template.offerType === "surprise_box" ? "جعبه غافلگیرکننده" : "محصول مشخص"}
              </small>
              <h2 className="text-base font-black text-ink mt-1 mb-1">{template.templateName}</h2>
              <p className="text-xs text-muted line-clamp-2 leading-relaxed">{template.description}</p>

              <dl className="grid gap-2 mt-4 pt-3 border-t border-line/60">
                <div className="flex items-center justify-between text-xs">
                  <dt className="text-muted">قیمت پیشنهادی</dt>
                  <dd className="font-bold text-ink">{formatMoney(template.salePrice)}</dd>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <dt className="text-muted">تعداد پایه</dt>
                  <dd className="font-bold text-ink">{formatNumber(template.totalQuantity)}</dd>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <dt className="text-muted">دریافت</dt>
                  <dd className="font-bold text-ink font-mono">{template.pickupStart}–{template.pickupEnd}</dd>
                </div>
              </dl>
            </div>

            <div className="p-3.5 pt-2 border-t border-line bg-canvas/30 space-y-2 mt-auto">
              <button
                className="w-full h-10 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity shadow-xs"
                type="button"
                onClick={() => openPublish(template)}
              >
                انتشار برای امروز
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 h-8 inline-flex items-center justify-center text-xs font-semibold rounded-lg bg-surface border border-line text-ink hover:bg-surface-raised transition-colors"
                  onClick={() => openEdit(template)}
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  className="flex-1 h-8 inline-flex items-center justify-center text-xs font-semibold rounded-lg bg-surface border border-line text-ink hover:bg-surface-raised transition-colors"
                  onClick={() => {
                    if (!ensurePermission()) return;
                    const result = duplicateTemplate(template.id);
                    notify(result.message, result.ok ? "success" : "error");
                  }}
                >
                  کپی
                </button>
                <button
                  type="button"
                  className="px-2.5 h-8 inline-flex items-center justify-center text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-500/10 transition-colors"
                  onClick={() => setConfirmDelete(template)}
                >
                  حذف
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Publish Template Modal */}
      {publishing && (
        <DialogShell titleId="publish-template-title" onClose={() => setPublishing(null)}>
          <form
            className="p-6 space-y-4 text-start"
            onSubmit={(event) => {
              event.preventDefault();
              const result = publishTemplate(publishing.id, publishValues);
              notify(
                result.ok ? "پیشنهاد از روی قالب منتشر شد و در نسخه مشتری قابل مشاهده است." : result.error,
                result.ok ? "success" : "error"
              );
              if (result.ok) setPublishing(null);
            }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">انتشار سریع</p>
              <h2 id="publish-template-title" className="text-base font-black text-ink mt-0.5">{publishing.templateName}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted">تعداد</span>
                <input
                  required
                  min="1"
                  type="number"
                  value={publishValues.quantity}
                  onChange={(event) => setPublishValues({ ...publishValues, quantity: Number(event.target.value) })}
                  className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted">قیمت رزرو (تومان)</span>
                <input
                  required
                  min="1"
                  type="number"
                  value={publishValues.price}
                  onChange={(event) => setPublishValues({ ...publishValues, price: Number(event.target.value) })}
                  className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">شعبه</span>
              <select
                value={publishValues.branchId}
                onChange={(event) => setPublishValues({ ...publishValues, branchId: event.target.value })}
                className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
              >
                {state.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">تاریخ دریافت</span>
              <input
                required
                type="date"
                value={publishValues.pickupDate}
                onChange={(event) => setPublishValues({ ...publishValues, pickupDate: event.target.value })}
                className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
              >
              </input>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted">شروع تحویل</span>
                <input
                  required
                  type="time"
                  value={publishValues.pickupStart}
                  onChange={(event) => setPublishValues({ ...publishValues, pickupStart: event.target.value })}
                  className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted">پایان تحویل</span>
                <input
                  required
                  type="time"
                  value={publishValues.pickupEnd}
                  onChange={(event) => setPublishValues({ ...publishValues, pickupEnd: event.target.value })}
                  className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
                />
              </label>
            </div>
            <button className="w-full h-11 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity shadow-xs" type="submit">
              انتشار پیشنهاد
            </button>
          </form>
        </DialogShell>
      )}

      {/* Edit / New Template Modal */}
      {editing && (
        <DialogShell titleId="edit-template-title" onClose={() => setEditing(null)}>
          <form
            className="p-6 space-y-4 text-start"
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit();
            }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{editing === "new" ? "قالب تازه" : "ویرایش قالب"}</p>
              <h2 id="edit-template-title" className="text-base font-black text-ink mt-0.5">اطلاعات پایه</h2>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">نام قالب</span>
              <input
                required
                value={editValues.templateName}
                onChange={(event) => setEditValues({ ...editValues, templateName: event.target.value })}
                placeholder="مثلاً قالب بسته پایان روز"
                className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">عنوان پیشنهاد</span>
              <input
                required
                value={editValues.title}
                onChange={(event) => setEditValues({ ...editValues, title: event.target.value })}
                placeholder="مثلاً بسته نان و شیرینی پایان روز"
                className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">توضیحات</span>
              <textarea
                required
                rows={4}
                value={editValues.description}
                onChange={(event) => setEditValues({ ...editValues, description: event.target.value })}
                placeholder="محتویات احتمالی، شرایط نگهداری و بازه دریافت را بنویسید."
                className="p-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 resize-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">قیمت پایه (تومان)</span>
              <input
                required
                min="1"
                type="number"
                value={editValues.salePrice}
                onChange={(event) => setEditValues({ ...editValues, salePrice: event.target.value === "" ? "" : Number(event.target.value) })}
                placeholder="مثلاً ۱۲۵٬۰۰۰"
                className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50"
              />
            </label>
            <button className="w-full h-11 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity shadow-xs" type="submit">
              ذخیره قالب
            </button>
          </form>
        </DialogShell>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <DialogShell label="تأیید حذف قالب" onClose={() => setConfirmDelete(null)} size="center">
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Icon name="trash" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-ink">قالب حذف شود؟</h2>
              <p className="text-xs text-muted leading-relaxed mt-1">
                پیشنهادهای قبلی دست‌نخورده می‌مانند، اما این قالب دیگر برای انتشار سریع در دسترس نیست.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="flex-1 h-10 text-xs font-bold rounded-xl bg-surface border border-line text-ink hover:bg-surface-raised transition-colors"
                onClick={() => setConfirmDelete(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className="flex-1 h-10 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
                onClick={() => {
                  const result = deleteTemplate(confirmDelete.id);
                  notify(result.message, result.ok ? "success" : "error");
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
