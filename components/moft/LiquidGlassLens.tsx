"use client";

import { useId } from "react";

/**
 * A small, isolated optical layer. It deliberately contains no text or controls:
 * crisp interactive content is rendered above it and scrolling surfaces remain
 * unfiltered for performance and readability.
 */
export function LiquidGlassLens({ className = "" }: { className?: string }) {
  const filterId = useId().replace(/:/g, "");

  return (
    <svg className={`liquid-glass-lens ${className}`} aria-hidden="true" focusable="false" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${filterId}-fill`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,.92)" />
          <stop offset=".46" stopColor="rgba(219,255,235,.56)" />
          <stop offset="1" stopColor="rgba(177,234,204,.68)" />
        </linearGradient>
        <filter id={filterId} x="-15%" y="-30%" width="130%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".016 .09" numOctaves="2" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id={`${filterId}-shine`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="white" stopOpacity=".76" />
          <stop offset=".38" stopColor="white" stopOpacity=".08" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="98" height="98" rx="24" fill={`url(#${filterId}-fill)`} filter={`url(#${filterId})`} />
      <rect x="2" y="2" width="96" height="96" rx="23" fill={`url(#${filterId}-shine)`} opacity=".74" />
    </svg>
  );
}
