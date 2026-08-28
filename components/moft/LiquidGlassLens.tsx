/** A localized lens; text and icons are deliberately rendered above it. */
export function LiquidGlassLens({ className = "" }: { className?: string }) {
  return <span className={`liquid-glass-lens ${className}`} aria-hidden="true"><i /><b /></span>;
}
