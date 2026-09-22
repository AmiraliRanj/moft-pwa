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
