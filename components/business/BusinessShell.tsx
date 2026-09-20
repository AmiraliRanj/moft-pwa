"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Icon, type IconName } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { staffRoleLabel } from "@/lib/demo-format";
import type { Permission } from "@/types/demo";
import { BusinessUiProvider } from "@/components/business/BusinessUiContext";
import { BranchSelector, SelectField } from "@/components/shared/FormControls";

const navItems: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/business", label: "امروز", icon: "grid" },
  { href: "/business/orders", label: "سفارش‌ها", icon: "bag" },
  { href: "/business/offers", label: "پیشنهادها", icon: "store" },
  { href: "/business/templates", label: "قالب‌ها", icon: "list" },
  { href: "/business/pickup", label: "تحویل سفارش", icon: "check" },
  { href: "/business/analytics", label: "گزارش‌ها", icon: "sliders" },
  { href: "/business/quality", label: "نظرات و کیفیت", icon: "star" },
  { href: "/business/finance", label: "امور مالی", icon: "cart" },
  { href: "/business/support", label: "راهنما و پشتیبانی", icon: "info" },
  { href: "/business/settings", label: "مدیریت مجموعه", icon: "user" },
];

const mobileNavItems: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/business", label: "امروز", icon: "grid" },
  { href: "/business/orders", label: "سفارش‌ها", icon: "bag" },
  { href: "/business/pickup", label: "تحویل", icon: "check" },
  { href: "/business/offers", label: "پیشنهادها", icon: "store" },
];

export function BusinessShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, updateBranch, markNotificationRead, markAllNotificationsRead, setActiveStaff } = useDemo();
  const [branchId, setBranchId] = useState(state.branches[0]?.id ?? "");
  const [navOpen, setNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const activeBranch = state.branches.find((branch) => branch.id === branchId) ?? state.branches[0];
  const activeStaff = state.staff.find((member) => member.id === state.activeStaffId) ?? state.staff[0];
  const unreadCount = state.notifications.filter((item) => !item.read).length;
  const notifications = unreadOnly ? state.notifications.filter((item) => !item.read) : state.notifications;

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const notify = useCallback((message: string, kind: "success" | "error" = "success") => {
    setToast({ text: message, kind });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const can = useCallback(
    (permission: Permission) => activeStaff?.permissions.includes(permission) ?? false,
    [activeStaff]
  );
  const contextValue = useMemo(
    () => ({ branchId: activeBranch?.id ?? "", setBranchId, can, notify }),
    [activeBranch?.id, can, notify]
  );

  const toggleOrders = () => {
    if (!activeBranch) return;
    const result = updateBranch(activeBranch.id, { acceptsOrders: !activeBranch.acceptsOrders });
    notify(result.message, result.ok ? "success" : "error");
  };

  return (
    <BusinessUiProvider value={contextValue}>
      <main className="relative min-h-svh bg-canvas text-ink flex flex-col md:flex-row pb-20 md:pb-0">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:end-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-xl focus:shadow-lg"
          href="#business-content"
        >
          رفتن به محتوای اصلی پنل
        </a>

        {navOpen && (
          <button
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="بستن منو"
          />
        )}

        <aside
          className={`fixed md:sticky top-0 inset-y-0 start-0 z-50 md:z-30 h-screen w-72 shrink-0 flex flex-col justify-between border-e border-line bg-surface p-4 sm:p-5 transition-transform duration-200 ${
            navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 rtl:translate-x-full rtl:md:translate-x-0"
          }`}
          aria-label="ناوبری پنل کسب‌وکار"
        >
          <div className="flex items-center justify-between pb-4 border-b border-line mb-3">
            <BrandMark subtitle="پنل کسب‌وکار" />
            <button
              className="md:hidden min-h-[44px] min-w-[44px] grid place-items-center rounded-xl text-muted hover:text-ink hover:bg-canvas-soft cursor-pointer [&>svg]:w-5 [&>svg]:h-5"
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="بستن منو"
            >
              <Icon name="close" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-2">
            {navItems.map((item) => {
              const active = item.href === "/business" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline ${
                    active ? "bg-brand-soft text-brand font-bold" : "text-ink hover:bg-canvas-soft"
                  }`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setNavOpen(false)}
                >
                  <span className="shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5">
                    <Icon name={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-line flex flex-col gap-2.5 text-start">
            <div className="flex items-center justify-between">
              <ThemeToggle />
            </div>
            <SelectField
              label="نقش فعال"
              value={activeStaff?.id ?? ""}
              onChange={setActiveStaff}
              options={state.staff.map((member) => ({
                value: member.id,
                label: member.name,
                description: staffRoleLabel[member.role],
              }))}
            />
            <div className="flex flex-col gap-1 text-xs text-muted pt-1">
              <small className="text-muted">نسخهٔ پیش‌نمایش دیبز</small>
            </div>
          </div>
        </aside>

        <section className="flex-1 min-w-0 flex flex-col">
          <header className={`sticky top-0 z-30 transition-all border-b border-line bg-surface/85 backdrop-blur-md px-4 sm:px-8 py-2.5 ${scrolled ? "shadow-xs" : ""}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 flex-1">
                <button
                  className="md:hidden min-h-[44px] min-w-[44px] grid place-items-center rounded-xl text-ink hover:bg-canvas-soft cursor-pointer [&>svg]:w-5 [&>svg]:h-5"
                  type="button"
                  onClick={() => setNavOpen(true)}
                  aria-label="باز کردن منوی پنل"
                >
                  <Icon name="list" />
                </button>
                <BranchSelector
                  value={activeBranch?.id ?? ""}
                  onChange={setBranchId}
                  options={state.branches.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                    description: branch.area,
                  }))}
                />
                <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
                  <ThemeToggle compact />
                  <button
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface text-ink hover:bg-surface-raised cursor-pointer transition-colors [&>svg]:w-5 [&>svg]:h-5"
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    aria-label={`اعلان‌ها؛ ${unreadCount} خوانده‌نشده`}
                    aria-expanded={notificationsOpen}
                  >
                    <Icon name="bell" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.65rem] font-bold text-white">
                        {unreadCount.toLocaleString("fa-IR")}
                      </span>
                    )}
                  </button>
                  <button
                    className="flex min-h-[44px] items-center gap-2 rounded-2xl border border-line bg-surface px-2.5 py-1.5 text-start hover:bg-surface-raised cursor-pointer transition-colors"
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    aria-label={`نمایه ${state.business.ownerName}`}
                    aria-expanded={profileOpen}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-brand-soft text-xs font-bold text-brand">
                      ا
                    </span>
                    <span className="hidden sm:flex flex-col">
                      <strong className="text-xs font-bold text-ink">{state.business.ownerName}</strong>
                      <small className="text-[0.65rem] text-muted">
                        {activeStaff ? staffRoleLabel[activeStaff.role] : "کاربر"}
                      </small>
                    </span>
                    <span className="text-muted [&>svg]:w-3.5 [&>svg]:h-3.5"><Icon name="chevron" /></span>
                  </button>
                </div>
              </div>

              <button
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  activeBranch?.acceptsOrders
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-300"
                }`}
                type="button"
                onClick={toggleOrders}
                aria-pressed={activeBranch?.acceptsOrders}
              >
                <span className={`h-2 w-2 rounded-full ${activeBranch?.acceptsOrders ? "bg-white animate-pulse" : "bg-zinc-400"}`} />
                <span>{activeBranch?.acceptsOrders ? "سفارش‌گیری فعال" : "سفارش‌گیری غیرفعال"}</span>
              </button>
            </div>
          </header>

          {notificationsOpen && (
            <aside className="absolute top-16 end-4 sm:end-8 z-50 w-full max-w-sm rounded-3xl border border-line bg-surface-raised/95 backdrop-blur-xl p-4 shadow-2xl" aria-label="مرکز اعلان‌ها">
              <header className="flex items-center justify-between pb-3 border-b border-line mb-3">
                <div className="text-start">
                  <p className="text-xs font-bold text-brand-2">مرکز اعلان‌ها</p>
                  <h2 className="text-sm font-bold text-ink">تازه‌های کسب‌وکار</h2>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-lg text-muted hover:text-ink cursor-pointer [&>svg]:w-4 [&>svg]:h-4"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="بستن اعلان‌ها"
                >
                  <Icon name="close" />
                </button>
              </header>
              <div className="flex items-center justify-between mb-3 text-xs">
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    unreadOnly ? "bg-brand text-white" : "bg-surface text-muted hover:text-ink"
                  }`}
                  onClick={() => setUnreadOnly(!unreadOnly)}
                  aria-pressed={unreadOnly}
                >
                  فقط خوانده‌نشده
                </button>
                <button
                  type="button"
                  className="text-muted hover:text-brand-2 cursor-pointer font-medium"
                  onClick={markAllNotificationsRead}
                >
                  خواندن همه
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                {notifications.length ? (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border border-line transition-colors text-start no-underline ${
                        item.read ? "bg-surface opacity-75" : "bg-surface-raised border-brand-2/30"
                      }`}
                      onClick={() => {
                        markNotificationRead(item.id);
                        setNotificationsOpen(false);
                      }}
                    >
                      <span className="mt-1 h-2 w-2 rounded-full shrink-0 bg-brand-2" />
                      <span className="flex-1 min-w-0">
                        <strong className="block text-xs font-bold text-ink truncate">{item.title}</strong>
                        <small className="block text-[0.7rem] text-muted line-clamp-2">{item.text}</small>
                      </span>
                      <span className="shrink-0 text-muted mt-1 [&>svg]:w-3 [&>svg]:h-3">
                        <Icon name="chevron" />
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-muted">اعلان خوانده‌نشده‌ای باقی نمانده است.</p>
                )}
              </div>
            </aside>
          )}

          {profileOpen && (
            <div className="absolute top-16 end-4 sm:end-24 z-50 w-56 rounded-2xl border border-line bg-surface-raised p-3 shadow-xl flex flex-col gap-1 text-start">
              <strong className="block text-sm font-bold text-ink">{state.business.name}</strong>
              <small className="block text-xs text-muted mb-2">{activeBranch?.name}</small>
              <div className="border-t border-line my-1" />
              <Link
                href="/business/settings"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-canvas-soft no-underline"
                onClick={() => setProfileOpen(false)}
              >
                تنظیمات مجموعه
              </Link>
              <Link
                href="/business/support"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-canvas-soft no-underline"
                onClick={() => setProfileOpen(false)}
              >
                راهنما و پشتیبانی
              </Link>
              <Link
                href="/customer"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-canvas-soft no-underline"
              >
                نسخه مشتری
              </Link>
              <Link
                href="/"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-canvas-soft no-underline"
              >
                انتخاب نوع ورود
              </Link>
            </div>
          )}

          <div id="business-content" className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto" tabIndex={-1}>
            {children}
          </div>
        </section>

        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-line bg-surface/90 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
          <nav className="flex items-center justify-around w-full" aria-label="ناوبری سریع پنل">
            {mobileNavItems.map((item) => {
              const active = item.href === "/business" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 text-xs font-medium no-underline transition-colors ${
                    active ? "text-brand font-bold" : "text-muted hover:text-ink"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="[&>svg]:w-5 [&>svg]:h-5"><Icon name={item.icon} /></span>
                  <span className="text-[0.65rem]">{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 text-xs font-medium text-muted hover:text-ink cursor-pointer"
              onClick={() => setNavOpen(true)}
              aria-label="نمایش بخش‌های بیشتر"
            >
              <span className="[&>svg]:w-5 [&>svg]:h-5"><Icon name="list" /></span>
              <span className="text-[0.65rem]">بیشتر</span>
            </button>
          </nav>
        </div>

        {toast && (
          <div
            className={`fixed bottom-20 md:bottom-6 start-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xl border ${
              toast.kind === "success"
                ? "bg-emerald-800 text-white border-emerald-700"
                : "bg-rose-800 text-white border-rose-700"
            }`}
            role="status"
          >
            <span className="[&>svg]:w-4 [&>svg]:h-4">
              <Icon name={toast.kind === "success" ? "check" : "info"} />
            </span>
            {toast.text}
          </div>
        )}
      </main>
    </BusinessUiProvider>
  );
}
