# PWA و Vercel

## PWA

فایل‌های اصلی:

- `app/manifest.ts`
- `public/sw.js`
- `components/ServiceWorkerRegister.tsx`
- `app/offline/page.tsx`
- آیکن‌های Home Screen در `public/icons/dibz-icon-180.png`، `public/icons/dibz-icon-192.png` و `public/icons/dibz-icon-512.png`

سرویس‌ورکر Preview فقط App Shell و پاسخ‌های موفق same-origin را cache می‌کند. داده حساس، API خصوصی یا پرداخت نباید با همین سیاست cache شود.

## تست نصب

- روی HTTPS یا localhost اجرا شود.
- Manifest در DevTools بررسی شود.
- Service Worker فعال باشد.
- آیکن 192 و 512 موجود باشد.
- نام و رنگ theme صحیح باشد.

## Vercel

برای این Preview تنظیم خاصی لازم نیست. Build command همان `npm run build` است.

## متغیرهای محیطی آینده

نمونه نام‌ها:

```text
DATABASE_URL=
AUTH_SECRET=
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

مقادیر واقعی هرگز در Git قرار نگیرند. فقط `.env.example` بدون مقدار حساس commit شود.
