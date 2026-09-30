# مسیرها و جریان‌های مشتری

- `/` به `/customer` منتقل می‌شود.
- `/customer/offers` و `/customer/offers/[id]`: کشف و جزئیات پیشنهاد
- `/customer/favorites`: علاقه‌مندی‌ها
- `/customer/cart` و `/customer/orders`: رزرو شبیه‌سازی‌شده و پیگیری دریافت حضوری
- `/customer/profile`: پروفایل، پوسته و بازنشانی دمو
- `/customer/support/[orderId]`: درخواست پشتیبانی مربوط به سفارش
- `/offline`، `/manifest.webmanifest` و `/sw.js`: زیرساخت PWA

پنل کسب‌وکار در مخزن مستقل `moft-business-pwa` قرار دارد. لینک‌های قدیمی `/business/*` با `BUSINESS_PWA_URL` به origin جدید منتقل می‌شوند. داده نمایشی بین دو برنامه همگام نمی‌شود.
