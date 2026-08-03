import Image from "next/image";
import Link from "next/link";

export function BrandMark({ href = "/", subtitle, variant = "default" }: { href?: string; subtitle?: string; variant?: "default" | "business" }) {
  return (
    <Link className="brand-mark" href={href} aria-label="مفت؛ بازگشت به انتخاب نوع ورود">
      <span className="brand-mark-logo"><Image src={variant === "business" ? "/business-logo-mark.svg" : "/logo-mark.svg"} alt="" width={42} height={42} /></span>
      <span><strong>مفت</strong>{subtitle && <small>{subtitle}</small>}</span>
    </Link>
  );
}
