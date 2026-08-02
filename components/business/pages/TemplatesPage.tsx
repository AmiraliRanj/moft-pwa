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

export function TemplatesPage() {
  const { state, publishTemplate, duplicateTemplate, deleteTemplate, createTemplate, updateTemplate } = useDemo();
  const { branchId, can, notify } = useBusinessUi();
  const [publishing, setPublishing] = useState<OfferTemplate | null>(null);
  const [editing, setEditing] = useState<OfferTemplate | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<OfferTemplate | null>(null);
  const [publishValues, setPublishValues] = useState({ quantity: 8, price: 125000, branchId, pickupDate: new Date().toISOString().slice(0, 10), pickupStart: "20:00", pickupEnd: "21:00" });
  const [editValues, setEditValues] = useState({ templateName: "", title: "", description: "", salePrice: 125000 });

  const ensurePermission = () => {
    if (can("offers:write")) return true;
    notify("نقش فعال اجازه مدیریت قالب‌ها را ندارد.", "error"); return false;
  };

  const openPublish = (template: OfferTemplate) => {
    if (!ensurePermission()) return;
    setPublishing(template);
    setPublishValues({ quantity: template.totalQuantity, price: template.salePrice, branchId, pickupDate: new Date().toISOString().slice(0, 10), pickupStart: template.pickupStart, pickupEnd: template.pickupEnd });
  };

  const openEdit = (template?: OfferTemplate) => {
    if (!ensurePermission()) return;
    setEditing(template ?? "new");
    setEditValues(template ? { templateName: template.templateName, title: template.title, description: template.description, salePrice: template.salePrice } : { templateName: "قالب تازه", title: "بسته تازه", description: "توضیحات روشن درباره بسته سالم و بازه دریافت حضوری.", salePrice: 125000 });
  };

  const saveEdit = () => {
    if (editing === "new") {
      const base: OfferDraft = { offerType: "surprise_box", title: editValues.title, description: editValues.description, image: "/images/offers/offer-01.webp", originalValue: Math.round(editValues.salePrice * 3), salePrice: editValues.salePrice, totalQuantity: 8, branchId, pickupDate: new Date().toISOString().slice(0, 10), pickupStart: "20:00", pickupEnd: "21:00", allergens: ["گلوتن"], dietaryLabels: ["ترکیب متغیر"], expiryInfo: "محصولات سالم همان روز", publishAt: new Date().toISOString(), expiresAt: `${new Date().toISOString().slice(0, 10)}T23:00:00.000Z` };
      const result = createTemplate(base, editValues.templateName);
      notify(result.message, result.ok ? "success" : "error");
      if (result.ok) setEditing(null);
    } else if (editing) {
      const result = updateTemplate(editing.id, editValues);
      notify(result.message, result.ok ? "success" : "error");
      if (result.ok) setEditing(null);
    }
  };

  return (
    <div className="business-page templates-page">
      <BusinessPageHeader eyebrow="انتشار سریع" title="قالب‌های پیشنهاد" description="پیشنهادهای پرتکرار را نگه دارید و با موجودی و بازه جدید برای امروز منتشر کنید." action={<button className="business-primary" type="button" onClick={() => openEdit()}><Icon name="plus" /> قالب تازه</button>} />
      <div className="template-grid">{state.templates.map((template) => <article className="template-card" key={template.id}><span className="template-image"><FoodImage src={template.image} sizes="240px" /></span><div><small>{template.offerType === "surprise_box" ? "جعبه غافلگیرکننده" : "محصول مشخص"}</small><h2>{template.templateName}</h2><p>{template.description}</p><dl><div><dt>قیمت پیشنهادی</dt><dd>{formatMoney(template.salePrice)}</dd></div><div><dt>تعداد پایه</dt><dd>{formatNumber(template.totalQuantity)}</dd></div><div><dt>دریافت</dt><dd>{template.pickupStart}–{template.pickupEnd}</dd></div></dl></div><div className="template-actions"><button className="business-primary" type="button" onClick={() => openPublish(template)}>انتشار برای امروز</button><button type="button" onClick={() => openEdit(template)}>ویرایش</button><button type="button" onClick={() => { if (!ensurePermission()) return; const result = duplicateTemplate(template.id); notify(result.message, result.ok ? "success" : "error"); }}>کپی</button><button className="danger-text" type="button" onClick={() => setConfirmDelete(template)}>حذف</button></div></article>)}</div>

      {publishing && <DialogShell titleId="publish-template-title" onClose={() => setPublishing(null)}><form className="business-dialog compact-form" onSubmit={(event) => { event.preventDefault(); const result = publishTemplate(publishing.id, publishValues); notify(result.ok ? "پیشنهاد از روی قالب منتشر شد و در نسخه مشتری قابل مشاهده است." : result.error, result.ok ? "success" : "error"); if (result.ok) setPublishing(null); }}><p className="eyebrow">انتشار سریع</p><h2 id="publish-template-title">{publishing.templateName}</h2><label><span>تعداد</span><input required min="1" type="number" value={publishValues.quantity} onChange={(event) => setPublishValues({ ...publishValues, quantity: Number(event.target.value) })} /></label><label><span>قیمت رزرو</span><input required min="1" type="number" value={publishValues.price} onChange={(event) => setPublishValues({ ...publishValues, price: Number(event.target.value) })} /></label><label><span>شعبه</span><select value={publishValues.branchId} onChange={(event) => setPublishValues({ ...publishValues, branchId: event.target.value })}>{state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><label><span>تاریخ دریافت</span><input required type="date" value={publishValues.pickupDate} onChange={(event) => setPublishValues({ ...publishValues, pickupDate: event.target.value })} /></label><div className="inline-fields"><label><span>شروع</span><input required type="time" value={publishValues.pickupStart} onChange={(event) => setPublishValues({ ...publishValues, pickupStart: event.target.value })} /></label><label><span>پایان</span><input required type="time" value={publishValues.pickupEnd} onChange={(event) => setPublishValues({ ...publishValues, pickupEnd: event.target.value })} /></label></div><button className="business-primary full" type="submit">انتشار پیشنهاد</button></form></DialogShell>}

      {editing && <DialogShell titleId="edit-template-title" onClose={() => setEditing(null)}><form className="business-dialog compact-form" onSubmit={(event) => { event.preventDefault(); saveEdit(); }}><p className="eyebrow">{editing === "new" ? "قالب تازه" : "ویرایش قالب"}</p><h2 id="edit-template-title">اطلاعات پایه</h2><label><span>نام قالب</span><input required value={editValues.templateName} onChange={(event) => setEditValues({ ...editValues, templateName: event.target.value })} /></label><label><span>عنوان پیشنهاد</span><input required value={editValues.title} onChange={(event) => setEditValues({ ...editValues, title: event.target.value })} /></label><label><span>توضیحات</span><textarea required rows={4} value={editValues.description} onChange={(event) => setEditValues({ ...editValues, description: event.target.value })} /></label><label><span>قیمت پایه</span><input required min="1" type="number" value={editValues.salePrice} onChange={(event) => setEditValues({ ...editValues, salePrice: Number(event.target.value) })} /></label><button className="business-primary full" type="submit">ذخیره قالب</button></form></DialogShell>}

      {confirmDelete && <DialogShell label="تأیید حذف قالب" onClose={() => setConfirmDelete(null)} size="center"><div className="cancel-dialog"><span className="danger-icon"><Icon name="trash" /></span><h2>قالب حذف شود؟</h2><p>پیشنهادهای قبلی دست‌نخورده می‌مانند، اما این قالب دیگر برای انتشار سریع در دسترس نیست.</p><div><button className="secondary-button" type="button" onClick={() => setConfirmDelete(null)}>انصراف</button><button className="danger-button" type="button" onClick={() => { const result = deleteTemplate(confirmDelete.id); notify(result.message, result.ok ? "success" : "error"); setConfirmDelete(null); }}>حذف</button></div></div></DialogShell>}
    </div>
  );
}
