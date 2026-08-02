import type {
  DemoState,
  MarketplaceOffer,
  OfferDraft,
  OfferStatus,
  Order,
  OrderStatus,
  Review,
} from "@/types/demo";

export type ServiceResult<T = undefined> = { ok: true; state: DemoState; value: T } | { ok: false; state: DemoState; error: string };

const now = () => new Date().toISOString();
const entityId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const availableQuantity = (offer: MarketplaceOffer) => Math.max(0, offer.totalQuantity - offer.soldQuantity - offer.reservedQuantity);

export const offerService = {
  validate(draft: OfferDraft): string | null {
    if (!draft.title.trim() || !draft.description.trim() || !draft.branchId) return "عنوان، توضیحات و شعبه الزامی است.";
    if (draft.totalQuantity <= 0) return "تعداد باید بیشتر از صفر باشد.";
    if (draft.originalValue <= 0 || draft.salePrice <= 0) return "مبلغ‌ها باید بیشتر از صفر باشند.";
    if (draft.salePrice >= draft.originalValue) return "قیمت رزرو باید کمتر از ارزش اصلی باشد.";
    if (draft.pickupEnd <= draft.pickupStart) return "پایان بازه دریافت باید بعد از شروع آن باشد.";
    if (new Date(draft.expiresAt).getTime() <= new Date(draft.publishAt).getTime()) return "زمان انقضا باید بعد از انتشار باشد.";
    return null;
  },

  create(state: DemoState, draft: OfferDraft, status: "draft" | "active" | "scheduled"): ServiceResult<MarketplaceOffer> {
    const error = this.validate(draft);
    if (error) return { ok: false, state, error };
    const branch = state.branches.find((item) => item.id === draft.branchId);
    if (!branch) return { ok: false, state, error: "شعبه انتخاب‌شده پیدا نشد." };
    const createdAt = now();
    const offer: MarketplaceOffer = {
      id: entityId("offer"),
      businessId: state.business.id,
      branchId: draft.branchId,
      merchantName: state.business.name,
      category: draft.offerType === "specific_product" ? "cafe" : "bakery",
      categoryLabel: draft.offerType === "specific_product" ? "محصول مشخص" : "جعبه غافلگیرکننده",
      offerType: draft.offerType,
      title: draft.title.trim(),
      description: draft.description.trim(),
      image: draft.image || "/images/offers/offer-01.webp",
      originalValue: draft.originalValue,
      salePrice: draft.salePrice,
      totalQuantity: draft.totalQuantity,
      soldQuantity: 0,
      reservedQuantity: 0,
      pickupDate: draft.pickupDate,
      pickupStart: draft.pickupStart,
      pickupEnd: draft.pickupEnd,
      pickupPeriod: draft.pickupStart >= "21:00" ? "late" : draft.pickupDate > new Date().toISOString().slice(0, 10) ? "tomorrow" : "evening",
      address: branch.address,
      neighborhood: branch.area,
      coordinates: branch.id === "branch-jordan" ? { lat: 35.775, lng: 51.421 } : { lat: 35.758, lng: 51.41 },
      distanceKm: branch.id === "branch-jordan" ? 0.8 : 1.4,
      rating: state.business.rating,
      reviewCount: state.reviews.length,
      allergens: draft.allergens,
      dietaryLabels: draft.dietaryLabels,
      expiryInfo: draft.expiryInfo,
      status,
      publishAt: draft.publishAt,
      expiresAt: draft.expiresAt,
      createdAt,
      updatedAt: createdAt,
    };
    const audit = { id: entityId("audit"), actor: "business" as const, action: status === "active" ? "offer_published" : "offer_saved", entityType: "offer" as const, entityId: offer.id, at: createdAt, detail: status === "active" ? "پیشنهاد منتشر شد." : "پیشنهاد ذخیره شد." };
    return { ok: true, value: offer, state: { ...state, offers: [offer, ...state.offers], auditLog: [audit, ...state.auditLog] } };
  },

  update(state: DemoState, id: string, patch: Partial<MarketplaceOffer>): ServiceResult<MarketplaceOffer> {
    const current = state.offers.find((offer) => offer.id === id);
    if (!current) return { ok: false, state, error: "پیشنهاد پیدا نشد." };
    const offer = { ...current, ...patch, id: current.id, updatedAt: now() };
    return { ok: true, value: offer, state: { ...state, offers: state.offers.map((item) => item.id === id ? offer : item) } };
  },

  setStatus(state: DemoState, id: string, status: OfferStatus): ServiceResult<MarketplaceOffer> {
    const current = state.offers.find((offer) => offer.id === id);
    if (!current) return { ok: false, state, error: "پیشنهاد پیدا نشد." };
    if (status === "active" && availableQuantity(current) < 1) return { ok: false, state, error: "برای فعال‌کردن، ابتدا موجودی را افزایش دهید." };
    const updatedAt = now();
    const offer = { ...current, status, updatedAt };
    return {
      ok: true,
      value: offer,
      state: {
        ...state,
        offers: state.offers.map((item) => item.id === id ? offer : item),
        auditLog: [{ id: entityId("audit"), actor: "business", action: `offer_${status}`, entityType: "offer", entityId: id, at: updatedAt, detail: `وضعیت پیشنهاد به ${status} تغییر کرد.` }, ...state.auditLog],
      },
    };
  },

  adjustStock(state: DemoState, id: string, delta: number): ServiceResult<MarketplaceOffer> {
    const current = state.offers.find((offer) => offer.id === id);
    if (!current) return { ok: false, state, error: "پیشنهاد پیدا نشد." };
    const minimum = current.soldQuantity + current.reservedQuantity;
    const totalQuantity = Math.max(minimum, current.totalQuantity + delta);
    if (totalQuantity === current.totalQuantity && delta < 0) return { ok: false, state, error: "موجودی نمی‌تواند از تعداد فروخته‌شده کمتر شود." };
    const remaining = totalQuantity - minimum;
    const status: OfferStatus = remaining === 0 ? "sold_out" : current.status === "sold_out" ? "active" : current.status;
    return this.update(state, id, { totalQuantity, status });
  },

  duplicate(state: DemoState, id: string): ServiceResult<MarketplaceOffer> {
    const current = state.offers.find((offer) => offer.id === id);
    if (!current) return { ok: false, state, error: "پیشنهاد پیدا نشد." };
    const createdAt = now();
    const copy: MarketplaceOffer = { ...current, id: entityId("offer"), title: `${current.title} (کپی)`, soldQuantity: 0, reservedQuantity: 0, status: "draft", createdAt, updatedAt: createdAt };
    return { ok: true, value: copy, state: { ...state, offers: [copy, ...state.offers] } };
  },

  removeDraft(state: DemoState, id: string): ServiceResult {
    const current = state.offers.find((offer) => offer.id === id);
    if (!current || current.status !== "draft") return { ok: false, state, error: "فقط پیش‌نویس قابل حذف است." };
    return { ok: true, value: undefined, state: { ...state, offers: state.offers.filter((offer) => offer.id !== id) } };
  },
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["reviewed", "preparing", "cancelled", "under_review"],
  reviewed: ["preparing", "cancelled", "under_review"],
  preparing: ["ready_for_pickup", "cancelled", "under_review"],
  ready_for_pickup: ["completed", "no_show", "cancelled", "under_review"],
  completed: ["under_review", "refunded"],
  cancelled: [],
  no_show: ["under_review"],
  under_review: ["refunded", "completed", "cancelled"],
  refunded: [],
};

export const orderService = {
  place(state: DemoState, offerId: string, quantity: number): ServiceResult<Order> {
    const offer = state.offers.find((item) => item.id === offerId);
    if (!offer || offer.status !== "active") return { ok: false, state, error: "این پیشنهاد در حال حاضر قابل رزرو نیست." };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) return { ok: false, state, error: "تعداد انتخاب‌شده معتبر نیست." };
    if (availableQuantity(offer) < quantity) return { ok: false, state, error: "موجودی برای این تعداد کافی نیست." };
    const createdAt = now();
    const orderId = entityId("order");
    const pickupValue = String((Date.now() % 900000) + 100000);
    const order: Order = {
      id: orderId,
      code: `MF-${String(Date.now()).slice(-5)}`,
      customerId: state.customer.id,
      customerName: state.customer.name,
      businessId: offer.businessId,
      branchId: offer.branchId,
      items: [{ offerId: offer.id, title: offer.title, unitPrice: offer.salePrice, quantity }],
      total: offer.salePrice * quantity,
      paymentStatus: "simulated_paid",
      pickupDate: offer.pickupDate,
      pickupStart: offer.pickupStart,
      pickupEnd: offer.pickupEnd,
      pickupCode: { value: pickupValue, usedAt: null, status: "active" },
      status: "paid",
      createdAt,
      updatedAt: createdAt,
      history: [{ status: "paid", at: createdAt, note: "پرداخت با موفقیت شبیه‌سازی شد." }],
    };
    const soldQuantity = offer.soldQuantity + quantity;
    const status: OfferStatus = offer.totalQuantity - soldQuantity - offer.reservedQuantity <= 0 ? "sold_out" : offer.status;
    const updatedOffer = { ...offer, soldQuantity, status, updatedAt: createdAt };
    const commission = Math.round(order.total * 0.12);
    return {
      ok: true,
      value: order,
      state: {
        ...state,
        offers: state.offers.map((item) => item.id === offer.id ? updatedOffer : item),
        orders: [order, ...state.orders],
        finance: [{ id: entityId("transaction"), orderId, gross: order.total, commission, refund: 0, net: order.total - commission, type: "sale", status: "pending", createdAt }, ...state.finance],
        notifications: [{ id: entityId("notification"), kind: "new_order", title: "سفارش تازه", text: `${state.customer.name} یک ${offer.title} رزرو کرد.`, href: "/business/orders", read: false, createdAt }, ...state.notifications],
        auditLog: [{ id: entityId("audit"), actor: "customer", action: "order_created", entityType: "order", entityId: orderId, at: createdAt, detail: "سفارش و پرداخت نمایشی ثبت شد." }, ...state.auditLog],
      },
    };
  },

  transition(state: DemoState, id: string, status: OrderStatus): ServiceResult<Order> {
    const order = state.orders.find((item) => item.id === id);
    if (!order) return { ok: false, state, error: "سفارش پیدا نشد." };
    if (!allowedTransitions[order.status].includes(status)) return { ok: false, state, error: "این تغییر وضعیت برای سفارش فعلی مجاز نیست." };
    const updatedAt = now();
    let offers = state.offers;
    let finance = state.finance;
    let pickupCode = order.pickupCode;
    let paymentStatus = order.paymentStatus;
    if (status === "completed") pickupCode = { ...pickupCode, status: "used", usedAt: updatedAt };
    if (status === "cancelled" || status === "refunded") {
      pickupCode = { ...pickupCode, status: "invalidated" };
      paymentStatus = "simulated_refunded";
      const canRestore = !["completed", "no_show", "refunded"].includes(order.status);
      if (canRestore) {
        for (const item of order.items) {
          offers = offers.map((offer) => offer.id === item.offerId ? {
            ...offer,
            soldQuantity: Math.max(0, offer.soldQuantity - item.quantity),
            status: offer.status === "sold_out" ? "active" : offer.status,
            updatedAt,
          } : offer);
        }
      }
      finance = finance.map((item) => item.orderId === order.id ? { ...item, refund: item.gross, net: 0, type: "refund", status: "refunded" } : item);
    }
    const updated: Order = { ...order, status, pickupCode, paymentStatus, updatedAt, history: [...order.history, { status, at: updatedAt, note: "وضعیت در پنل کسب‌وکار تغییر کرد." }] };
    return {
      ok: true,
      value: updated,
      state: {
        ...state,
        offers,
        finance,
        orders: state.orders.map((item) => item.id === id ? updated : item),
        auditLog: [{ id: entityId("audit"), actor: "business", action: `order_${status}`, entityType: "order", entityId: id, at: updatedAt, detail: `وضعیت سفارش به ${status} تغییر کرد.` }, ...state.auditLog],
      },
    };
  },
};

export const pickupService = {
  verify(state: DemoState, code: string): { kind: "valid" | "invalid" | "used" | "wrong_status"; order?: Order } {
    const order = state.orders.find((item) => item.pickupCode.value === code.trim());
    if (!order) return { kind: "invalid" };
    if (order.pickupCode.status === "used") return { kind: "used", order };
    if (order.pickupCode.status !== "active" || order.status !== "ready_for_pickup") return { kind: "wrong_status", order };
    return { kind: "valid", order };
  },
};

export const reviewService = {
  submit(state: DemoState, orderId: string, rating: number, comment: string): ServiceResult<Review> {
    const order = state.orders.find((item) => item.id === orderId && item.customerId === state.customer.id);
    if (!order || order.status !== "completed") return { ok: false, state, error: "فقط برای سفارش تحویل‌شده می‌توان نظر ثبت کرد." };
    if (state.reviews.some((review) => review.orderId === orderId)) return { ok: false, state, error: "برای این سفارش قبلاً نظر ثبت شده است." };
    if (rating < 1 || rating > 5) return { ok: false, state, error: "امتیاز باید بین ۱ تا ۵ باشد." };
    const createdAt = now();
    const review: Review = { id: entityId("review"), orderId, offerId: order.items[0].offerId, businessId: order.businessId, branchId: order.branchId, customerId: state.customer.id, customerName: state.customer.name, rating, comment: comment.trim(), response: "", respondedAt: null, createdAt };
    return {
      ok: true,
      value: review,
      state: {
        ...state,
        reviews: [review, ...state.reviews],
        notifications: [{ id: entityId("notification"), kind: "review", title: "نظر تازه", text: `${state.customer.name} امتیاز ${rating} ثبت کرد.`, href: "/business/quality", read: false, createdAt }, ...state.notifications],
        auditLog: [{ id: entityId("audit"), actor: "customer", action: "review_submitted", entityType: "review", entityId: review.id, at: createdAt, detail: "نظر مشتری ثبت شد." }, ...state.auditLog],
      },
    };
  },

  respond(state: DemoState, id: string, response: string): ServiceResult<Review> {
    const review = state.reviews.find((item) => item.id === id);
    if (!review) return { ok: false, state, error: "نظر پیدا نشد." };
    if (!response.trim()) return { ok: false, state, error: "متن پاسخ را وارد کنید." };
    const updated = { ...review, response: response.trim(), respondedAt: now() };
    return { ok: true, value: updated, state: { ...state, reviews: state.reviews.map((item) => item.id === id ? updated : item) } };
  },
};

export const financeService = {
  toCsv(state: DemoState, transactionIds?: string[]) {
    const selected = transactionIds ? state.finance.filter((item) => transactionIds.includes(item.id)) : state.finance;
    const rows = [["order", "gross", "commission", "refund", "net", "date", "status"], ...selected.map((item) => [item.orderId, item.gross, item.commission, item.refund, item.net, item.createdAt, item.status])];
    return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  },
};

export const analyticsService = {
  range(state: DemoState, days: 1 | 7 | 30) {
    return state.analytics.slice(-days);
  },
};
