import Link from "next/link";
import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Icon } from "@/components/moft/Icon";

export default function RoleSelector() {
  return (
    <main className="role-page">
      <a className="skip-link" href="#role-options">رفتن به انتخاب نوع ورود</a>
      <div className="role-orb role-orb-one" aria-hidden="true" />
      <div className="role-orb role-orb-two" aria-hidden="true" />
      <header className="role-header">
        <BrandMark subtitle="نجات غذای خوب، نزدیک شما" />
        <ThemeToggle compact />
      </header>

      <section className="role-hero" aria-labelledby="role-title">
        <p className="eyebrow">یک مقصد، دو تجربه</p>
        <h1 id="role-title">دوست داری از کدام سمت وارد دیبز شوی؟</h1>
        <p>پیشنهادهای نزدیک را پیدا کنید یا عملیات روزانهٔ مجموعه‌تان را از یک پنل یکپارچه مدیریت کنید.</p>
      </section>

      <section id="role-options" className="role-grid" aria-label="انتخاب نوع ورود">
        <Link className="role-card customer-role" href="/customer">
          <span className="role-card-art customer-art" aria-hidden="true">
            <span><Icon name="bag" /></span><i /><i /><i />
          </span>
          <span className="role-card-copy">
            <small>برای نجات یک وعده خوب</small>
            <strong>ورود به نسخه مشتری</strong>
            <span>پیشنهادهای نزدیک شما را ببینید، بسته‌های مازاد را رزرو کنید و سفارش خود را حضوری دریافت کنید.</span>
          </span>
          <span className="role-card-action">مشاهده نسخه مشتری <Icon name="arrow" /></span>
        </Link>

        <Link className="role-card business-role" href="/business">
          <span className="role-card-art business-art" aria-hidden="true">
            <span><Icon name="store" /></span><i /><i /><i />
          </span>
          <span className="role-card-copy">
            <small>برای مدیریت عملیات روزانه</small>
            <strong>ورود به پنل کسب‌وکار</strong>
            <span>پیشنهادها، موجودی، سفارش‌ها، تحویل، گزارش‌ها و امور مالی مجموعه را مدیریت کنید.</span>
          </span>
          <span className="role-card-action">مشاهده پنل کسب‌وکار <Icon name="arrow" /></span>
        </Link>
      </section>

      <footer className="role-footer"><Icon name="leaf" /> غذای خوب، قبل از دورریز.</footer>
    </main>
  );
}
