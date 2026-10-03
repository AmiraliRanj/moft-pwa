"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/moft/Icon";
import { SupportCenter } from "@/components/support/SupportCenter";
import { useDemo } from "@/demo/DemoProvider";
import { formatMoney } from "@/lib/demo-format";

export function CustomerSupportPage({ initialOrderId = "" }: { initialOrderId?: string }) {
  const { state } = useDemo();
  return (
    <main className="min-h-dvh px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 bg-canvas text-ink" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top Header Bar for Standalone Support Route */}
        <header className="flex items-center justify-between pb-3 border-b border-line/60">
          <Link
            href="/customer"
            className="flex items-center gap-2 group cursor-pointer"
            aria-label="بازگشت به دیبز"
          >
            <span className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-line/50 shrink-0 bg-brand-soft grid place-items-center">
              <Image
                src="/icons/dibz-ios-dark.png"
                alt="لوگوی دیبز"
                width={32}
                height={32}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </span>
            <span className="font-black text-sm text-ink font-morabba">دیبز!</span>
          </Link>
          <Link
            href="/customer/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-surface border border-line text-ink hover:text-brand-2 hover:bg-surface-raised transition-colors shadow-2xs"
          >
            <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-0" />
            <span>بازگشت به برنامه</span>
          </Link>
        </header>

        <SupportCenter
          scope="customer"
          initialRelatedId={initialOrderId}
          relatedOptions={state.orders
            .filter((order) => order.customerId === state.customer.id)
            .map((order) => ({
              value: order.id,
              label: order.code,
              description: `${order.items[0].title} · ${formatMoney(order.total)}`,
            }))}
        />
      </div>
    </main>
  );
}

export function BusinessSupportPage() {
  const { state } = useDemo();
  const options = [
    ...state.orders.slice(0, 20).map((order) => ({
      value: order.id,
      label: order.code,
      description: `${order.customerName} · ${formatMoney(order.total)}`,
    })),
    ...state.settlements.map((settlement) => ({
      value: settlement.id,
      label: `تسویه ${settlement.period}`,
      description: formatMoney(settlement.amount),
    })),
  ];
  return (
    <div className="space-y-6">
      <SupportCenter scope="business" relatedOptions={options} />
    </div>
  );
}
