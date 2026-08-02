"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { BusinessPageHeader, EmptyBusinessState } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { DialogShell } from "@/components/moft/DialogShell";
import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { staffRoleLabel } from "@/lib/demo-format";
import type { Permission, StaffMember, StaffRole } from "@/types/demo";

type SettingsTab = "business" | "branches" | "hours" | "pickup" | "staff" | "roles" | "notifications" | "finance" | "documents" | "security";
const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "business", label: "اطلاعات مجموعه" }, { id: "branches", label: "شعب" }, { id: "hours", label: "ساعات کاری" },
  { id: "pickup", label: "بازه‌های تحویل" }, { id: "staff", label: "کارکنان" }, { id: "roles", label: "نقش‌ها و دسترسی‌ها" },
  { id: "notifications", label: "اعلان‌ها" }, { id: "finance", label: "اطلاعات مالی" }, { id: "documents", label: "مدارک" }, { id: "security", label: "امنیت" },
];

const rolePermissions: Record<StaffRole, Permission[]> = {
  owner: ["offers:write", "orders:write", "pickup:write", "finance:read", "settings:owner"],
  branch_manager: ["offers:write", "orders:write", "pickup:write"], orders: ["orders:write"], pickup: ["pickup:write"], accountant: ["finance:read"],
};

export function SettingsPage() {
  const { state, updateBusiness, updateBranch, addBranch, removeBranch, updateStaff, addStaff } = useDemo();
  const { can, notify } = useBusinessUi();
  const [tab, setTab] = useState<SettingsTab>("business");
  const [businessForm, setBusinessForm] = useState({ name: state.business.name, ownerName: state.business.ownerName, category: state.business.category });
  const [branchDialog, setBranchDialog] = useState(false);
  const [staffDialog, setStaffDialog] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: "شعبه تازه", area: "تهران", address: "", phone: "021-00000000", acceptsOrders: true, openingHours: "۹:۰۰ تا ۲۱:۰۰", pickupWindows: ["۲۰:۰۰ تا ۲۱:۰۰"] });
  const [staffForm, setStaffForm] = useState({ name: "", mobile: "", branchId: state.branches[0]?.id ?? "", role: "orders" as StaffRole });
  const [documentName, setDocumentName] = useState("");
  const [notifications, setNotifications] = useState({ order: true, stock: true, review: true, settlement: true });
  const ownerOnly = can("settings:owner");

  const requireOwner = () => {
    if (ownerOnly) return true;
    notify("این بخش فقط با نقش مالک قابل ویرایش است.", "error"); return false;
  };

  const imagePreview = (event: ChangeEvent<HTMLInputElement>, field: "logo" | "cover") => {
    if (!requireOwner()) return;
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2_000_000) return notify("تصویر باید کمتر از ۲ مگابایت باشد.", "error");
    const reader = new FileReader(); reader.onload = () => { updateBusiness({ [field]: String(reader.result) }); notify("پیش‌نمایش تصویر ذخیره شد."); }; reader.readAsDataURL(file);
  };

  const saveBusiness = (event: FormEvent) => {
    event.preventDefault(); if (!requireOwner()) return; updateBusiness(businessForm); notify("اطلاعات مجموعه ذخیره شد.");
  };

  const selectRole = (member: StaffMember, role: StaffRole) => {
    if (!requireOwner()) return;
    const result = updateStaff(member.id, { role, permissions: rolePermissions[role] }); notify(result.message, result.ok ? "success" : "error");
  };

  const togglePermission = (member: StaffMember, permission: Permission) => {
    if (!requireOwner()) return;
    const permissions = member.permissions.includes(permission) ? member.permissions.filter((item) => item !== permission) : [...member.permissions, permission];
    const result = updateStaff(member.id, { permissions }); notify(result.message, result.ok ? "success" : "error");
  };

  return (
    <div className="business-page settings-page">
      <BusinessPageHeader eyebrow="تنظیمات دمو" title="مدیریت مجموعه" description="اطلاعات، شعب، کارکنان و دسترسی‌های نمایشی کافه ویونا را مدیریت کنید." />
      <div className="settings-layout"><nav className="settings-tabs" aria-label="بخش‌های تنظیمات">{settingsTabs.map((item) => <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}<Icon name="chevron" /></button>)}</nav><section className="business-panel settings-content">
        {tab === "business" && <form className="settings-form" onSubmit={saveBusiness}><SettingsTitle title="اطلاعات مجموعه" text="هویت مشترک نسخه مشتری و پنل کسب‌وکار" /><div className="business-media-fields"><label><span className="settings-image logo"><FoodImage src={state.business.logo} sizes="100px" /></span><strong>نشان مجموعه</strong><small>PNG یا JPG کمتر از ۲ مگابایت</small><input type="file" accept="image/*" onChange={(event) => imagePreview(event, "logo")} disabled={!ownerOnly} /></label><label><span className="settings-image cover"><FoodImage src={state.business.cover} sizes="260px" /></span><strong>تصویر کاور</strong><small>پیش‌نمایش در کارت کسب‌وکار</small><input type="file" accept="image/*" onChange={(event) => imagePreview(event, "cover")} disabled={!ownerOnly} /></label></div><div className="settings-field-grid"><label><span>نام مجموعه</span><input value={businessForm.name} onChange={(event) => setBusinessForm({ ...businessForm, name: event.target.value })} disabled={!ownerOnly} /></label><label><span>نام مالک</span><input value={businessForm.ownerName} onChange={(event) => setBusinessForm({ ...businessForm, ownerName: event.target.value })} disabled={!ownerOnly} /></label><label><span>دسته‌بندی</span><input value={businessForm.category} onChange={(event) => setBusinessForm({ ...businessForm, category: event.target.value })} disabled={!ownerOnly} /></label><label><span>امتیاز نمایشی</span><input value={state.business.rating.toLocaleString("fa-IR")} disabled /></label></div><button className="business-primary" type="submit" disabled={!ownerOnly}>ذخیره تغییرات</button></form>}
        {tab === "branches" && <div><SettingsTitle title="شعب" text="شعبه‌های متصل به این پنل و پیشنهادها" action={<button className="business-primary" type="button" onClick={() => requireOwner() && setBranchDialog(true)}><Icon name="plus" /> افزودن شعبه</button>} /><div className="settings-list">{state.branches.map((branch) => <article key={branch.id}><span className="list-icon"><Icon name="store" /></span><div><strong>{branch.name}</strong><small>{branch.address}</small><small>{branch.phone} · {branch.openingHours}</small></div><label className="inline-switch"><input type="checkbox" checked={branch.acceptsOrders} onChange={() => { if (!requireOwner()) return; const result = updateBranch(branch.id, { acceptsOrders: !branch.acceptsOrders }); notify(result.message, result.ok ? "success" : "error"); }} /><span /></label><button className="danger-text" type="button" onClick={() => { if (!requireOwner()) return; const result = removeBranch(branch.id); notify(result.message, result.ok ? "success" : "error"); }}>حذف</button></article>)}</div></div>}
        {tab === "hours" && <div><SettingsTitle title="ساعات کاری هفتگی" text="در نسخه دمو، یک الگو برای همه روزها ذخیره می‌شود." /><div className="weekly-hours">{["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"].map((day) => <div key={day}><strong>{day}</strong><label className="inline-switch"><input type="checkbox" defaultChecked={day !== "جمعه"} disabled={!ownerOnly} /><span /></label><input type="time" defaultValue="08:00" disabled={!ownerOnly || day === "جمعه"} /><span>تا</span><input type="time" defaultValue="22:00" disabled={!ownerOnly || day === "جمعه"} /></div>)}</div><button className="business-primary" type="button" disabled={!ownerOnly} onClick={() => notify("ساعات کاری نمایشی ذخیره شد.")}>ذخیره ساعات</button></div>}
        {tab === "pickup" && <div><SettingsTitle title="بازه‌های تحویل" text="این بازه‌ها هنگام ساخت پیشنهاد قابل انتخاب‌اند." /><div className="settings-list pickup-window-list">{state.branches.map((branch) => <article key={branch.id}><span className="list-icon"><Icon name="clock" /></span><div><strong>{branch.name}</strong>{branch.pickupWindows.map((window) => <small key={window}>{window}</small>)}</div><button type="button" disabled={!ownerOnly} onClick={() => { const result = updateBranch(branch.id, { pickupWindows: [...branch.pickupWindows, "۲۱:۳۰ تا ۲۲:۳۰"] }); notify(result.message, result.ok ? "success" : "error"); }}><Icon name="plus" /> افزودن بازه</button></article>)}</div></div>}
        {tab === "staff" && <div><SettingsTitle title="کارکنان" text="اعضای نمایشی و نقش عملیاتی آن‌ها" action={<button className="business-primary" type="button" onClick={() => requireOwner() && setStaffDialog(true)}><Icon name="plus" /> افزودن کارمند</button>} /><div className="settings-list staff-list">{state.staff.map((member) => <article key={member.id}><span className="staff-avatar">{member.name[0]}</span><div><strong>{member.name}</strong><small>{member.mobile} · {staffRoleLabel[member.role]}</small></div><label><span className="sr-only">نقش {member.name}</span><select value={member.role} disabled={!ownerOnly} onChange={(event) => selectRole(member, event.target.value as StaffRole)}>{Object.entries(staffRoleLabel).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="inline-switch"><input type="checkbox" checked={member.active} disabled={!ownerOnly} onChange={() => updateStaff(member.id, { active: !member.active })} /><span /></label></article>)}</div></div>}
        {tab === "roles" && <div><SettingsTitle title="نقش‌ها و دسترسی‌ها" text="دسترسی‌ها واقعاً روی عملیات پنل اثر می‌گذارند." /><div className="permission-table">{state.staff.map((member) => <section key={member.id}><header><strong>{member.name}</strong><small>{staffRoleLabel[member.role]}</small></header>{(["offers:write", "orders:write", "pickup:write", "finance:read", "settings:owner"] as Permission[]).map((permission) => <label key={permission}><input type="checkbox" checked={member.permissions.includes(permission)} disabled={!ownerOnly || member.role === "owner"} onChange={() => togglePermission(member, permission)} /><span>{permission === "offers:write" ? "انتشار پیشنهاد" : permission === "orders:write" ? "مدیریت سفارش" : permission === "pickup:write" ? "تأیید تحویل" : permission === "finance:read" ? "مشاهده مالی" : "تنظیمات مالک"}</span></label>)}</section>)}</div><p className="permission-note"><Icon name="info" /> مسئول تحویل تنظیمات مالی را نمی‌بیند؛ حسابدار نمی‌تواند پیشنهاد منتشر کند؛ مدیر شعبه تنظیمات مالک را ویرایش نمی‌کند.</p></div>}
        {tab === "notifications" && <div><SettingsTitle title="اعلان‌ها" text="کانال‌های این نسخه شبیه‌سازی شده‌اند." /><div className="notification-settings">{Object.entries({ order: "سفارش تازه", stock: "کمبود موجودی", review: "نظر و پیگیری کیفیت", settlement: "تسویه مالی" }).map(([id, label]) => <label key={id}><span><strong>{label}</strong><small>نمایش در مرکز اعلان پنل</small></span><span className="inline-switch"><input type="checkbox" checked={notifications[id as keyof typeof notifications]} onChange={() => setNotifications({ ...notifications, [id]: !notifications[id as keyof typeof notifications] })} /><i /></span></label>)}</div><button className="business-primary" type="button" onClick={() => notify("تنظیمات اعلان‌ها ذخیره شد.")}>ذخیره اعلان‌ها</button></div>}
        {tab === "finance" && (can("finance:read") ? <div><SettingsTitle title="اطلاعات مالی" text="داده‌ها عمداً نمایشی و غیرقابل استفاده هستند." /><div className="demo-bank-card"><Icon name="info" /><span><small>شماره شبای نمایشی</small><strong dir="ltr">{state.business.demoBankIban}</strong></span></div><p>برای امنیت، این دموی عمومی اطلاعات بانکی واقعی دریافت یا ذخیره نمی‌کند.</p><button type="button" className="business-secondary" onClick={() => notify("ویرایش اطلاعات مالی در دمو غیرفعال است.", "error")}>درخواست تغییر نمایشی</button></div> : <EmptyBusinessState title="دسترسی مالی ندارید" text="فقط مالک و حسابدار می‌توانند این بخش را ببینند." />)}
        {tab === "documents" && <div><SettingsTitle title="مدارک" text="فقط نام و پیش‌نمایش فایل در حافظه مرورگر نمایش داده می‌شود." /><label className="document-drop"><Icon name="share" /><strong>{documentName || "یک مدرک نمونه انتخاب کنید"}</strong><small>PDF یا تصویر؛ فایل به سروری ارسال نمی‌شود.</small><input type="file" accept="application/pdf,image/*" disabled={!ownerOnly} onChange={(event) => { const file = event.target.files?.[0]; if (file) { setDocumentName(file.name); notify("پیش‌نمایش نام مدرک اضافه شد."); } }} /></label>{documentName && <div className="document-preview"><span>PDF</span><strong>{documentName}</strong><button type="button" onClick={() => setDocumentName("")} aria-label="حذف پیش‌نمایش"><Icon name="trash" /></button></div>}</div>}
        {tab === "security" && <SecuritySettings ownerOnly={ownerOnly} notify={notify} />}
      </section></div>

      {branchDialog && <DialogShell titleId="branch-dialog-title" onClose={() => setBranchDialog(false)}><form className="business-dialog compact-form" onSubmit={(event) => { event.preventDefault(); addBranch(branchForm); setBranchDialog(false); notify("شعبه نمایشی اضافه شد."); }}><p className="eyebrow">شعبه تازه</p><h2 id="branch-dialog-title">اطلاعات شعبه</h2><label><span>نام شعبه</span><input required value={branchForm.name} onChange={(event) => setBranchForm({ ...branchForm, name: event.target.value })} /></label><label><span>منطقه</span><input required value={branchForm.area} onChange={(event) => setBranchForm({ ...branchForm, area: event.target.value })} /></label><label><span>نشانی</span><textarea required rows={3} value={branchForm.address} onChange={(event) => setBranchForm({ ...branchForm, address: event.target.value })} /></label><label><span>تلفن نمایشی</span><input value={branchForm.phone} onChange={(event) => setBranchForm({ ...branchForm, phone: event.target.value })} /></label><button className="business-primary full" type="submit">افزودن شعبه</button></form></DialogShell>}
      {staffDialog && <DialogShell titleId="staff-dialog-title" onClose={() => setStaffDialog(false)}><form className="business-dialog compact-form" onSubmit={(event) => { event.preventDefault(); addStaff({ ...staffForm, permissions: rolePermissions[staffForm.role], active: true }); setStaffDialog(false); notify("کارمند نمایشی اضافه شد."); }}><p className="eyebrow">عضو تازه</p><h2 id="staff-dialog-title">اطلاعات کارمند</h2><label><span>نام و نام خانوادگی</span><input required value={staffForm.name} onChange={(event) => setStaffForm({ ...staffForm, name: event.target.value })} /></label><label><span>موبایل نمایشی</span><input required value={staffForm.mobile} onChange={(event) => setStaffForm({ ...staffForm, mobile: event.target.value })} /></label><label><span>شعبه</span><select value={staffForm.branchId} onChange={(event) => setStaffForm({ ...staffForm, branchId: event.target.value })}>{state.branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></label><label><span>نقش</span><select value={staffForm.role} onChange={(event) => setStaffForm({ ...staffForm, role: event.target.value as StaffRole })}>{Object.entries(staffRoleLabel).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><button className="business-primary full" type="submit">افزودن کارمند</button></form></DialogShell>}
    </div>
  );
}

function SettingsTitle({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) { return <header className="settings-title"><div><h2>{title}</h2><p>{text}</p></div>{action}</header>; }

function SecuritySettings({ ownerOnly, notify }: { ownerOnly: boolean; notify: (message: string, kind?: "success" | "error") => void }) {
  const [passwords, setPasswords] = useState({ current: "", next: "", repeat: "" });
  const save = (event: FormEvent) => { event.preventDefault(); if (passwords.next.length < 8) return notify("رمز نمایشی باید حداقل ۸ نویسه باشد.", "error"); if (passwords.next !== passwords.repeat) return notify("تکرار رمز یکسان نیست.", "error"); setPasswords({ current: "", next: "", repeat: "" }); notify("رمز نمایشی تغییر کرد؛ احراز هویت واقعی وجود ندارد."); };
  return <div><SettingsTitle title="امنیت" text="این نسخه ورود واقعی ندارد؛ فرم فقط رفتار محصول را شبیه‌سازی می‌کند." /><form className="settings-form security-form" onSubmit={save}><label><span>رمز فعلی نمایشی</span><input type="password" required value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} disabled={!ownerOnly} /></label><label><span>رمز تازه</span><input type="password" minLength={8} required value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} disabled={!ownerOnly} /></label><label><span>تکرار رمز</span><input type="password" minLength={8} required value={passwords.repeat} onChange={(event) => setPasswords({ ...passwords, repeat: event.target.value })} disabled={!ownerOnly} /></label><button className="business-primary" type="submit" disabled={!ownerOnly}>تغییر رمز نمایشی</button></form><div className="signout-card"><div><strong>خروج از پنل دمو</strong><small>به صفحه انتخاب نوع ورود برمی‌گردید.</small></div><Link href="/">خروج</Link></div></div>;
}
