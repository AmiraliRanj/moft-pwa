import type { OfferCategory, PickupPeriod } from "@/types/moft";

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  joinedAt: string;
};

export type Business = {
  id: string;
  name: string;
  ownerName: string;
  category: string;
  rating: number;
  logo: string;
  cover: string;
  demoBankIban: string;
};

export type Branch = {
  id: string;
  businessId: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  acceptsOrders: boolean;
  openingHours: string;
  pickupWindows: string[];
};

export type StaffRole = "owner" | "branch_manager" | "orders" | "pickup" | "accountant";
export type Permission = "offers:write" | "orders:write" | "pickup:write" | "finance:read" | "settings:owner";

export type StaffMember = {
  id: string;
  name: string;
  mobile: string;
  branchId: string;
  role: StaffRole;
  permissions: Permission[];
  active: boolean;
};

export type OfferType = "surprise_box" | "specific_product";
export type OfferStatus = "draft" | "scheduled" | "active" | "paused" | "sold_out" | "expired" | "archived";

export type MarketplaceOffer = {
  id: string;
  businessId: string;
  branchId: string;
  merchantName: string;
  category: OfferCategory;
  categoryLabel: string;
  offerType: OfferType;
  title: string;
  description: string;
  image: string;
  originalValue: number;
  salePrice: number;
  totalQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  pickupDate: string;
  pickupStart: string;
  pickupEnd: string;
  pickupPeriod: PickupPeriod;
  address: string;
  neighborhood: string;
  coordinates: { lat: number; lng: number };
  distanceKm: number;
  rating: number;
  reviewCount: number;
  allergens: string[];
  dietaryLabels: string[];
  expiryInfo: string;
  status: OfferStatus;
  publishAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  endingSoon?: boolean;
  popular?: boolean;
};

export type OfferTemplate = Omit<MarketplaceOffer, "id" | "soldQuantity" | "reservedQuantity" | "status" | "publishAt" | "expiresAt" | "createdAt" | "updatedAt"> & {
  id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "reviewed"
  | "preparing"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "no_show"
  | "under_review"
  | "refunded";

export type OrderItem = {
  offerId: string;
  title: string;
  unitPrice: number;
  quantity: number;
};

export type PickupCode = {
  value: string;
  usedAt: string | null;
  status: "active" | "used" | "invalidated";
};

export type OrderHistoryEntry = {
  status: OrderStatus;
  at: string;
  note: string;
};

export type Order = {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  businessId: string;
  branchId: string;
  items: OrderItem[];
  total: number;
  paymentStatus: "simulated_paid" | "simulated_refunded" | "not_paid";
  pickupDate: string;
  pickupStart: string;
  pickupEnd: string;
  pickupCode: PickupCode;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  history: OrderHistoryEntry[];
};

export type Review = {
  id: string;
  orderId: string;
  offerId: string;
  businessId: string;
  branchId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  response: string;
  respondedAt: string | null;
  createdAt: string;
};

export type ComplaintCategory = "quality" | "quantity" | "description" | "unsafe" | "pickup" | "behavior" | "payment";
export type ComplaintStatus = "new" | "reviewing" | "responded" | "escalated" | "closed";

export type Complaint = {
  id: string;
  orderId: string;
  reviewId: string | null;
  businessId: string;
  branchId: string;
  customerName: string;
  category: ComplaintCategory;
  description: string;
  response: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  history: Array<{ status: ComplaintStatus; at: string }>;
};

export type NotificationKind = "new_order" | "low_stock" | "pickup" | "review" | "complaint" | "settlement" | "offer_expired";

export type DemoNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  text: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type FinanceTransaction = {
  id: string;
  orderId: string;
  gross: number;
  commission: number;
  refund: number;
  net: number;
  type: "sale" | "refund" | "adjustment";
  status: "pending" | "settled" | "refunded";
  createdAt: string;
};

export type Settlement = {
  id: string;
  amount: number;
  period: string;
  status: "scheduled" | "paid";
  dueAt: string;
};

export type AuditLogEntry = {
  id: string;
  actor: "customer" | "business" | "system";
  action: string;
  entityType: "offer" | "order" | "review" | "complaint" | "settings";
  entityId: string;
  at: string;
  detail: string;
};

export type AnalyticsDay = {
  date: string;
  revenue: number;
  orders: number;
  savedPackages: number;
  noShows: number;
  refunds: number;
  rating: number;
};

export type DemoState = {
  version: number;
  customer: Customer;
  business: Business;
  branches: Branch[];
  staff: StaffMember[];
  activeStaffId: string;
  offers: MarketplaceOffer[];
  templates: OfferTemplate[];
  orders: Order[];
  reviews: Review[];
  complaints: Complaint[];
  notifications: DemoNotification[];
  finance: FinanceTransaction[];
  settlements: Settlement[];
  analytics: AnalyticsDay[];
  auditLog: AuditLogEntry[];
};

export type OfferDraft = Pick<MarketplaceOffer,
  "offerType" | "title" | "description" | "image" | "originalValue" | "salePrice" |
  "totalQuantity" | "branchId" | "pickupDate" | "pickupStart" | "pickupEnd" |
  "allergens" | "dietaryLabels" | "expiryInfo" | "publishAt" | "expiresAt"
>;
