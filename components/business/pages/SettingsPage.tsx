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
  { id: "business", label: "اطلاعات مجموعه" },
  { id: "branches", label: "شعب" },
  { id: "hours", label: "ساعات کاری" },
  { id: "pickup", label: "بازه‌های تحویل" },
  { id: "staff", label: "کارکنان" },
  { id: "roles", label: "نقش‌ها و دسترسی‌ها" },
  { id: "notifications", label: "اعلان‌ها" },
  { id: "finance", label: "اطلاعات مالی" },
  { id: "documents", label: "مدارک" },
  { id: "security", label: "امنیت" },
];

const rolePermissions: Record<StaffRole, Permission[]> = {
  owner: ["offers:write", "orders:write", "pickup:write", "finance:read", "settings:owner"],
  branch_manager: ["offers:write", "orders:write", "pickup:write"],
  orders: ["orders:write"],
  pickup: ["pickup:write"],
  accountant: ["finance:read"],
};

export function SettingsPage() {
  const { state, updateBusiness, updateBranch, addBranch, removeBranch, updateStaff, addStaff } = useDemo();
  const { can, notify } = useBusinessUi();
  const [tab, setTab] = useState<SettingsTab>("business");
  const [businessForm, setBusinessForm] = useState({
    name: state.business.name,
    ownerName: state.business.ownerName,
    category: state.business.category,
  });
  const [branchDialog, setBranchDialog] = useState(false);
  const [staffDialog, setStaffDialog] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: "شعبه تازه",
    area: "تهران",
    address: "",
    phone: "021-00000000",
    acceptsOrders: true,
    openingHours: "۹:۰۰ تا ۲۱:۰۰",
    pickupWindows: ["۲۰:۰۰ تا ۲۱:۰۰"],
  });
  const [staffForm, setStaffForm] = useState({
    name: "",
    mobile: "",
    branchId: state.branches[0]?.id ?? "",
    role: "orders" as StaffRole,
  });
  const [documentName, setDocumentName] = useState("");
  const [notifications, setNotifications] = useState({ order: true, stock: true, review: true, settlement: true });
  const ownerOnly = can("settings:owner");

  const requireOwner = () => {
    if (ownerOnly) return true;
    notify("این بخش فقط با نقش مالک قابل ویرایش است.", "error");
    return false;
  };

  const imagePreview = (event: ChangeEvent<HTMLInputElement>, field: "logo" | "cover") => {
    if (!requireOwner()) return;
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2_000_000) {
      return notify("تصویر باید کمتر از ۲ مگابایت باشد.", "error");
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateBusiness({ [field]: String(reader.result) });
      notify("پیش‌نمایش تصویر ذخیره شد.");
    };
    reader.readAsDataURL(file);
  };

  const saveBusiness = (event: FormEvent) => {
    event.preventDefault();
    if (!requireOwner()) return;
    updateBusiness(businessForm);
    notify("اطلاعات مجموعه ذخیره شد.");
  };

  const selectRole = (member: StaffMember, role: StaffRole) => {
    if (!requireOwner()) return;
    const result = updateStaff(member.id, { role, permissions: rolePermissions[role] });
    notify(result.message, result.ok ? "success" : "error");
  };

  const togglePermission = (member: StaffMember, permission: Permission) => {
    if (!requireOwner()) return;
    const permissions = member.permissions.includes(permission)
      ? member.permissions.filter((item) => item !== permission)
      : [...member.permissions, permission];
    const result = updateStaff(member.id, { permissions });
    notify(result.message, result.ok ? "success" : "error");
  };

  return (
    <div className="space-y-6">
      <BusinessPageHeader
        eyebrow="تنظیمات"
        title="مدیریت مجموعه"
        description="اطلاعات، شعب، کارکنان و دسترسی‌های کافه ویونا را مدیریت کنید."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-5 items-start">
        {/* Navigation Tabs */}
        <nav className="lg:sticky lg:top-24 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 p-2 rounded-2xl bg-surface border border-line shadow-xs shrink-0" aria-label="بخش‌های تنظیمات">
          {settingsTabs.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                className={`min-h-[42px] px-3.5 py-2 flex items-center justify-between text-xs rounded-xl transition-colors whitespace-nowrap lg:whitespace-normal font-medium ${
                  isActive
                    ? "bg-brand-soft text-brand-2 font-bold"
                    : "text-muted hover:text-ink hover:bg-canvas/50"
                }`}
                onClick={() => setTab(item.id)}
              >
                <span>{item.label}</span>
                <Icon name="chevron" className="hidden lg:block w-3.5 h-3.5 rtl:rotate-180 opacity-60" />
              </button>
            );
          })}
        </nav>

        {/* Settings Content */}
        <section className="min-h-[580px] p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs">
          {tab === "business" && (
            <form className="space-y-5" onSubmit={saveBusiness}>
              <SettingsTitle title="اطلاعات مجموعه" text="هویت مشترک نسخه مشتری و پنل کسب‌وکار" />
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
                <label className="relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-canvas/50 border border-line cursor-pointer hover:border-brand-2/40 transition-colors group">
                  <span className="w-24 h-24 relative block overflow-hidden rounded-xl bg-canvas shadow-inner">
                    <FoodImage src={state.business.logo} sizes="100px" className="w-full h-full object-cover" />
                  </span>
                  <strong className="text-xs font-bold text-ink">نشان مجموعه</strong>
                  <small className="text-[10px] text-muted text-center">PNG یا JPG کمتر از ۲ مگابایت</small>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(event) => imagePreview(event, "logo")} disabled={!ownerOnly} />
                </label>
                <label className="relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-canvas/50 border border-line cursor-pointer hover:border-brand-2/40 transition-colors group">
                  <span className="w-full h-24 relative block overflow-hidden rounded-xl bg-canvas shadow-inner">
                    <FoodImage src={state.business.cover} sizes="260px" className="w-full h-full object-cover" />
                  </span>
                  <strong className="text-xs font-bold text-ink">تصویر کاور</strong>
                  <small className="text-[10px] text-muted text-center">پیش‌نمایش در کارت کسب‌وکار</small>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(event) => imagePreview(event, "cover")} disabled={!ownerOnly} />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium text-muted">نام مجموعه</span>
                  <input className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 disabled:opacity-60" value={businessForm.name} onChange={(event) => setBusinessForm({ ...businessForm, name: event.target.value })} disabled={!ownerOnly} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium text-muted">نام مالک</span>
                  <input className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 disabled:opacity-60" value={businessForm.ownerName} onChange={(event) => setBusinessForm({ ...businessForm, ownerName: event.target.value })} disabled={!ownerOnly} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium text-muted">دسته‌بندی</span>
                  <input className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 disabled:opacity-60" value={businessForm.category} onChange={(event) => setBusinessForm({ ...businessForm, category: event.target.value })} disabled={!ownerOnly} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium text-muted">امتیاز</span>
                  <input className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-muted focus:outline-none opacity-60" value={state.business.rating.toLocaleString("fa-IR")} disabled />
                </label>
              </div>
              <button className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xs" type="submit" disabled={!ownerOnly}>
                ذخیره تغییرات
              </button>
            </form>
          )}

          {tab === "branches" && (
            <div className="space-y-4">
              <SettingsTitle
                title="شعب"
                text="شعبه‌های متصل به این پنل و پیشنهادها"
                action={
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity" type="button" onClick={() => requireOwner() && setBranchDialog(true)}>
                    <Icon name="plus" className="w-3.5 h-3.5" /> افزودن شعبه
                  </button>
                }
              />
              <div className="grid gap-2.5">
                {state.branches.map((branch) => (
                  <article key={branch.id} className="min-h-[72px] flex items-center gap-3.5 p-3.5 rounded-xl bg-canvas/40 border border-line">
                    <span className="w-11 h-11 grid place-items-center rounded-xl bg-brand-soft text-brand-2 shrink-0">
                      <Icon name="store" className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-xs font-bold text-ink">{branch.name}</strong>
                      <small className="block text-[11px] text-muted mt-0.5">{branch.address}</small>
                      <small className="block text-[11px] text-muted mt-0.5">{branch.phone} · {branch.openingHours}</small>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={branch.acceptsOrders}
                        onChange={() => {
                          if (!requireOwner()) return;
                          const result = updateBranch(branch.id, { acceptsOrders: !branch.acceptsOrders });
                          notify(result.message, result.ok ? "success" : "error");
                        }}
                      />
                      <div className="w-9 h-5 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <button
                      className="text-xs font-medium text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg"
                      type="button"
                      onClick={() => {
                        if (!requireOwner()) return;
                        const result = removeBranch(branch.id);
                        notify(result.message, result.ok ? "success" : "error");
                      }}
                    >
                      حذف
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === "hours" && (
            <div className="space-y-4">
              <SettingsTitle title="ساعات کاری هفتگی" text="یک الگوی کاری برای روزهای هفته تنظیم کنید." />
              <div className="grid gap-2">
                {["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"].map((day) => (
                  <div key={day} className="grid grid-cols-[80px_42px_1fr_auto_1fr] sm:grid-cols-[100px_48px_120px_25px_120px] items-center gap-2 p-2.5 rounded-xl bg-canvas/40 border border-line">
                    <strong className="text-xs font-bold text-ink">{day}</strong>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" defaultChecked={day !== "جمعه"} disabled={!ownerOnly} />
                      <div className="w-8 h-4 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <input type="time" defaultValue="08:00" disabled={!ownerOnly || day === "جمعه"} className="h-9 px-2 text-xs rounded-lg bg-surface border border-line text-ink focus:outline-none disabled:opacity-50" />
                    <span className="text-xs text-muted text-center">تا</span>
                    <input type="time" defaultValue="22:00" disabled={!ownerOnly || day === "جمعه"} className="h-9 px-2 text-xs rounded-lg bg-surface border border-line text-ink focus:outline-none disabled:opacity-50" />
                  </div>
                ))}
              </div>
              <button className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity disabled:opacity-50" type="button" disabled={!ownerOnly} onClick={() => notify("ساعات کاری ذخیره شد.")}>
                ذخیره ساعات
              </button>
            </div>
          )}

          {tab === "pickup" && (
            <div className="space-y-4">
              <SettingsTitle title="بازه‌های تحویل" text="این بازه‌ها هنگام ساخت پیشنهاد قابل انتخاب‌اند." />
              <div className="grid gap-2.5">
                {state.branches.map((branch) => (
                  <article key={branch.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-canvas/40 border border-line">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 grid place-items-center rounded-xl bg-brand-soft text-brand-2 shrink-0">
                        <Icon name="clock" className="w-4 h-4" />
                      </span>
                      <div>
                        <strong className="block text-xs font-bold text-ink">{branch.name}</strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {branch.pickupWindows.map((window) => (
                            <span key={window} className="text-[11px] font-medium text-muted bg-surface px-2 py-0.5 rounded-md border border-line">
                              {window}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!ownerOnly}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-2 hover:bg-brand-soft rounded-lg transition-colors disabled:opacity-50"
                      onClick={() => {
                        const result = updateBranch(branch.id, { pickupWindows: [...branch.pickupWindows, "۲۱:۳۰ تا ۲۲:۳۰"] });
                        notify(result.message, result.ok ? "success" : "error");
                      }}
                    >
                      <Icon name="plus" className="w-3.5 h-3.5" /> افزودن بازه
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === "staff" && (
            <div className="space-y-4">
              <SettingsTitle
                title="کارکنان"
                text="اعضا و نقش عملیاتی آن‌ها"
                action={
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity" type="button" onClick={() => requireOwner() && setStaffDialog(true)}>
                    <Icon name="plus" className="w-3.5 h-3.5" /> افزودن کارمند
                  </button>
                }
              />
              <div className="grid gap-2.5">
                {state.staff.map((member) => (
                  <article key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-canvas/40 border border-line">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 grid place-items-center rounded-full bg-brand-soft text-brand-2 font-bold text-xs shrink-0">
                        {member.name[0]}
                      </span>
                      <div>
                        <strong className="block text-xs font-bold text-ink">{member.name}</strong>
                        <small className="block text-[11px] text-muted mt-0.5">{member.mobile} · {staffRoleLabel[member.role]}</small>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <label>
                        <span className="sr-only">نقش {member.name}</span>
                        <select
                          value={member.role}
                          disabled={!ownerOnly}
                          onChange={(event) => selectRole(member, event.target.value as StaffRole)}
                          className="h-9 px-2.5 text-xs rounded-xl bg-surface border border-line text-ink focus:outline-none disabled:opacity-50"
                        >
                          {Object.entries(staffRoleLabel).map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={member.active}
                          disabled={!ownerOnly}
                          onChange={() => updateStaff(member.id, { active: !member.active })}
                        />
                        <div className="w-8 h-4 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === "roles" && (
            <div className="space-y-4">
              <SettingsTitle title="نقش‌ها و دسترسی‌ها" text="دسترسی‌ها واقعاً روی عملیات پنل اثر می‌گذارند." />
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[720px] grid gap-2.5">
                  {state.staff.map((member) => (
                    <section key={member.id} className="grid grid-cols-[160px_repeat(5,minmax(90px,1fr))] items-center gap-2 p-3 rounded-xl bg-canvas/40 border border-line">
                      <header>
                        <strong className="block text-xs font-bold text-ink">{member.name}</strong>
                        <small className="block text-[11px] text-muted mt-0.5">{staffRoleLabel[member.role]}</small>
                      </header>
                      {(["offers:write", "orders:write", "pickup:write", "finance:read", "settings:owner"] as Permission[]).map((permission) => (
                        <label key={permission} className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer hover:text-ink">
                          <input
                            type="checkbox"
                            className="accent-brand-2 rounded"
                            checked={member.permissions.includes(permission)}
                            disabled={!ownerOnly || member.role === "owner"}
                            onChange={() => togglePermission(member, permission)}
                          />
                          <span>
                            {permission === "offers:write"
                              ? "انتشار پیشنهاد"
                              : permission === "orders:write"
                              ? "مدیریت سفارش"
                              : permission === "pickup:write"
                              ? "تأیید تحویل"
                              : permission === "finance:read"
                              ? "مشاهده مالی"
                              : "تنظیمات مالک"}
                          </span>
                        </label>
                      ))}
                    </section>
                  ))}
                </div>
              </div>
              <p className="flex items-center gap-2 p-3 rounded-xl bg-brand-soft text-brand-2 text-xs font-medium">
                <Icon name="info" className="w-4 h-4 shrink-0" />
                <span>مسئول تحویل تنظیمات مالی را نمی‌بیند؛ حسابدار نمی‌تواند پیشنهاد منتشر کند؛ مدیر شعبه تنظیمات مالک را ویرایش نمی‌کند.</span>
              </p>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-4">
              <SettingsTitle title="اعلان‌ها" text="رویدادهای قابل نمایش در مرکز اعلان را انتخاب کنید." />
              <div className="grid gap-2">
                {Object.entries({ order: "سفارش تازه", stock: "کمبود موجودی", review: "نظر و پیگیری کیفیت", settlement: "تسویه مالی" }).map(([id, label]) => (
                  <label key={id} className="flex items-center justify-between p-3.5 rounded-xl bg-canvas/40 border border-line cursor-pointer">
                    <div>
                      <strong className="block text-xs font-bold text-ink">{label}</strong>
                      <small className="block text-[11px] text-muted mt-0.5">نمایش در مرکز اعلان پنل</small>
                    </div>
                    <span className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications[id as keyof typeof notifications]}
                        onChange={() => setNotifications({ ...notifications, [id]: !notifications[id as keyof typeof notifications] })}
                      />
                      <div className="w-9 h-5 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </span>
                  </label>
                ))}
              </div>
              <button className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity" type="button" onClick={() => notify("تنظیمات اعلان‌ها ذخیره شد.")}>
                ذخیره اعلان‌ها
              </button>
            </div>
          )}

          {tab === "finance" && (
            can("finance:read") ? (
              <div className="space-y-4">
                <SettingsTitle title="اطلاعات مالی" text="حساب مقصد تسویه‌های مجموعه" />
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                  <Icon name="info" className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <small className="block text-[11px] text-muted">شماره شبای ثبت‌شده</small>
                    <strong className="block text-xs font-mono font-bold mt-0.5 tracking-wider" dir="ltr">{state.business.demoBankIban}</strong>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">برای تغییر حساب تسویه، یک درخواست پشتیبانی ثبت کنید.</p>
                <Link className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface border border-line text-ink hover:bg-surface-raised transition-colors shadow-xs" href="/business/support">
                  درخواست تغییر حساب
                </Link>
              </div>
            ) : (
              <EmptyBusinessState title="دسترسی مالی ندارید" text="فقط مالک و حسابدار می‌توانند این بخش را ببینند." />
            )
          )}

          {tab === "documents" && (
            <div className="space-y-4">
              <SettingsTitle title="مدارک" text="مدارک مجموعه را برای دسترسی سریع نگه‌داری کنید." />
              <label className="min-h-[190px] relative grid place-items-center p-6 text-center rounded-2xl bg-canvas/40 border-2 border-dashed border-line hover:border-brand-2/50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Icon name="share" className="w-8 h-8 text-brand-2" />
                  <strong className="text-xs font-bold text-ink">{documentName || "یک مدرک انتخاب کنید"}</strong>
                  <small className="text-[11px] text-muted">PDF یا تصویر تا ۲ مگابایت</small>
                </div>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  disabled={!ownerOnly}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setDocumentName(file.name);
                      notify("مدرک اضافه شد.");
                    }
                  }}
                />
              </label>
              {documentName && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-canvas/60 border border-line">
                  <span className="w-9 h-9 grid place-items-center rounded-lg bg-rose-600 text-white font-bold text-[10px]">PDF</span>
                  <strong className="flex-1 text-xs font-medium text-ink">{documentName}</strong>
                  <button type="button" onClick={() => setDocumentName("")} aria-label="حذف مدرک" className="w-8 h-8 grid place-items-center text-muted hover:text-rose-600 transition-colors">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "security" && <SecuritySettings ownerOnly={ownerOnly} notify={notify} />}
        </section>
      </div>

      {/* Branch Dialog */}
      {branchDialog && (
        <DialogShell titleId="branch-dialog-title" onClose={() => setBranchDialog(false)}>
          <form
            className="p-6 space-y-4 text-start"
            onSubmit={(event) => {
              event.preventDefault();
              addBranch(branchForm);
              setBranchDialog(false);
              notify("شعبه اضافه شد.");
            }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">شعبه تازه</p>
              <h2 id="branch-dialog-title" className="text-base font-black text-ink mt-0.5">اطلاعات شعبه</h2>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">نام شعبه</span>
              <input required value={branchForm.name} onChange={(event) => setBranchForm({ ...branchForm, name: event.target.value })} className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">منطقه</span>
              <input required value={branchForm.area} onChange={(event) => setBranchForm({ ...branchForm, area: event.target.value })} className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">نشانی</span>
              <textarea required rows={3} value={branchForm.address} onChange={(event) => setBranchForm({ ...branchForm, address: event.target.value })} className="p-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 resize-none" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">تلفن</span>
              <input value={branchForm.phone} onChange={(event) => setBranchForm({ ...branchForm, phone: event.target.value })} className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50" />
            </label>
            <button className="w-full h-11 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity shadow-xs" type="submit">
              افزودن شعبه
            </button>
          </form>
        </DialogShell>
      )}

      {/* Staff Dialog */}
      {staffDialog && (
        <DialogShell titleId="staff-dialog-title" onClose={() => setStaffDialog(false)}>
          <form
            className="p-6 space-y-4 text-start"
            onSubmit={(event) => {
              event.preventDefault();
              addStaff({ ...staffForm, permissions: rolePermissions[staffForm.role], active: true });
              setStaffDialog(false);
              notify("کارمند اضافه شد.");
            }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">عضو تازه</p>
              <h2 id="staff-dialog-title" className="text-base font-black text-ink mt-0.5">اطلاعات کارمند</h2>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">نام و نام خانوادگی</span>
              <input required value={staffForm.name} onChange={(event) => setStaffForm({ ...staffForm, name: event.target.value })} className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">موبایل</span>
              <input required value={staffForm.mobile} onChange={(event) => setStaffForm({ ...staffForm, mobile: event.target.value })} className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">شعبه</span>
              <select value={staffForm.branchId} onChange={(event) => setStaffForm({ ...staffForm, branchId: event.target.value })} className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50">
                {state.branches.map((branch) => (
                  <option value={branch.id} key={branch.id}>{branch.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">نقش</span>
              <select value={staffForm.role} onChange={(event) => setStaffForm({ ...staffForm, role: event.target.value as StaffRole })} className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50">
                {Object.entries(staffRoleLabel).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </label>
            <button className="w-full h-11 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity shadow-xs" type="submit">
              افزودن کارمند
            </button>
          </form>
        </DialogShell>
      )}
    </div>
  );
}

function SettingsTitle({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-line">
      <div>
        <h2 className="text-base font-black text-ink">{title}</h2>
        <p className="text-xs text-muted mt-0.5">{text}</p>
      </div>
      {action}
    </header>
  );
}

function SecuritySettings({ ownerOnly, notify }: { ownerOnly: boolean; notify: (message: string, kind?: "success" | "error") => void }) {
  const [passwords, setPasswords] = useState({ current: "", next: "", repeat: "" });
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (passwords.next.length < 8) return notify("رمز باید حداقل ۸ نویسه باشد.", "error");
    if (passwords.next !== passwords.repeat) return notify("تکرار رمز یکسان نیست.", "error");
    setPasswords({ current: "", next: "", repeat: "" });
    notify("رمز تغییر کرد.");
  };

  return (
    <div className="space-y-4">
      <SettingsTitle title="امنیت" text="رمز ورود و نشست‌های فعال را مدیریت کنید." />
      <form className="space-y-3.5 max-w-md" onSubmit={save}>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">رمز فعلی</span>
          <input
            type="password"
            required
            value={passwords.current}
            onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
            disabled={!ownerOnly}
            className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">رمز تازه</span>
          <input
            type="password"
            minLength={8}
            required
            value={passwords.next}
            onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
            disabled={!ownerOnly}
            className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">تکرار رمز</span>
          <input
            type="password"
            minLength={8}
            required
            value={passwords.repeat}
            onChange={(event) => setPasswords({ ...passwords, repeat: event.target.value })}
            disabled={!ownerOnly}
            className="h-10 px-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 disabled:opacity-60"
          />
        </label>
        <button
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity disabled:opacity-50"
          type="submit"
          disabled={!ownerOnly}
        >
          تغییر رمز
        </button>
      </form>

      <div className="flex items-center justify-between gap-4 mt-6 p-4 rounded-xl bg-canvas/60 border border-line">
        <div>
          <strong className="block text-xs font-bold text-ink">خروج از پنل</strong>
          <small className="block text-[11px] text-muted mt-0.5">به صفحه انتخاب نوع ورود برمی‌گردید.</small>
        </div>
        <Link href="/" className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors">
          خروج
        </Link>
      </div>
    </div>
  );
}
