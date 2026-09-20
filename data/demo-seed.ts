import { initialOffers } from "@/data/offers";
import type {
  AnalyticsDay,
  Complaint,
  DemoNotification,
  DemoState,
  FinanceTransaction,
  MarketplaceOffer,
  OfferTemplate,
  Order,
  OrderStatus,
  Review,
} from "@/types/demo";

export const DEMO_STATE_VERSION = 3;
export const DEMO_STORAGE_KEY = "moft-unified-demo-v1";
export const DEMO_BUSINESS_ID = "business-vienna";
export const DEMO_CUSTOMER_ID = "customer-sara";

const BUSINESS_OFFER_IDS = ["vienna-evening", "vienna-bread", "vienna-brunch", "vienna-cake"];
const seedDate = "2026-08-02";

const iso = (dayOffset: number, hour = 12, minute = 0) => {
  const date = new Date(`${seedDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString();
};

const businessOffers: MarketplaceOffer[] = [
  {
    id: BUSINESS_OFFER_IDS[0], businessId: DEMO_BUSINESS_ID, branchId: "branch-jordan", merchantName: "کافه ویونا",
    category: "cafe", categoryLabel: "کافه و نانوایی", offerType: "surprise_box", title: "بسته شگفت‌انگیز پایان روز",
    description: "ترکیبی از کروسان، کیک روز یا ساندویچ‌های سالم؛ محتویات دقیق هنگام دریافت مشخص می‌شود.",
    image: "/images/offers/offer-01.webp", originalValue: 390000, salePrice: 125000, totalQuantity: 18, soldQuantity: 11, reservedQuantity: 0,
    pickupDate: seedDate, pickupStart: "20:00", pickupEnd: "21:00", pickupPeriod: "evening", address: "تهران، جردن، خیابان ناهید غربی",
    neighborhood: "جردن", coordinates: { lat: 35.775, lng: 51.421 }, distanceKm: 0.8, rating: 4.6, reviewCount: 184,
    allergens: ["گلوتن", "لبنیات", "تخم‌مرغ"], dietaryLabels: ["ترکیب متغیر"], expiryInfo: "فقط محصولات سالم همان روز؛ مصرف تا پایان امشب",
    status: "active", publishAt: iso(0, 8), expiresAt: iso(0, 21), createdAt: iso(-18), updatedAt: iso(0, 8), popular: true,
  },
  {
    id: BUSINESS_OFFER_IDS[1], businessId: DEMO_BUSINESS_ID, branchId: "branch-jordan", merchantName: "کافه ویونا",
    category: "bakery", categoryLabel: "نانوایی", offerType: "surprise_box", title: "بسته نان و شیرینی عصر",
    description: "نان‌های حجیم و شیرینی‌های سالم پخت امروز با ترکیب غافلگیرکننده و دریافت حضوری.", image: "/images/offers/offer-09.webp",
    originalValue: 460000, salePrice: 149000, totalQuantity: 14, soldQuantity: 10, reservedQuantity: 0, pickupDate: seedDate,
    pickupStart: "19:30", pickupEnd: "20:30", pickupPeriod: "evening", address: "تهران، جردن، خیابان ناهید غربی", neighborhood: "جردن",
    coordinates: { lat: 35.775, lng: 51.421 }, distanceKm: 0.8, rating: 4.8, reviewCount: 92, allergens: ["گلوتن", "لبنیات", "تخم‌مرغ", "احتمال مغزها"],
    dietaryLabels: ["گیاهی احتمالی"], expiryInfo: "محصولات پخت امروز؛ نگهداری طبق برچسب فروشگاه", status: "active",
    publishAt: iso(0, 9), expiresAt: iso(0, 20, 30), createdAt: iso(-16), updatedAt: iso(0, 9), endingSoon: true,
  },
  {
    id: BUSINESS_OFFER_IDS[2], businessId: DEMO_BUSINESS_ID, branchId: "branch-vanak", merchantName: "کافه ویونا",
    category: "cafe", categoryLabel: "کافه", offerType: "specific_product", title: "باکس برانچ ویونا",
    description: "باکس مشخص شامل ساندویچ سبزیجات، کیک هویج و نوشیدنی روز؛ آماده دریافت در شعبه ونک.", image: "/images/offers/offer-15.webp",
    originalValue: 520000, salePrice: 219000, totalQuantity: 8, soldQuantity: 5, reservedQuantity: 0, pickupDate: "2026-08-03",
    pickupStart: "10:00", pickupEnd: "12:00", pickupPeriod: "tomorrow", address: "تهران، ونک، خیابان ملاصدرا", neighborhood: "ونک",
    coordinates: { lat: 35.758, lng: 51.41 }, distanceKm: 1.4, rating: 4.7, reviewCount: 76, allergens: ["گلوتن", "لبنیات", "تخم‌مرغ"],
    dietaryLabels: ["گیاهی"], expiryInfo: "آماده‌سازی همان روز؛ دریافت در بازه تعیین‌شده", status: "active", publishAt: iso(0, 10),
    expiresAt: iso(1, 12), createdAt: iso(-11), updatedAt: iso(0, 10),
  },
  {
    id: BUSINESS_OFFER_IDS[3], businessId: DEMO_BUSINESS_ID, branchId: "branch-jordan", merchantName: "کافه ویونا",
    category: "confectionery", categoryLabel: "شیرینی‌فروشی", offerType: "surprise_box", title: "جعبه کیک و دسر روز",
    description: "برش‌های سالم کیک و دسر روز؛ نوع دقیق بر اساس انتخاب همان روز است.", image: "/images/offers/offer-05.webp",
    originalValue: 440000, salePrice: 139000, totalQuantity: 10, soldQuantity: 10, reservedQuantity: 0, pickupDate: seedDate,
    pickupStart: "20:30", pickupEnd: "21:30", pickupPeriod: "late", address: "تهران، جردن، خیابان ناهید غربی", neighborhood: "جردن",
    coordinates: { lat: 35.775, lng: 51.421 }, distanceKm: 0.8, rating: 4.7, reviewCount: 63, allergens: ["گلوتن", "لبنیات", "تخم‌مرغ", "مغزها"],
    dietaryLabels: [], expiryInfo: "تولید امروز؛ فقط در شرایط سالم عرضه می‌شود", status: "sold_out", publishAt: iso(0, 9), expiresAt: iso(0, 21, 30),
    createdAt: iso(-9), updatedAt: iso(0, 13), endingSoon: true,
  },
];

const networkOffers: MarketplaceOffer[] = initialOffers.map((offer, index) => {
  const total = offer.quantityLeft + 4 + (index % 3);
  return {
    id: offer.id,
    businessId: `network-business-${index + 1}`,
    branchId: `network-branch-${index + 1}`,
    merchantName: offer.merchantName,
    category: offer.category,
    categoryLabel: offer.categoryLabel,
    offerType: "surprise_box",
    title: offer.title,
    description: offer.description,
    image: offer.image,
    originalValue: offer.originalPrice,
    salePrice: offer.price,
    totalQuantity: total,
    soldQuantity: total - offer.quantityLeft,
    reservedQuantity: 0,
    pickupDate: offer.pickupPeriod === "tomorrow" ? "2026-08-03" : seedDate,
    pickupStart: offer.pickupPeriod === "late" ? "21:30" : offer.pickupPeriod === "tomorrow" ? "10:00" : "19:30",
    pickupEnd: offer.pickupPeriod === "late" ? "23:00" : offer.pickupPeriod === "tomorrow" ? "12:00" : "21:00",
    pickupPeriod: offer.pickupPeriod,
    address: offer.address,
    neighborhood: offer.neighborhood,
    coordinates: offer.coordinates,
    distanceKm: offer.distanceKm,
    rating: offer.rating,
    reviewCount: offer.reviewCount,
    allergens: offer.allergens,
    dietaryLabels: [],
    expiryInfo: "فقط غذای سالم و قابل‌مصرف در بازه دریافت عرضه می‌شود.",
    status: offer.quantityLeft ? "active" : "sold_out",
    publishAt: iso(0, 8),
    expiresAt: iso(1, 23),
    createdAt: iso(-30 + index),
    updatedAt: iso(0, 8),
    endingSoon: offer.endingSoon,
    popular: offer.popular,
  };
});

const orderStatuses: OrderStatus[] = [
  "ready_for_pickup", "paid", "reviewed", "preparing", "completed", "completed", "cancelled", "no_show", "under_review", "completed",
];

const orders: Order[] = Array.from({ length: 25 }, (_, index) => {
  const offer = businessOffers[index % businessOffers.length];
  const quantity = index % 5 === 0 ? 2 : 1;
  const status = orderStatuses[index % orderStatuses.length];
  const createdAt = iso(-(index % 12), 9 + (index % 10), (index * 7) % 60);
  const completed = status === "completed";
  return {
    id: `order-${String(index + 1).padStart(3, "0")}`,
    code: `MF-${String(3100 + index)}`,
    customerId: index < 6 ? DEMO_CUSTOMER_ID : `customer-${index + 1}`,
    customerName: index < 6 ? "سارا احمدی" : ["نگار مرادی", "پارسا شریفی", "رها کریمی", "آرین محمدی"][index % 4],
    businessId: DEMO_BUSINESS_ID,
    branchId: offer.branchId,
    items: [{ offerId: offer.id, title: offer.title, unitPrice: offer.salePrice, quantity }],
    total: offer.salePrice * quantity,
    paymentStatus: status === "cancelled" ? "simulated_refunded" : "simulated_paid",
    pickupDate: offer.pickupDate,
    pickupStart: offer.pickupStart,
    pickupEnd: offer.pickupEnd,
    pickupCode: {
      value: index === 0 ? "482913" : String(510000 + index * 137).slice(0, 6),
      usedAt: completed ? iso(-(index % 10), 20) : null,
      status: completed ? "used" : status === "cancelled" ? "invalidated" : "active",
    },
    status,
    createdAt,
    updatedAt: completed ? iso(-(index % 10), 20) : createdAt,
    history: [
      { status: "paid", at: createdAt, note: "پرداخت ثبت شد." },
      ...(status !== "paid" ? [{ status, at: completed ? iso(-(index % 10), 20) : createdAt, note: "وضعیت توسط پنل کسب‌وکار به‌روزرسانی شد." }] : []),
    ],
  };
});

const reviews: Review[] = Array.from({ length: 15 }, (_, index) => {
  const order = orders[(index * 3 + 4) % orders.length];
  return {
    id: `review-${index + 1}`,
    orderId: order.id,
    offerId: order.items[0].offerId,
    businessId: DEMO_BUSINESS_ID,
    branchId: order.branchId,
    customerId: order.customerId,
    customerName: order.customerName,
    rating: [5, 4, 5, 3, 4][index % 5],
    comment: ["بسته تازه و خوشمزه بود.", "تحویل سریع انجام شد، ممنون.", "ارزش خرید خیلی خوبی داشت.", "تنوع بسته می‌توانست بهتر باشد.", "برخورد کارکنان عالی بود."][index % 5],
    response: index % 3 === 0 ? "ممنون که تجربه‌تان را با ما به اشتراک گذاشتید." : "",
    respondedAt: index % 3 === 0 ? iso(-(index % 8), 15) : null,
    createdAt: iso(-(index + 1), 14),
  };
});

const complaintCategories: Complaint["category"][] = ["quality", "quantity", "description", "pickup", "behavior", "payment"];
const complaintStatuses: Complaint["status"][] = ["new", "reviewing", "responded", "escalated", "closed", "new"];
const complaints: Complaint[] = Array.from({ length: 6 }, (_, index) => ({
  id: `complaint-${index + 1}`,
  orderId: orders[index + 5].id,
  reviewId: index < 3 ? reviews[index].id : null,
  businessId: DEMO_BUSINESS_ID,
  branchId: orders[index + 5].branchId,
  customerName: orders[index + 5].customerName,
  category: complaintCategories[index],
  description: ["بخشی از بسته مطابق انتظار نبود.", "حجم بسته کمتر از تصورم بود.", "محتوا با توضیح کلی تفاوت داشت.", "برای تحویل کمی معطل شدم.", "در زمان تحویل راهنمایی کافی نبود.", "بازپرداخت نیاز به بررسی دارد."][index],
  response: index === 2 ? "موضوع بررسی و برای بهبود فرایند ثبت شد." : "",
  status: complaintStatuses[index],
  createdAt: iso(-(index + 2), 13),
  updatedAt: iso(-index, 15),
  history: [{ status: complaintStatuses[index], at: iso(-index, 15) }],
}));

const notificationSeeds: Array<[DemoNotification["kind"], string, string, string]> = [
  ["new_order", "سفارش تازه", "یک سفارش جدید برای بسته پایان روز ثبت شد.", "/business/orders"],
  ["low_stock", "موجودی رو به پایان", "فقط یک بسته نان و شیرینی باقی مانده است.", "/business/offers"],
  ["pickup", "تحویل نزدیک است", "بازه دریافت سفارش MF-3100 تا کمتر از یک ساعت دیگر شروع می‌شود.", "/business/pickup"],
  ["review", "نظر تازه", "یک امتیاز ۵ ستاره برای شعبه جردن ثبت شد.", "/business/quality"],
  ["complaint", "پیگیری کیفیت", "یک مورد جدید برای بررسی ثبت شده است.", "/business/quality"],
  ["settlement", "تسویه انجام شد", "تسویه دوره قبل با موفقیت ثبت شد.", "/business/finance"],
  ["offer_expired", "پیشنهاد منقضی شد", "زمان انتشار بسته دیروز پایان یافته است.", "/business/offers"],
  ["new_order", "دو سفارش تازه", "سفارش‌های امروز به پنل اضافه شدند.", "/business/orders"],
  ["low_stock", "نیاز به افزایش موجودی", "موجودی باکس برانچ کمتر از سه عدد است.", "/business/offers"],
  ["review", "بازخورد مشتری", "یک مشتری درباره کیفیت تحویل نظر داده است.", "/business/quality"],
  ["pickup", "صف تحویل", "سه سفارش آماده دریافت هستند.", "/business/pickup"],
  ["complaint", "پاسخ لازم است", "یک شکایت هنوز بدون پاسخ کسب‌وکار است.", "/business/quality"],
];

const notifications: DemoNotification[] = notificationSeeds.map(([kind, title, text, href], index) => ({
  id: `notification-${index + 1}`, kind, title, text, href, read: index > 4, createdAt: iso(-(index % 5), 9 + (index % 8)),
}));

const finance: FinanceTransaction[] = orders.slice(0, 20).map((order, index) => {
  const refund = order.status === "cancelled" ? order.total : 0;
  const commission = Math.round(order.total * 0.12);
  return {
    id: `transaction-${index + 1}`, orderId: order.id, gross: order.total, commission, refund,
    net: Math.max(0, order.total - commission - refund), type: refund ? "refund" : "sale",
    status: refund ? "refunded" : index > 12 ? "pending" : "settled", createdAt: order.createdAt,
  };
});

const analytics: AnalyticsDay[] = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(`${seedDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - (29 - index));
  return {
    date: date.toISOString().slice(0, 10),
    revenue: 680000 + ((index * 173000) % 1250000),
    orders: 5 + ((index * 7) % 14),
    savedPackages: 7 + ((index * 5) % 18),
    noShows: index % 9 === 0 ? 1 : 0,
    refunds: index % 11 === 0 ? 1 : 0,
    rating: 4.3 + (index % 5) * 0.1,
  };
});

const templates: OfferTemplate[] = [
  ["template-end-day", "بسته شانسی پایان روز", businessOffers[0]],
  ["template-bread", "بسته نان و شیرینی", businessOffers[1]],
  ["template-hot-food", "بسته غذای گرم", { ...businessOffers[0], category: "restaurant" as const, categoryLabel: "غذای گرم", title: "بسته غذای گرم" }],
  ["template-produce", "بسته میوه و سبزیجات", { ...businessOffers[2], category: "fruit" as const, categoryLabel: "میوه و سبزیجات", title: "بسته میوه و سبزیجات" }],
].map(([id, templateName, offer]) => {
  const { id: _id, soldQuantity: _sold, reservedQuantity: _reserved, status: _status, publishAt: _publish, expiresAt: _expires, createdAt: _created, updatedAt: _updated, ...base } = offer as MarketplaceOffer;
  void _id; void _sold; void _reserved; void _status; void _publish; void _expires; void _created; void _updated;
  return { ...base, id: id as string, templateName: templateName as string, createdAt: iso(-20), updatedAt: iso(-2) };
});

export function createDemoSeed(): DemoState {
  return {
    version: DEMO_STATE_VERSION,
    customer: { id: DEMO_CUSTOMER_ID, name: "سارا احمدی", mobile: "09120000000", joinedAt: iso(-120) },
    business: {
      id: DEMO_BUSINESS_ID, name: "کافه ویونا", ownerName: "امیر رضایی", category: "کافه و نانوایی", rating: 4.6,
      logo: "/icons/dibz-ios-default-180-v2.png", cover: "/images/offers/offer-01.webp", demoBankIban: "IR00 •••• •••• •••• •••• 0000 00",
    },
    branches: [
      { id: "branch-jordan", businessId: DEMO_BUSINESS_ID, name: "شعبه جردن", area: "جردن", address: "تهران، جردن، خیابان ناهید غربی", phone: "021-00000000", acceptsOrders: true, openingHours: "۸:۰۰ تا ۲۲:۰۰", pickupWindows: ["۱۹:۳۰ تا ۲۰:۳۰", "۲۰:۳۰ تا ۲۱:۳۰"] },
      { id: "branch-vanak", businessId: DEMO_BUSINESS_ID, name: "شعبه ونک", area: "ونک", address: "تهران، ونک، خیابان ملاصدرا", phone: "021-00000001", acceptsOrders: true, openingHours: "۹:۰۰ تا ۲۱:۰۰", pickupWindows: ["۱۰:۰۰ تا ۱۲:۰۰", "۱۹:۰۰ تا ۲۰:۳۰"] },
    ],
    staff: [
      { id: "staff-owner", name: "امیر رضایی", mobile: "09120000001", branchId: "branch-jordan", role: "owner", permissions: ["offers:write", "orders:write", "pickup:write", "finance:read", "settings:owner"], active: true },
      { id: "staff-manager", name: "نگار شمس", mobile: "09120000002", branchId: "branch-jordan", role: "branch_manager", permissions: ["offers:write", "orders:write", "pickup:write"], active: true },
      { id: "staff-pickup", name: "علی محمودی", mobile: "09120000003", branchId: "branch-vanak", role: "pickup", permissions: ["pickup:write"], active: true },
    ],
    activeStaffId: "staff-owner",
    offers: [...businessOffers, ...networkOffers],
    templates,
    orders,
    reviews,
    complaints,
    notifications,
    finance,
    settlements: [
      { id: "settlement-1", amount: 4260000, period: "۱ تا ۱۵ تیر", status: "paid", dueAt: iso(-14) },
      { id: "settlement-2", amount: 3184000, period: "۱۶ تا ۳۱ تیر", status: "scheduled", dueAt: iso(4) },
    ],
    analytics,
    auditLog: [{ id: "audit-seed", actor: "system", action: "seed_created", entityType: "settings", entityId: DEMO_BUSINESS_ID, at: iso(-30), detail: "اطلاعات اولیه ایجاد شد." }],
  };
}
