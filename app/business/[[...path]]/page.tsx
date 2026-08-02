import type { Metadata } from "next";
import BusinessApp from "@/components/business/BusinessApp";

export const metadata: Metadata = {
  title: "پنل کسب‌وکار",
  description: "پنل نمایشی مدیریت پیشنهاد، سفارش، تحویل، کیفیت و امور مالی مفت.",
};

export default function BusinessPage() {
  return <BusinessApp />;
}
