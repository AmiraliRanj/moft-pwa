# PWA مشتری Dibz

این مخزن نسخه مشتری دیبز، یک دموی دانشگاهی فارسی و RTL است. پرداخت، رزرو و پشتیبانی شبیه‌سازی می‌شوند و backend یا احراز هویت واقعی وجود ندارد.

پنل کسب‌وکار در مخزن مستقل `../moft-business-pwa` قرار دارد. داده دو برنامه همگام نمی‌شود؛ هر برنامه seed و `localStorage` مستقل دارد.

## اجرا و بررسی

```bash
npm ci
npm run dev
```

نسخه مشتری: `http://localhost:3000`. نسخه کسب‌وکار جداگانه روی پورت 3001 اجرا می‌شود.

```bash
npm run validate
npm test
npm run lint
npm run build
npm run start
```

## مسیرها

- `/` → `/customer`
- `/customer/offers` و `/customer/offers/[id]`: کشف و جزئیات پیشنهاد
- `/customer/favorites`: علاقه‌مندی‌ها
- `/customer/cart`: سبد رزرو
- `/customer/orders`: رزروها و کد دریافت
- `/customer/profile`: پروفایل، پوسته و بازنشانی دمو
- `/customer/support` و `/customer/support/[orderId]`: پشتیبانی نمایشی
- `/offline`: صفحه آفلاین

## داده و PWA

کلیدهای قبلی مشتری (`moft-unified-demo-v1`، `moft-favorites-v2`، `moft-theme-v2` و `moft-support-v1`) و نسخه state حفظ شده‌اند تا اطلاعات ذخیره‌شده از دست نرود. مدل‌های مشترک دامنه و seed همچنان برای پیشنهادها و رزروهای مشتری استفاده می‌شوند.

manifest مشتری و start URL قبلی حفظ شده‌اند. سرویس‌ورکر از cache با نام `dibz-customer-shell-v8` استفاده می‌کند؛ cacheهای قدیمی `dibz-shell-*` حذف می‌شوند و مسیرهای `/business/*` دیگر cache نمی‌شوند. سرویس‌ورکر فقط در اجرای production فعال است.

## انتقال لینک‌های قدیمی و استقرار

در توسعه، `/business/*` به همان مسیر در `http://localhost:3001` منتقل می‌شود. برای production، متغیر `BUSINESS_PWA_URL` را پیش از build به origin واقعی کسب‌وکار تنظیم کنید؛ مثلاً `https://business.example.com`. متغیر فقط origin می‌پذیرد، نه مسیر `/business`. پارامترهای query و ادامه مسیر حفظ می‌شوند.

اگر در production این متغیر تنظیم نشود، صفحه اطلاع‌رسانی انتقال پنل نمایش داده می‌شود. قبل از انتشار مشتری آن را تنظیم و redirect را بررسی کنید.

در Vercel دو پروژه مستقل برای دو مخزن ایجاد کنید؛ هرکدام Next.js و `npm run build`. از originهای جدا برای استقلال نصب، ذخیره‌سازی و cache استفاده کنید. نیازی به backend نیست. فایل `.env.example` فقط نمونه غیرحساس است؛ فایل `.env` واقعی وارد Git نشود.
