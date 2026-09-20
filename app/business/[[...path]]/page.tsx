import type { Metadata } from "next";
import { redirect } from "next/navigation";
// [BUSINESS PANEL TEMPORARILY HIDDEN - WILL BE A SEPARATE APP - DO NOT DELETE CODEBASE]
// import BusinessApp from "@/components/business/BusinessApp";

export const metadata: Metadata = {
  title: "نسخه مشتری",
  description: "دیبز - غذای خوب، نزدیک تو",
};

export default function BusinessPage() {
  // Business panel is temporarily hidden as it will be in a separated app/panel.
  // Codebase is preserved in components/business/ - DO NOT DELETE.
  redirect("/customer");
  // return <BusinessApp />;
}

