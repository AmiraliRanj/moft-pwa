"use client";

import { SupportCenter } from "@/components/support/SupportCenter";
import { useDemo } from "@/demo/DemoProvider";
import { formatMoney } from "@/lib/demo-format";

export function CustomerSupportPage({ initialOrderId = "" }: { initialOrderId?: string }) {
  const { state } = useDemo();
  return <main className="customer-support-page"><SupportCenter scope="customer" initialRelatedId={initialOrderId} relatedOptions={state.orders.filter((order) => order.customerId === state.customer.id).map((order) => ({ value: order.id, label: order.code, description: `${order.items[0].title} · ${formatMoney(order.total)}` }))} /></main>;
}

export function BusinessSupportPage() {
  const { state } = useDemo();
  const options = [
    ...state.orders.slice(0, 20).map((order) => ({ value: order.id, label: order.code, description: `${order.customerName} · ${formatMoney(order.total)}` })),
    ...state.settlements.map((settlement) => ({ value: settlement.id, label: `تسویه ${settlement.period}`, description: formatMoney(settlement.amount) })),
  ];
  return <div className="business-page"><SupportCenter scope="business" relatedOptions={options} /></div>;
}
