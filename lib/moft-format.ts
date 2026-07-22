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

export function discountPercent(originalPrice: number, price: number) {
  return Math.round((1 - price / originalPrice) * 100);
}

export function distanceFa(value: number) {
  return `${faDecimal.format(value)} کیلومتر`;
}

export function pickupCode() {
  return faNumber.format(Math.floor(1000 + Math.random() * 9000)).replace(/٬/g, "");
}
