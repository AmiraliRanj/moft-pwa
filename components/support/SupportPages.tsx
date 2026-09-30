"use client";

import { SupportCenter } from "@/components/support/SupportCenter";
import { useDemo } from "@/demo/DemoProvider";
import { formatMoney } from "@/lib/demo-format";

export function CustomerSupportPage({ initialOrderId = "" }: { initialOrderId?: string }) {
  const { state } = useDemo();
  return (
    <main className="min-h-dvh px-4 py-6 md:py-8 bg-canvas text-ink">
      <div className="max-w-5xl mx-auto">
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
