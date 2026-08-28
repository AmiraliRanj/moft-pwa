import type { Metadata } from "next";
import MoftPreview from "@/components/MoftPreview";
import { CustomerSupportPage } from "@/components/support/SupportPages";

export const metadata: Metadata = {
  title: "نسخه مشتری",
  description: "پیشنهادهای غذای سالم امروز را پیدا و برای دریافت حضوری رزرو کنید.",
};

export default async function CustomerPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const section = path[0];
  if (section === "support") return <CustomerSupportPage initialOrderId={path[1]} />;
  const initialTab = section === "orders" ? "reservations" : section === "profile" ? "profile" : ["offers", "favorites", "cart"].includes(section ?? "") ? "discover" : "home";

  return <MoftPreview initialTab={initialTab} initialFavoritesOnly={section === "favorites"} initialOfferId={section === "offers" ? path[1] : undefined} />;
}
