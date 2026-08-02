export type CategoryId =
  | "all"
  | "cafe"
  | "restaurant"
  | "fast-food"
  | "bakery"
  | "confectionery"
  | "fruit"
  | "grocery";

export type OfferCategory = Exclude<CategoryId, "all">;
export type PickupPeriod = "evening" | "late" | "tomorrow";

export type Offer = {
  id: string;
  merchantName: string;
  category: OfferCategory;
  categoryLabel: string;
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  coordinates: { lat: number; lng: number };
  distanceKm: number;
  rating: number;
  reviewCount: number;
  pickup: string;
  pickupPeriod: PickupPeriod;
  quantityLeft: number;
  originalPrice: number;
  price: number;
  allergens: string[];
  image: string;
  endingSoon?: boolean;
  popular?: boolean;
};

export type ReservationStatus = "active" | "collected" | "cancelled" | "expired";

export type Reservation = {
  id: string;
  offerId: string;
  merchantName: string;
  title: string;
  pickup: string;
  address: string;
  code: string;
  quantity: number;
  total: number;
  status: ReservationStatus;
  orderStatus?: import("@/types/demo").OrderStatus;
  hasReview?: boolean;
  reviewResponse?: string;
  createdAt: string;
};

export type ThemePreference = "light" | "dark" | "system";
export type AppTab = "home" | "discover" | "reservations" | "profile";
