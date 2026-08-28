import { numberFa } from "@/lib/moft-format";
import type { CSSProperties } from "react";

/** Small, replayable digit emphasis for values that change after a user action. */
export function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const digits = numberFa(value);
  return <span className={`animated-number is-animating ${className}`} key={digits} aria-label={digits}>{[...digits].map((digit, index) => <span key={`${digit}-${index}`} style={{ "--digit-index": index } as CSSProperties}>{digit}</span>)}</span>;
}
