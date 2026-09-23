"use client";

import type { SVGProps } from "react";

export type MascotKey =
  | "viuna"
  | "radio"
  | "khooshe"
  | "charcoal"
  | "green_fruit"
  | "mah"
  | "naranj"
  | "koocheh"
  | "sham_shahr"
  | "toranj"
  | "sofreh_shomal"
  | "mana"
  | "nan_ghahveh"
  | "rouzbeh"
  | "sobhaneh"
  | "aftab";

export function getMascotKey(name: string, category?: string): MascotKey {
  const n = (name || "").toLowerCase();
  if (n.includes("ویونا")) return "viuna";
  if (n.includes("رادیو")) return "radio";
  if (n.includes("خوشه")) return "khooshe";
  if (n.includes("ذغالی") || n.includes("برگر")) return "charcoal";
  if (n.includes("ماه")) return "mah";
  if (n.includes("نارنج")) return "naranj";
  if (n.includes("کوچه") || n.includes("پیتزا")) return "koocheh";
  if (n.includes("شام شهر") || n.includes("آشپزخانه")) return "sham_shahr";
  if (n.includes("ترنج")) return "toranj";
  if (n.includes("شمال")) return "sofreh_shomal";
  if (n.includes("مانا")) return "mana";
  if (n.includes("نان و قهوه")) return "nan_ghahveh";
  if (n.includes("روزبه")) return "rouzbeh";
  if (n.includes("صبحانه")) return "sobhaneh";
  if (n.includes("آفتاب")) return "aftab";
  if (n.includes("سبز") || n.includes("میوه")) return "green_fruit";

  switch (category) {
    case "cafe":
      return "viuna";
    case "bakery":
      return "khooshe";
    case "fast-food":
      return "charcoal";
    case "confectionery":
      return "mah";
    case "fruit":
      return "green_fruit";
    case "grocery":
      return "naranj";
    case "restaurant":
      return "sham_shahr";
    default:
      return "viuna";
  }
}

interface MascotTheme {
  bg: string;
  darkBg: string;
  border: string;
  render: (props: SVGProps<SVGSVGElement>) => React.ReactNode;
}

const MASCOT_CONFIG: Record<MascotKey, MascotTheme> = {
  // 1. کافه ویونا: Smiling Coffee Cup Mascot with Steam Heart
  viuna: {
    bg: "bg-[#fdf3e7]",
    darkBg: "dark:bg-[#2e2116]",
    border: "border-[#f1dfcc] dark:border-[#423122]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Steam */}
        <path d="M20 9C19 6 22 5 21 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
        <path d="M26 10C27 7 24 6 26 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        {/* Cup Body */}
        <rect x="11" y="14" width="22" height="22" rx="6" fill="#f59e0b" />
        <path d="M12 15C12 15 15 28 22 28C29 28 32 15 32 15" fill="#d97706" opacity="0.3" />
        {/* Handle */}
        <path d="M33 19H36C38.2 19 40 20.8 40 23C40 25.2 38.2 27 36 27H33" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
        {/* Saucer */}
        <ellipse cx="22" cy="38" rx="14" ry="2.5" fill="#b45309" opacity="0.3" />
        <rect x="9" y="37" width="26" height="3" rx="1.5" fill="#f59e0b" />
        {/* Cheerful Eyes */}
        <circle cx="17.5" cy="22" r="1.5" fill="#78350f" />
        <circle cx="26.5" cy="22" r="1.5" fill="#78350f" />
        {/* Blush */}
        <circle cx="14.5" cy="25" r="1.5" fill="#f43f5e" opacity="0.5" />
        <circle cx="29.5" cy="25" r="1.5" fill="#f43f5e" opacity="0.5" />
        {/* Smile */}
        <path d="M19.5 25C20.5 27 23.5 27 24.5 25" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 2. کافه رادیو: Vintage Radio Mascot with Antenna & Musical Notes
  radio: {
    bg: "bg-[#eaf4f7]",
    darkBg: "dark:bg-[#16272e]",
    border: "border-[#cee5ec] dark:border-[#213943]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Antenna */}
        <path d="M16 14L22 6" stroke="#0e7490" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="23" cy="5" r="2" fill="#0891b2" />
        {/* Radio Body */}
        <rect x="9" y="14" width="30" height="24" rx="6" fill="#0891b2" />
        <rect x="12" y="17" width="24" height="18" rx="4" fill="#cffafe" />
        {/* Big speaker circle acting as face */}
        <circle cx="20" cy="26" r="6" fill="#06b6d4" opacity="0.25" />
        {/* Eyes */}
        <circle cx="18" cy="25" r="1.4" fill="#0e7490" />
        <circle cx="23" cy="25" r="1.4" fill="#0e7490" />
        {/* Smile */}
        <path d="M19 28C20 29.5 22 29.5 23 28" stroke="#0e7490" strokeWidth="1.6" strokeLinecap="round" />
        {/* Knobs */}
        <circle cx="31" cy="22" r="2.5" fill="#0891b2" />
        <circle cx="31" cy="29" r="2.5" fill="#0891b2" />
      </svg>
    ),
  },

  // 3. نانوایی خوشه: Golden Wheat Bread Mascot with Baker Hat
  khooshe: {
    bg: "bg-[#fef7ea]",
    darkBg: "dark:bg-[#2c2214]",
    border: "border-[#f7e6ca] dark:border-[#42341f]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Baker Toque Hat */}
        <path d="M16 15C13 14 13 9 17 9C17 6 22 6 24 8C26 6 31 6 31 9C35 9 35 14 32 15Z" fill="#ffffff" />
        <rect x="17" y="14" width="14" height="3" rx="1" fill="#e5e7eb" />
        {/* Bread Bun Body */}
        <path d="M12 26C12 19 16 16 24 16C32 16 36 19 36 26C36 33 32 37 24 37C16 37 12 33 12 26Z" fill="#d97706" />
        {/* Crust cuts */}
        <path d="M17 21C18 20 20 20 21 21" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M27 21C28 20 30 20 31 21" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        {/* Eyes */}
        <path d="M19 26C19.5 25 21 25 21.5 26" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M26.5 26C27 25 28.5 25 29 26" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" />
        {/* Cheeks */}
        <circle cx="17.5" cy="28.5" r="1.5" fill="#f87171" opacity="0.6" />
        <circle cx="30.5" cy="28.5" r="1.5" fill="#f87171" opacity="0.6" />
        {/* Smile */}
        <path d="M21.5 29C22.5 31 25.5 31 26.5 29" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 4. برگر ذغالی: Sizzling Happy Burger Mascot
  charcoal: {
    bg: "bg-[#fef2f0]",
    darkBg: "dark:bg-[#2d1b18]",
    border: "border-[#fadad5] dark:border-[#452824]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Flame / spark on top */}
        <path d="M24 6C24 6 26 8.5 25 10C24 11 22 10 24 6Z" fill="#ef4444" />
        {/* Top Bun */}
        <path d="M11 20C11 14 17 11 24 11C31 11 37 14 37 20H11Z" fill="#f59e0b" />
        {/* Sesame seeds */}
        <ellipse cx="18" cy="15" rx="1" ry="0.6" fill="#fef3c7" transform="rotate(-15 18 15)" />
        <ellipse cx="24" cy="14" rx="1" ry="0.6" fill="#fef3c7" />
        <ellipse cx="30" cy="15" rx="1" ry="0.6" fill="#fef3c7" transform="rotate(15 30 15)" />
        {/* Lettuce wave */}
        <path d="M9 22C11 21 13 23 15 22C17 21 19 23 21 22C23 21 25 23 27 22C29 21 31 23 33 22C35 21 37 23 39 22V24H9V22Z" fill="#22c55e" />
        {/* Patty */}
        <rect x="10" y="24" width="28" height="5" rx="2.5" fill="#78350f" />
        {/* Melted Cheese drop */}
        <path d="M12 28L15 33L19 28H36V30H12V28Z" fill="#fbbf24" />
        {/* Bottom Bun */}
        <path d="M12 31H36C36 35 32 38 24 38C16 38 12 35 12 31Z" fill="#f59e0b" />
        {/* Happy Face on top bun */}
        <circle cx="19" cy="18" r="1.3" fill="#78350f" />
        <circle cx="29" cy="18" r="1.3" fill="#78350f" />
        <path d="M22 18.5C23 19.5 25 19.5 26 18.5" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },

  // 5. میوه‌فروشی سبز: Cheerful Fresh Green Pear / Apple Mascot
  green_fruit: {
    bg: "bg-[#edf8ee]",
    darkBg: "dark:bg-[#16291a]",
    border: "border-[#d0edd3] dark:border-[#223d28]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Leaf & stem */}
        <path d="M24 12V7" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 8C27 6 31 7 32 10C30 11 26 11 24 8Z" fill="#16a34a" />
        {/* Apple/Pear Body */}
        <path d="M24 15C21 13 13 14 13 23C13 32 19 38 24 38C29 38 35 32 35 23C35 14 27 13 24 15Z" fill="#22c55e" />
        {/* Shiny Highlight */}
        <ellipse cx="19" cy="20" rx="2" ry="4" fill="#86efac" opacity="0.6" transform="rotate(-20 19 20)" />
        {/* Eyes */}
        <circle cx="20" cy="24" r="1.5" fill="#14532d" />
        <circle cx="28" cy="24" r="1.5" fill="#14532d" />
        {/* Cheeks */}
        <circle cx="17.5" cy="27" r="1.5" fill="#f43f5e" opacity="0.4" />
        <circle cx="30.5" cy="27" r="1.5" fill="#f43f5e" opacity="0.4" />
        {/* Smile */}
        <path d="M22 28C23 29.5 25 29.5 26 28" stroke="#14532d" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },

  // 6. شیرینی‌سرای ماه: Crescent Moon Mascot with Pastry Spark
  mah: {
    bg: "bg-[#f8eff9]",
    darkBg: "dark:bg-[#2b182d]",
    border: "border-[#ecd4ee] dark:border-[#432347]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Sparkles */}
        <path d="M12 12L13 9L14 12L17 13L14 14L13 17L12 14L9 13Z" fill="#fbbf24" />
        {/* Crescent Moon Body */}
        <path d="M30 8C21 8 15 15 15 24C15 33 21 40 30 40C33 40 36 39 38 37C28 36 22 29 22 24C22 19 28 12 38 11C36 9 33 8 30 8Z" fill="#d946ef" />
        {/* Sleeping / Happy eye */}
        <path d="M22 22C23 21 25 21 26 22" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        {/* Blush */}
        <circle cx="21" cy="25" r="1.5" fill="#fbcfe8" />
        {/* Gentle smile */}
        <path d="M23 26C24 27.5 26 27.5 27 26" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },

  // 7. سوپرمارکت نارنج: Smiling Sunny Citrus Mascot
  naranj: {
    bg: "bg-[#fff3e6]",
    darkBg: "dark:bg-[#2e1d0f]",
    border: "border-[#fcdcc0] dark:border-[#442914]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Stem & Leaves */}
        <path d="M24 10V6" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 8C21 6 17 7 16 10C18 11 22 11 24 8Z" fill="#15803d" />
        <path d="M24 8C27 6 31 7 32 10C30 11 26 11 24 8Z" fill="#16a34a" />
        {/* Orange Body */}
        <circle cx="24" cy="25" r="14" fill="#f97316" />
        <ellipse cx="20" cy="18" rx="2" ry="4" fill="#fdba74" opacity="0.6" transform="rotate(-30 20 18)" />
        {/* Eyes */}
        <circle cx="19" cy="24" r="1.5" fill="#7c2d12" />
        <circle cx="29" cy="24" r="1.5" fill="#7c2d12" />
        {/* Blush */}
        <circle cx="16.5" cy="27" r="1.6" fill="#f43f5e" opacity="0.4" />
        <circle cx="31.5" cy="27" r="1.6" fill="#f43f5e" opacity="0.4" />
        {/* Big Smile */}
        <path d="M21 28C22.5 31 25.5 31 27 28" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 8. پیتزا کوچه: Happy Pizza Slice Mascot
  koocheh: {
    bg: "bg-[#fef2eb]",
    darkBg: "dark:bg-[#2d1b14]",
    border: "border-[#fadbd0] dark:border-[#43271d]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Pizza Crust */}
        <path d="M12 12C19 9 29 9 36 12C37 13 36 15 35 16C28 13 20 13 13 16C12 15 11 13 12 12Z" fill="#d97706" />
        {/* Cheese Body */}
        <path d="M13 16L24 38L35 16C28 14 20 14 13 16Z" fill="#fbbf24" />
        {/* Pepperoni dots */}
        <circle cx="24" cy="22" r="2.5" fill="#dc2626" />
        <circle cx="19" cy="30" r="2" fill="#dc2626" />
        <circle cx="28" cy="28" r="2" fill="#dc2626" />
        {/* Eyes */}
        <circle cx="21" cy="19" r="1.3" fill="#78350f" />
        <circle cx="27" cy="19" r="1.3" fill="#78350f" />
        {/* Smile */}
        <path d="M23 21C23.5 22 24.5 22 25 21" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },

  // 9. آشپزخانه شام شهر: Cozy Persian Pot Mascot with Steam
  sham_shahr: {
    bg: "bg-[#f7efe9]",
    darkBg: "dark:bg-[#2b1c15]",
    border: "border-[#edd8ce] dark:border-[#41291f]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Steam */}
        <path d="M21 7C20 5 22 4 21 2" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M27 8C28 6 26 5 27 3" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        {/* Pot Lid Handle */}
        <circle cx="24" cy="12" r="2" fill="#9a3412" />
        {/* Lid */}
        <path d="M14 16C17 14 31 14 34 16H14Z" fill="#c2410c" />
        {/* Pot Body */}
        <path d="M13 18H35L33 34C33 36 31 38 29 38H19C17 38 15 36 15 34L13 18Z" fill="#ea580c" />
        {/* Handles */}
        <path d="M11 20H13V24H11C10 24 9 23 9 22C9 21 10 20 11 20Z" fill="#9a3412" />
        <path d="M37 20H35V24H37C38 24 39 23 39 22C39 21 38 20 37 20Z" fill="#9a3412" />
        {/* Happy Face */}
        <circle cx="20" cy="26" r="1.4" fill="#ffffff" />
        <circle cx="28" cy="26" r="1.4" fill="#ffffff" />
        <path d="M22 29C23 31 25 31 26 29" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 10. قنادی ترنج: Paisley / Floral Confectionery Mascot
  toranj: {
    bg: "bg-[#f5effa]",
    darkBg: "dark:bg-[#25172e]",
    border: "border-[#e5d4f1] dark:border-[#3c224a]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Crown on top */}
        <path d="M20 10L22 13L24 9L26 13L28 10L27 15H21L20 10Z" fill="#fbbf24" />
        {/* Toranj Paisley Shape */}
        <path d="M24 14C17 14 13 20 13 27C13 34 18 38 24 38C30 38 35 34 35 27C35 18 27 15 24 14Z" fill="#9333ea" />
        <ellipse cx="20" cy="22" rx="2" ry="4" fill="#c084fc" opacity="0.6" transform="rotate(-20 20 22)" />
        {/* Eyes */}
        <circle cx="20" cy="26" r="1.5" fill="#ffffff" />
        <circle cx="28" cy="26" r="1.5" fill="#ffffff" />
        {/* Cheeks */}
        <circle cx="17.5" cy="29" r="1.5" fill="#f472b6" />
        <circle cx="30.5" cy="29" r="1.5" fill="#f472b6" />
        {/* Smile */}
        <path d="M22 30C23 31.5 25 31.5 26 30" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 11. سفره شمال: Sea Wave & Fish Mascot
  sofreh_shomal: {
    bg: "bg-[#ebf5f7]",
    darkBg: "dark:bg-[#15272d]",
    border: "border-[#cee6ec] dark:border-[#1e3b44]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Wave / Fish body */}
        <path d="M12 24C12 16 18 14 24 14C30 14 36 16 36 24C36 32 30 36 24 36C18 36 12 32 12 24Z" fill="#0284c7" />
        {/* Bandana */}
        <path d="M12 19C16 16 32 16 36 19L35 16C31 13 17 13 13 16L12 19Z" fill="#ef4444" />
        {/* Eyes */}
        <circle cx="20" cy="24" r="1.5" fill="#ffffff" />
        <circle cx="28" cy="24" r="1.5" fill="#ffffff" />
        {/* Cheeks */}
        <circle cx="17" cy="27" r="1.5" fill="#38bdf8" />
        <circle cx="31" cy="27" r="1.5" fill="#38bdf8" />
        {/* Smile */}
        <path d="M22 28C23 30 25 30 26 28" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 12. کافه مانا: Cool Cold Brew Bottle Mascot
  mana: {
    bg: "bg-[#f2eff9]",
    darkBg: "dark:bg-[#231a30]",
    border: "border-[#ded7f1] dark:border-[#38264e]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Straw */}
        <path d="M27 5L24 12" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
        {/* Cup Lid */}
        <rect x="15" y="12" width="18" height="3" rx="1.5" fill="#8b5cf6" />
        {/* Cup */}
        <path d="M16 15H32L30 37C30 38 29 39 28 39H20C19 39 18 38 18 37L16 15Z" fill="#a78bfa" />
        {/* Sunglasses */}
        <rect x="18" y="21" width="5" height="3.5" rx="1" fill="#1e1b4b" />
        <rect x="25" y="21" width="5" height="3.5" rx="1" fill="#1e1b4b" />
        <path d="M23 22H25" stroke="#1e1b4b" strokeWidth="1.2" />
        {/* Smirk */}
        <path d="M23 29C24 30 26 30 27 29" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },

  // 13. نان و قهوه: Baguette & Coffee Pals
  nan_ghahveh: {
    bg: "bg-[#fef4ea]",
    darkBg: "dark:bg-[#2f2214]",
    border: "border-[#f8dfc7] dark:border-[#45311c]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Baguette on left */}
        <rect x="12" y="12" width="10" height="24" rx="5" fill="#f59e0b" transform="rotate(-10 12 12)" />
        <line x1="13" y1="18" x2="18" y2="16" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="15" cy="22" r="1" fill="#78350f" />
        {/* Little Coffee cup on right */}
        <rect x="22" y="19" width="16" height="16" rx="4" fill="#b45309" />
        <path d="M38 23H40C41 23 42 24 42 25C42 26 41 27 40 27H38" stroke="#b45309" strokeWidth="2" />
        {/* Eyes on cup */}
        <circle cx="27" cy="26" r="1.2" fill="#fef3c7" />
        <circle cx="33" cy="26" r="1.2" fill="#fef3c7" />
        <path d="M29 29C30 30 31 30 32 29" stroke="#fef3c7" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },

  // 14. فروشگاه روزبه: Cheerful Fresh Grocery Bag Mascot
  rouzbeh: {
    bg: "bg-[#eef8f2]",
    darkBg: "dark:bg-[#152a1d]",
    border: "border-[#d0eedb] dark:border-[#20402b]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Green leaf sticking out */}
        <path d="M28 8C27 12 25 15 25 15C25 15 31 14 32 10C32 8 30 7 28 8Z" fill="#16a34a" />
        {/* Carrot top */}
        <path d="M19 10C17 12 16 15 16 15C16 15 21 14 21 11Z" fill="#ea580c" />
        {/* Paper bag */}
        <path d="M13 15H35L33 37H15L13 15Z" fill="#d97706" />
        <rect x="12" y="14" width="24" height="2" fill="#b45309" />
        {/* Eyes */}
        <circle cx="20" cy="24" r="1.4" fill="#451a03" />
        <circle cx="28" cy="24" r="1.4" fill="#451a03" />
        {/* Cheeks */}
        <circle cx="17" cy="26.5" r="1.4" fill="#f87171" opacity="0.6" />
        <circle cx="31" cy="26.5" r="1.4" fill="#f87171" opacity="0.6" />
        {/* Smile */}
        <path d="M22 28C23 30 25 30 26 28" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },

  // 15. صبحانه نو: Sunny-Side Egg on Toast Mascot
  sobhaneh: {
    bg: "bg-[#fff9e8]",
    darkBg: "dark:bg-[#302714]",
    border: "border-[#fceec4] dark:border-[#46391d]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Toast Slice */}
        <rect x="12" y="12" width="24" height="24" rx="4" fill="#d97706" />
        <rect x="14" y="14" width="20" height="20" rx="3" fill="#fef3c7" />
        {/* Egg White */}
        <path d="M24 16C19 16 16 19 17 24C18 28 21 31 26 31C30 31 32 27 31 22C30 18 27 16 24 16Z" fill="#ffffff" />
        {/* Egg Yolk Smiling */}
        <circle cx="24" cy="23" r="4.5" fill="#f59e0b" />
        {/* Eyes on yolk */}
        <circle cx="22.5" cy="22.5" r="0.7" fill="#78350f" />
        <circle cx="25.5" cy="22.5" r="0.7" fill="#78350f" />
        <path d="M23.5 24C24 24.6 24.5 24.6 25 24" stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 16. میوه‌خانه آفتاب: Cheerful Sun & Watermelon Mascot
  aftab: {
    bg: "bg-[#fef5e7]",
    darkBg: "dark:bg-[#302213]",
    border: "border-[#f9e0be] dark:border-[#46321b]",
    render: (props) => (
      <svg viewBox="0 0 48 48" fill="none" {...props}>
        {/* Sun rays */}
        <circle cx="24" cy="24" r="15" fill="#fde047" opacity="0.35" />
        {/* Sun face */}
        <circle cx="24" cy="24" r="11" fill="#f59e0b" />
        {/* Eyes */}
        <circle cx="20.5" cy="22" r="1.3" fill="#78350f" />
        <circle cx="27.5" cy="22" r="1.3" fill="#78350f" />
        {/* Watermelon smile */}
        <path d="M20 25C20 28 28 28 28 25H20Z" fill="#ef4444" />
        <path d="M20 25C20 28 28 28 28 25" stroke="#16a34a" strokeWidth="1" />
      </svg>
    ),
  },
};

export interface MerchantLogoProps {
  name: string;
  category?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
}

export function MerchantLogo({
  name,
  category,
  size = "md",
  className = "",
  alt,
}: MerchantLogoProps) {
  const key = getMascotKey(name, category);
  const config = MASCOT_CONFIG[key] || MASCOT_CONFIG.viuna;

  const sizeClasses = {
    xs: "w-6 h-6 rounded-lg",
    sm: "w-8 h-8 rounded-xl",
    md: "w-11 h-11 rounded-2xl",
    lg: "w-13 h-13 sm:w-14 sm:h-14 rounded-2xl",
    xl: "w-16 h-16 rounded-3xl",
  }[size];

  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 border shadow-2xs transition-transform ${config.bg} ${config.darkBg} ${config.border} ${sizeClasses} ${className}`}
      aria-label={alt || `نشان تجاری ${name}`}
      role="img"
    >
      {config.render({ className: "w-full h-full p-0.5 object-contain" })}
    </span>
  );
}
