import type { ReactNode } from "react";

export type IconName =
  | "home" | "search" | "bag" | "user" | "pin" | "heart" | "arrow" | "spark"
  | "clock" | "star" | "sliders" | "list" | "map" | "close" | "minus" | "plus"
  | "check" | "leaf" | "calendar" | "route" | "bell" | "moon" | "sun" | "info"
  | "wifi" | "chevron" | "trash" | "store" | "share"
  | "grid" | "coffee" | "utensils" | "pizza" | "bread" | "cake" | "apple" | "cart";

const paths: Record<IconName, ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></>,
  search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
  bag: <><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
  pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
  heart: <path d="M20.5 9.5c0 5-8.5 10-8.5 10s-8.5-5-8.5-10a4.5 4.5 0 0 1 8.5-2.2 4.5 4.5 0 0 1 8.5 2.2Z"/>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  spark: <><path d="m12 2 1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4L12 2Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></>,
  clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>,
  sliders: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="5" cy="6" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="18" r="1"/></>,
  map: <><path d="m3.5 6 5-2 7 2 5-2v14l-5 2-7-2-5 2V6Z"/><path d="M8.5 4v14M15.5 6v14"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  minus: <path d="M5 12h14"/>,
  plus: <><path d="M5 12h14M12 5v14"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  leaf: <><path d="M19.5 4.5C11 4 5.5 8 5.5 14c0 3 2 5.5 5 5.5 6 0 9-6.5 9-15Z"/><path d="M5 20c2.5-5 6-8 11-11"/></>,
  calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="3"/><path d="M8 3v5M16 3v5M4 10h16"/></>,
  route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h2a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3"/></>,
  bell: <><path d="M6 10a6 6 0 0 1 12 0c0 7 2.5 7 2.5 7h-17S6 17 6 10Z"/><path d="M10 20h4"/></>,
  moon: <path d="M19 15.5A8.5 8.5 0 0 1 8.5 5 8.5 8.5 0 1 0 19 15.5Z"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
  wifi: <><path d="M3.5 9a13 13 0 0 1 17 0M6.5 12.5a8.5 8.5 0 0 1 11 0M9.7 16a3.7 3.7 0 0 1 4.6 0"/><circle cx="12" cy="19" r=".8" fill="currentColor" stroke="none"/></>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></>,
  store: <><path d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 3-2M9 20v-5h6v5"/></>,
  share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></>,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></>,
  coffee: <><path d="M5 8h11v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z"/><path d="M16 10h1a3 3 0 0 1 0 6h-2M8 4v2M12 4v2"/></>,
  utensils: <><path d="M7 3v7M4.5 3v4.5A2.5 2.5 0 0 0 7 10a2.5 2.5 0 0 0 2.5-2.5V3M7 10v11"/><path d="M16 3v18M16 3c3 2 3 7 0 9"/></>,
  pizza: <><path d="m12 3 9 18H3L12 3Z"/><path d="M7 13c3 1.5 7 1.5 10 0"/><circle cx="11" cy="10" r="1"/><circle cx="14" cy="16" r="1"/></>,
  bread: <><path d="M5 19c-2-1-2.5-4-.5-5.5C2.5 9 5 5 9 5c2-3 7-2 8 1 4 0 5 5 2 7 2 4-1 7-4 6H5Z"/><path d="m8 9 2 2M12 7l2 2M15 10l2 2"/></>,
  cake: <><path d="M5 10h14v10H5V10Z"/><path d="M4 10c2-3 4 1 6-2 2 3 4-1 6 2 1-2 3-1 4 0M12 4v4M10 4h4"/></>,
  apple: <><path d="M12 7c-5-4-9 0-8 6 1 5 4 8 8 6 4 2 7-1 8-6 1-6-3-10-8-6Z"/><path d="M12 7c0-3 2-5 5-5M12 7c-2-2-4-2-6-1"/></>,
  cart: <><path d="M3 4h2l2.2 10.5h9.8l2-7H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></>
};

export function Icon({ name, filled = false }: { name: IconName; filled?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}
