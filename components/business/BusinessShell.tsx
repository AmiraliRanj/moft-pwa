"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { DialogShell } from "@/components/moft/DialogShell";
import { Icon, type IconName } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { staffRoleLabel } from "@/lib/demo-format";
import type { Permission } from "@/types/demo";
import { BusinessUiProvider } from "@/components/business/BusinessUiContext";

const navItems: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/business", label: "امروز", icon: "grid" },
  { href: "/business/orders", label: "سفارش‌ها", icon: "bag" },
  { href: "/business/offers", label: "پیشنهادها", icon: "store" },
  { href: "/business/templates", label: "قالب‌ها", icon: "list" },
  { href: "/business/pickup", label: "تحویل سفارش", icon: "check" },
  { href: "/business/analytics", label: "گزارش‌ها", icon: "sliders" },
  { href: "/business/quality", label: "نظرات و کیفیت", icon: "star" },
  { href: "/business/finance", label: "امور مالی", icon: "cart" },
  { href: "/business/settings", label: "مدیریت مجموعه", icon: "user" },
];

export function BusinessShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, updateBranch, markNotificationRead, markAllNotificationsRead, setActiveStaff, resetDemo } = useDemo();
  const [branchId, setBranchId] = useState(state.branches[0]?.id ?? "");
  const [navOpen, setNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const activeBranch = state.branches.find((branch) => branch.id === branchId) ?? state.branches[0];
  const activeStaff = state.staff.find((member) => member.id === state.activeStaffId) ?? state.staff[0];
  const unreadCount = state.notifications.filter((item) => !item.read).length;
  const notifications = unreadOnly ? state.notifications.filter((item) => !item.read) : state.notifications;

  const notify = useCallback((message: string, kind: "success" | "error" = "success") => {
    setToast({ text: message, kind });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const can = useCallback((permission: Permission) => activeStaff?.permissions.includes(permission) ?? false, [activeStaff]);
  const contextValue = useMemo(() => ({ branchId: activeBranch?.id ?? "", setBranchId, can, notify }), [activeBranch?.id, can, notify]);

  const toggleOrders = () => {
    if (!activeBranch) return;
    const result = updateBranch(activeBranch.id, { acceptsOrders: !activeBranch.acceptsOrders });
    notify(result.message, result.ok ? "success" : "error");
  };

  return (
    <BusinessUiProvider value={contextValue}>
      <main className="business-app">
        <a className="skip-link" href="#business-content">رفتن به محتوای اصلی پنل</a>
        {navOpen && <button className="business-nav-backdrop" type="button" onClick={() => setNavOpen(false)} aria-label="بستن منو" />}
        <aside className={`business-sidebar ${navOpen ? "open" : ""}`} aria-label="ناوبری پنل کسب‌وکار">
          <div className="business-sidebar-head">
            <BrandMark subtitle="پنل کسب‌وکار" />
            <button className="mobile-close" type="button" onClick={() => setNavOpen(false)} aria-label="بستن منو"><Icon name="close" /></button>
          </div>
          <nav className="business-nav">
            {navItems.map((item) => {
              const active = item.href === "/business" ? pathname === item.href : pathname.startsWith(item.href);
              return <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setNavOpen(false)}><Icon name={item.icon} /><span>{item.label}</span></Link>;
            })}
          </nav>
          <div className="business-sidebar-foot">
            <label className="staff-preview"><span>نقش فعال دمو</span><select value={activeStaff?.id} onChange={(event) => setActiveStaff(event.target.value)}>{state.staff.map((member) => <option key={member.id} value={member.id}>{member.name} · {staffRoleLabel[member.role]}</option>)}</select></label>
            <Link href="/customer"><Icon name="user" /> رفتن به نسخه مشتری</Link>
            <Link href="/"><Icon name="home" /> انتخاب نوع ورود</Link>
            <button type="button" onClick={() => setResetOpen(true)}><Icon name="trash" /> بازنشانی داده‌های نمایشی</button>
          </div>
        </aside>

        <section className="business-stage">
          <header className="business-topbar glass-medium">
            <button className="mobile-menu-button" type="button" onClick={() => setNavOpen(true)} aria-label="باز کردن منوی پنل"><Icon name="list" /></button>
            <label className="branch-select"><span className="sr-only">انتخاب شعبه</span><Icon name="pin" /><select value={activeBranch?.id} onChange={(event) => setBranchId(event.target.value)}>{state.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
            <button className={`acceptance-toggle ${activeBranch?.acceptsOrders ? "online" : ""}`} type="button" onClick={toggleOrders} aria-pressed={activeBranch?.acceptsOrders}><i /><span>{activeBranch?.acceptsOrders ? "سفارش‌گیری روشن" : "سفارش‌گیری خاموش"}</span></button>
            <span className="business-top-spacer" />
            <ThemeToggle compact />
            <button className="notification-button" type="button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label={`اعلان‌ها؛ ${unreadCount} خوانده‌نشده`} aria-expanded={notificationsOpen}><Icon name="bell" />{unreadCount > 0 && <b>{unreadCount.toLocaleString("fa-IR")}</b>}</button>
            <button className="business-profile-button" type="button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span>ا</span><span><strong>{state.business.ownerName}</strong><small>{activeStaff ? staffRoleLabel[activeStaff.role] : "دمو"}</small></span><Icon name="chevron" /></button>
          </header>

          {notificationsOpen && (
            <aside className="notification-panel glass-strong" aria-label="مرکز اعلان‌ها">
              <header><div><p className="eyebrow">مرکز اعلان‌ها</p><h2>تازه‌های کسب‌وکار</h2></div><button type="button" onClick={() => setNotificationsOpen(false)} aria-label="بستن اعلان‌ها"><Icon name="close" /></button></header>
              <div className="notification-actions"><button type="button" className={unreadOnly ? "active" : ""} onClick={() => setUnreadOnly(!unreadOnly)} aria-pressed={unreadOnly}>فقط خوانده‌نشده</button><button type="button" onClick={markAllNotificationsRead}>خواندن همه</button></div>
              <div className="notification-list">{notifications.length ? notifications.map((item) => <Link key={item.id} href={item.href} className={item.read ? "read" : ""} onClick={() => { markNotificationRead(item.id); setNotificationsOpen(false); }}><i /><span><strong>{item.title}</strong><small>{item.text}</small></span><Icon name="chevron" /></Link>) : <p className="panel-empty">اعلان خوانده‌نشده‌ای باقی نمانده است.</p>}</div>
            </aside>
          )}

          {profileOpen && <div className="business-profile-menu glass-strong"><strong>{state.business.name}</strong><small>{activeBranch?.name} · نسخه نمایشی</small><Link href="/business/settings" onClick={() => setProfileOpen(false)}>تنظیمات مجموعه</Link><Link href="/customer">نسخه مشتری</Link><Link href="/">انتخاب نوع ورود</Link><button type="button" onClick={() => { setProfileOpen(false); setResetOpen(true); }}>بازنشانی دمو</button></div>}

          <div id="business-content" className="business-content" tabIndex={-1}>{children}</div>
        </section>

        {toast && <div className={`business-toast ${toast.kind}`} role="status"><Icon name={toast.kind === "success" ? "check" : "info"} />{toast.text}</div>}
        {resetOpen && <DialogShell label="تأیید بازنشانی اطلاعات نمایشی" onClose={() => setResetOpen(false)} size="center"><div className="cancel-dialog"><span className="danger-icon"><Icon name="trash" /></span><h2>داده‌های دمو بازنشانی شود؟</h2><p>پیشنهادها، سفارش‌ها، نظرها، اعلان‌ها و امور مالی به حالت اولیه برمی‌گردند. پوسته انتخاب‌شده حفظ می‌شود.</p><div><button className="secondary-button" type="button" onClick={() => setResetOpen(false)}>انصراف</button><button className="danger-button" type="button" onClick={() => { resetDemo(); setBranchId("branch-jordan"); setResetOpen(false); notify("اطلاعات نمایشی به حالت اولیه برگشت."); }}>بازنشانی</button></div></div></DialogShell>}
      </main>
    </BusinessUiProvider>
  );
}
