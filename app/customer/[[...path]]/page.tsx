import type { Metadata } from "next";
import MoftPreview from "@/components/MoftPreview";

export const metadata: Metadata = {
  title: "نسخه مشتری",
  description: "پیشنهادهای غذای سالم فروش‌نرفته را پیدا و به‌صورت نمایشی رزرو کنید.",
};

export default async function CustomerPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const section = path[0];
  const initialTab = section === "orders" ? "reservations" : section === "profile" ? "profile" : ["offers", "favorites", "cart"].includes(section ?? "") ? "discover" : "home";

  return <MoftPreview initialTab={initialTab} initialFavoritesOnly={section === "favorites"} initialOfferId={section === "offers" ? path[1] : undefined} />;
}
