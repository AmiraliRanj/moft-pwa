"use client";

import { usePathname } from "next/navigation";
import { BusinessShell } from "@/components/business/BusinessShell";
import { TodayPage } from "@/components/business/pages/TodayPage";
import { OrdersPage } from "@/components/business/pages/OrdersPage";
import { OffersPage } from "@/components/business/pages/OffersPage";
import { TemplatesPage } from "@/components/business/pages/TemplatesPage";
import { PickupPage } from "@/components/business/pages/PickupPage";
import { AnalyticsPage } from "@/components/business/pages/AnalyticsPage";
import { QualityPage } from "@/components/business/pages/QualityPage";
import { FinancePage } from "@/components/business/pages/FinancePage";
import { SettingsPage } from "@/components/business/pages/SettingsPage";
import { EmptyBusinessState } from "@/components/business/BusinessPrimitives";

export default function BusinessApp() {
  const pathname = usePathname();
  const page = pathname === "/business" ? <TodayPage />
    : pathname.startsWith("/business/orders") ? <OrdersPage />
    : pathname.startsWith("/business/offers") ? <OffersPage />
    : pathname.startsWith("/business/templates") ? <TemplatesPage />
    : pathname.startsWith("/business/pickup") ? <PickupPage />
    : pathname.startsWith("/business/analytics") ? <AnalyticsPage />
    : pathname.startsWith("/business/quality") ? <QualityPage />
    : pathname.startsWith("/business/finance") ? <FinancePage />
    : pathname.startsWith("/business/settings") ? <SettingsPage />
    : <EmptyBusinessState title="این بخش پیدا نشد" text="از منوی پنل یکی از بخش‌های موجود را انتخاب کنید." />;
  return <BusinessShell>{page}</BusinessShell>;
}
