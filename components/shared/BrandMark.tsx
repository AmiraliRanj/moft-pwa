import Image from "next/image";
import Link from "next/link";

export function BrandMark({ href = "/", subtitle }: { href?: string; subtitle?: string }) {
  return (
    <Link className="brand-mark" href={href} aria-label="Dibz؛ بازگشت به انتخاب نوع ورود">
      <span className="brand-mark-logo"><Image src="/dibz-logo.png" alt="" width={42} height={42} /></span>
      <span><strong>Dibz</strong>{subtitle && <small>{subtitle}</small>}</span>
    </Link>
  );
}
