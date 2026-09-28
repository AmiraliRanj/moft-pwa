import type { Reservation, GroupedReservation, GroupedReservationItem } from "@/types/moft";

const faNumber = new Intl.NumberFormat("fa-IR");
const faDecimal = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });

export function numberFa(value: number) {
  return faNumber.format(value);
}

export function decimalFa(value: number) {
  return faDecimal.format(value);
}

export function money(value: number) {
  return `${faNumber.format(value)} تومان`;
}

export function moneyCompact(value: number) {
  return `${faNumber.format(Math.round(value / 1000))} هزار تومان`;
}

export function discountPercent(originalPrice: number, price: number) {
  return Math.round((1 - price / originalPrice) * 100);
}

export function distanceFa(value: number) {
  return `${faDecimal.format(value)} کیلومتر`;
}

export function pickupCode() {
  return faNumber.format(Math.floor(1000 + Math.random() * 9000)).replace(/٬/g, "");
}

export function formatMerchantWithCategory(merchantName: string, categoryLabel?: string) {
  if (!merchantName) return "";
  const trimmed = merchantName.trim();
  if (!categoryLabel) return trimmed;
  const label = categoryLabel.trim();

  // If already starts with the label (e.g. "کافه رادیو" with category "کافه")
  if (trimmed.startsWith(label)) return trimmed;

  // Synonyms and variations:
  // "شیرینی" / "قنادی" -> e.g. "شیرینی ترنج" or "ترنج" -> "قنادی ترنج"
  if (label === "شیرینی" || label === "قنادی") {
    if (trimmed.startsWith("شیرینی")) return trimmed.replace(/^شیرینی\s*/, "قنادی ");
    if (trimmed.startsWith("قنادی")) return trimmed;
    return `قنادی ${trimmed}`;
  }

  // "نانوایی" -> e.g. "نانوایی خوشه" or "نان خوشه"
  if (label === "نانوایی") {
    if (trimmed.startsWith("نانوایی") || trimmed.startsWith("نان ")) return trimmed;
    return `نانوایی ${trimmed}`;
  }

  // "فست‌فود" / "فست فود" -> e.g. "پیتزا کوچه" -> "فست فود پیتزا کوچه"
  if (label === "فست‌فود" || label === "فست فود") {
    if (trimmed.startsWith("فست فود") || trimmed.startsWith("فست‌فود")) return trimmed;
    return `فست فود ${trimmed}`;
  }

  // "رستوران" -> e.g. "شام شهر" -> "رستوران شام شهر"
  if (label === "رستوران") {
    if (trimmed.startsWith("رستوران")) return trimmed;
    return `رستوران ${trimmed}`;
  }

  // "کافه" -> e.g. "کافه ویونا"
  if (label === "کافه") {
    if (trimmed.startsWith("کافه")) return trimmed;
    return `کافه ${trimmed}`;
  }

  return `${label} ${trimmed}`;
}

const faJalaliDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" });

export function formatJalaliDate(dateInput: string | Date): string {
  try {
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim().toLowerCase();
      if (trimmed === "today" || trimmed === "امروز") return "امروز";
      if (trimmed === "yesterday" || trimmed === "دیروز") return "دیروز";
    }
    let d: Date;
    if (typeof dateInput === "string") {
      const asciiDate = dateInput.replace(/[۰-۹]/g, (w) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(w)));
      if (asciiDate.includes("-") && !asciiDate.includes("T")) {
        d = new Date(`${asciiDate}T12:00:00`);
      } else {
        d = new Date(asciiDate);
      }
    } else {
      d = dateInput;
    }
    if (isNaN(d.getTime())) return typeof dateInput === "string" ? dateInput : "";
    return faJalaliDate.format(d);
  } catch {
    return typeof dateInput === "string" ? dateInput : "";
  }
}

export function formatPickupDate(pickupText: string): string {
  if (!pickupText) return "";
  return pickupText.replace(/([0-9۰-۹]{4})[-/]([0-9۰-۹]{1,2})[-/]([0-9۰-۹]{1,2})/g, (match) => {
    const formatted = formatJalaliDate(match);
    return formatted || match;
  });
}

export function mergePickupTimes(p1: string, p2: string): string {
  if (!p1) return p2;
  if (!p2 || p1 === p2) return p1;
  const parts1 = p1.split("،");
  const parts2 = p2.split("،");
  if (parts1.length === 2 && parts2.length === 2 && parts1[0].trim() === parts2[0].trim()) {
    const datePrefix = parts1[0].trim();
    const times1 = parts1[1].split("تا").map((s) => s.trim());
    const times2 = parts2[1].split("تا").map((s) => s.trim());
    if (times1.length === 2 && times2.length === 2) {
      const toAscii = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
      const start = toAscii(times1[0]) < toAscii(times2[0]) ? times1[0] : times2[0];
      const end = toAscii(times1[1]) > toAscii(times2[1]) ? times1[1] : times2[1];
      return `${datePrefix}، ${start} تا ${end}`;
    }
  }
  return p1;
}

export function toGroupedReservation(res: Reservation): GroupedReservation {
  return {
    groupKey: `${res.merchantName.trim()}___${res.status}___${res.id}`,
    merchantName: res.merchantName,
    category: res.category,
    address: res.address,
    pickup: res.pickup,
    code: res.code,
    status: res.status,
    orderStatus: res.orderStatus,
    items: [
      {
        id: res.id,
        offerId: res.offerId,
        title: res.title,
        image: res.image,
        quantity: res.quantity || 1,
        total: res.total,
        originalPrice: res.originalPrice,
        description: res.description,
        allergens: res.allergens,
        category: res.category,
        reservation: res,
      },
    ],
    total: res.total,
    originalTotal: res.originalPrice || res.total,
    primaryReservation: res,
    allReservations: [res],
    hasReview: res.hasReview,
    reviewResponse: res.reviewResponse,
    createdAt: res.createdAt,
  };
}

export function groupReservationsByMerchant(reservationsList: Reservation[]): GroupedReservation[] {
  const groupsMap = new Map<string, GroupedReservation>();

  for (const res of reservationsList) {
    const key = `${res.merchantName.trim()}___${res.status}`;
    const existing = groupsMap.get(key);

    const item: GroupedReservationItem = {
      id: res.id,
      offerId: res.offerId,
      title: res.title,
      image: res.image,
      quantity: res.quantity || 1,
      total: res.total,
      originalPrice: res.originalPrice,
      description: res.description,
      allergens: res.allergens,
      category: res.category,
      reservation: res,
    };

    if (existing) {
      existing.items.push(item);
      existing.total += res.total;
      existing.originalTotal += res.originalPrice || res.total;
      existing.allReservations.push(res);
      if (res.hasReview) existing.hasReview = true;
      if (res.reviewResponse && !existing.reviewResponse) existing.reviewResponse = res.reviewResponse;
      existing.pickup = mergePickupTimes(existing.pickup, res.pickup);
    } else {
      groupsMap.set(key, {
        groupKey: key,
        merchantName: res.merchantName,
        category: res.category,
        address: res.address,
        pickup: res.pickup,
        code: res.code,
        status: res.status,
        orderStatus: res.orderStatus,
        items: [item],
        total: res.total,
        originalTotal: res.originalPrice || res.total,
        primaryReservation: res,
        allReservations: [res],
        hasReview: res.hasReview,
        reviewResponse: res.reviewResponse,
        createdAt: res.createdAt,
      });
    }
  }

  return Array.from(groupsMap.values());
}


