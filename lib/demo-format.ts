import type { ComplaintCategory, ComplaintStatus, OfferStatus, OrderStatus, StaffRole } from "@/types/demo";

const faNumber = new Intl.NumberFormat("fa-IR");
const faDecimal = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });
const faDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "long", day: "numeric" });

export const formatNumber = (value: number) => faNumber.format(value);
export const formatDecimal = (value: number) => faDecimal.format(value);
export const formatMoney = (value: number) => `${faNumber.format(value)} تومان`;
export const formatDate = (value: string | Date) => faDate.format(typeof value === "string" ? new Date(value) : value);
export const remainingQuantity = (offer: { totalQuantity: number; soldQuantity: number; reservedQuantity: number }) => Math.max(0, offer.totalQuantity - offer.soldQuantity - offer.reservedQuantity);

export const offerStatusLabel: Record<OfferStatus, string> = {
  draft: "پیش‌نویس", scheduled: "زمان‌بندی‌شده", active: "فعال", paused: "متوقف", sold_out: "فروخته‌شده", expired: "منقضی‌شده", archived: "بایگانی‌شده",
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending_payment: "در انتظار پرداخت", paid: "پرداخت‌شده", reviewed: "بررسی‌شده", preparing: "در حال آماده‌سازی",
  ready_for_pickup: "آماده تحویل", completed: "تحویل‌شده", cancelled: "لغوشده", no_show: "عدم مراجعه", under_review: "نیازمند بررسی", refunded: "بازپرداخت‌شده",
};

export const complaintStatusLabel: Record<ComplaintStatus, string> = {
  new: "جدید", reviewing: "در حال بررسی", responded: "پاسخ داده‌شده", escalated: "ارجاع به پشتیبانی", closed: "بسته‌شده",
};

export const complaintCategoryLabel: Record<ComplaintCategory, string> = {
  quality: "کیفیت پایین", quantity: "مقدار کمتر از انتظار", description: "مغایرت با توضیحات", unsafe: "محصول غیرقابل مصرف",
  pickup: "مشکل در زمان تحویل", behavior: "برخورد نامناسب", payment: "مشکل پرداخت یا بازپرداخت",
};

export const staffRoleLabel: Record<StaffRole, string> = {
  owner: "مالک", branch_manager: "مدیر شعبه", orders: "مسئول سفارش‌ها", pickup: "مسئول تحویل", accountant: "حسابدار",
};
