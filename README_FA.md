# دموی یکپارچه «مفت»

«مفت» یک PWA فارسی و RTL برای نجات غذای سالمِ فروش‌نرفته است. این مخزن یک دموی دانشگاهی عمومی است و دو تجربه متصل را در یک پروژه Next.js و یک استقرار Vercel ارائه می‌کند:

- نسخه مشتری برای کشف پیشنهاد، رزرو و پرداخت شبیه‌سازی‌شده، دریافت حضوری و ثبت نظر
- پنل کسب‌وکار برای مدیریت پیشنهاد، موجودی، سفارش، تحویل، کیفیت، گزارش و امور مالی نمایشی

هیچ پرداخت، احراز هویت، بانک یا backend واقعی در این نسخه وجود ندارد.

## مسیرها

| مسیر | کاربرد |
| --- | --- |
| `/` | انتخاب نوع ورود |
| `/customer` | خانه مشتری |
| `/customer/offers` | کشف و جست‌وجوی پیشنهادها |
| `/customer/offers/[id]` | جزئیات مستقیم پیشنهاد |
| `/customer/orders` | سفارش‌ها، وضعیت و کد دریافت |
| `/customer/favorites` | علاقه‌مندی‌ها |
| `/customer/profile` | پروفایل، پوسته و تغییر حالت دمو |
| `/business` | داشبورد امروز |
| `/business/orders` | مدیریت سفارش‌ها |
| `/business/offers` | پیشنهاد و موجودی |
| `/business/templates` | قالب‌های انتشار سریع |
| `/business/pickup` | بررسی کد و تحویل |
| `/business/analytics` | گزارش‌های تعاملی |
| `/business/quality` | نظرها و پیگیری کیفیت |
| `/business/finance` | تراکنش و تسویه نمایشی |
| `/business/settings` | مجموعه، شعب، کارکنان و دسترسی‌ها |

## نصب و اجرای محلی

نیازمندی: Node.js 20.9 یا جدیدتر.

```bash
npm install
npm run dev
```

سپس `http://localhost:3000` را باز کنید.

بررسی کامل نسخه تولیدی:

```bash
npm run validate
npm run lint
npm run build
npm run start
```

در PowerShell ویندوزی که اجرای `npm.ps1` مسدود است، به‌جای `npm` از `npm.cmd` استفاده کنید.

## هویت‌های دمو

- مشتری: سارا احمدی — `09120000000`
- کسب‌وکار: کافه ویونا
- مالک: امیر رضایی
- شعبه اصلی: شعبه جردن
- کد دریافت معتبر seed: `482913`

از پایین نوار کناری Business می‌توان نقش فعال را میان مالک، مدیر شعبه و مسئول تحویل تغییر داد. دسترسی‌ها واقعاً روی عملیات پنل اثر می‌گذارند.

## داده مشترک و بازنشانی

seed اصلی در [`data/demo-seed.ts`](./data/demo-seed.ts) قرار دارد. `DemoProvider` در [`demo/DemoProvider.tsx`](./demo/DemoProvider.tsx) state مشترک را با کلید نسخه‌بندی‌شده `moft-unified-demo-v1` در `localStorage` نگه می‌دارد.

برای بازنشانی:

1. در Customer به پروفایل بروید یا در Business پایین نوار کناری را باز کنید.
2. «بازنشانی اطلاعات نمایشی» را انتخاب کنید.
3. تأیید کنید.

پیشنهادها، موجودی، سفارش‌ها، نظرها، پیگیری‌ها، اعلان‌ها و امور مالی به seed اولیه برمی‌گردند؛ پوسته روشن/تاریک حفظ می‌شود.

## معماری store و service

- مدل‌های strict مشترک: `types/demo.ts`
- seed قطعی و روابط داده: `data/demo-seed.ts`
- persistence و actionهای UI: `demo/DemoProvider.tsx`
- قواعد دامنه و سرویس‌های mock: `demo/services.ts`
- UI مشتری: `components/MoftPreview.tsx`
- shell و صفحه‌های کسب‌وکار: `components/business/`

صفحه‌ها مستقیماً آرایه mock جداگانه را تغییر نمی‌دهند. عملیات پیشنهاد، سفارش، تحویل، نظر، گزارش و مالی از سرویس‌ها و store مشترک عبور می‌کنند.

## جایگزینی mock با Django REST API

برای نسخه آینده:

1. قراردادهای TypeScript در `types/demo.ts` را با serializerهای Django هم‌راستا کنید.
2. متدهای `offerService`، `orderService`، `pickupService`، `reviewService` و `financeService` را با clientهای async HTTP جایگزین کنید.
3. optimistic update و rollback را در `DemoProvider` یا یک لایه query جدا اضافه کنید.
4. کنترل اتمیک موجودی، idempotency پرداخت و یک‌بارمصرف‌بودن کد تحویل را روی backend enforce کنید.
5. احراز هویت و permission را سمت سرور هم بررسی کنید؛ محدودیت‌های فعلی صرفاً دموی UI هستند.
6. کلیدها و secretها را فقط در محیط استقرار نگه دارید و هیچ `.env` واقعی را commit نکنید.

## استقرار روی Vercel

این پروژه به environment variable نیاز ندارد. Framework Preset روی Next.js و Build Command روی `npm run build` باشد.

روش Git:

```bash
git push -u origin prototype-3
```

اگر Vercel به GitHub متصل باشد، Push همین شاخه یک Preview Deployment می‌سازد.

روش CLI برای Preview:

```bash
npx vercel
```

انتشار Production فقط با تصمیم صریح پروژه:

```bash
npx vercel --prod
```

## PWA

- manifest: `app/manifest.ts`
- ثبت service worker: `components/ServiceWorkerRegister.tsx`
- service worker نسخه‌بندی‌شده: `public/sw.js`
- fallback آفلاین: `/offline`
- start URL: `/` برای نمایش انتخاب نوع ورود

PWA از یک service worker مشترک استفاده می‌کند و برای Customer و Business سرویس‌ورکر جداگانه‌ای ایجاد نشده است.

## شاخه توسعه

تمام تغییرات دموی یکپارچه روی شاخه `prototype-3` نگهداری می‌شوند.
