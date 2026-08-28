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
        <BrandMark subtitle="غذای خوب، نزدیک تو" />
        <ThemeToggle compact />
      </header>

      <section className="role-hero" aria-labelledby="role-title">
        <p className="eyebrow">برای خودت یا کسب‌وکارت</p>
        <h1 id="role-title">دوست داری از کدوم سمت وارد دیبز بشی؟</h1>
        <p>دنبال یه پیشنهاد خوب می‌گردی یا می‌خوای کسب‌وکارت رو مدیریت کنی؟</p>
      </section>

      <section id="role-options" className="role-grid" aria-label="انتخاب نوع ورود">
        <Link className="role-card customer-role" href="/customer">
          <span className="role-card-art customer-art" aria-hidden="true">
            <span><Icon name="bag" /></span><i /><i /><i />
          </span>
          <span className="role-card-copy">
            <small>برای نجات یک وعده خوب</small>
            <strong>برای خودم</strong>
            <span>پیشنهادهای نزدیکت رو ببین، رزرو کن و حضوری تحویل بگیر.</span>
          </span>
          <span className="role-card-action">پیشنهادها رو ببین <Icon name="arrow" /></span>
        </Link>

        <Link className="role-card business-role" href="/business">
          <span className="role-card-art business-art" aria-hidden="true">
            <span><Icon name="store" /></span><i /><i /><i />
          </span>
          <span className="role-card-copy">
            <small>همه‌چی کسب‌وکارت، یه‌جا</small>
            <strong>برای کسب‌وکارم</strong>
            <span>پیشنهادها، سفارش‌ها و کارهای روزمره‌ات رو یه‌جا مدیریت کن.</span>
          </span>
          <span className="role-card-action">برو به پنل <Icon name="arrow" /></span>
        </Link>
      </section>

      <footer className="role-footer"><Icon name="leaf" /> انتخاب خوش‌طعم برای امروز.</footer>
    </main>
  );
}
