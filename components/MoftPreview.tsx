"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomNavigation } from "@/components/moft/BottomNavigation";
import { CategorySelector } from "@/components/moft/CategorySelector";
import { DialogShell } from "@/components/moft/DialogShell";
import { EmptyState } from "@/components/moft/EmptyState";
import { FoodImage } from "@/components/moft/FoodImage";
import { MerchantLogo } from "@/components/moft/MerchantLogo";
import { HomeHeroCarousel } from "@/components/moft/HomeHeroCarousel";
import { AnimatedNumber } from "@/components/moft/AnimatedNumber";
import { GlassSegmentedControl } from "@/components/glass/GlassSegmentedControl";
import { GlassToggle } from "@/components/glass/GlassToggle";
import { SuccessCheck } from "@/components/motion/SuccessCheck";
import { Icon, type IconName } from "@/components/moft/Icon";
import { OfferCard, OfferList } from "@/components/moft/OfferCard";
import { SearchBar } from "@/components/moft/SearchBar";
import { EndingSoonBannerCard } from "@/components/moft/EndingSoonBannerCard";
import { MerchantProfileModal } from "@/components/moft/MerchantProfileModal";
import { CartPipelinePage, type CartItem } from "@/components/moft/CartPipelinePage";
import { useMoftTheme } from "@/components/shared/ThemeToggle";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster, toast as toastManager } from "@/components/ui/toast";
import { useDemo } from "@/demo/DemoProvider";
import { remainingQuantity } from "@/lib/demo-format";
import { decimalFa, discountPercent, distanceFa, formatJalaliDate, formatMerchantWithCategory, formatPickupDate, money, moneyCompact, numberFa } from "@/lib/moft-format";
import type { MarketplaceOffer, Order } from "@/types/demo";
import type { AppTab, CategoryId, Offer, PickupPeriod, Reservation, ThemePreference } from "@/types/moft";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Layer = "detail" | "reserve" | "filters" | "location" | "about" | "cancel" | "review" | "merchant" | "receipt" | null;
type SortMode = "nearest" | "popular" | "discount";

const productCutoutByOffer: Record<string, string> = {
  "vienna-evening": "/images/products/dibz-dessert-box-cutout.png",
  "vienna-bread": "/images/products/dibz-bread-box-cutout.png",
  "vienna-brunch": "/images/products/dibz-sandwich-cutout.png",
  "vienna-cake": "/images/products/dibz-dessert-box-cutout.png",
  "radio-cafe": "/images/products/dibz-bakery-cutout.png",
  "khooshe-bakery": "/images/products/dibz-bread-box-cutout.png",
  "zoghali-burger": "/images/products/dibz-sandwich-cutout.png",
  "sabz-fruit": "/images/products/dibz-fruit-crate-cutout.png",
  "mah-pastry": "/images/products/dibz-dessert-box-cutout.png",
  "narenj-market": "/images/products/dibz-grocery-box-cutout.png",
  "mana-cafe": "/images/products/dibz-bakery-cutout.png",
  "kooche-pizza": "/images/products/dibz-pizza-cutout.png",
  "nan-ghahve": "/images/products/dibz-bread-box-cutout.png",
  "roozbeh-store": "/images/products/dibz-grocery-box-cutout.png",
  "sham-e-shahr": "/images/products/dibz-persian-meal-cutout.png",
  "toranj-pastry": "/images/products/dibz-dessert-box-cutout.png",
  "shomal-table": "/images/products/dibz-persian-meal-cutout.png",
  "aftab-fruit": "/images/products/dibz-fruit-crate-cutout.png",
  "sobhaneh-no": "/images/products/dibz-sandwich-cutout.png",
};

const storageKeys = {
  favorites: "moft-favorites-v2",
};

const faDigits = (value: string) => value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function customerOffer(offer: MarketplaceOffer): Offer {
  const dateLabel = offer.pickupPeriod === "tomorrow" ? "فردا" : "امروز";
  return {
    id: offer.id,
    merchantName: offer.merchantName,
    category: offer.category,
    categoryLabel: offer.categoryLabel,
    title: offer.title,
    description: offer.description,
    address: offer.address,
    neighborhood: offer.neighborhood,
    coordinates: offer.coordinates,
    distanceKm: offer.distanceKm,
    rating: offer.rating,
    reviewCount: offer.reviewCount,
    pickup: `${dateLabel}، ${faDigits(offer.pickupStart)} تا ${faDigits(offer.pickupEnd)}`,
    pickupPeriod: offer.pickupPeriod,
    quantityLeft: remainingQuantity(offer),
    originalPrice: offer.originalValue,
    price: offer.salePrice,
    allergens: offer.allergens,
    image: productCutoutByOffer[offer.id] ?? offer.image,
    endingSoon: offer.endingSoon,
    popular: offer.popular,
  };
}

function customerReservation(order: Order, offers: MarketplaceOffer[], reviews: import("@/types/demo").Review[]): Reservation {
  const offer = offers.find((item) => item.id === order.items[0].offerId);
  const review = reviews.find((item) => item.orderId === order.id);
  const status: Reservation["status"] =
    order.status === "completed"
      ? "collected"
      : ["cancelled", "refunded", "no_show"].includes(order.status)
      ? "cancelled"
      : "active";
  return {
    id: order.id,
    offerId: order.items[0].offerId,
    merchantName: offer?.merchantName ?? "کافه ویونا",
    category: offer?.category ?? "cafe",
    image: offer ? (productCutoutByOffer[offer.id] ?? offer.image) : "/images/offers/offer-01.webp",
    title: order.items[0].title,
    pickup: `${formatJalaliDate(order.pickupDate)}، ${faDigits(order.pickupStart)} تا ${faDigits(order.pickupEnd)}`,
    address: offer?.address ?? "شعبه انتخاب‌شده",
    code: faDigits(order.pickupCode.value),
    quantity: order.items[0].quantity,
    total: order.total,
    status,
    orderStatus: order.status,
    hasReview: Boolean(review),
    reviewResponse: review?.response,
    createdAt: order.createdAt,
    description: offer?.description ?? "بسته غافلگیرکننده با اقلام تازه روز",
    allergens: offer?.allergens ?? [],
    originalPrice: offer ? offer.originalValue * order.items[0].quantity : order.total,
  };
}

type MoftPreviewProps = {
  initialTab?: AppTab;
  initialFavoritesOnly?: boolean;
  initialOfferId?: string;
};

export default function MoftPreview({
  initialTab = "home",
  initialFavoritesOnly = false,
  initialOfferId,
}: MoftPreviewProps) {
  const { state, placeOrder, transitionOrder, submitReview } = useDemo();
  const [tab, setTab] = useState<AppTab>(initialTab);
  const [discoverMode, setDiscoverMode] = useState<"feed" | "map">("feed");
  const [previousTab, setPreviousTab] = useState<AppTab>("home");
  const [cartClosing, setCartClosing] = useState(false);
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const offers = useMemo(
    () => state.offers.filter((offer) => ["active", "sold_out"].includes(offer.status)).map(customerOffer),
    [state.offers]
  );
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const reservations = useMemo(
    () =>
      state.orders
        .filter((order) => order.customerId === state.customer.id)
        .map((order) => customerReservation(order, state.offers, state.reviews)),
    [state.customer.id, state.offers, state.orders, state.reviews]
  );
  const [selected, setSelected] = useState<Offer | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Offer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [layer, setLayer] = useState<Layer>(null);
  const [reservationStep, setReservationStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [successReservation, setSuccessReservation] = useState<Reservation | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [receiptReservation, setReceiptReservation] = useState<Reservation | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const [online, setOnline] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [islandVisible, setIslandVisible] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(300000);
  const [pickupFilter, setPickupFilter] = useState<"all" | PickupPeriod>("all");
  const [sort, setSort] = useState<SortMode>("nearest");
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavoritesOnly);
  const [location, setLocation] = useState("تهران، ونک");
  const [searchVisible, setSearchVisible] = useState(true);
  const [ordersSubTab, setOrdersSubTab] = useState<"active" | "history">("active");
  const lastScrollYRef = useRef(0);
  const isInputFocusedRef = useRef(false);
  const routeHandledRef = useRef(false);

  const showToast = useCallback((message: string, type?: "success" | "error" | "info" | "warning") => {
    toastManager.add({ title: message, type, timeout: 3400 });
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || document.documentElement.scrollTop;
          const diff = currentScrollY - lastScrollYRef.current;

          // Always reveal search bar when near the top of the page
          if (currentScrollY <= 20) {
            setSearchVisible(true);
          } else if (!isInputFocusedRef.current) {
            // Scrolling down past threshold -> hide search bar
            if (diff > 8 && currentScrollY > 60) {
              setSearchVisible(false);
            }
            // Scrolling up anywhere on the page -> show search bar
            else if (diff < -8) {
              setSearchVisible(true);
            }
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let savedFavorites: string[] | null = null;
    let invalidStorage = false;
    try {
      const favoritesJson = localStorage.getItem(storageKeys.favorites);
      if (favoritesJson) savedFavorites = JSON.parse(favoritesJson) as string[];
    } catch {
      invalidStorage = true;
    }

    const shortcut = new URLSearchParams(window.location.search).get("tab");
    const hydrateTimer = window.setTimeout(() => {
      if (savedFavorites) setFavorites(new Set(savedFavorites));
      if (invalidStorage) setStorageWarning(true);
      if (shortcut === "discover" || shortcut === "reservations") setTab(shortcut);
      setOnline(navigator.onLine);
      setInstalled(
        window.matchMedia("(display-mode: standalone)").matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
      );
    }, 0);

    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes("/cart")) {
        setTab("cart");
      } else if (path.includes("/orders") || path.includes("/reservations")) {
        setTab("orders");
      } else if (path.includes("/offers") || path.includes("/discover") || path.includes("/favorites")) {
        setTab("discover");
        setSearchVisible(true);
      } else if (path.includes("/profile")) {
        setTab("profile");
      } else {
        setTab("home");
        setSearchVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.clearTimeout(hydrateTimer);
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (routeHandledRef.current || !offers.length) return;
    routeHandledRef.current = true;
    if (!initialOfferId) return;
    const offer = offers.find((item) => item.id === initialOfferId);
    if (!offer) return;
    const timer = window.setTimeout(() => {
      setSelected(offer);
      setLayer("detail");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialOfferId, offers]);

  const activeReservations = reservations.filter((item) => item.status === "active");
  const pastReservations = useMemo(
    () => reservations.filter((item) => item.status !== "active"),
    [reservations]
  );
  const favoriteSet = favorites;

  const baseFilteredOffers = useMemo(() => {
    const normalized = query.trim();
    return offers.filter((offer) => {
      const categoryMatch = category === "all" || offer.category === category;
      const text = `${offer.merchantName} ${offer.title} ${offer.categoryLabel} ${offer.neighborhood}`;
      return categoryMatch && (!normalized || text.includes(normalized));
    });
  }, [category, offers, query]);

  const discoverOffers = useMemo(() => {
    const filtered = baseFilteredOffers.filter(
      (offer) =>
        offer.distanceKm <= maxDistance &&
        offer.price >= minPrice &&
        offer.price <= maxPrice &&
        (pickupFilter === "all" || offer.pickupPeriod === pickupFilter) &&
        (!favoritesOnly || favoriteSet.has(offer.id))
    );
    return [...filtered].sort((a, b) => {
      if (sort === "popular") return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sort === "discount") return discountPercent(b.originalPrice, b.price) - discountPercent(a.originalPrice, a.price);
      return a.distanceKm - b.distanceKm;
    });
  }, [baseFilteredOffers, favoriteSet, favoritesOnly, maxDistance, minPrice, maxPrice, pickupFilter, sort]);

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    const removing = next.has(id);
    if (removing) next.delete(id);
    else next.add(id);
    setFavorites(next);
    localStorage.setItem(storageKeys.favorites, JSON.stringify([...next]));
    showToast(removing ? "از علاقه‌مندی‌ها حذف شد." : "به علاقه‌مندی‌ها اضافه شد.");
  };

  const paths: Record<AppTab, string> = {
    home: "/customer",
    discover: "/customer/offers",
    orders: "/customer/orders",
    reservations: "/customer/orders",
    cart: "/customer/cart",
    profile: "/customer/profile",
  };

  const handleBackFromReservations = () => {
    if (cartClosing) return;
    setCartClosing(true);
    window.setTimeout(() => {
      const target = previousTab === "reservations" || previousTab === "orders" || previousTab === "cart" ? "home" : previousTab;
      setTab(target);
      setCartClosing(false);
      window.history.pushState({}, "", paths[target]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 240);
  };

  const toggleReservations = () => {
    if (tab === "cart") {
      switchTab(previousTab === "cart" ? "home" : previousTab);
    } else {
      switchTab("cart");
    }
  };

  const switchTab = (nextTab: AppTab) => {
    if (nextTab === tab) return;
    setPreviousTab(tab);
    setTab(nextTab);
    if (nextTab === "home" || nextTab === "discover") {
      setSearchVisible(true);
    }
    window.history.pushState({}, "", paths[nextTab]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openOffer = (offer: Offer) => {
    setSelected(offer);
    setLayer("detail");
    window.history.pushState({}, "", `/customer/offers/${encodeURIComponent(offer.id)}`);
  };

  const closeOffer = () => {
    setLayer(null);
    window.history.replaceState({}, "", paths[tab]);
  };

  const openMerchant = (offer: Offer) => {
    setSelectedMerchant(offer);
    setLayer("merchant");
  };

  const closeMerchant = () => {
    setLayer(null);
    setSelectedMerchant(null);
  };

  const openReservation = () => {
    if (!selected || selected.quantityLeft < 1) return;
    if (!online) {
      showToast("برای ثبت رزرو دوباره آنلاین شو.");
      return;
    }
    const existing = cartItems.find((item) => item.offer.id === selected.id);
    if (existing) {
      showToast("این بسته قبلاً به سبد خرید اضافه شده است.", "info");
      return;
    }

    setCartItems((prev) => [...prev, { offer: selected, quantity: 1 }]);
    showToast("به سبد خرید اضافه شد.", "success");
  };

  const handleDecrementFromCart = (offerId: string) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.offer.id === offerId);
      if (!found) return prev;
      showToast("از سبد خرید حذف شد.", "info");
      return prev.filter((item) => item.offer.id !== offerId);
    });
  };

  const handleUpdateCartQuantity = (offerId: string, q: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.offer.id === offerId ? { ...item, quantity: q } : item))
    );
  };

  const handleRemoveCartItem = (offerId: string) => {
    setCartItems((prev) => prev.filter((item) => item.offer.id !== offerId));
    showToast("آیتم از سبد خرید حذف شد.");
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast("سبد خرید خالی شد.");
  };

  const handleConfirmCartOrder = (items: CartItem[]) => {
    for (const item of items) {
      const result = placeOrder(item.offer.id, item.quantity);
      if (!result.ok) {
        showToast(result.error, "error");
      }
    }
    setCartItems([]);
  };

  const openReceipt = (reservation: Reservation) => {
    setReceiptReservation(reservation);
    setLayer("receipt");
  };

  const completeReservation = () => {
    if (!selected || confirming) return;
    setConfirming(true);
    window.setTimeout(() => {
      const result = placeOrder(selected.id, quantity);
      if (!result.ok) {
        setConfirming(false);
        showToast(result.error);
        return;
      }
      const reservation = customerReservation(result.value, result.state.offers, result.state.reviews);
      setSelected((current) =>
        current ? { ...current, quantityLeft: Math.max(0, current.quantityLeft - quantity) } : current
      );
      setSuccessReservation(reservation);
      setReservationStep(3);
      setConfirming(false);
      setIslandVisible(true);
      window.setTimeout(() => setIslandVisible(false), 4200);
    }, 950);
  };

  const requestCancel = (id: string) => {
    setCancelId(id);
    setLayer("cancel");
  };

  const confirmCancel = () => {
    if (!cancelId) return;
    const result = transitionOrder(cancelId, "cancelled");
    if (!result.ok) {
      showToast(result.error);
      setLayer(null);
      setCancelId(null);
      return;
    }
    setLayer(null);
    setCancelId(null);
    showToast("رزرو لغو و موجودی مجاز بازگردانده شد.");
  };

  const install = async () => {
    if (!installPrompt) {
      showToast("برای نصب، گزینهٔ «افزودن به صفحهٔ اصلی» مرورگر را بزن.");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      showToast("دیبز به دستگاهت اضافه شد.");
    }
    setInstallPrompt(null);
  };


  const requestReview = (id: string) => {
    setReviewOrderId(id);
    setLayer("review");
  };

  const savedMeals = reservations
    .filter((item) => item.status === "active" || item.status === "collected")
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans w-full max-w-full overflow-x-clip">
      <main className={`w-full max-w-full overflow-x-clip ${tab === "discover" && discoverMode === "map" ? "h-dvh max-h-dvh overflow-hidden pb-0 overscroll-none select-none" : "pb-28 sm:pb-32"}`}>
        <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 px-3 py-1 bg-surface text-ink rounded-lg border border-line"
        href="#main-content"
      >
        رفتن به محتوای اصلی
      </a>

      {/* Ambient background glows removed */}

      {!online && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 p-2.5 bg-rose-600 text-white text-xs font-semibold text-center" role="status">
          <Icon name="wifi" className="w-4 h-4" />
          <span>آفلاینی؛ پیشنهادهای ذخیره‌شده را می‌بینی، اما رزرو تازه ثبت نمی‌شود.</span>
        </div>
      )}

      {storageWarning && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium" role="alert">
          <span>اطلاعات محلی قبلی خوانده نشد و برنامه تازه‌سازی شد.</span>
          <button type="button" onClick={() => setStorageWarning(false)} aria-label="بستن هشدار">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {islandVisible && successReservation && (
        <div className="fixed top-4 inset-x-4 z-50 max-w-sm mx-auto flex items-center gap-3 p-3.5 rounded-2xl bg-surface border border-line shadow-float backdrop-blur-xl animate-bounce" role="status">
          <span className="w-8 h-8 rounded-full bg-brand-2 text-white grid place-items-center shrink-0">
            <Icon name="check" className="w-4 h-4" />
          </span>
          <div className="flex-1">
            <strong className="block text-xs font-bold text-ink">رزرو آماده شد</strong>
            <small className="block text-[11px] text-muted">کد دریافت {successReservation.code}</small>
          </div>
        </div>
      )}

      {/* Fixed/Sticky Top Header & Collapsible Search Bar */}
      <div className="sticky top-0 z-30 w-full bg-canvas/90 backdrop-blur-xl transition-shadow">
        <div className="max-w-md mx-auto px-4">
          <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-h-[56px] sm:min-h-[60px] py-3">
            <div className="flex items-center justify-start">
              {tab === "reservations" || tab === "orders" || tab === "cart" ? (
                <button
                  type="button"
                  onClick={handleBackFromReservations}
                  className="flex items-center justify-center min-h-[44px] min-w-[44px] w-11 h-11 rounded-2xl hover:bg-surface/80 active:scale-95 transition-all cursor-pointer text-ink hover:text-brand-2 -ms-1"
                  aria-label="بازگشت به صفحه قبلی"
                >
                  <Icon name="arrow" className="w-5 h-5 text-ink" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchTab("home")}
                  className="group flex items-center gap-2 min-h-[44px] min-w-[44px] -ms-1 p-1 rounded-2xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  aria-label="دیبز - صفحه اصلی"
                >
                  <span className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-xs border border-line/50 shrink-0 bg-brand-soft grid place-items-center">
                    <Image
                      src="/icons/dibz-ios-dark.png"
                      alt="لوگوی دیبز"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      priority
                    />
                  </span>
                  <strong className="hidden sm:inline-block font-black text-sm tracking-tight text-ink">
                    دیبز
                  </strong>
                </button>
              )}
            </div>

            {tab === "reservations" || tab === "orders" ? (
              <div className="flex flex-col items-center justify-center min-h-[44px]">
                <strong className="text-sm sm:text-base font-black text-ink tracking-tight">سفارش‌های من</strong>
                <div className="w-10 h-[3px] bg-brand-2 rounded-full mt-1.5" aria-hidden="true" />
              </div>
            ) : tab === "cart" ? (
              <div className="flex flex-col items-center justify-center min-h-[44px]">
                <strong className="text-sm sm:text-base font-black text-ink tracking-tight">پیگیری مراحل سفارش</strong>
                <div className="w-10 h-[3px] bg-brand-2 rounded-full mt-1.5" aria-hidden="true" />
              </div>
            ) : (
              <button
                className="group flex flex-col items-center justify-center min-h-[44px] px-3 py-1 bg-transparent hover:opacity-85 transition-all active:scale-[0.98] text-center cursor-pointer"
                type="button"
                onClick={() => setLayer("location")}
                aria-label={`تغییر موقعیت فعلی؛ ${location}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 text-brand-2 shrink-0 flex items-center justify-center">
                    <Icon name="pin" className="w-4.5 h-4.5" />
                  </span>
                  <strong className="text-sm sm:text-base font-black text-ink tracking-tight">{location}</strong>
                  <Icon name="chevron" className="w-4 h-4 text-muted rotate-90 opacity-80 group-hover:text-brand-2 transition-transform group-hover:translate-y-0.5" />
                </div>
                <div className="w-10 h-[3px] bg-brand-2 rounded-full mt-1.5 transition-all group-hover:w-14" aria-hidden="true" />
              </button>
            )}

            <div className="flex justify-end">
              {tab !== "reservations" && tab !== "orders" && tab !== "cart" ? (
                <button
                  className="relative w-11 h-11 rounded-2xl transition-all active:scale-95 cursor-pointer grid place-items-center bg-transparent text-ink hover:text-brand-2 hover:bg-surface/60"
                  type="button"
                  onClick={toggleReservations}
                  aria-label="سبد خرید و رزروها"
                >
                  <Icon name="cart" className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <b className="pointer-events-none absolute -top-0.5 -end-0.5 min-w-5 h-5 px-1 rounded-full bg-brand-2 text-white text-[11px] font-black grid place-items-center border-2 border-canvas shadow-xs">
                      {numberFa(cartItems.reduce((acc, it) => acc + it.quantity, 0))}
                    </b>
                  )}
                </button>
              ) : (
                <div className="w-11 h-11" aria-hidden="true" />
              )}
            </div>
          </header>

          {/* Collapsible Search Bar (only on home tab) */}
          {tab === "home" && (
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                searchVisible
                  ? "max-h-16 opacity-100 pb-3 translate-y-0"
                  : "max-h-0 opacity-0 pb-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="کافه، رستوران یا محله..."
                onFocus={() => {
                  isInputFocusedRef.current = true;
                  setSearchVisible(true);
                }}
                onBlur={() => {
                  isInputFocusedRef.current = false;
                }}
              />
            </div>
          )}

          {/* Fixed Sub-tab segmented control (orders/reservations tab) */}
          {(tab === "reservations" || tab === "orders") && (
            <div className="pb-3">
              <div className="flex items-center p-1 rounded-2xl bg-surface border border-line overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOrdersSubTab("active")}
                  className={`flex-1 min-w-0 min-h-[38px] rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate px-2 ${
                    ordersSubTab === "active"
                      ? "bg-brand-soft text-brand-2 font-black shadow-2xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  سفارش‌های جاری ({numberFa(activeReservations.length)})
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersSubTab("history")}
                  className={`flex-1 min-w-0 min-h-[38px] rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate px-2 ${
                    ordersSubTab === "history"
                      ? "bg-brand-soft text-brand-2 font-black shadow-2xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  تاریخچه ({numberFa(pastReservations.length)})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {tab === "discover" ? (
        <div
          id="main-content"
          tabIndex={-1}
          className={
            discoverMode === "map"
              ? "w-full h-[calc(100dvh-56px-64px)] sm:h-[calc(100vh-60px-70px)] relative overflow-hidden overscroll-none touch-none select-none"
              : "w-full min-h-full"
          }
        >
          <DiscoverPage
            offers={offers}
            favorites={favorites}
            onFavorite={toggleFavorite}
            onSelect={openOffer}
            showToast={showToast}
            onFilters={() => setLayer("filters")}
            mode={discoverMode}
            onModeChange={setDiscoverMode}
            searchVisible={searchVisible}
          />
        </div>
      ) : (
        <section className="w-full max-w-md mx-auto px-4 pt-3 space-y-4">
          <div id="main-content" tabIndex={-1} className="space-y-4">
            {tab === "home" && (
              <HomePage
                query={query}
                category={category}
                setCategory={setCategory}
                offers={discoverOffers}
                allOffers={offers}
                favorites={favorites}
                onFavorite={toggleFavorite}
                onSelect={openOffer}
                onOpenMerchant={openMerchant}
                onDiscover={() => switchTab("discover")}
                onFilters={() => setLayer("filters")}
                favoritesOnly={favoritesOnly}
                setFavoritesOnly={setFavoritesOnly}
                sort={sort}
                setSort={setSort}
              />
            )}
            {(tab === "orders" || tab === "reservations") && (
              <OrdersPage
                active={activeReservations}
                reservations={reservations}
                subTab={ordersSubTab}
                onCancel={requestCancel}
                onReview={requestReview}
                onReceipt={openReceipt}
                onDiscover={() => switchTab("discover")}
                onDirections={() => showToast("مسیریابی این فروشگاه اکنون در دسترس نیست.")}
                onTrackPipeline={() => switchTab("cart")}
              />
            )}
            {tab === "cart" && (
              <CartPipelinePage
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                onConfirmOrder={handleConfirmCartOrder}
                activeReservations={activeReservations}
                reservations={reservations}
                onTransitionOrder={(orderId, status) => {
                  transitionOrder(orderId, status);
                }}
                onDirections={() => showToast("مسیریابی این فروشگاه اکنون در دسترس نیست.")}
                onDiscover={() => switchTab("discover")}
                onGoToOrders={() => switchTab("orders")}
                showToast={showToast}
              />
            )}
            {tab === "profile" && (
              <ProfilePage
                savedMeals={savedMeals}
                favoriteOffers={offers.filter((offer) => favorites.has(offer.id))}
                reservations={reservations}
                notifications={notifications}
                setNotifications={setNotifications}
                installed={installed}
                onInstall={install}
                onOpenOffer={openOffer}
                onOpenMerchant={openMerchant}
                onAbout={() => setLayer("about")}
                showToast={showToast}
                onCancel={requestCancel}
                onReview={requestReview}
                onReceipt={openReceipt}
                onDirections={() => showToast("مسیریابی این فروشگاه اکنون در دسترس نیست.")}
              />
            )}
          </div>
        </section>
      )}
      </main>

      <BottomNavigation
        value={tab === "reservations" ? "orders" : tab}
        onChange={switchTab}
      />

      {/* Sheets & Dialogs */}
      {layer === "detail" && selected && (
        <OfferDetails
          offer={selected}
          favorite={favorites.has(selected.id)}
          onFavorite={toggleFavorite}
          onClose={closeOffer}
          onIncrement={openReservation}
          onDecrement={() => handleDecrementFromCart(selected.id)}
          inCartQuantity={cartItems.find((it) => it.offer.id === selected.id)?.quantity ?? 0}
          onOpenMerchant={openMerchant}
          related={offers.filter((offer) => offer.category === selected.category && offer.id !== selected.id).slice(0, 2)}
          onSelect={openOffer}
          favorites={favorites}
        />
      )}
      {layer === "reserve" && selected && (
        <ReservationFlow
          offer={selected}
          step={reservationStep}
          setStep={setReservationStep}
          quantity={quantity}
          setQuantity={setQuantity}
          confirming={confirming}
          onConfirm={completeReservation}
          success={successReservation}
          onClose={() => setLayer(null)}
          onDone={() => {
            setLayer(null);
            switchTab("reservations");
          }}
          onDirections={() => showToast("مسیریابی این فروشگاه اکنون در دسترس نیست.")}
          onCalendar={() => addToCalendar(successReservation, showToast)}
        />
      )}
      {layer === "filters" && (
        <FilterSheet
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          pickup={pickupFilter}
          setPickup={setPickupFilter}
          onReset={() => {
            setMaxDistance(10);
            setMinPrice(0);
            setMaxPrice(300000);
            setPickupFilter("all");
          }}
          onClose={() => setLayer(null)}
          resultCount={discoverOffers.length}
        />
      )}
      {layer === "location" && (
        <LocationSheet
          value={location}
          onChange={(value) => {
            setLocation(value);
            setLayer(null);
            showToast("موقعیت تغییر کرد.");
          }}
          onClose={() => setLayer(null)}
        />
      )}
      {layer === "about" && <AboutSheet onClose={() => setLayer(null)} />}
      {layer === "cancel" && <CancelDialog onClose={() => setLayer(null)} onConfirm={confirmCancel} />}
      {layer === "review" && reviewOrderId && (
        <ReviewDialog
          orderId={reviewOrderId}
          onClose={() => {
            setLayer(null);
            setReviewOrderId(null);
          }}
          onSubmit={(rating, comment) => {
            const result = submitReview(reviewOrderId, rating, comment);
            if (!result.ok) {
              showToast(result.error);
              return false;
            }
            showToast("نظرت ثبت شد و در پنل کیفیت کسب‌وکار دیده می‌شود.");
            setLayer(null);
            setReviewOrderId(null);
            return true;
          }}
        />
      )}
      {layer === "merchant" && selectedMerchant && (
        <MerchantProfileModal
          merchant={selectedMerchant}
          allOffers={offers}
          onClose={closeMerchant}
          onSelectOffer={openOffer}
          onDirections={() => showToast("مسیریابی این فروشگاه اکنون در دسترس نیست.")}
        />
      )}
      {layer === "receipt" && receiptReservation && (
        <OrderReceiptModal
          reservation={receiptReservation}
          onClose={() => {
            setLayer(null);
            setReceiptReservation(null);
          }}
        />
      )}
      <Toaster timeout={3400} limit={3} />
    </div>
  );
}

function HomePage({
  query,
  category,
  setCategory,
  offers,
  allOffers,
  favorites,
  onFavorite,
  onSelect,
  onOpenMerchant,
  onDiscover,
  onFilters,
  favoritesOnly,
  setFavoritesOnly,
  sort,
  setSort,
}: {
  query: string;
  category: CategoryId;
  setCategory: (value: CategoryId) => void;
  offers: Offer[];
  allOffers: Offer[];
  favorites: Set<string>;
  onFavorite: (id: string) => void;
  onSelect: (offer: Offer) => void;
  onOpenMerchant?: (offer: Offer) => void;
  onDiscover: () => void;
  onFilters: () => void;
  favoritesOnly: boolean;
  setFavoritesOnly: (value: boolean) => void;
  sort: SortMode;
  setSort: (value: SortMode) => void;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [sortOpen]);

  const sortOptions: Array<{ value: SortMode; label: string }> = [
    { value: "nearest", label: "نزدیک‌ترین" },
    { value: "popular", label: "محبوب‌ترین" },
    { value: "discount", label: "بیشترین تخفیف" },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label ?? "مرتب‌سازی";
  const browsing = Boolean(query.trim()) || category !== "all";
  const popular = Array.from(
    new Map(
      allOffers
        .filter((offer) => offer.popular)
        .map((offer) => [offer.merchantName, offer])
    ).values()
  ).slice(0, 8);
  const ending = allOffers.filter((offer) => offer.endingSoon).slice(0, 5);

  const filterBar = (
    <div className="flex items-center gap-2 py-0.5">
      {/* Filters Trigger Chip */}
      <button
        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-bold rounded-full bg-surface dark:bg-[#1f2621] border border-line/80 text-ink hover:text-brand-2 hover:bg-surface-raised transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
        type="button"
        onClick={onFilters}
        aria-label="فیلترها"
      >
        <Icon name="sliders" className="w-3.5 h-3.5 text-muted" />
        <span>فیلترها</span>
      </button>

      {/* Favorites Toggle Chip */}
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs rounded-full border transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0 ${
          favoritesOnly
            ? "bg-rose-500/10 text-rose-600 border-rose-500/30 font-black shadow-rose-500/5"
            : "bg-surface dark:bg-[#1f2621] border-line/80 text-ink hover:bg-surface-raised font-bold"
        }`}
        type="button"
        onClick={() => setFavoritesOnly(!favoritesOnly)}
        aria-pressed={favoritesOnly}
        aria-label="علاقه‌مندی‌ها"
      >
        <Icon name="heart" filled={favoritesOnly} className={`w-3.5 h-3.5 ${favoritesOnly ? "text-rose-500" : "text-muted"}`} />
        <span>علاقه‌مندی‌ها</span>
      </button>

      {/* Sleek Sort Dropdown Chip */}
      <div className="relative shrink-0" ref={sortRef}>
        <button
          type="button"
          onClick={() => setSortOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-bold rounded-full bg-surface dark:bg-[#1f2621] border border-line/80 text-ink hover:text-brand-2 hover:bg-surface-raised transition-all shadow-2xs cursor-pointer active:scale-95"
          aria-expanded={sortOpen}
          aria-haspopup="listbox"
          aria-label={`مرتب‌سازی: ${currentSortLabel}`}
        >
          <span>{currentSortLabel}</span>
          <Icon name="chevron" className={`w-3 h-3 text-muted transition-transform duration-200 ${sortOpen ? "-rotate-90" : "rotate-90"}`} />
        </button>

        {sortOpen && (
          <div className="absolute start-0 top-full mt-1.5 z-30 min-w-[140px] py-1 bg-surface dark:bg-[#1f2621] rounded-2xl border border-line shadow-lg backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSort(opt.value);
                  setSortOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-start transition-colors cursor-pointer ${
                  sort === opt.value
                    ? "text-brand-2 font-black bg-brand-soft/40 dark:bg-[#F87F45]/15"
                    : "text-ink hover:bg-canvas-soft font-semibold"
                }`}
              >
                <span>{opt.label}</span>
                {sort === opt.value && <Icon name="check" className="w-3.5 h-3.5 text-brand-2" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <CategorySelector value={category} onChange={setCategory} />

      <HomeHeroCarousel onDiscover={onDiscover} />

      {browsing ? (
        <section className="space-y-3" aria-labelledby="search-results-title">
          <div className="space-y-2">
            <SectionHeading title={`${numberFa(offers.length)} پیشنهاد پیدا شد`} id="search-results-title" />
            {filterBar}
          </div>
          {offers.length ? (
            <OfferList offers={offers} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} />
          ) : (
            <EmptyState title="این اطراف چیزی پیدا نشد" text="عبارت جست‌وجو یا دسته‌بندی را تغییر بده." />
          )}
        </section>
      ) : (
        <div className="space-y-6 sm:space-y-8 pt-2">
          <section className="space-y-3" aria-labelledby="near-title">
            <div className="space-y-2">
              <SectionHeading title="انتخاب‌های تازهٔ امروز" id="near-title" />
              {filterBar}
            </div>
            <OfferList offers={allOffers.slice(0, 4)} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} />
            <div className="pt-1">
              <button
                type="button"
                onClick={onDiscover}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] rounded-2xl bg-brand-2 hover:bg-brand-2/90 text-white text-xs font-black active:scale-[0.99] transition-all shadow-xs cursor-pointer"
              >
                <span>دیدن همه پیشنهادهای امروز</span>
                <Icon name="arrow" className="w-4 h-4 text-white rtl:rotate-180" />
              </button>
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="ending-title">
            <SectionHeading title="داره تموم می‌شه" id="ending-title" />
            <div className="flex items-stretch gap-3 overflow-x-auto py-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              <EndingSoonBannerCard onAction={onDiscover} />
              {ending.map((offer) => (
                <OfferCard compact key={offer.id} offer={offer} favorite={favorites.has(offer.id)} onFavorite={onFavorite} onSelect={onSelect} />
              ))}
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="popular-title">
            <SectionHeading title="همسایه‌های خوش‌سلیقه" id="popular-title" />
            <div
              className="flex items-start gap-3.5 sm:gap-4 overflow-x-auto py-2 px-1 scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              {popular.map((offer) => (
                <button
                  className="flex flex-col items-center gap-2 shrink-0 w-20 sm:w-22 group cursor-pointer focus-visible:outline-none select-none active:scale-95 transition-transform text-center"
                  type="button"
                  key={offer.id}
                  onClick={() => (onOpenMerchant ? onOpenMerchant(offer) : onSelect(offer))}
                  aria-label={`مشاهده پروفایل ${offer.merchantName}`}
                >
                  {/* Circular Profile Avatar */}
                  <div className="relative p-1 rounded-full bg-surface border-2 border-line/80 group-hover:border-brand-2 shadow-xs group-hover:shadow-sm transition-all flex items-center justify-center">
                    <MerchantLogo
                      name={offer.merchantName}
                      category={offer.category}
                      size="lg"
                      className="!rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-none"
                    />
                    {/* Star Rating Badge */}
                    <span className="absolute -bottom-1 inset-x-auto bg-surface border border-line text-[10px] font-black text-ink px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5">
                      <Icon name="star" filled className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                      <span>{decimalFa(offer.rating)}</span>
                    </span>
                  </div>

                  {/* Merchant Name & Neighborhood */}
                  <div className="w-full min-w-0">
                    <strong className="block text-xs font-bold text-ink truncate group-hover:text-brand-2 transition-colors leading-tight">
                      {offer.merchantName}
                    </strong>
                    <span className="block text-[10.5px] text-muted truncate mt-0.5">
                      {offer.neighborhood}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

function getCategoryIconName(category: CategoryId | string): IconName {
  switch (category) {
    case "cafe":
      return "coffee";
    case "restaurant":
      return "utensils";
    case "fast-food":
      return "pizza";
    case "bakery":
      return "bread";
    case "confectionery":
      return "cake";
    case "fruit":
      return "apple";
    case "grocery":
      return "store";
    default:
      return "utensils";
  }
}

type DiscoverMode = "feed" | "map";

function DiscoverPage({
  offers,
  favorites,
  onFavorite,
  onSelect,
  showToast,
  onFilters,
  mode = "feed",
  onModeChange,
  searchVisible = true,
}: {
  offers: Offer[];
  favorites: Set<string>;
  onFavorite: (id: string) => void;
  onSelect: (offer: Offer) => void;
  showToast: (msg: string) => void;
  onFilters?: () => void;
  mode: DiscoverMode;
  onModeChange: (mode: DiscoverMode) => void;
  searchVisible?: boolean;
}) {
  type SmartFilter = "all" | "hot" | "deadline" | "walk" | "tonight";
  const [smartFilter, setSmartFilter] = useState<SmartFilter>("all");
  const [walkRadius, setWalkRadius] = useState<number | null>(null);

  // Live countdown to today's evening pickup cutoff
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 1, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdownFormatted = `${faDigits(String(countdown.minutes).padStart(2, "0"))}:${faDigits(String(countdown.seconds).padStart(2, "0"))}`;

  // Deadline offers: items ending soon or low quantity left
  const deadlineOffers = useMemo(() => {
    return offers.filter((o) => o.endingSoon || o.quantityLeft <= 2 || o.pickupPeriod === "evening").slice(0, 5);
  }, [offers]);

  // Hot offers: high discount or popular
  const hotOffers = useMemo(() => {
    return [...offers]
      .filter((o) => discountPercent(o.originalPrice, o.price) >= 45 || o.popular)
      .sort((a, b) => discountPercent(b.originalPrice, b.price) - discountPercent(a.originalPrice, a.price))
      .slice(0, 5);
  }, [offers]);

  const topHotOffer = hotOffers[0] ?? offers[0];

  // Feed filtered offers
  const feedOffers = useMemo(() => {
    let list = offers;

    if (smartFilter === "hot") {
      list = list.filter((o) => discountPercent(o.originalPrice, o.price) >= 50 || o.popular);
    } else if (smartFilter === "deadline") {
      list = list.filter((o) => o.endingSoon || o.quantityLeft <= 2);
    } else if (smartFilter === "walk") {
      list = list.filter((o) => o.distanceKm <= 1.5);
    } else if (smartFilter === "tonight") {
      list = list.filter((o) => o.pickupPeriod === "evening" || o.pickupPeriod === "late");
    }

    if (walkRadius !== null) {
      list = list.filter((o) => o.distanceKm <= walkRadius);
    }

    return list;
  }, [offers, smartFilter, walkRadius]);

  const smartFilterOptions: Array<{ id: SmartFilter; label: string; icon: IconName }> = [
    { id: "all", label: "همه جعبه‌ها", icon: "grid" },
    { id: "hot", label: "شکار داغ", icon: "flame" },
    { id: "deadline", label: "مهلت فوری", icon: "clock" },
    { id: "walk", label: "نزدیک (پیاده)", icon: "pin" },
    { id: "tonight", label: "شیفت امشب", icon: "moon" },
  ];
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [peekIndex, setPeekIndex] = useState(0);
  const [zoom, setZoom] = useState(0.85);
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const touchDistRef = useRef<number | null>(null);

  const changeZoom = (delta: number) => {
    if (!mapScrollRef.current) return;
    const el = mapScrollRef.current;
    const currentCenterX = el.scrollLeft + el.clientWidth / 2;
    const currentCenterY = el.scrollTop + el.clientHeight / 2;
    const ratioX = el.scrollWidth > 0 ? currentCenterX / el.scrollWidth : 0.5;
    const ratioY = el.scrollHeight > 0 ? currentCenterY / el.scrollHeight : 0.5;

    setZoom((prev) => {
      // Zoom out to 0.3 allows seeing the entire city at a glance
      const next = Math.max(0.3, Math.min(2.0, Number((prev + delta).toFixed(2))));
      if (next === prev) return prev;

      window.requestAnimationFrame(() => {
        if (mapScrollRef.current) {
          const newEl = mapScrollRef.current;
          newEl.scrollLeft = ratioX * newEl.scrollWidth - newEl.clientWidth / 2;
          newEl.scrollTop = ratioY * newEl.scrollHeight - newEl.clientHeight / 2;
        }
      });
      return next;
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      // Trackpad pinch-to-zoom
      const delta = -e.deltaY * 0.006;
      changeZoom(delta);
    } else if (Math.abs(e.deltaY) > 10) {
      // Mouse wheel zoom
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      changeZoom(delta);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    } else {
      touchDistRef.current = null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const deltaDist = dist - touchDistRef.current;
      if (Math.abs(deltaDist) > 5) {
        const delta = deltaDist > 0 ? 0.05 : -0.05;
        changeZoom(delta);
        touchDistRef.current = dist;
      }
    }
  };

  const onTouchEnd = () => {
    touchDistRef.current = null;
  };

  const onDoubleClick = () => {
    if (zoom <= 0.45) {
      changeZoom(0.55);
    } else if (zoom >= 1.4) {
      changeZoom(-0.8);
    } else {
      changeZoom(0.35);
    }
  };

  useEffect(() => {
    if (mapScrollRef.current) {
      const el = mapScrollRef.current;
      // Vanak Square / User location is around 48% left, 52% top
      const x = el.scrollWidth * 0.48 - el.clientWidth / 2;
      const y = el.scrollHeight * 0.52 - el.clientHeight / 2;
      el.scrollLeft = Math.max(0, x);
      el.scrollTop = Math.max(0, y);
    }
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !mapScrollRef.current) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: mapScrollRef.current.scrollLeft,
      scrollTop: mapScrollRef.current.scrollTop,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !mapScrollRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    mapScrollRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    mapScrollRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  const scrollToUserLocation = () => {
    if (mapScrollRef.current) {
      const el = mapScrollRef.current;
      const x = el.scrollWidth * 0.48 - el.clientWidth / 2;
      const y = el.scrollHeight * 0.52 - el.clientHeight / 2;
      el.scrollTo({ left: x, top: y, behavior: "smooth" });
    }
    showToast("موقعیت شما روی ونک تنظیم شد.");
  };

  const quickCategories: Array<{ id: CategoryId; label: string }> = [
    { id: "all", label: "همه" },
    { id: "restaurant", label: "رستوران" },
    { id: "cafe", label: "کافه" },
    { id: "fast-food", label: "فست‌فود" },
    { id: "bakery", label: "نانوایی" },
    { id: "confectionery", label: "شیرینی" },
    { id: "fruit", label: "میوه" },
    { id: "grocery", label: "سوپرمارکت" },
  ];

  const mapOffers = useMemo(() => {
    const list = selectedCategory === "all" ? offers : offers.filter((o) => o.category === selectedCategory);
    // Deduplicate by merchant name so each restaurant has only one pin
    const seenMerchants = new Set<string>();
    const distinct: Offer[] = [];
    for (const o of list) {
      if (!seenMerchants.has(o.merchantName)) {
        seenMerchants.add(o.merchantName);
        distinct.push(o);
      }
    }
    // Lower frequency/density on the map: max 5 well-spaced spots across the city when "all", or 3-4 when filtered
    const maxCount = selectedCategory === "all" ? 5 : 4;
    return distinct.slice(0, maxCount);
  }, [offers, selectedCategory]);

  // Spaced coordinates for restaurants across Vanak, Jordan, Mirdamad & Vali Asr
  const pinCoordinates = [
    { top: "24%", left: "64%" }, // Mirdamad East
    { top: "35%", left: "26%" }, // Vali Asr North / Mollasadra
    { top: "52%", left: "70%" }, // Haghani East / Abo-o-Atash Park
    { top: "66%", left: "34%" }, // Vanak South / Shiraz
    { top: "78%", left: "56%" }, // Hemmat / Taleghani Park
  ];

  const currentPeekOffer = mapOffers.length > 0 ? mapOffers[peekIndex % mapOffers.length] : null;

  const cycleToNextOffer = () => {
    if (!mapOffers.length) return;
    const nextIndex = (peekIndex + 1) % mapOffers.length;
    setPeekIndex(nextIndex);
    const nextOffer = mapOffers[nextIndex];
    const pinIdx = offers.findIndex((o) => o.merchantName === nextOffer.merchantName);
    const coord = pinCoordinates[(pinIdx >= 0 ? pinIdx : nextIndex) % pinCoordinates.length];
    if (mapScrollRef.current && coord) {
      const topPct = parseFloat(coord.top) / 100;
      const leftPct = parseFloat(coord.left) / 100;
      const el = mapScrollRef.current;
      const x = el.scrollWidth * leftPct - el.clientWidth / 2;
      const y = el.scrollHeight * topPct - el.clientHeight / 2;
      el.scrollTo({ left: Math.max(0, x), top: Math.max(0, y), behavior: "smooth" });
    }
  };

  const activeOfferPacks = useMemo(() => {
    if (!activeOffer) return [];

    // Find all offers from the same merchant
    const sameMerchant = offers.filter((o) => o.merchantName === activeOffer.merchantName);
    if (sameMerchant.length > 1) {
      return sameMerchant;
    }

    // Generate 2-3 realistic pack options for this merchant so they are scrollable horizontally
    const base = activeOffer;
    const pack1: Offer = { ...base };
    const pack2: Offer = {
      ...base,
      title: base.title.includes("نان")
        ? "بسته عصرانه و شیرینی"
        : base.title.includes("میوه")
        ? "سبد میوه دستچین"
        : base.title.includes("برگر") || base.title.includes("پیتزا")
        ? "باکس میکس ویژه"
        : "باکس برانچ فردا",
      price: Math.round((base.price * 1.25) / 1000) * 1000,
      originalPrice: Math.round((base.originalPrice * 1.3) / 1000) * 1000,
      quantityLeft: Math.max(1, Math.min(base.quantityLeft, 2)),
      pickup: base.pickupPeriod === "tomorrow" ? "امروز، ۱۹:۳۰ تا ۲۱:۰۰" : "فردا، ۱۰:۰۰ تا ۱۲:۰۰",
    };
    const pack3: Offer = {
      ...base,
      title: "باکس سورپرایز اقتصادی",
      price: Math.max(49000, Math.round((base.price * 0.75) / 1000) * 1000),
      originalPrice: Math.round((base.originalPrice * 0.8) / 1000) * 1000,
      quantityLeft: 1,
      pickup: base.pickup,
    };

    return [pack1, pack2, pack3];
  }, [activeOffer, offers]);

  const totalPacks = useMemo(() => {
    return activeOfferPacks.reduce((sum, p) => sum + p.quantityLeft, 0);
  }, [activeOfferPacks]);

  return (
    <div className={`relative w-full ${mode === "map" ? "h-full overflow-hidden bg-[#edf1ed] dark:bg-[#161c18]" : "min-h-full"} flex flex-col`}>
      {/* Top Header Panel: View Switcher (Feed vs Map) and Category / Smart Filters */}
      <div className="w-full bg-canvas/95 backdrop-blur-xl border-b border-line shadow-2xs px-4 py-2 z-20 shrink-0 sticky top-[56px] sm:top-[60px]">
        <div className="max-w-md mx-auto">
          {/* Row 1: Segmented Switcher & Filter Button (collapsible on scroll like search bar) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              mode === "map" || searchVisible
                ? "max-h-16 opacity-100 mb-2 translate-y-0"
                : "max-h-0 opacity-0 mb-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex-1 flex items-center p-1 rounded-2xl bg-surface border border-line shadow-2xs">
                <button
                  type="button"
                  onClick={() => onModeChange("feed")}
                  className={`flex-1 min-h-[38px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    mode === "feed"
                      ? "bg-brand-soft text-brand-2 font-black shadow-2xs"
                      : "text-muted hover:text-ink"
                  }`}
                  aria-pressed={mode === "feed"}
                >
                  <Icon name="spark" className="w-4 h-4" />
                  <span>ویترین کشف</span>
                </button>

                <button
                  type="button"
                  onClick={() => onModeChange("map")}
                  className={`flex-1 min-h-[38px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    mode === "map"
                      ? "bg-brand-soft text-brand-2 font-black shadow-2xs"
                      : "text-muted hover:text-ink"
                  }`}
                  aria-pressed={mode === "map"}
                >
                  <Icon name="map" className="w-4 h-4" />
                  <span>روی نقشه</span>
                </button>
              </div>

              {onFilters && (
                <button
                  type="button"
                  onClick={onFilters}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-surface border border-line flex items-center justify-center text-ink hover:text-brand-2 hover:bg-surface-raised active:scale-95 transition-all shadow-2xs cursor-pointer"
                  aria-label="فیلترهای پیشرفته"
                >
                  <Icon name="sliders" className="w-4 h-4 text-brand-2" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: In Map Mode -> Category Chips; In Feed Mode -> Smart Filter Chips */}
          {mode === "map" ? (
            <div
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5"
              style={{ scrollbarWidth: "none" }}
            >
              {quickCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1 min-h-[32px] rounded-full text-[11px] font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer active:scale-95 border ${
                    selectedCategory === cat.id
                      ? "bg-ink text-canvas border-ink shadow-xs"
                      : "bg-surface text-ink border-line hover:bg-surface-raised"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5"
              style={{ scrollbarWidth: "none" }}
            >
              {smartFilterOptions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSmartFilter(f.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 min-h-[32px] rounded-full text-[11px] font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer active:scale-95 border ${
                    smartFilter === f.id
                      ? "bg-ink text-canvas border-ink shadow-xs"
                      : "bg-surface text-ink border-line hover:bg-surface-raised"
                  }`}
                >
                  <Icon name={f.icon} className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {mode === "map" ? (
        /* Map Area: ONLY the map is scrollable and pannable */
        <div className="relative flex-1 w-full overflow-hidden">
        {/* Scrollable / Draggable Map Canvas Container */}
        <div
          ref={mapScrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onWheel={onWheel}
          className="absolute inset-0 overflow-auto scrollbar-none select-none cursor-grab active:cursor-grabbing flex"
          style={{ touchAction: "pan-x pan-y", WebkitOverflowScrolling: "touch" }}
        >
          <div
            className="relative shrink-0 transition-all duration-200 ease-out origin-center m-auto"
            style={{
              width: `${Math.round(1100 * zoom)}px`,
              height: `${Math.round(1200 * zoom)}px`,
            }}
            onClick={() => setActiveOffer(null)}
            onDoubleClick={onDoubleClick}
          >
            {/* SVG Imaginary Map Vector Canvas (Google Maps & Fresha inspired) */}
            <svg
              className="absolute inset-0 w-full h-full object-cover"
              viewBox="0 0 800 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <pattern id="city-blocks" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect width="56" height="56" rx="4" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-line/40 dark:text-line/20" />
                </pattern>
              </defs>

              {/* Background Street Grid & City Blocks */}
              <rect width="100%" height="100%" fill="#f4f6f4" className="dark:fill-[#1D1E21]" />
              <rect width="100%" height="100%" fill="url(#city-blocks)" />

              {/* Green Park Zones (Mellat, Abo-Atash, Taleghani) */}
              <path
                d="M 50 100 C 130 80, 180 200, 130 320 C 80 400, 30 280, 50 100 Z"
                className="fill-emerald-500/25 dark:fill-emerald-500/15"
              />
              <text x="85" y="210" className="text-[13px] fill-emerald-800/70 dark:fill-emerald-400/60 font-black" transform="rotate(-15 85 210)">
                بوستان ملت
              </text>

              {/* Abo-o-Atash Park */}
              <path
                d="M 570 410 C 690 370, 770 510, 690 630 C 610 690, 530 530, 570 410 Z"
                className="fill-emerald-500/25 dark:fill-emerald-500/15"
              />
              <text x="615" y="510" className="text-[13px] fill-emerald-800/70 dark:fill-emerald-400/60 font-black" transform="rotate(10 615 510)">
                پارک آب‌و‌آتش
              </text>

              {/* Taleghani Forest Park */}
              <path
                d="M 270 710 C 380 680, 450 790, 370 880 C 290 920, 230 810, 270 710 Z"
                className="fill-emerald-500/20 dark:fill-emerald-500/15"
              />
              <text x="300" y="790" className="text-[13px] fill-emerald-800/60 dark:fill-emerald-400/50 font-black">
                بوستان طالقانی
              </text>

              {/* Mirdamad Canal (Waterway Feature) */}
              <path
                d="M 0 370 Q 400 375 800 370"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-sky-300/40 dark:text-sky-600/30"
              />

              {/* Road Network - Google Maps Arterial Styling */}
              {/* Vali Asr Avenue (خیابان ولی‌عصر) */}
              <path d="M 210 0 L 250 400 L 310 1000" fill="none" stroke="currentColor" strokeWidth="32" className="text-white dark:text-[#252f28]" />
              <path d="M 210 0 L 250 400 L 310 1000" fill="none" stroke="currentColor" strokeWidth="20" className="text-[#edf2ee] dark:text-[#323f36]" />
              <text x="235" y="240" className="text-[12px] fill-muted/80 font-black" transform="rotate(76 235 240)">
                خیابان ولی‌عصر (عج)
              </text>

              {/* Nelson Mandela Boulevard / Jordan */}
              <path d="M 440 40 L 460 520 L 480 960" fill="none" stroke="currentColor" strokeWidth="26" className="text-white dark:text-[#252f28]" />
              <path d="M 440 40 L 460 520 L 480 960" fill="none" stroke="currentColor" strokeWidth="16" className="text-[#edf2ee] dark:text-[#323f36]" />
              <text x="445" y="320" className="text-[12px] fill-muted/80 font-black" transform="rotate(84 445 320)">
                بلوار نلسون ماندلا (جردن)
              </text>

              {/* Mirdamad Boulevard */}
              <path d="M 0 350 L 800 350" fill="none" stroke="currentColor" strokeWidth="28" className="text-white dark:text-[#252f28]" />
              <path d="M 0 350 L 800 350" fill="none" stroke="currentColor" strokeWidth="18" className="text-[#fef3d6] dark:text-[#383324]" />
              <text x="350" y="345" className="text-[12px] fill-muted/80 font-black">
                بلوار میرداماد
              </text>

              {/* Haghani Highway (بزرگراه شهید حقانی) */}
              <path d="M 110 530 Q 400 510 800 650" fill="none" stroke="currentColor" strokeWidth="34" className="text-white dark:text-[#252f28]" />
              <path d="M 110 530 Q 400 510 800 650" fill="none" stroke="currentColor" strokeWidth="22" className="text-[#fef3d6] dark:text-[#3c3624]" />
              <text x="480" y="570" className="text-[12px] fill-muted/80 font-black" transform="rotate(12 480 570)">
                بزرگراه شهید حقانی
              </text>

              {/* Tabiat Bridge (پل طبیعت) across Haghani */}
              <path d="M 590 535 L 610 575" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-amber-600/70" />
              <text x="618" y="555" className="text-[10px] fill-amber-700 dark:fill-amber-400 font-black">
                پل طبیعت
              </text>

              {/* Mollasadra Street */}
              <path d="M 0 530 L 270 520" fill="none" stroke="currentColor" strokeWidth="24" className="text-white dark:text-[#252f28]" />
              <path d="M 0 530 L 270 520" fill="none" stroke="currentColor" strokeWidth="14" className="text-[#edf2ee] dark:text-[#323f36]" />
              <text x="110" y="515" className="text-[11px] fill-muted/80 font-black">
                خیابان ملاصدرا
              </text>

              {/* Hemmat Highway */}
              <path d="M 0 780 L 800 780" fill="none" stroke="currentColor" strokeWidth="32" className="text-white dark:text-[#252f28]" />
              <path d="M 0 780 L 800 780" fill="none" stroke="currentColor" strokeWidth="22" className="text-[#fef3d6] dark:text-[#3c3624]" />
              <text x="500" y="775" className="text-[12px] fill-muted/80 font-black">
                بزرگراه شهید همت
              </text>

              {/* Vanak Square Rotary */}
              <circle cx="260" cy="525" r="34" fill="none" stroke="currentColor" strokeWidth="20" className="text-white dark:text-[#252f28]" />
              <circle cx="260" cy="525" r="34" fill="none" stroke="currentColor" strokeWidth="12" className="text-[#edf2ee] dark:text-[#323f36]" />
              <circle cx="260" cy="525" r="20" className="fill-emerald-500/30" />
              <text x="260" y="529" textAnchor="middle" className="text-[11px] fill-ink font-black">
                میدان ونک
              </text>

              {/* Metro Stations Icons */}
              <g transform="translate(680, 580)">
                <circle cx="10" cy="10" r="10" className="fill-blue-500 shadow-sm" />
                <text x="10" y="14" textAnchor="middle" fill="#ffffff" className="text-[10px] font-black">M</text>
                <text x="25" y="14" className="text-[10px] fill-muted font-bold">مترو حقانی</text>
              </g>
              <g transform="translate(620, 320)">
                <circle cx="10" cy="10" r="10" className="fill-blue-500 shadow-sm" />
                <text x="10" y="14" textAnchor="middle" fill="#ffffff" className="text-[10px] font-black">M</text>
                <text x="25" y="14" className="text-[10px] fill-muted font-bold">مترو میرداماد</text>
              </g>
            </svg>

            {/* User Location Radar Marker */}
            <div
              className="absolute z-10 flex flex-col items-center pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ top: "52%", left: "48%" }}
            >
              <span className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-sky-500 border-2 border-white shadow-md"></span>
              </span>
              <span className="mt-1 px-2 py-0.5 rounded-full bg-surface/90 backdrop-blur-xs text-[9px] font-black text-ink border border-line shadow-xs">
                موقعیت شما
              </span>
            </div>

            {/* Restaurant Marker Pins: Circular Restaurant Logo pin, title card with category icon above location when selected */}
            {mapOffers.map((offer, index) => {
              const coords = pinCoordinates[index % pinCoordinates.length];
              const isSelected = activeOffer?.id === offer.id;
              const iconName = getCategoryIconName(offer.category);

              return (
                <div
                  key={offer.id}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: coords.top, left: coords.left }}
                >
                  {/* Selected State: Title card above location with category icon, restaurant name and available packs (NO background behind title/badge!) */}
                  {isSelected && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/95 dark:bg-[#1D1E21]/95 backdrop-blur-md border border-line shadow-lg text-start whitespace-nowrap">
                        <Icon name={iconName} className="w-4 h-4 text-brand-2 shrink-0" />
                        <strong className="text-xs font-black text-ink">
                          {formatMerchantWithCategory(offer.merchantName, offer.categoryLabel)}
                        </strong>
                        <span className="text-[11px] font-bold text-brand-2 dark:text-[#FDA74D]">
                          • {numberFa(offer.quantityLeft)} بسته موجود
                        </span>
                      </div>
                      {/* Pointer triangle pointing down to pin */}
                      <span
                        className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-surface -mt-[1px] drop-shadow-xs"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  {/* Location Marker Pin: Circular Restaurant/Cafe Logo */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveOffer(offer);
                    }}
                    className={`pointer-events-auto relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 focus:outline-none ${
                      isSelected
                        ? "bg-surface ring-3 ring-brand-2 shadow-xl scale-115 z-30"
                        : "bg-surface border-2 border-white dark:border-[#2D2F35] shadow-md hover:shadow-lg hover:scale-110"
                    }`}
                    aria-label={`انتخاب ${offer.merchantName} - ${numberFa(offer.quantityLeft)} بسته موجود`}
                  >
                    <MerchantLogo
                      name={offer.merchantName}
                      category={offer.category}
                      size="sm"
                      className="rounded-full shadow-none border-0"
                    />
                    {/* Pointer tip at bottom of circle */}
                    <span
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
                        isSelected
                          ? "bg-brand-2 border-brand-2"
                          : "bg-surface border-line/70"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Floating Bar: Action buttons on Right, Nearest Box Preview Card on Left */}
        <div
          className={`absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 max-w-lg mx-auto z-30 flex items-end justify-between gap-2.5 pointer-events-none transition-all duration-300 ${
            activeOffer ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
        >
          {/* Right side (start in RTL): The 2 Green Action Buttons */}
          <div className="flex flex-col items-end gap-2 shrink-0 pointer-events-auto">
            {/* My Location Button (Above) */}
            <button
              type="button"
              onClick={scrollToUserLocation}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[#14532d] hover:bg-[#0f3d21] text-white shadow-lg flex items-center justify-center border border-white/10 active:scale-90 transition-all cursor-pointer"
              aria-label="موقعیت من"
            >
              <Icon name="pin" className="w-5 h-5 text-white" />
            </button>

            {/* Nearest Box Cycle Button (Below) */}
            <button
              type="button"
              onClick={cycleToNextOffer}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[#14532d] hover:bg-[#0f3d21] text-white shadow-lg flex items-center justify-center border border-white/10 active:scale-90 transition-all cursor-pointer"
              aria-label="جعبه بعدی روی نقشه"
            >
              <Icon name="spark" className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Left side (end in RTL): Nearest Box Preview Card */}
          {currentPeekOffer ? (
            <button
              type="button"
              onClick={() => setActiveOffer(currentPeekOffer)}
              className="pointer-events-auto flex-1 min-w-0 flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-surface/95 dark:bg-[#1D1E21]/95 backdrop-blur-xl border border-line shadow-lg hover:shadow-xl hover:border-brand-2/40 transition-all text-start cursor-pointer active:scale-[0.98] group"
              aria-label={`مشاهده ${currentPeekOffer.title} از ${currentPeekOffer.merchantName}`}
            >
              {/* Store / Food Image Thumbnail */}
              <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden bg-canvas shrink-0 shadow-2xs border border-line/40">
                <FoodImage
                  src={currentPeekOffer.image}
                  sizes="56px"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {currentPeekOffer.quantityLeft > 0 && currentPeekOffer.quantityLeft <= 3 && (
                  <span className="absolute bottom-0.5 start-0.5 px-1 py-0.2 rounded text-[8px] font-black bg-black/75 text-white">
                    {numberFa(currentPeekOffer.quantityLeft)} عدد
                  </span>
                )}
              </div>

              {/* Info Column */}
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-black text-ink truncate leading-tight">
                    {currentPeekOffer.merchantName}
                  </h3>
                  {mapOffers.length > 1 && (
                    <span className="text-[10px] font-bold text-muted/70 shrink-0">
                      {numberFa(peekIndex + 1)}/{numberFa(mapOffers.length)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-muted truncate mt-0.5">
                  <span className="truncate">{currentPeekOffer.pickup}</span>
                  <span className="text-muted/40">•</span>
                  <span className="shrink-0">{distanceFa(currentPeekOffer.distanceKm)}</span>
                </div>

                {/* Price & Discount */}
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <strong className="text-xs font-black text-ink">
                    {moneyCompact(currentPeekOffer.price)}
                  </strong>
                  {currentPeekOffer.originalPrice > currentPeekOffer.price && (
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded-md">
                      {numberFa(discountPercent(currentPeekOffer.originalPrice, currentPeekOffer.price))}٪ تخفیف
                    </span>
                  )}
                </div>
              </div>

              {/* Chevron open indicator */}
              <span className="w-7 h-7 rounded-full bg-brand-soft/80 text-brand-2 flex items-center justify-center shrink-0 group-hover:bg-brand-2 group-hover:text-white transition-colors">
                <Icon name="chevron" className="w-3.5 h-3.5 rtl:rotate-180" />
              </span>
            </button>
          ) : (
            <div className="pointer-events-auto flex-1 min-w-0 flex items-center gap-2 p-2.5 rounded-2xl bg-surface/95 dark:bg-[#1D1E21]/95 backdrop-blur-xl border border-line shadow-lg text-xs text-muted">
              <Icon name="info" className="w-4 h-4 text-brand-2 shrink-0" />
              <span className="truncate">جعبه‌ای در این دسته‌بندی نیست</span>
            </div>
          )}
        </div>

        {/* Slide-Up Popup from Bottom: Overlays the Bottom Navigation bar with fixed z-50 */}
        {activeOffer && (
          <div
            className="fixed bottom-0 inset-x-0 sm:inset-x-4 sm:bottom-3 max-w-lg mx-auto z-50 transition-all duration-300 ease-out transform translate-y-0 opacity-100 pointer-events-auto"
          >
            <div className="relative bg-surface dark:bg-[#1D1E21] rounded-t-3xl sm:rounded-3xl border-t sm:border border-line shadow-2xl p-3.5 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4 space-y-3">
              {/* Header with Restaurant Name, Address, pack count, distance and close button */}
              <div className="pb-2.5 border-b border-line/40 space-y-1.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1 flex items-center gap-2.5">
                    <MerchantLogo
                      name={activeOffer.merchantName}
                      category={activeOffer.category}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm sm:text-base font-black text-ink leading-snug truncate">
                        {formatMerchantWithCategory(activeOffer.merchantName, activeOffer.categoryLabel)}
                      </h2>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted font-medium mt-0.5">
                        <Icon name="pin" className="w-3.5 h-3.5 text-brand-2 shrink-0" />
                        <span className="truncate">{activeOffer.address}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveOffer(null)}
                    className="min-w-[44px] min-h-[44px] w-11 h-11 -me-2 -mt-1 rounded-full hover:bg-canvas text-muted hover:text-ink grid place-items-center transition-colors cursor-pointer active:scale-90 shrink-0"
                    aria-label="بستن پیش‌نمایش فروشگاه"
                  >
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-black text-brand-2 dark:text-[#FDA74D] bg-[#F87F45]/15 px-2.5 py-0.5 rounded-full shrink-0">
                    {numberFa(totalPacks)} بسته موجود
                  </span>
                  <span className="text-[11px] font-bold text-muted truncate">
                    • حدود {numberFa(Math.round(activeOffer.distanceKm * 1000))} متر تا شما
                  </span>
                </div>
              </div>

              {/* Pack Options: Horizontally scrollable container */}
              <div
                className="flex items-stretch gap-3 overflow-x-auto snap-x scrollbar-none py-1 -mx-1 px-1"
                style={{ scrollbarWidth: "none" }}
              >
                {activeOfferPacks.map((pack, pIndex) => {
                  const discount =
                    pack.originalPrice > pack.price
                      ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
                      : 0;

                  return (
                    <div
                      key={`${pack.id}-${pack.title}-${pIndex}`}
                      className="w-[285px] sm:w-[320px] shrink-0 snap-center rounded-2xl bg-canvas/60 dark:bg-canvas/40 border border-line p-3.5 flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      {/* Top: Photo on right and Info on left (in RTL) */}
                      <div className="flex items-center gap-3">
                        {/* Photo Thumbnail */}
                        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-canvas border border-line/40 shrink-0 shadow-2xs">
                          <FoodImage
                            src={pack.image}
                            sizes="88px"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Information */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-black text-ink truncate leading-snug">
                                {pack.title}
                              </h3>
                              <p className="text-[11px] font-medium text-muted truncate mt-0.5">
                                {formatMerchantWithCategory(pack.merchantName, pack.categoryLabel)}
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-1 shrink-0 text-xs font-black text-ink pt-0.5">
                              <Icon name="star" filled className="w-3.5 h-3.5 text-brand-2" />
                              <span>{decimalFa(pack.rating)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-muted mt-2 truncate">
                            <Icon name="clock" className="w-3 h-3 text-muted/70 shrink-0" />
                            <span className="truncate">{pack.pickup}</span>
                            <span className="text-muted/40 shrink-0">•</span>
                            <Icon name="pin" className="w-3 h-3 text-muted/70 shrink-0" />
                            <span className="shrink-0">{distanceFa(pack.distanceKm)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dedicated Price Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-line/50">
                        {discount > 0 ? (
                          <span className="text-xs font-black text-rose-600">
                            {numberFa(discount)}٪ تخفیف
                          </span>
                        ) : (
                          <span />
                        )}
                        <div className="flex items-baseline gap-2">
                          <del className="text-xs text-muted line-through" aria-label={`ارزش اصلی ${moneyCompact(pack.originalPrice)}`}>
                            {moneyCompact(pack.originalPrice)}
                          </del>
                          <strong className="text-sm font-black text-ink">
                            {moneyCompact(pack.price)}
                          </strong>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => onSelect(pack)}
                        className="w-full min-h-[44px] py-2.5 px-4 rounded-xl sm:rounded-2xl bg-brand-2 text-white font-black text-xs hover:bg-brand-2/90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        <span>مشاهده و رزرو این جعبه</span>
                        <Icon name="chevron" className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    ) : (
      /* Feed Area Container */
      <div className="w-full max-w-md mx-auto px-4 pt-3.5 space-y-6">
        {/* Section 1: ساعت صفر نجات | Urgent Rescue Deadline Countdown */}
        <section className="space-y-3" aria-labelledby="deadline-heading">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <h2 id="deadline-heading" className="text-sm font-black text-ink tracking-tight">
                ساعت صفر نجات
              </h2>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                شیفت عصر
              </span>
            </div>

            {/* Live Countdown Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
              <Icon name="clock" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-[family-name:var(--font-vazirmatn)] font-black text-xs tracking-wider">
                {countdownFormatted}
              </span>
            </div>
          </div>

          {/* Deadline Urgent Snap Carousel */}
          <div
            className="flex items-stretch gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none snap-x"
            style={{ scrollbarWidth: "none" }}
          >
            {deadlineOffers.map((offer) => {
              const discount = discountPercent(offer.originalPrice, offer.price);
              return (
                <article
                  key={offer.id}
                  className="w-[235px] sm:w-[255px] shrink-0 snap-start rounded-2xl bg-surface border border-line overflow-hidden shadow-2xs hover:border-brand-2/40 transition-all flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(offer)}
                    className="w-full text-start flex flex-col h-full cursor-pointer focus:outline-none"
                    aria-label={`مشاهده ${offer.title} از ${offer.merchantName}`}
                  >
                    <div className="relative w-full h-28 bg-canvas overflow-hidden">
                      <FoodImage
                        src={offer.image}
                        sizes="255px"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-xs">
                        {discount > 0 ? `${numberFa(discount)}٪ تخفیف` : "فوری"}
                      </span>
                      <span className="absolute bottom-2 start-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-black/75 text-white backdrop-blur-xs flex items-center gap-1">
                        <Icon name="clock" className="w-3 h-3 text-amber-400" />
                        <span>تنها {numberFa(offer.quantityLeft)} عدد مانده</span>
                      </span>
                    </div>

                    <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-ink truncate leading-tight">{offer.title}</h3>
                        <p className="text-[11px] text-muted truncate mt-0.5">{offer.merchantName}</p>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-muted mt-2 truncate">
                          <Icon name="clock" className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="truncate">{offer.pickup}</span>
                        </div>
                      </div>

                      {/* Dedicated Price Row: price and unit on one line, no time in price field */}
                      <div className="flex items-center justify-between pt-2 border-t border-line/60">
                        <span className="text-[10px] font-bold text-muted">قیمت:</span>
                        <div className="flex items-baseline gap-2 shrink-0 whitespace-nowrap">
                          <del className="text-[10.5px] text-muted line-through whitespace-nowrap">
                            {moneyCompact(offer.originalPrice)}
                          </del>
                          <strong className="text-xs sm:text-sm font-black text-brand-2 whitespace-nowrap">
                            {moneyCompact(offer.price)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 2: شکار داغ امروز | Hot Drops & Golden Deals */}
        <section className="space-y-3" aria-labelledby="hot-heading">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Icon name="flame" className="w-4 h-4" />
              </span>
              <div>
                <h2 id="hot-heading" className="text-sm font-black text-ink tracking-tight">
                  شکار داغ امروز
                </h2>
                <p className="text-[11px] text-muted">بیشترین تخفیف‌های نجات غذا در ونک</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-muted">ارزش خرید بالا</span>
          </div>

          {/* Spotlight Hero Deal */}
          {topHotOffer && (
            <article className="rounded-3xl bg-gradient-to-br from-brand-soft/70 to-surface dark:from-[#232924] dark:to-[#1D1E21] border border-brand-2/20 p-3.5 sm:p-4 shadow-xs relative overflow-hidden group">
              <button
                type="button"
                onClick={() => onSelect(topHotOffer)}
                className="w-full text-start flex flex-col sm:flex-row items-center gap-3.5 cursor-pointer focus:outline-none"
                aria-label={`شکار طلایی: ${topHotOffer.title} از ${topHotOffer.merchantName}`}
              >
                <div className="relative w-full sm:w-36 h-36 sm:h-32 rounded-2xl overflow-hidden bg-canvas shrink-0 shadow-2xs">
                  <FoodImage
                    src={topHotOffer.image}
                    sizes="(max-width: 640px) 100vw, 144px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 start-2 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-600 text-white shadow-xs">
                    {numberFa(discountPercent(topHotOffer.originalPrice, topHotOffer.price))}٪ تخفیف طلایی
                  </span>
                </div>

                <div className="w-full min-w-0 flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-brand-2 dark:text-[#FDA74D] flex items-center gap-1">
                        <Icon name="spark" className="w-3.5 h-3.5" />
                        <span>بهترین پیشنهاد محله</span>
                      </span>
                      <div className="inline-flex items-center gap-1 text-xs font-black text-ink">
                        <Icon name="star" filled className="w-3.5 h-3.5 text-brand-2" />
                        <span>{decimalFa(topHotOffer.rating)}</span>
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-ink mt-1 truncate">
                      {topHotOffer.title}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {formatMerchantWithCategory(topHotOffer.merchantName, topHotOffer.categoryLabel)} • {distanceFa(topHotOffer.distanceKm)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-line/60">
                    <span className="text-[11px] text-muted flex items-center gap-1.5 truncate">
                      <Icon name="clock" className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span className="truncate">{topHotOffer.pickup}</span>
                    </span>
                    <div className="flex items-baseline gap-2 shrink-0 whitespace-nowrap">
                      <del className="text-xs text-muted line-through whitespace-nowrap">{moneyCompact(topHotOffer.originalPrice)}</del>
                      <strong className="text-base font-black text-ink whitespace-nowrap">{moneyCompact(topHotOffer.price)}</strong>
                    </div>
                  </div>
                </div>
              </button>
            </article>
          )}
        </section>

        {/* Section 3: رادار پیاده‌روی و دسترسی سریع | Walking Proximity Radar */}
        <div className="p-3.5 rounded-2xl bg-surface border border-line flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-brand-soft text-brand-2 grid place-items-center shrink-0">
              <Icon name="route" className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <strong className="block text-xs font-black text-ink truncate">رادار فاصلهٔ پیاده‌روی</strong>
              <small className="block text-[10.5px] text-muted truncate">موقعیت مرجع: تهران، میدان ونک</small>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {[
              { label: "همه", val: null },
              { label: "۱.۵ ک‌م", val: 1.5 },
              { label: "۳ ک‌م", val: 3 },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setWalkRadius(item.val)}
                className={`px-2.5 py-1 min-h-[30px] rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                  walkRadius === item.val
                    ? "bg-brand-2 text-white font-black shadow-2xs"
                    : "bg-canvas text-muted hover:text-ink border border-line/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: فهرست جعبه‌های کاوش | Discovery Offers Grid */}
        <section className="space-y-3" aria-labelledby="feed-offers-heading">
          <div className="flex items-center justify-between">
            <h2 id="feed-offers-heading" className="text-xs font-bold text-muted">
              {numberFa(feedOffers.length)} جعبه برای نجات در اطراف شما
            </h2>
            {smartFilter !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setSmartFilter("all");
                  setWalkRadius(null);
                }}
                className="text-[11px] font-bold text-brand-2 hover:underline cursor-pointer"
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>

          {feedOffers.length > 0 ? (
            <OfferList
              offers={feedOffers}
              favorites={favorites}
              onFavorite={onFavorite}
              onSelect={onSelect}
            />
          ) : (
            <div className="p-8 rounded-3xl bg-surface border border-line text-center space-y-2">
              <p className="text-xs font-bold text-muted">جعبه‌ای با فیلترهای انتخابی شما پیدا نشد.</p>
              <button
                type="button"
                onClick={() => {
                  setSmartFilter("all");
                  setWalkRadius(null);
                }}
                className="text-xs font-bold text-brand-2 hover:underline cursor-pointer"
              >
                نمایش همه پیشنهادها
              </button>
            </div>
          )}
        </section>
      </div>
    )}
  </div>
);
}

function OrdersPage({
  active,
  reservations,
  subTab = "active",
  onCancel,
  onReview,
  onReceipt,
  onDiscover,
  onDirections,
  onTrackPipeline,
}: {
  active: Reservation[];
  reservations: Reservation[];
  subTab?: "active" | "history";
  onCancel: (id: string) => void;
  onReview: (id: string) => void;
  onReceipt?: (reservation: Reservation) => void;
  onDiscover: () => void;
  onDirections: () => void;
  onTrackPipeline?: (reservationId: string) => void;
}) {
  const [timelineReservation, setTimelineReservation] = useState<Reservation | null>(null);

  const pastOrders = useMemo(
    () => reservations.filter((item) => item.status !== "active"),
    [reservations]
  );

  const handleTrack = (id: string) => {
    const target = reservations.find((r) => r.id === id);
    if (target) {
      setTimelineReservation(target);
    } else if (onTrackPipeline) {
      onTrackPipeline(id);
    }
  };

  return (
    <div className="space-y-4">
      {subTab === "active" ? (
        active.length ? (
          <div className="grid gap-3 min-w-0 w-full max-w-full">
            {active.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={onCancel}
                onReview={onReview}
                onReceipt={onReceipt}
                onDirections={onDirections}
                onTrackPipeline={handleTrack}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bag"
            title="سفارش جاری نداری"
            text="یک جعبهٔ نزدیک پیدا کن و برای امشب رزرو کن."
            action="کشف جعبه‌ها"
            onAction={onDiscover}
          />
        )
      ) : pastOrders.length ? (
        <div className="grid gap-3 min-w-0 w-full max-w-full">
          {pastOrders.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={onCancel}
              onReview={onReview}
              onReceipt={onReceipt}
              onDirections={onDirections}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="clock"
          title="هنوز سفارشی تکمیل نشده"
          text="سفارش‌های قبلی شما پس از دریافت حضوری در این قسمت قرار می‌گیرند."
          action="کشف جعبه‌ها"
          onAction={onDiscover}
        />
      )}

      {/* Order Stage Timeline Popup */}
      {timelineReservation && (
        <OrderTimelineDialog
          reservation={timelineReservation}
          onClose={() => setTimelineReservation(null)}
        />
      )}
    </div>
  );
}

function OrderTimelineDialog({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  const isCollected = reservation.status === "collected";

  const copyCode = () => {
    navigator.clipboard?.writeText(reservation.code);
    toastManager.add({ title: "کد تحویل کپی شد.", type: "success" });
  };

  return (
    <DialogShell titleId="order-timeline-title" onClose={onClose}>
      <div className="p-4 sm:p-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line pe-12">
          <div>
            <h2 id="order-timeline-title" className="text-base font-black text-ink">
              پیگیری مراحل سفارش
            </h2>
            <p className="text-xs text-muted mt-0.5">وضعیت و مراحل دریافت بستهٔ نجات غذا</p>
          </div>
        </div>

        {/* Order Brief Info */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-canvas border border-line">
          <div className="relative w-12 h-12 rounded-xl bg-surface border border-line/60 overflow-hidden shrink-0">
            <Image
              src={reservation.image || "/images/products/dibz-dessert-box-cutout.png"}
              alt={reservation.title}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="text-xs font-bold text-ink block truncate">{reservation.merchantName}</strong>
            <h3 className="text-xs sm:text-sm font-black text-ink truncate leading-tight mt-0.5">
              {reservation.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-muted mt-1 truncate">
              <span className="flex items-center gap-1 shrink-0">
                <Icon name="clock" className="w-3.5 h-3.5 text-muted" />
                <span>{reservation.pickup}</span>
              </span>
              <span>•</span>
              <strong className="text-brand-2 font-bold shrink-0">{money(reservation.total)}</strong>
            </div>
          </div>
        </div>

        {/* Two-Step Timeline */}
        <div className="p-4 rounded-3xl bg-surface border border-line space-y-4 shadow-2xs">
          <h4 className="text-xs font-black text-ink">مراحل تکمیل سفارش</h4>

          <div className="relative space-y-6 ps-1">
            {/* Step 1: پرداخت غذا */}
            <div className="relative flex items-start gap-3">
              {/* Connecting Line between Step 1 and Step 2 */}
              <div className="absolute top-8 start-4 -translate-x-1/2 w-0.5 h-12 bg-brand-2" aria-hidden="true" />

              <div className="w-8 h-8 rounded-full bg-brand-2 text-white grid place-items-center shrink-0 shadow-xs z-10">
                <Icon name="check" className="w-4 h-4 stroke-[3]" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-xs sm:text-sm font-black text-ink">۱. پرداخت غذا</strong>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    انجام شد
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1 leading-relaxed">
                  مبلغ {money(reservation.total)} با موفقیت پرداخت و رزرو شما ثبت شد.
                </p>
              </div>
            </div>

            {/* Step 2: مراجعه به رستوران و تحویل کد */}
            <div className="relative flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full grid place-items-center shrink-0 shadow-xs z-10 ${
                  isCollected
                    ? "bg-brand-2 text-white"
                    : "bg-brand-soft text-brand-2 border-2 border-brand-2"
                }`}
              >
                {isCollected ? (
                  <Icon name="check" className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon name="clock" className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-xs sm:text-sm font-black text-ink">
                    ۲. مراجعه به رستوران و تحویل کد سفارش
                  </strong>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCollected
                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                        : "text-amber-700 dark:text-amber-300 bg-amber-500/10"
                    }`}
                  >
                    {isCollected ? "تحویل گرفته شد" : "مرحله جاری"}
                  </span>
                </div>

                <p className="text-[11px] text-muted mt-1 leading-relaxed">
                  {isCollected
                    ? "سفارش با ارائه کد تحویل به فروشگاه با موفقیت تحویل گرفته شد."
                    : `در بازهٔ زمانی (${reservation.pickup}) به ${reservation.merchantName} مراجعه کرده و کد تحویل زیر را اعلام فرمایید:`}
                </p>

                {/* Delivery Code Box */}
                {!isCollected && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-canvas border border-dashed border-brand-2/40 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-muted font-bold block">کد تحویل شما:</span>
                      <strong className="text-2xl font-[family-name:var(--font-vazirmatn)] font-black text-brand-2 tracking-widest select-all">
                        {faDigits(reservation.code)}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={copyCode}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-line text-xs font-bold text-ink hover:bg-surface-raised active:scale-95 transition-all cursor-pointer shadow-2xs"
                    >
                      کپی کد
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store Address & Directions */}
        {reservation.address && (
          <div className="p-3 rounded-2xl bg-canvas border border-line/60 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Icon name="pin" className="w-4 h-4 text-brand-2 shrink-0" />
              <span className="text-muted truncate">{reservation.address}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reservation.merchantName + " " + reservation.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-2 font-bold shrink-0 hover:underline inline-flex items-center gap-1"
            >
              <span>مسیریابی</span>
              <Icon name="chevron" className="w-3.5 h-3.5 rtl:rotate-180" />
            </a>
          </div>
        )}

        {/* Close CTA */}
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-brand-2 text-white text-xs sm:text-sm font-black hover:bg-brand-2/95 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
        >
          بستن
        </button>
      </div>
    </DialogShell>
  );
}

function ReservationCard({
  reservation,
  onCancel,
  onReview,
  onReceipt,
  onDirections,
  onTrackPipeline,
}: {
  reservation: Reservation;
  onCancel: (id: string) => void;
  onReview: (id: string) => void;
  onReceipt?: (reservation: Reservation) => void;
  onDirections: () => void;
  onTrackPipeline?: (reservationId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const cancellable = reservation.orderStatus
    ? ["paid", "reviewed", "preparing", "ready_for_pickup"].includes(reservation.orderStatus)
    : reservation.status === "active";

  return (
    <article className="w-full max-w-full min-w-0 overflow-hidden rounded-3xl bg-surface border border-line p-3.5 sm:p-4 shadow-xs space-y-3 transition-all hover:shadow-sm">
      {/* 1. Header: Merchant circular avatar + Store Info + ... Menu Button at top-left */}
      <div className="flex items-start justify-between gap-2.5 min-w-0 relative">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border border-line/60 shadow-2xs mt-0.5">
            <MerchantLogo
              name={reservation.merchantName}
              category={reservation.category}
              size="md"
              className="!rounded-none !border-0"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-sm sm:text-base font-black text-ink truncate leading-tight">
              {reservation.merchantName}
            </h2>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted">
              <Icon name="clock" className="w-3.5 h-3.5 text-muted shrink-0" />
              <span>{formatPickupDate(reservation.pickup)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted min-w-0">
              <Icon name="pin" className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="truncate">{reservation.address}</span>
            </div>
          </div>
        </div>

        {/* ... More Options Menu Button at Top-Left */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="گزینه‌های بیشتر سفارش"
            aria-expanded={menuOpen}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-canvas border border-transparent hover:border-line transition-all cursor-pointer active:scale-95"
          >
            <Icon name="dots" className="w-4.5 h-4.5" />
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-44 rounded-2xl bg-surface/95 backdrop-blur-md border border-line shadow-lg p-1.5 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              {onReceipt && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onReceipt(reservation);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-ink hover:bg-canvas rounded-xl transition-colors cursor-pointer text-start"
                >
                  <Icon name="receipt" className="w-4 h-4 text-brand-2 shrink-0" />
                  <span>مشاهده رسید</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDirections();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-ink hover:bg-canvas rounded-xl transition-colors cursor-pointer text-start"
              >
                <Icon name="route" className="w-4 h-4 text-brand-2 shrink-0" />
                <span>مسیریابی</span>
              </button>

              {cancellable && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onCancel(reservation.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer text-start"
                >
                  <Icon name="close" className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>لغو سفارش</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Middle Row: Product Cutout with Quantity Badge + Title | Price */}
      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-line/60 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Food Cutout with Quantity Circle Badge */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-canvas border border-line/60 overflow-visible">
            <div className="relative w-full h-full p-1">
              <div className="relative w-full h-full">
                <Image
                  src={reservation.image || "/images/products/dibz-dessert-box-cutout.png"}
                  alt={reservation.title}
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
            </div>
            {/* RTL-aware quantity badge */}
            <span className="absolute -top-1 -end-1 w-4.5 h-4.5 rounded-full bg-surface border border-line/80 shadow-2xs flex items-center justify-center text-[10px] font-black text-ink z-10">
              {numberFa(reservation.quantity || 1)}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-black text-ink truncate leading-tight min-w-0 flex-1">
            {reservation.title}
          </h3>
        </div>

        {/* Total Price */}
        <div className="shrink-0 text-start sm:text-end">
          <span className="text-sm sm:text-base font-black text-ink whitespace-nowrap">
            {money(reservation.total)}
          </span>
        </div>
      </div>

      {/* 3. Delivery Code Ticket Voucher (Clean, Prominent & Bold Vazir Font) - Only shown for active orders */}
      {reservation.status === "active" && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-brand-soft/40 dark:bg-[#F87F45]/10 border border-dashed border-brand-2/30 dark:border-[#F87F45]/25 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-xl bg-brand-soft dark:bg-[#F87F45]/20 text-brand-2 dark:text-[#FDA74D] grid place-items-center shrink-0 shadow-2xs">
              <Icon name="receipt" className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-muted shrink-0">کد تحویل:</span>
          </div>

          <span className="font-[family-name:var(--font-vazirmatn)] font-black text-xl sm:text-2xl text-brand-2 dark:text-[#FDA74D] tracking-wide select-all">
            {faDigits(reservation.code)}
          </span>
        </div>
      )}

      {reservation.reviewResponse && (
        <blockquote className="p-3 rounded-2xl bg-brand-soft/60 border-s-2 border-brand-2 text-xs text-ink space-y-1">
          <strong className="block font-bold text-brand-2">پاسخ فروشگاه</strong>
          <p className="opacity-90">{reservation.reviewResponse}</p>
        </blockquote>
      )}

      {/* 4. Bottom Row: Primary Actions */}
      {reservation.status === "active" && onTrackPipeline ? (
        <div className="pt-2 border-t border-line/60">
          <button
            type="button"
            onClick={() => onTrackPipeline(reservation.id)}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-2xl bg-brand-2 text-white hover:bg-brand-2/95 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <span>پیگیری مراحل</span>
            <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180 shrink-0" />
          </button>
        </div>
      ) : reservation.status === "collected" ? (
        <div className="pt-2 border-t border-line/60 grid grid-cols-2 gap-2">
          {onReceipt && (
            <button
              type="button"
              onClick={() => onReceipt(reservation)}
              className="min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-bold rounded-2xl bg-surface border border-line text-ink hover:bg-canvas transition-colors cursor-pointer active:scale-[0.98]"
            >
              <span>مشاهده رسید</span>
            </button>
          )}

          {!reservation.hasReview ? (
            <button
              type="button"
              onClick={() => onReview(reservation.id)}
              className={`min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-bold rounded-2xl bg-brand-2 text-white hover:opacity-95 transition-opacity cursor-pointer active:scale-[0.98] shadow-xs ${!onReceipt ? "col-span-2 w-full" : ""}`}
            >
              <span>ثبت نظر</span>
            </button>
          ) : (
            <span className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-brand-2 bg-brand-soft rounded-2xl border border-brand-2/20 dark:text-[#FDA74D] dark:bg-[#F87F45]/10 dark:border-[#F87F45]/20 ${!onReceipt ? "col-span-2 w-full" : ""}`}>
              <Icon name="check" className="w-4 h-4 shrink-0" />
              <span>نظر ثبت شده</span>
            </span>
          )}
        </div>
      ) : reservation.status !== "active" && onReceipt ? (
        <div className="pt-2 border-t border-line/60">
          <button
            type="button"
            onClick={() => onReceipt(reservation)}
            className="w-full min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-bold rounded-2xl bg-surface border border-line text-ink hover:bg-canvas transition-colors cursor-pointer active:scale-[0.98]"
          >
            <span>مشاهده رسید</span>
          </button>
        </div>
      ) : null}
    </article>
  );
}

function ProfilePage({
  savedMeals,
  favoriteOffers,
  reservations,
  notifications,
  setNotifications,
  installed,
  onInstall,
  onOpenOffer,
  onOpenMerchant,
  onAbout,
  showToast,
  onCancel,
  onReview,
  onReceipt,
  onDirections,
}: {
  savedMeals: number;
  favoriteOffers: Offer[];
  reservations: Reservation[];
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  installed: boolean;
  onInstall: () => void;
  onOpenOffer: (offer: Offer) => void;
  onOpenMerchant?: (offer: Offer) => void;
  onAbout: () => void;
  showToast: (message: string) => void;
  onCancel: (id: string) => void;
  onReview: (id: string) => void;
  onReceipt?: (reservation: Reservation) => void;
  onDirections: () => void;
}) {
  const { state, updateCustomer } = useDemo();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [profileSubpage, setProfileSubpage] = useState<"main" | "history">("main");
  const { theme, setTheme, resolvedTheme } = useMoftTheme();
  const preventedWaste = savedMeals * 0.78;
  const co2 = savedMeals * 2.4;
  const historyReservations = useMemo(
    () => reservations.filter((item) => item.status !== "active"),
    [reservations]
  );

  if (profileSubpage === "history") {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-start-2 duration-200">
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => setProfileSubpage("main")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-brand-2 transition-colors py-1 cursor-pointer"
            aria-label="بازگشت به پروفایل و گزینه‌ها"
          >
            <Icon name="arrow" className="w-4 h-4 text-brand-2" />
            <span>پروفایل و گزینه‌ها</span>
          </button>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface border border-line text-muted">
            {numberFa(historyReservations.length)} سفارش گذشته
          </span>
        </div>

        <div>
          <h1 className="text-base font-black text-ink">تاریخچهٔ سفارش‌ها</h1>
          <p className="text-xs text-muted mt-0.5">سفارش‌های قبلی، دریافت‌شده و سوابق خرید شما</p>
        </div>

        {historyReservations.length ? (
          <div className="grid gap-3.5">
            {historyReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={onCancel}
                onReview={onReview}
                onReceipt={onReceipt}
                onDirections={onDirections}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="clock"
            title="هنوز سابقه‌ای نداری"
            text="سفارش‌های قبلی، دریافت‌شده یا لغوشده در این بخش نمایش داده می‌شوند."
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Profile Info Card (Clickable with edit icon to edit personal info) */}
      <button
        type="button"
        onClick={() => setEditProfileOpen(true)}
        className="w-full flex items-center justify-between p-4 rounded-3xl bg-surface border border-line shadow-xs hover:bg-surface-raised transition-colors cursor-pointer text-start active:scale-[0.99]"
        aria-label="ویرایش اطلاعات شخصی"
      >
        <div className="flex items-center gap-3">
          <Icon name="user" className="w-6 h-6 text-brand-2 shrink-0" />
          <h1 className="text-base font-black text-ink">{state.customer.name}</h1>
        </div>
        <Icon name="pencil" className="w-4 h-4 text-muted shrink-0" />
      </button>

      {/* 2. Group 1: Activity & Orders */}
      <div className="rounded-3xl bg-surface border border-line shadow-xs divide-y divide-line overflow-hidden">
        {/* Order History */}
        <button
          type="button"
          onClick={() => setProfileSubpage("history")}
          className="w-full flex items-center justify-between p-3.5 text-start hover:bg-canvas/40 transition-colors cursor-pointer min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex items-center justify-center text-muted shrink-0">
              <Icon name="clock" className="w-5 h-5" />
            </span>
            <strong className="text-xs font-bold text-ink">تاریخچهٔ سفارش‌ها</strong>
          </div>
          <div className="flex items-center gap-2">
            {historyReservations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand-2 text-[11px] font-bold">
                {numberFa(historyReservations.length)}
              </span>
            )}
            <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
          </div>
        </button>

        {/* Allergies & Preferences */}
        <button
          type="button"
          onClick={() => showToast("هشدار آلرژی هر جعبه را پیش از رزرو بررسی کن.")}
          className="w-full flex items-center justify-between p-3.5 text-start hover:bg-canvas/40 transition-colors min-h-[48px] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex items-center justify-center text-muted shrink-0 text-base">⚠️</span>
            <strong className="text-xs font-bold text-ink">آلرژی‌ها و ترجیحات</strong>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </button>
      </div>

      {/* 3. Group 2: App Preferences & Notifications */}
      <div className="rounded-3xl bg-surface border border-line shadow-xs divide-y divide-line overflow-hidden">
        {/* Dark/Light Mode Button */}
        <button
          type="button"
          onClick={() => setThemeModalOpen(true)}
          className="w-full flex items-center justify-between p-3.5 text-start hover:bg-canvas/40 transition-colors cursor-pointer min-h-[48px]"
          aria-label="تنظیم حالت شب و روز و پوسته برنامه"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex items-center justify-center text-brand-2 shrink-0">
              <Icon name={resolvedTheme === "dark" ? "moon" : "sun"} className="w-5 h-5" />
            </span>
            <strong className="text-xs font-bold text-ink">حالت شب و روز</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-canvas border border-line text-[11px] font-bold text-ink inline-flex items-center gap-1.5">
              <Icon
                name={theme === "auto" ? "clock" : resolvedTheme === "dark" ? "moon" : "sun"}
                className="w-3.5 h-3.5 text-brand-2"
              />
              <span>
                {theme === "auto"
                  ? "خودکار (ساعت)"
                  : theme === "dark"
                  ? "تاریک"
                  : "روشن"}
              </span>
            </span>
            <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
          </div>
        </button>

        {/* Pickup Reminders Toggle */}
        <div className="flex items-center justify-between p-3.5 min-h-[48px]">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex items-center justify-center text-muted shrink-0">
              <Icon name="bell" className="w-5 h-5" />
            </span>
            <strong className="text-xs font-bold text-ink">یادآوری زمان دریافت</strong>
          </div>
          <GlassToggle checked={notifications} onCheckedChange={setNotifications} label="یادآوری زمان دریافت" />
        </div>

        {/* PWA Install */}
        <button
          type="button"
          onClick={onInstall}
          className="w-full flex items-center justify-between p-3.5 text-start hover:bg-canvas/40 transition-colors min-h-[48px] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex items-center justify-center text-muted shrink-0">
              <Icon name="share" className="w-5 h-5" />
            </span>
            <strong className="text-xs font-bold text-ink">{installed ? "دیبز روی دستگاه نصب است" : "نصب برنامه"}</strong>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </button>
      </div>

      {/* 4. Group 3: About & Support */}
      <div className="rounded-3xl bg-surface border border-line shadow-xs divide-y divide-line overflow-hidden">
        {/* About Moft */}
        <button type="button" onClick={onAbout} className="w-full flex items-center justify-between p-3.5 text-start hover:bg-canvas/40 transition-colors min-h-[48px] cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex items-center justify-center text-muted shrink-0">
              <Icon name="info" className="w-5 h-5" />
            </span>
            <strong className="text-xs font-bold text-ink">دربارهٔ دیبز</strong>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </button>

        {/* Help & Support */}
        <Link href="/customer/support" className="flex items-center justify-between p-3.5 hover:bg-canvas/40 transition-colors min-h-[48px]">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex items-center justify-center text-muted shrink-0 font-bold text-sm">؟</span>
            <strong className="text-xs font-bold text-ink">راهنما و پشتیبانی</strong>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </Link>
      </div>

      {/* 3. Impact Stats Card */}
      <section className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 flex items-center justify-center text-brand-2 shrink-0">
              <Icon name="leaf" className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-black text-ink">سهم شما در نجات غذا</h2>
              <p className="text-[11px] text-muted font-medium">تاثیر زیست‌محیطی سفارش‌های دریافت‌شده</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand-soft text-brand-2 text-xs font-black">
            <AnimatedNumber value={savedMeals} /> وعده
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <div className="p-3 rounded-2xl bg-canvas border border-line/60 text-center space-y-1">
            <div className="w-5 h-5 mx-auto flex items-center justify-center text-brand-2">
              <Icon name="bag" className="w-4 h-4" />
            </div>
            <strong className="block text-sm font-black text-ink">{decimalFa(preventedWaste)}</strong>
            <small className="block text-[10px] text-muted font-bold">کیلو غذا</small>
          </div>
          <div className="p-3 rounded-2xl bg-canvas border border-line/60 text-center space-y-1">
            <div className="w-5 h-5 mx-auto flex items-center justify-center text-brand-2 dark:text-[#FDA74D]">
              <Icon name="leaf" className="w-4 h-4" />
            </div>
            <strong className="block text-sm font-black text-ink">{decimalFa(co2)}</strong>
            <small className="block text-[10px] text-muted font-bold">کیلو CO₂</small>
          </div>
          <div className="p-3 rounded-2xl bg-canvas border border-line/60 text-center space-y-1">
            <div className="w-5 h-5 mx-auto flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Icon name="spark" className="w-4 h-4" />
            </div>
            <strong className="block text-sm font-black text-ink"><AnimatedNumber value={savedMeals * 11} /></strong>
            <small className="block text-[10px] text-muted font-bold">لیتر آب</small>
          </div>
        </div>
        <p className="text-[10px] text-muted text-center font-medium">این برآوردها تقریبی‌اند و ادعای زیست‌محیطی قطعی نیستند.</p>
      </section>

      {/* 4. Favorite Stores Card */}
      <section className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="heart" className="w-4 h-4 text-rose-500 shrink-0" />
            <h2 className="text-sm font-black text-ink">فروشگاه‌های محبوب</h2>
          </div>
          {favoriteOffers.length > 0 && (
            <span className="text-[11px] font-bold text-muted px-2 py-0.5 rounded-full bg-canvas border border-line">
              {numberFa(favoriteOffers.length)} فروشگاه
            </span>
          )}
        </div>

        {favoriteOffers.length ? (
          <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {favoriteOffers.slice(0, 8).map((offer) => (
              <button
                type="button"
                onClick={() => (onOpenMerchant ? onOpenMerchant(offer) : onOpenOffer(offer))}
                key={offer.id}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl shrink-0 hover:bg-canvas transition-colors group cursor-pointer"
              >
                <MerchantLogo
                  name={offer.merchantName}
                  category={offer.category}
                  size="lg"
                  className="group-hover:scale-105 transition-transform"
                />
                <small className="text-[11px] font-bold text-ink truncate max-w-[84px] text-center">{offer.merchantName}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-canvas border border-line/50 text-xs text-muted">
            <Icon name="heart" className="w-4 h-4 text-muted/60 shrink-0" />
            <p className="font-medium">هنوز فروشگاهی را ذخیره نکرده‌اید. با نشان کردن بسته‌ها یا فروشگاه‌ها، دسترسی سریع‌تری خواهید داشت.</p>
          </div>
        )}
      </section>

      {/* 5. Minimal Footer */}
      <div className="text-center pt-1 pb-3 space-y-1">
        <p className="text-[11px] font-bold text-muted">دیبز • پیش‌نمایش دانشگاهی</p>
        <p className="text-[10px] text-muted/70">{numberFa(reservations.length)} سفارش در حافظهٔ این دستگاه</p>
      </div>

      {editProfileOpen && (
        <EditProfileDialog
          customer={state.customer}
          onSave={(patch) => {
            updateCustomer(patch);
            showToast("اطلاعات شخصی با موفقیت ذخیره شد.");
          }}
          onClose={() => setEditProfileOpen(false)}
        />
      )}

      {themeModalOpen && (
        <ThemeSelectDialog
          current={theme}
          onSelect={(next) => {
            setTheme(next);
            showToast(
              next === "auto"
                ? "حالت خودکار (هماهنگ با ساعت) فعال شد."
                : next === "dark"
                ? "حالت شب (تاریک) فعال شد."
                : "حالت روز (روشن) فعال شد."
            );
          }}
          onClose={() => setThemeModalOpen(false)}
        />
      )}
    </div>
  );
}

function ThemeSelectDialog({
  current,
  onSelect,
  onClose,
}: {
  current: ThemePreference;
  onSelect: (preference: ThemePreference) => void;
  onClose: () => void;
}) {
  const options: Array<{
    id: ThemePreference;
    title: string;
    desc: string;
    icon: IconName;
    badge: string;
    iconClass: string;
  }> = [
    {
      id: "light",
      title: "روشن",
      desc: "نمایش دائم پوسته روشن مناسب برای روز",
      icon: "sun",
      badge: "روز",
      iconClass: "text-amber-500 bg-amber-500/10",
    },
    {
      id: "dark",
      title: "تاریک",
      desc: "نمایش دائم پوسته تاریک و کاهش مصرف باتری",
      icon: "moon",
      badge: "شب",
      iconClass: "text-indigo-400 bg-indigo-500/10",
    },
    {
      id: "auto",
      title: "خودکار (بر اساس ساعت)",
      desc: "روزها پوسته روشن و شب‌ها (۱۹:۰۰ تا ۰۷:۰۰) خودکار تاریک",
      icon: "clock",
      badge: "ساعت",
      iconClass: "text-brand-2 bg-brand-soft",
    },
  ];

  return (
    <DialogShell titleId="theme-dialog-title" onClose={onClose}>
      <div className="p-4 sm:p-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between pb-3 border-b border-line pe-12">
          <div>
            <h2 id="theme-dialog-title" className="text-base font-black text-ink">
              حالت شب و روز
            </h2>
            <p className="text-xs text-muted mt-0.5">پوسته ظاهری برنامه را انتخاب کنید.</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {options.map((opt) => {
            const isSelected = current === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelect(opt.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-start transition-all cursor-pointer active:scale-[0.99] ${
                  isSelected
                    ? "bg-brand-soft/50 border-brand-2 shadow-xs"
                    : "bg-canvas border-line hover:bg-surface text-ink"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${opt.iconClass}`}>
                    <Icon name={opt.icon} className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs sm:text-sm font-black text-ink">{opt.title}</strong>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface border border-line text-muted">
                        {opt.badge}
                      </span>
                    </div>
                    <span className="block text-[11px] text-muted truncate mt-0.5 leading-tight">{opt.desc}</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? "border-brand-2 bg-brand-2 text-white"
                      : "border-line/80 bg-surface"
                  }`}
                >
                  {isSelected && <Icon name="check" className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </DialogShell>
  );
}

function EditProfileDialog({
  customer,
  onSave,
  onClose,
}: {
  customer: import("@/types/demo").Customer;
  onSave: (patch: Partial<import("@/types/demo").Customer>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(customer.name);
  const [mobile, setMobile] = useState(customer.mobile);
  const [age, setAge] = useState(customer.age ? String(customer.age) : "");
  const [gender, setGender] = useState<"female" | "male" | "other">(
    (customer.gender as "female" | "male" | "other") || "female"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      mobile: mobile.trim(),
      age: age ? Number(age) : undefined,
      gender,
    });
    onClose();
  };

  return (
    <DialogShell titleId="edit-profile-title" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between pb-3 border-b border-line pe-12">
          <h2 id="edit-profile-title" className="text-base font-black text-ink">
            ویرایش اطلاعات شخصی
          </h2>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="user-name" className="text-xs font-bold text-muted">
            نام و نام خانوادگی
          </label>
          <input
            id="user-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-canvas border border-line text-sm font-bold text-ink focus:border-brand-2 outline-none transition-colors"
            placeholder="نام شما"
          />
        </div>

        {/* Mobile */}
        <div className="space-y-1.5">
          <label htmlFor="user-mobile" className="text-xs font-bold text-muted">
            شماره همراه
          </label>
          <input
            id="user-mobile"
            type="tel"
            dir="ltr"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-canvas border border-line text-sm font-mono text-ink text-left focus:border-brand-2 outline-none transition-colors"
            placeholder="۰۹۱۲۰۰۰۰۰۰۰"
          />
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <label htmlFor="user-age" className="text-xs font-bold text-muted">
            سن
          </label>
          <input
            id="user-age"
            type="number"
            min="10"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-canvas border border-line text-sm font-bold text-ink focus:border-brand-2 outline-none transition-colors"
            placeholder="مثال: ۲۴"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted">
            جنسیت
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "female", label: "خانم" },
              { id: "male", label: "آقا" },
              { id: "other", label: "سایر" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGender(item.id as "female" | "male" | "other")}
                className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                  gender === item.id
                    ? "bg-brand-soft text-brand-2 border-brand-2 font-black shadow-2xs"
                    : "bg-canvas text-ink border-line hover:bg-surface-raised"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-muted hover:text-ink px-3 py-2 min-h-[44px] cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="h-11 min-h-[44px] px-6 inline-flex items-center justify-center text-xs font-bold rounded-2xl bg-brand-2 text-white hover:opacity-90 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

function OfferDetails({
  offer,
  onClose,
  onIncrement,
  onDecrement,
  inCartQuantity = 0,
  onOpenMerchant,
  related,
  onSelect,
  favorites,
  onFavorite,
}: {
  offer: Offer;
  favorite?: boolean;
  onFavorite: (id: string) => void;
  onClose: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  inCartQuantity?: number;
  onOpenMerchant?: (offer: Offer) => void;
  related: Offer[];
  onSelect: (offer: Offer) => void;
  favorites: Set<string>;
}) {
  const detailScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (detailScrollRef.current) detailScrollRef.current.scrollTop = 0;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [offer.id]);

  return (
    <DialogShell titleId="offer-title" onClose={onClose} size="fullscreen">
      <div ref={detailScrollRef} className="overflow-y-auto flex-1 h-full">
        <div className="relative w-full h-72 sm:h-80 bg-canvas overflow-hidden">
          <FoodImage
            src={offer.image}
            alt={`تصویر ${offer.title}`}
            sizes="(max-width: 700px) 100vw, 540px"
            priority
            className="w-full h-full object-cover"
          />
          {/* Food Title, Description & Rating Overlay on bottom right/start of image */}
          <div className="absolute inset-x-0 bottom-0 p-4 pt-14 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white space-y-1.5">
            <h1 id="offer-title" className="text-base sm:text-lg font-black leading-snug drop-shadow-sm">
              {offer.title}
            </h1>
            {offer.description && (
              <p className="text-[11px] sm:text-xs text-white/90 leading-relaxed line-clamp-2 drop-shadow-xs max-w-md">
                {offer.description}
              </p>
            )}
            <div className="flex items-center gap-2 pt-0.5 text-xs text-white">
              <span className="inline-flex items-center gap-1 font-bold drop-shadow-xs">
                <Icon name="star" filled className="w-3.5 h-3.5 text-amber-400" />
                <span>{decimalFa(offer.rating)}</span>
                <span className="text-white/80 font-normal text-[11px]">({numberFa(offer.reviewCount)} نظر)</span>
              </span>
              <span className="text-white/40">•</span>
              <span className="inline-flex items-center gap-1 font-medium text-[11px] text-white/85 drop-shadow-xs">
                <Icon name="pin" className="w-3 h-3 text-white/70" />
                <span>{distanceFa(offer.distanceKm)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Clean Merchant Header: Clickable Logo and Name (Profile text button removed) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenMerchant && onOpenMerchant(offer)}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full grid place-items-center transition-transform cursor-pointer hover:scale-105 active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2"
              aria-label={`مشاهده صفحه اختصاصی ${offer.merchantName}`}
            >
              <MerchantLogo name={offer.merchantName} category={offer.category} size="md" />
            </button>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onOpenMerchant && onOpenMerchant(offer)}
                className="text-start group cursor-pointer block min-w-0 focus-visible:outline-none"
                aria-label={`مشاهده صفحه اختصاصی ${offer.merchantName}`}
              >
                <strong className="block text-sm sm:text-base font-black text-ink group-hover:text-brand-2 transition-colors truncate leading-tight">
                  {formatMerchantWithCategory(offer.merchantName, offer.categoryLabel)}
                </strong>
                <span className="block text-[11px] text-muted font-medium mt-0.5 truncate">
                  {offer.neighborhood} · {offer.categoryLabel} · {distanceFa(offer.distanceKm)}
                </span>
              </button>
            </div>
          </div>

          {/* 3 Key Elements: Pickup Time, Remaining Quantity & Pickup Address */}
          <section className="p-3.5 sm:p-4 rounded-2xl bg-canvas border border-line space-y-3 shadow-2xs">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-line/60">
              <div className="flex items-center gap-2">
                <Icon name="clock" className="w-5 h-5 text-brand-2 shrink-0" />
                <div className="min-w-0">
                  <strong className="block text-xs font-black text-ink truncate">{offer.pickup}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Icon name="bag" className="w-5 h-5 text-brand-2 shrink-0" />
                <div className="min-w-0">
                  <strong className="block text-xs font-black text-ink truncate">
                    {numberFa(offer.quantityLeft)} جعبه
                    {offer.quantityLeft <= 3 && (
                      <span className="text-[10px] text-rose-500 font-bold ms-1">(پایان نزدیک)</span>
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-0.5">
              <Icon name="pin" className="w-5 h-5 text-brand-2 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <strong className="block text-xs font-bold text-ink leading-snug">{offer.address}</strong>
                <span className="block text-[10.5px] text-muted mt-0.5">
                  تحویل فقط به‌صورت حضوری و در بازهٔ مشخص‌شده است.
                </span>
              </div>
            </div>
          </section>

          {/* Allergen & Safety Warning */}
          <section className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs grid place-items-center shrink-0">!</span>
            <div className="text-xs space-y-1 min-w-0 flex-1">
              <strong className="block font-bold">هشدار آلرژی و ایمنی</strong>
              <p className="opacity-90 leading-relaxed text-[11px]">
                فقط غذای سالم عرضه می‌شود، اما ترکیب متغیر است. اگر آلرژی جدی داری، پیش از دریافت با فروشگاه هماهنگ کن.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {offer.allergens.map((item) => (
                  <span key={item} className="px-2 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-bold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Recommendations */}
          {related.length > 0 && (
            <section className="space-y-3 pt-1">
              <SectionHeading title="شاید این‌ها را هم دوست داشته باشی" />
              <div className="grid grid-cols-2 gap-3">
                {related.map((item) => (
                  <OfferCard
                    compact
                    key={item.id}
                    offer={item}
                    favorite={favorites.has(item.id)}
                    onFavorite={onFavorite}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Sticky Bottom Reservation Bar */}
      <div className="sticky bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-line bg-surface/95 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="min-w-0">
          <del className="block text-xs text-muted line-through">
            {money(offer.originalPrice)}
          </del>
          <strong className="block text-sm sm:text-base font-black text-ink">
            {money(offer.price)}
          </strong>
          <small className="block text-[10.5px] text-muted">
            برای هر جعبه
          </small>
        </div>

        {inCartQuantity > 0 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDecrement}
              aria-label="حذف از سبد خرید"
              className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-2xl bg-surface border border-line hover:border-rose-500/40 text-muted hover:text-rose-500 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Icon name="trash" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onDecrement}
              className="inline-flex items-center justify-center gap-1.5 min-w-[130px] sm:min-w-[155px] h-12 min-h-[48px] px-5 sm:px-6 text-xs sm:text-sm font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              aria-label="در سبد خرید موجود است (کلیک برای حذف)"
            >
              <Icon name="check" className="w-4 h-4 text-white shrink-0" />
              <span>به سبد خرید اضافه شد</span>
            </button>
          </div>
        ) : (
          <button
            className="inline-flex items-center justify-center min-w-[140px] sm:min-w-[160px] h-12 min-h-[48px] px-8 text-xs sm:text-sm font-bold rounded-2xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
            type="button"
            disabled={offer.quantityLeft < 1}
            onClick={onIncrement}
          >
            {offer.quantityLeft < 1 ? "تمام شد" : "رزرو جعبه"}
          </button>
        )}
      </div>
    </DialogShell>
  );
}

function ReservationFlow({
  offer,
  step,
  setStep,
  quantity,
  confirming,
  onConfirm,
  success,
  onClose,
  onDone,
  onDirections,
  onCalendar,
}: {
  offer: Offer;
  step: number;
  setStep: (step: number) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  confirming: boolean;
  onConfirm: () => void;
  success: Reservation | null;
  onClose: () => void;
  onDone: () => void;
  onDirections: () => void;
  onCalendar: () => void;
}) {
  const total = offer.price * quantity;
  const [acknowledged, setAcknowledged] = useState(true);

  return (
    <DialogShell titleId="reservation-title" onClose={onClose}>
      <div className="p-4 border-b border-line flex items-center justify-between">
        <strong className="text-xs font-bold text-muted">{step < 3 ? `${numberFa(step)} از ۲` : "انجام شد"}</strong>
      </div>
      {step < 3 && (
        <div className="grid grid-cols-2 gap-1 px-4 pt-2" aria-label={`مرحله ${numberFa(step)} از ۲`}>
          <div className={`h-1 rounded-full ${step >= 1 ? "bg-brand-2" : "bg-line"}`} />
          <div className={`h-1 rounded-full ${step >= 2 ? "bg-brand-2" : "bg-line"}`} />
        </div>
      )}

      <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        {step === 1 && (
          <>
            <div>
              <h2 id="reservation-title" className="text-base font-black text-ink">همه‌چیز در یک نگاه</h2>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-canvas border border-line">
              <span className="relative block w-14 h-14 rounded-xl overflow-hidden bg-surface shrink-0">
                <FoodImage src={offer.image} sizes="60px" className="w-full h-full object-cover" />
              </span>
              <div>
                <strong className="block text-xs font-bold text-ink">{offer.merchantName}</strong>
                <p className="text-xs text-muted mt-0.5">{offer.title}</p>
                <small className="block text-[11px] text-muted">{offer.neighborhood}</small>
              </div>
            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-soft text-brand-2">
                <div className="flex items-center gap-2">
                  <Icon name="clock" className="w-4 h-4 shrink-0" />
                  <div>
                    <strong className="block text-xs font-bold">{offer.pickup}</strong>
                    <small className="block text-[10px] opacity-80">دریافت حضوری از {offer.neighborhood}</small>
                  </div>
                </div>
                <Icon name="check" className="w-4 h-4" />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-canvas border border-line cursor-pointer">
                <Checkbox className="mt-0.5" checked={acknowledged} onCheckedChange={(val) => setAcknowledged(Boolean(val))} />
                <p className="text-xs text-muted leading-relaxed">
                  می‌دانم ترکیب جعبه متغیر است و هشدار آلرژی را بررسی کرده‌ام.
                </p>
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-line">
                <span className="text-xs text-muted">جمع رزرو</span>
                <strong className="text-sm font-black text-ink">{money(total)}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
              <Icon name="info" className="w-4 h-4 shrink-0" />
              <p><strong>این رزرو آزمایشی است.</strong> پرداخت واقعی انجام نمی‌شود.</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 id="reservation-title" className="text-base font-black text-ink">آمادهٔ ثبت رزرو</h2>
            </div>
            <div className="divide-y divide-line rounded-2xl bg-canvas border border-line overflow-hidden">
              <div className="flex items-center justify-between p-3 text-xs">
                <small className="text-muted">فروشگاه</small>
                <strong className="font-bold text-ink">{offer.merchantName}</strong>
              </div>
              <div className="flex items-center justify-between p-3 text-xs">
                <small className="text-muted">تعداد</small>
                <strong className="font-bold text-ink">{numberFa(quantity)} جعبه</strong>
              </div>
              <div className="flex items-center justify-between p-3 text-xs">
                <small className="text-muted">دریافت</small>
                <strong className="font-bold text-ink">{offer.pickup}</strong>
              </div>
              <div className="flex items-center justify-between p-3 text-xs">
                <small className="text-muted">مبلغ</small>
                <strong className="font-black text-brand-2">{money(total)}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-soft text-brand-2 text-xs">
              <Icon name="bell" className="w-4 h-4 shrink-0" />
              <p>یادآوری دریافت از تنظیمات حساب قابل کنترل است.</p>
            </div>
          </>
        )}

        {step === 3 && success && (
          <SuccessState reservation={success} onDirections={onDirections} onCalendar={onCalendar} onDone={onDone} />
        )}
      </div>

      {step < 3 && (
        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-line flex items-center justify-end gap-2 bg-surface">
          {step > 1 && (
            <button
              className="px-5 h-12 min-h-[48px] text-xs sm:text-sm font-bold rounded-2xl bg-canvas border border-line text-ink hover:bg-surface-raised transition-colors cursor-pointer"
              type="button"
              onClick={() => setStep(step - 1)}
            >
              برگشت
            </button>
          )}
          <button
            className="flex-1 h-12 min-h-[48px] inline-flex items-center justify-center text-xs sm:text-sm font-bold rounded-2xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            type="button"
            onClick={() => (step === 2 ? onConfirm() : setStep(2))}
            disabled={confirming || !acknowledged}
          >
            {confirming ? "در حال ثبت..." : step === 2 ? "تأیید رزرو" : "مرور نهایی"}
          </button>
        </div>
      )}
    </DialogShell>
  );
}

function SuccessState({
  reservation,
  onDirections,
  onCalendar,
  onDone,
}: {
  reservation: Reservation;
  onDirections: () => void;
  onCalendar: () => void;
  onDone: () => void;
}) {
  return (
    <div className="text-center space-y-4 py-2">
      <div className="w-14 h-14 mx-auto rounded-full bg-brand-soft text-brand-2 dark:bg-[#F87F45]/15 dark:text-[#FDA74D] grid place-items-center">
        <SuccessCheck />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-2">رزرو با موفقیت انجام شد</p>
        <h2 id="reservation-title" className="text-base font-black text-ink mt-0.5">جعبه‌ات کنار گذاشته شد!</h2>
        <p className="text-xs text-muted mt-1 leading-relaxed">در بازهٔ تعیین‌شده به فروشگاه برو و کد دریافت را نشان بده.</p>
      </div>

      <div className="p-4 rounded-2xl bg-canvas border border-line text-start space-y-3">
        <div className="flex items-center gap-2">
          <Image src="/icons/dibz-ios-dark.png" alt="" width={24} height={24} className="rounded-md" />
          <small className="text-[11px] font-bold text-muted">برگهٔ دریافت دیبز</small>
        </div>
        <div>
          <strong className="block text-xs font-bold text-ink">{reservation.merchantName}</strong>
          <small className="block text-[11px] text-muted mt-0.5">{reservation.pickup}</small>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-line">
          <div>
            <small className="block text-[10px] text-muted">کد دریافت</small>
            <strong className="block text-lg font-mono font-black text-ink">{reservation.code}</strong>
          </div>
          <MiniQr code={reservation.code} />
        </div>
        <p className="text-xs text-muted">{reservation.address}</p>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-brand-soft text-brand-2 text-xs font-bold">
        <span>تا شروع زمان دریافت</span>
        <span>۲ ساعت و ۱۲ دقیقه</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDirections}
          className="flex-1 h-11 min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl bg-canvas border border-line text-ink hover:bg-surface-raised transition-colors"
        >
          <Icon name="route" className="w-4 h-4 text-muted" />
          <span>مسیریابی</span>
        </button>
        <button
          type="button"
          onClick={onCalendar}
          className="flex-1 h-11 min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl bg-canvas border border-line text-ink hover:bg-surface-raised transition-colors"
        >
          <Icon name="calendar" className="w-4 h-4 text-muted" />
          <span>افزودن به تقویم</span>
        </button>
      </div>

      <button
        className="w-full h-11 min-h-[44px] inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity"
        type="button"
        onClick={onDone}
      >
        دیدن در رزروهای من
      </button>
    </div>
  );
}

function FilterSheet({
  maxDistance,
  setMaxDistance,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  pickup,
  setPickup,
  onReset,
  onClose,
  resultCount,
}: {
  maxDistance: number;
  setMaxDistance: (value: number) => void;
  minPrice: number;
  setMinPrice: (value: number) => void;
  maxPrice: number;
  setMaxPrice: (value: number) => void;
  pickup: "all" | PickupPeriod;
  setPickup: (value: "all" | PickupPeriod) => void;
  onReset: () => void;
  onClose: () => void;
  resultCount: number;
}) {
  const handleMinPriceChange = (val: number) => {
    if (val > maxPrice) {
      setMaxPrice(val);
    }
    setMinPrice(val);
  };

  const handleMaxPriceChange = (val: number) => {
    if (val < minPrice) {
      setMinPrice(val);
    }
    setMaxPrice(val);
  };

  return (
    <DialogShell titleId="filters-title" onClose={onClose}>
      <div className="p-5 space-y-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between pb-3 border-b border-line pe-12">
          <h2 id="filters-title" className="text-base font-black text-ink">فیلتر پیشنهادها</h2>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="distance-range" className="text-muted font-medium">حداکثر فاصله</label>
            <strong className="font-bold text-ink">{numberFa(maxDistance)} کیلومتر</strong>
          </div>
          <input
            id="distance-range"
            type="range"
            min="1"
            max="10"
            step="1"
            value={maxDistance}
            onChange={(event) => setMaxDistance(Number(event.target.value))}
            className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand-2"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-medium">محدودهٔ قیمت هر جعبه</span>
            <span className="px-2.5 py-1 rounded-full bg-brand-soft text-brand-2 text-xs font-bold">
              از {money(minPrice)} تا {money(maxPrice)}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <label htmlFor="min-price-range" className="text-muted font-medium">حداقل قیمت</label>
              <strong className="font-bold text-ink">{money(minPrice)}</strong>
            </div>
            <input
              id="min-price-range"
              type="range"
              min="0"
              max="350000"
              step="10000"
              value={minPrice}
              onChange={(event) => handleMinPriceChange(Number(event.target.value))}
              className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand-2"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <label htmlFor="max-price-range" className="text-muted font-medium">حداکثر قیمت</label>
              <strong className="font-bold text-ink">{money(maxPrice)}</strong>
            </div>
            <input
              id="max-price-range"
              type="range"
              min="0"
              max="350000"
              step="10000"
              value={maxPrice}
              onChange={(event) => handleMaxPriceChange(Number(event.target.value))}
              className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand-2"
            />
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs text-muted mb-1 font-medium">زمان دریافت</legend>
          <GlassSegmentedControl
            value={pickup}
            onChange={setPickup}
            ariaLabel="زمان دریافت"
            className="pickup-selector"
            options={[
              { value: "all", label: "همه" },
              { value: "evening", label: "امشب" },
              { value: "late", label: "آخر شب" },
              { value: "tomorrow", label: "فردا" },
            ]}
          />
        </fieldset>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
          <button
            className="text-xs font-bold text-brand-2 hover:opacity-80 px-3 py-2 min-h-[44px] inline-flex items-center cursor-pointer active:opacity-75 transition-opacity"
            type="button"
            onClick={onReset}
          >
            پاک کردن همه
          </button>
          <button
            className="h-11 min-h-[44px] px-6 inline-flex items-center justify-center text-xs font-bold rounded-2xl bg-brand-2 text-white hover:opacity-90 shadow-sm transition-all cursor-pointer active:scale-95"
            type="button"
            onClick={onClose}
          >
            نمایش {numberFa(resultCount)} نتیجه
          </button>
        </div>
      </div>
    </DialogShell>
  );
}

function LocationSheet({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const locations = ["تهران، ونک", "تهران، میدان ولیعصر", "تهران، یوسف‌آباد"];
  return (
    <DialogShell titleId="location-title" onClose={onClose}>
      <div className="p-5 space-y-4">
        <div>
          <h2 id="location-title" className="text-base font-black text-ink">کجای تهران هستی؟</h2>
          <p className="text-xs text-muted mt-1">محدودهٔ نزدیک خودت را انتخاب کن.</p>
        </div>
        <div className="divide-y divide-line rounded-2xl bg-canvas border border-line overflow-hidden">
          {locations.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => onChange(item)}
              className={`w-full flex items-center justify-between p-3.5 min-h-[44px] text-xs text-start transition-colors cursor-pointer ${
                value === item ? "bg-brand-soft text-brand-2 font-bold" : "text-ink hover:bg-surface"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon name="pin" className="w-4 h-4 text-muted" />
                <span>{item}</span>
              </div>
              {value === item && <Icon name="check" className="w-4 h-4 text-brand-2" />}
            </button>
          ))}
        </div>
      </div>
    </DialogShell>
  );
}

function AboutSheet({ onClose }: { onClose: () => void }) {
  return (
    <DialogShell titleId="about-title" onClose={onClose}>
      <div className="p-5 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-soft grid place-items-center overflow-hidden">
          <Image src="/brand/dibz-mascot-transparent.png" alt="" width={72} height={72} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-2">داستان دیبز</p>
          <h2 id="about-title" className="text-base font-black text-ink mt-0.5">انتخاب خوش‌طعم برای امروز</h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            دیبز کاربران را به جعبه‌های سالم و آمادهٔ دریافت حضوری در محله‌شان وصل می‌کند.
          </p>
        </div>

        <ul className="text-start space-y-3 p-4 rounded-2xl bg-canvas border border-line">
          <li className="flex items-start gap-2.5 text-xs">
            <Icon name="spark" className="w-4 h-4 text-brand-2 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-ink">جعبهٔ غافلگیرکننده</strong>
              <span className="text-muted text-[11px]">محتوا دقیقاً از قبل معلوم نیست، اما ایمنی نامعلوم نیست.</span>
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs">
            <Icon name="clock" className="w-4 h-4 text-brand-2 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-ink">دریافت حضوری</strong>
              <span className="text-muted text-[11px]">هر رزرو بازهٔ مشخص دارد و ارسال نداریم.</span>
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs">
            <Icon name="info" className="w-4 h-4 text-brand-2 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-ink">شفافیت و ایمنی</strong>
              <span className="text-muted text-[11px]">محصول تاریخ‌گذشته یا نامناسب برای مصرف در دیبز عرضه نمی‌شود.</span>
            </div>
          </li>
        </ul>

        <button
          className="w-full h-11 min-h-[44px] inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
          type="button"
          onClick={onClose}
        >
          متوجه شدم
        </button>
      </div>
    </DialogShell>
  );
}

function CancelDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <DialogShell label="تأیید لغو رزرو" onClose={onClose} size="center">
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 grid place-items-center">
          <Icon name="trash" className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-black text-ink">رزرو لغو شود؟</h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            پس از لغو، کد دریافت غیرفعال و موجودی مجاز به فروشگاه بازگردانده می‌شود.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 h-11 min-h-[44px] text-xs font-bold rounded-xl bg-canvas border border-line text-ink hover:bg-surface-raised transition-colors cursor-pointer"
            type="button"
            onClick={onClose}
          >
            نه، نگهش دار
          </button>
          <button
            className="flex-1 h-11 min-h-[44px] text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
            type="button"
            onClick={onConfirm}
          >
            بله، لغو کن
          </button>
        </div>
      </div>
    </DialogShell>
  );
}

function OrderReceiptModal({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  return (
    <DialogShell onClose={onClose} label="رسید الکترونیکی سفارش">
      <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto text-start">
        {/* Header receipt badge & store */}
        <div className="text-center space-y-2 pt-1 pb-3 border-b border-dashed border-line">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-soft text-brand-2 dark:bg-[#F87F45]/15 dark:text-[#FDA74D] grid place-items-center shadow-2xs">
            <Icon name="receipt" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink">رسید سفارش دیبز</h2>
            <p className="text-xs font-bold text-muted mt-0.5">{reservation.merchantName}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-line text-[11px] font-bold text-muted">
            <span>شناسه سفارش:</span>
            <span className="font-mono text-ink font-black">#{faDigits(reservation.id.replace("order-", ""))}</span>
          </div>
        </div>

        {/* Date and Time Details */}
        <div className="p-3.5 rounded-2xl bg-canvas border border-line space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted font-bold">زمان و بازه تحویل:</span>
            <span className="font-bold text-ink">{reservation.pickup}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted font-bold shrink-0">آدرس دریافت:</span>
            <span className="font-bold text-ink text-end leading-tight">{reservation.address}</span>
          </div>
          {reservation.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted font-bold">تاریخ ثبت سفارش:</span>
              <span className="font-bold text-muted">{formatJalaliDate(reservation.createdAt)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted font-bold">وضعیت سفارش:</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <Icon name="check" className="w-3.5 h-3.5" />
              <span>تحویل حضوری با موفقیت انجام شد</span>
            </span>
          </div>
        </div>

        {/* Food Name & Price */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-canvas border border-line flex items-center justify-between gap-3">
          <strong className="text-xs sm:text-sm font-black text-ink truncate leading-tight">{reservation.title}</strong>
          <span className="text-xs sm:text-sm font-black text-ink shrink-0 whitespace-nowrap">{money(reservation.total)}</span>
        </div>

        {/* Price Breakdown */}
        <div className="p-3.5 rounded-2xl bg-canvas border border-line space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted font-bold">روش پرداخت:</span>
            <span className="font-bold text-ink">پرداخت شبیه‌سازی‌شده (کیف پول دیبز)</span>
          </div>

          {reservation.originalPrice && reservation.originalPrice > reservation.total && (
            <div className="flex items-center justify-between text-muted">
              <span>ارزش مرجع بسته:</span>
              <del className="font-mono">{money(reservation.originalPrice)}</del>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-line/60">
            <span className="text-sm font-black text-ink">مبلغ پرداخت‌شده:</span>
            <span className="text-base sm:text-lg font-black text-brand-2 dark:text-[#FDA74D]">
              {money(reservation.total)}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-surface border border-line text-ink font-black text-xs sm:text-sm hover:bg-canvas transition-colors cursor-pointer active:scale-[0.98]"
          >
            بستن رسید
          </button>
        </div>
      </div>
    </DialogShell>
  );
}

function ReviewDialog({
  orderId,
  onClose,
  onSubmit,
}: {
  orderId: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <DialogShell titleId="customer-review-title" onClose={onClose}>
      <form
        className="p-5 space-y-4 text-start"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(rating, comment);
        }}
      >
        <div>
          <h2 id="customer-review-title" className="text-base font-black text-ink">نظرت درباره این سفارش چیست؟</h2>
          <p className="text-xs text-muted mt-1">پاسخ شما در پنل کیفیت کسب‌وکار دیده می‌شود. سفارش: <b className="font-mono">{orderId}</b></p>
        </div>

        <div className="flex items-center justify-center gap-2 py-2" role="radiogroup" aria-label="امتیاز از پنج">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              role="radio"
              aria-checked={rating === value}
              className={`min-w-[44px] min-h-[44px] grid place-items-center text-2xl transition-transform hover:scale-125 cursor-pointer ${
                rating >= value ? "text-amber-500" : "text-muted/40"
              }`}
              onClick={() => setRating(value)}
              key={value}
              aria-label={`${value} ستاره`}
            >
              ★
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">توضیح اختیاری</span>
          <textarea
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="چه چیزی خوب بود یا بهتر می‌شد؟"
            className="p-3 text-xs rounded-xl bg-canvas border border-line text-ink focus:outline-none focus:border-brand-2/50 resize-none"
          />
        </label>

        <button
          className="w-full h-11 min-h-[44px] inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
          type="submit"
        >
          ثبت نظر
        </button>
      </form>
    </DialogShell>
  );
}

function SectionHeading({
  eyebrow,
  title,
  id,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  id?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        {eyebrow && <span className="block text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider mb-0.5">{eyebrow}</span>}
        <h2 id={id} className="text-lg sm:text-xl font-black text-ink tracking-tight">{title}</h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 min-h-[44px] px-2 text-xs font-bold text-brand-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span>{action}</span>
          <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      )}
    </div>
  );
}


function MiniQr({ code }: { code: string }) {
  const seed = [...code].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <span
      className="grid grid-cols-9 gap-0.5 p-1.5 rounded-lg bg-white border border-line shrink-0"
      aria-label={`کد دیداری دریافت ${code}`}
    >
      {Array.from({ length: 81 }, (_, index) => (
        <i
          className={`w-1 h-1 rounded-[1px] ${
            (index * 7 + seed + index * index) % 5 < 2 ? "bg-black" : "bg-transparent"
          }`}
          key={index}
        />
      ))}
    </span>
  );
}

function addToCalendar(reservation: Reservation | null, showToast: (message: string) => void) {
  if (!reservation) return;
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:دریافت جعبه از ${reservation.merchantName}`,
    `LOCATION:${reservation.address}`,
    "DTSTART:20260722T170000Z",
    "DTEND:20260722T180000Z",
    `DESCRIPTION:کد دریافت ${reservation.code}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "dibz-pickup.ics";
  link.click();
  URL.revokeObjectURL(url);
  showToast("یادآور دریافت برای تقویم آماده شد.");
}
