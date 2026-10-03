# PWA و استقرار مستقل

نسخه مشتری و کسب‌وکار دو پروژه Next.js مستقل روی دو origin جدا هستند. هرکدام manifest، service worker، cache و داده نمایشی خود را دارند.

## مشتری

- start URL و هویت نصب قبلی مشتری حفظ می‌شود.
- cache جدید: `dibz-customer-shell-v8`؛ cacheهای قدیمی `dibz-shell-*` پاک می‌شوند.
- `/business/*` توسط service worker cache نمی‌شود.
- در Vercel قبل از build مقدار `BUSINESS_PWA_URL` را روی origin کسب‌وکار تنظیم کنید. ادامه مسیر و query در redirect حفظ می‌شود.

## کسب‌وکار

مخزن `moft-business-pwa` پروژه جداگانه Vercel است. manifest با نام `Dibz Business` و start URL برابر `/business`، cache و storage مختص کسب‌وکار دارد؛ به متغیر محیطی نیاز ندارد.

## بررسی نصب و آفلاین

بعد از `npm run build` و `npm run start` روی HTTPS یا localhost، manifest، آیکن‌ها، حالت standalone، فعال‌شدن worker، بارگذاری دوباره صفحه بازدیدشده در حالت آفلاین و fallback `/offline` را بررسی کنید. اجرای dev سرویس‌ورکر را ثبت نمی‌کند.

قبل از انتشار مشتری، redirectهای `/business` و `/business/orders?status=paid` را به origin واقعی کسب‌وکار آزمایش کنید. هیچ backend، پرداخت یا انتشار واقعی بخشی از این تغییر نیست.
