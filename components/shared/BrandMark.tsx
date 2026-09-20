import Image from "next/image";
import Link from "next/link";

export function BrandMark({ href = "/", subtitle }: { href?: string; subtitle?: string }) {
  return (
    <Link
      className="inline-flex min-w-0 items-center gap-2.5 text-ink no-underline"
      href={href}
      aria-label="دیبز؛ بازگشت به انتخاب نوع ورود"
    >
      <span className="grid h-[42px] w-[42px] shrink-0 place-items-center">
        <Image src="/icons/dibz-ios-default-180-v2.png" alt="" width={42} height={42} className="h-full w-full object-contain" />
      </span>
      <span className="flex flex-col text-start">
        <strong className="text-xl font-black leading-tight text-ink">دیبز</strong>
        {subtitle && <small className="text-[0.68rem] text-muted whitespace-nowrap">{subtitle}</small>}
      </span>
    </Link>
  );
}
