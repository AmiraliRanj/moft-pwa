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
  category?: OfferCategory;
  image?: string;
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
  description?: string;
  allergens?: string[];
  originalPrice?: number;
};

export type GroupedReservationItem = {
  id: string;
  offerId: string;
  title: string;
  image?: string;
  quantity: number;
  total: number;
  originalPrice?: number;
  description?: string;
  allergens?: string[];
  category?: OfferCategory;
  reservation: Reservation;
};

export type GroupedReservation = {
  groupKey: string;
  merchantName: string;
  category?: OfferCategory;
  address: string;
  pickup: string;
  code: string;
  status: ReservationStatus;
  orderStatus?: import("@/types/demo").OrderStatus;
  items: GroupedReservationItem[];
  total: number;
  originalTotal: number;
  primaryReservation: Reservation;
  allReservations: Reservation[];
  hasReview?: boolean;
  reviewResponse?: string;
  createdAt: string;
};

export type ThemePreference = "light" | "dark" | "auto";
export type AppTab = "home" | "discover" | "orders" | "reservations" | "cart" | "profile";

