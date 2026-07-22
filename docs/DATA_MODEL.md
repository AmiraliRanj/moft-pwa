# مدل داده پیشنهادی

## مدل Mock فعلی

```ts
type SurpriseBox = {
  id: string
  merchantName: string
  category: "cafe" | "restaurant" | "bakery" | "fruit" | "grocery"
  title: string
  description: string
  pickupStart: string
  pickupEnd: string
  originalPrice: number
  price: number
  quantityLeft: number
  rating: number
  distanceKm: number
  allergens: string[]
}
```

## مدل نسخه واقعی

### users

- id
- phone
- display_name
- allergy_preferences
- created_at

### merchants

- id
- legal_name
- display_name
- category
- status
- address
- latitude / longitude
- pickup_instructions

### merchant_locations

برای کسب‌وکار چندشعبه‌ای.

### offers

- id
- merchant_location_id
- title
- description
- original_price
- sale_price
- quantity_total
- quantity_reserved
- pickup_start
- pickup_end
- allergen_flags
- status

### reservations

- id
- user_id
- offer_id
- quantity
- amount
- pickup_code_hash
- status
- expires_at
- created_at

### payments

در نسخه واقعی جدا از reservation نگهداری شود و webhookها idempotent باشند.

## قواعد مهم نسخه واقعی

- کاهش موجودی باید اتمیک باشد.
- یک Offer بعد از شروع یا پایان Pickup طبق سیاست قابل ویرایش نیست.
- کد تحویل به‌صورت Plaintext در دیتابیس ذخیره نشود.
- رویداد پرداخت چندبار مصرف نشود.
- داده آلرژن با تاریخچه تغییرات نگهداری شود.
