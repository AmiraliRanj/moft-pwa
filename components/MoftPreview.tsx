"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomNavigation } from "@/components/moft/BottomNavigation";
import { CategorySelector } from "@/components/moft/CategorySelector";
import { DialogShell } from "@/components/moft/DialogShell";
import { EmptyState } from "@/components/moft/EmptyState";
import { FoodImage } from "@/components/moft/FoodImage";
import { HomeHeroCarousel } from "@/components/moft/HomeHeroCarousel";
import { AnimatedNumber } from "@/components/moft/AnimatedNumber";
import { GlassSegmentedControl } from "@/components/glass/GlassSegmentedControl";
import { GlassToggle } from "@/components/glass/GlassToggle";
import { SuccessCheck } from "@/components/motion/SuccessCheck";
import { Icon } from "@/components/moft/Icon";
import { LoadingSkeleton } from "@/components/moft/LoadingSkeleton";
import { OfferCard, OfferList } from "@/components/moft/OfferCard";
import { SearchBar } from "@/components/moft/SearchBar";
import { SelectField } from "@/components/shared/FormControls";
import { useMoftTheme } from "@/components/shared/ThemeToggle";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster, toast as toastManager } from "@/components/ui/toast";
import { useDemo } from "@/demo/DemoProvider";
import { orderStatusLabel, remainingQuantity } from "@/lib/demo-format";
import { decimalFa, discountPercent, distanceFa, money, numberFa } from "@/lib/moft-format";
import type { MarketplaceOffer, Order } from "@/types/demo";
import type { AppTab, CategoryId, Offer, PickupPeriod, Reservation } from "@/types/moft";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Layer = "detail" | "reserve" | "filters" | "location" | "about" | "cancel" | "review" | null;
type SortMode = "nearest" | "popular" | "discount";
type ReservationView = "active" | "history";

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
    title: order.items[0].title,
    pickup: `${faDigits(order.pickupDate)}، ${faDigits(order.pickupStart)} تا ${faDigits(order.pickupEnd)}`,
    address: offer?.address ?? "شعبه انتخاب‌شده",
    code: faDigits(order.pickupCode.value),
    quantity: order.items[0].quantity,
    total: order.total,
    status,
    orderStatus: order.status,
    hasReview: Boolean(review),
    reviewResponse: review?.response,
    createdAt: order.createdAt,
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
  const [layer, setLayer] = useState<Layer>(null);
  const [reservationStep, setReservationStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [successReservation, setSuccessReservation] = useState<Reservation | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reservationView, setReservationView] = useState<ReservationView>("active");
  const [pageLoading, setPageLoading] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [online, setOnline] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [islandVisible, setIslandVisible] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [maxPrice, setMaxPrice] = useState(300000);
  const [pickupFilter, setPickupFilter] = useState<"all" | PickupPeriod>("all");
  const [sort, setSort] = useState<SortMode>("nearest");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavoritesOnly);
  const [location, setLocation] = useState("تهران، ونک");
  const routeHandledRef = useRef(false);

  const showToast = useCallback((message: string) => {
    toastManager.add({ title: message, type: "success", timeout: 3400 });
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
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.clearTimeout(hydrateTimer);
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
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
  const historyReservations = reservations.filter((item) => item.status !== "active");
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
        offer.price <= maxPrice &&
        (pickupFilter === "all" || offer.pickupPeriod === pickupFilter) &&
        (!favoritesOnly || favoriteSet.has(offer.id))
    );
    return [...filtered].sort((a, b) => {
      if (sort === "popular") return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sort === "discount") return discountPercent(b.originalPrice, b.price) - discountPercent(a.originalPrice, a.price);
      return a.distanceKm - b.distanceKm;
    });
  }, [baseFilteredOffers, favoriteSet, favoritesOnly, maxDistance, maxPrice, pickupFilter, sort]);

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    const removing = next.has(id);
    if (removing) next.delete(id);
    else next.add(id);
    setFavorites(next);
    localStorage.setItem(storageKeys.favorites, JSON.stringify([...next]));
    showToast(removing ? "از علاقه‌مندی‌ها حذف شد." : "به علاقه‌مندی‌ها اضافه شد.");
  };

  const switchTab = (nextTab: AppTab) => {
    if (nextTab === tab) return;
    setPageLoading(true);
    setTab(nextTab);
    const paths: Record<AppTab, string> = {
      home: "/customer",
      discover: "/customer/offers",
      reservations: "/customer/orders",
      profile: "/customer/profile",
    };
    window.history.pushState({}, "", paths[nextTab]);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => setPageLoading(false), 360);
  };

  const openOffer = (offer: Offer) => {
    setSelected(offer);
    setLayer("detail");
    window.history.pushState({}, "", `/customer/offers/${encodeURIComponent(offer.id)}`);
  };

  const closeOffer = () => {
    setLayer(null);
    const paths: Record<AppTab, string> = {
      home: "/customer",
      discover: "/customer/offers",
      reservations: "/customer/orders",
      profile: "/customer/profile",
    };
    window.history.replaceState({}, "", paths[tab]);
  };

  const openReservation = () => {
    if (!selected || selected.quantityLeft < 1) return;
    if (!online) {
      showToast("برای ثبت رزرو دوباره آنلاین شو.");
      return;
    }
    setQuantity(1);
    setReservationStep(1);
    setSuccessReservation(null);
    setLayer("reserve");
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

  const openFavorites = () => {
    setFavoritesOnly(true);
    setCategory("all");
    setQuery("");
    switchTab("discover");
    window.history.replaceState({}, "", "/customer/favorites");
  };

  const requestReview = (id: string) => {
    setReviewOrderId(id);
    setLayer("review");
  };

  const savedMeals = reservations
    .filter((item) => item.status === "active" || item.status === "collected")
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-canvas text-ink relative overflow-hidden font-sans select-none pb-24">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 px-3 py-1 bg-surface text-ink rounded-lg border border-line"
        href="#main-content"
      >
        رفتن به محتوای اصلی
      </a>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 start-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-soft/60 blur-[100px] rounded-full" aria-hidden="true" />
      <div className="pointer-events-none absolute top-1/3 -start-32 w-[350px] h-[350px] bg-amber-500/10 blur-[90px] rounded-full" aria-hidden="true" />

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
          <span className="w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center shrink-0">
            <Icon name="check" className="w-4 h-4" />
          </span>
          <div className="flex-1">
            <strong className="block text-xs font-bold text-ink">رزرو آماده شد</strong>
            <small className="block text-[11px] text-muted">کد دریافت {successReservation.code}</small>
          </div>
        </div>
      )}

      <section className="max-w-md mx-auto px-4 pt-3 space-y-4">
        <header className="flex items-center justify-between gap-3 py-1">
          <p className="text-xs font-bold text-muted">سلام {state.customer.name.split(" ")[0]}، عصر بخیر 👋</p>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-xs hover:border-brand-2/40 transition-colors text-start"
              type="button"
              onClick={() => setLayer("location")}
              aria-label={`تغییر موقعیت فعلی؛ ${location}`}
            >
              <span className="w-5 h-5 rounded-full bg-brand-soft text-brand-2 grid place-items-center shrink-0">
                <Icon name="pin" className="w-3 h-3" />
              </span>
              <div className="leading-tight">
                <small className="block text-[9px] text-muted">نزدیک شما</small>
                <strong className="block text-[11px] font-bold text-ink truncate max-w-[90px]">{location}</strong>
              </div>
              <Icon name="chevron" className="w-3 h-3 text-muted rtl:rotate-180 opacity-60" />
            </button>
            <button
              className="relative w-9 h-9 rounded-full bg-surface border border-line shadow-xs grid place-items-center hover:border-brand-2/40 transition-colors"
              type="button"
              onClick={openFavorites}
              aria-label="نمایش علاقه‌مندی‌ها"
            >
              <Icon name="heart" filled={favorites.size > 0} className={`w-4 h-4 ${favorites.size > 0 ? "text-rose-500" : "text-muted"}`} />
              {favorites.size > 0 && (
                <b className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black grid place-items-center">
                  {numberFa(favorites.size)}
                </b>
              )}
            </button>
          </div>
        </header>

        <div id="main-content" tabIndex={-1} className="space-y-4">
          {pageLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {tab === "home" && (
                <HomePage
                  query={query}
                  setQuery={setQuery}
                  category={category}
                  setCategory={setCategory}
                  offers={baseFilteredOffers}
                  allOffers={offers}
                  favorites={favorites}
                  onFavorite={toggleFavorite}
                  onSelect={openOffer}
                  onDiscover={() => switchTab("discover")}
                  installPrompt={installPrompt}
                  installed={installed}
                  onInstall={install}
                  savedMeals={savedMeals}
                />
              )}
              {tab === "discover" && (
                <DiscoverPage
                  query={query}
                  setQuery={setQuery}
                  category={category}
                  setCategory={setCategory}
                  offers={discoverOffers}
                  favorites={favorites}
                  onFavorite={toggleFavorite}
                  onSelect={openOffer}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  sort={sort}
                  setSort={setSort}
                  onFilters={() => setLayer("filters")}
                  favoritesOnly={favoritesOnly}
                  setFavoritesOnly={setFavoritesOnly}
                />
              )}
              {tab === "reservations" && (
                <ReservationsPage
                  active={activeReservations}
                  history={historyReservations}
                  view={reservationView}
                  setView={setReservationView}
                  onCancel={requestCancel}
                  onReview={requestReview}
                  onDiscover={() => switchTab("discover")}
                  onDirections={() => showToast("مسیریابی این فروشگاه اکنون در دسترس نیست.")}
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
                  onAbout={() => setLayer("about")}
                  showToast={showToast}
                  customerName={state.customer.name}
                />
              )}
            </>
          )}
        </div>

        <BottomNavigation value={tab} onChange={switchTab} reservationCount={activeReservations.length} />
      </section>

      {/* Sheets & Dialogs */}
      {layer === "detail" && selected && (
        <OfferDetails
          offer={selected}
          favorite={favorites.has(selected.id)}
          onFavorite={toggleFavorite}
          onClose={closeOffer}
          onReserve={openReservation}
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
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          pickup={pickupFilter}
          setPickup={setPickupFilter}
          onReset={() => {
            setMaxDistance(10);
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
      <Toaster timeout={3400} limit={3} />
    </main>
  );
}

function HomePage({
  query,
  setQuery,
  category,
  setCategory,
  offers,
  allOffers,
  favorites,
  onFavorite,
  onSelect,
  onDiscover,
  installPrompt,
  installed,
  onInstall,
  savedMeals,
}: {
  query: string;
  setQuery: (value: string) => void;
  category: CategoryId;
  setCategory: (value: CategoryId) => void;
  offers: Offer[];
  allOffers: Offer[];
  favorites: Set<string>;
  onFavorite: (id: string) => void;
  onSelect: (offer: Offer) => void;
  onDiscover: () => void;
  installPrompt: InstallPromptEvent | null;
  installed: boolean;
  onInstall: () => void;
  savedMeals: number;
}) {
  const browsing = Boolean(query.trim()) || category !== "all";
  const popular = allOffers.filter((offer) => offer.popular).slice(0, 4);
  const ending = allOffers.filter((offer) => offer.endingSoon).slice(0, 5);

  return (
    <div className="space-y-4">
      <SearchBar value={query} onChange={setQuery} placeholder="کافه، رستوران یا محله..." />
      <CategorySelector value={category} onChange={setCategory} />
      <HomeHeroCarousel onDiscover={onDiscover} />

      {!installed && installPrompt && (
        <button
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-surface border border-line shadow-xs hover:border-brand-2/40 transition-colors text-start"
          type="button"
          onClick={onInstall}
        >
          <span className="w-11 h-11 rounded-xl overflow-hidden bg-brand-soft shrink-0">
            <Image src="/icons/dibz-ios-default-180-v2.png" alt="" width={44} height={44} />
          </span>
          <div className="flex-1">
            <strong className="block text-xs font-bold text-ink">دیبز را نصب کن</strong>
            <small className="block text-[11px] text-muted mt-0.5">سریع‌تر بازش کن و آفلاین هم ببین</small>
          </div>
          <Icon name="arrow" className="w-4 h-4 text-muted rtl:rotate-180 shrink-0" />
        </button>
      )}

      {browsing ? (
        <section className="space-y-3" aria-labelledby="search-results-title">
          <SectionHeading eyebrow="نتیجهٔ جست‌وجو" title={`${numberFa(offers.length)} پیشنهاد پیدا شد`} id="search-results-title" />
          {offers.length ? (
            <OfferList offers={offers} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} />
          ) : (
            <EmptyState title="این اطراف چیزی پیدا نشد" text="عبارت جست‌وجو یا دسته‌بندی را تغییر بده." />
          )}
        </section>
      ) : (
        <>
          <section className="space-y-3" aria-labelledby="near-title">
            <SectionHeading eyebrow="نزدیک شما" title="انتخاب‌های تازهٔ امروز" id="near-title" action="دیدن همه" onAction={onDiscover} />
            <OfferList offers={allOffers.slice(0, 4)} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} />
          </section>

          <section className="space-y-3" aria-labelledby="ending-title">
            <SectionHeading eyebrow="فرصت کوتاه" title="داره تموم می‌شه" id="ending-title" />
            <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {ending.map((offer) => (
                <OfferCard compact key={offer.id} offer={offer} favorite={favorites.has(offer.id)} onFavorite={onFavorite} onSelect={onSelect} />
              ))}
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="popular-title">
            <SectionHeading eyebrow="محبوب این هفته" title="همسایه‌های خوش‌سلیقه" id="popular-title" />
            <div className="grid gap-2">
              {popular.map((offer) => (
                <button
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface border border-line shadow-xs hover:border-brand-2/30 transition-colors text-start"
                  type="button"
                  key={offer.id}
                  onClick={() => onSelect(offer)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl overflow-hidden bg-canvas shrink-0">
                      <FoodImage src={offer.image} sizes="48px" className="w-full h-full object-cover" />
                    </span>
                    <div>
                      <strong className="block text-xs font-bold text-ink">{offer.merchantName}</strong>
                      <small className="block text-[11px] text-muted mt-0.5">{offer.neighborhood} · امتیاز {decimalFa(offer.rating)}</small>
                    </div>
                  </div>
                  <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180 shrink-0" />
                </button>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-between gap-4 p-5 rounded-3xl bg-surface border border-line shadow-xs">
            <div className="space-y-1">
              <span className="w-8 h-8 rounded-xl bg-brand-soft text-brand-2 grid place-items-center mb-1">
                <Icon name="leaf" className="w-4 h-4" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">اثر کوچک، حال خوب بزرگ</p>
              <h2 className="text-sm font-black text-ink leading-snug">
                تا امروز <AnimatedNumber value={savedMeals || 1} /> وعده با یک انتخاب خوب همراه شده.
              </h2>
              <p className="text-[11px] text-muted leading-relaxed">
                {savedMeals ? "این عدد با رزروهای تو به‌روز می‌شود." : "اولین جعبه‌ات می‌تواند شروع این مسیر باشد."}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-brand-soft text-brand-2 shrink-0">
              <strong className="text-base font-black leading-none">
                <AnimatedNumber value={(savedMeals || 1) * 11} />
              </strong>
              <small className="text-[10px] text-center mt-1 font-bold leading-tight">
                لیتر آب<br />تخمینی
              </small>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function DiscoverPage({
  query,
  setQuery,
  category,
  setCategory,
  offers,
  favorites,
  onFavorite,
  onSelect,
  viewMode,
  setViewMode,
  sort,
  setSort,
  onFilters,
  favoritesOnly,
  setFavoritesOnly,
}: {
  query: string;
  setQuery: (value: string) => void;
  category: CategoryId;
  setCategory: (value: CategoryId) => void;
  offers: Offer[];
  favorites: Set<string>;
  onFavorite: (id: string) => void;
  onSelect: (offer: Offer) => void;
  viewMode: "list" | "map";
  setViewMode: (value: "list" | "map") => void;
  sort: SortMode;
  setSort: (value: SortMode) => void;
  onFilters: () => void;
  favoritesOnly: boolean;
  setFavoritesOnly: (value: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <PageTitle eyebrow="کشف" title="مزه‌های خوبِ اطراف" text="پیشنهادها را بر اساس فاصله، قیمت و زمان دریافت پیدا کن." />
      <SearchBar value={query} onChange={setQuery} />
      <CategorySelector value={category} onChange={setCategory} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-surface border border-line text-ink hover:bg-surface-raised transition-colors shadow-xs"
          type="button"
          onClick={onFilters}
        >
          <Icon name="sliders" className="w-3.5 h-3.5 text-muted" />
          <span>فیلترها</span>
        </button>
        <button
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors shadow-xs ${
            favoritesOnly
              ? "bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold"
              : "bg-surface border-line text-ink hover:bg-surface-raised"
          }`}
          type="button"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          aria-pressed={favoritesOnly}
        >
          <Icon name="heart" filled={favoritesOnly} className="w-3.5 h-3.5" />
          <span>علاقه‌مندی‌ها</span>
        </button>
        <div className="ms-auto">
          <SelectField
            label=""
            value={sort}
            onChange={(value) => setSort(value as SortMode)}
            options={[
              { value: "nearest", label: "نزدیک‌ترین" },
              { value: "popular", label: "محبوب‌ترین" },
              { value: "discount", label: "بیشترین تخفیف" },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted pt-1">
        <span>{numberFa(offers.length)} پیشنهاد</span>
        <div className="flex items-center rounded-xl bg-surface border border-line p-0.5 shadow-xs" role="group" aria-label="نوع نمایش">
          <button
            type="button"
            className={`w-7 h-7 rounded-lg grid place-items-center transition-colors ${
              viewMode === "list" ? "bg-brand-soft text-brand-2 font-bold" : "text-muted hover:text-ink"
            }`}
            onClick={() => setViewMode("list")}
            aria-label="نمایش فهرستی"
            aria-pressed={viewMode === "list"}
          >
            <Icon name="list" className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className={`w-7 h-7 rounded-lg grid place-items-center transition-colors ${
              viewMode === "map" ? "bg-brand-soft text-brand-2 font-bold" : "text-muted hover:text-ink"
            }`}
            onClick={() => setViewMode("map")}
            aria-label="پیش‌نمایش نقشه"
            aria-pressed={viewMode === "map"}
          >
            <Icon name="map" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {offers.length ? (
        viewMode === "list" ? (
          <OfferList offers={offers} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} />
        ) : (
          <MapPreview offers={offers} onSelect={onSelect} />
        )
      ) : (
        <EmptyState
          icon={favoritesOnly ? "heart" : "search"}
          title={favoritesOnly ? "علاقه‌مندی‌ای با این فیلتر نیست" : "پیشنهادی پیدا نشد"}
          text="فاصله یا سقف قیمت را بیشتر کن و دوباره ببین."
          action="پاک کردن جست‌وجو"
          onAction={() => {
            setQuery("");
            setCategory("all");
            setFavoritesOnly(false);
          }}
        />
      )}
    </div>
  );
}

function MapPreview({ offers, onSelect }: { offers: Offer[]; onSelect: (offer: Offer) => void }) {
  return (
    <div className="relative h-72 rounded-3xl bg-surface border border-line overflow-hidden shadow-xs flex items-center justify-center" aria-label="موقعیت تقریبی فروشگاه‌ها">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-soft to-canvas" />
      <div className="absolute z-10 flex flex-col items-center">
        <span className="w-3.5 h-3.5 rounded-full bg-sky-500 ring-4 ring-sky-500/30 animate-pulse"></span>
        <small className="text-[10px] font-bold text-ink mt-1">شما</small>
      </div>
      {offers.slice(0, 6).map((offer, index) => (
        <button
          key={offer.id}
          type="button"
          className="absolute z-20 flex items-center gap-1 p-1 rounded-full bg-surface border border-line shadow-xs hover:scale-110 transition-transform"
          style={{ insetInlineStart: `${15 + ((index * 27) % 65)}%`, top: `${20 + ((index * 33) % 55)}%` }}
          onClick={() => onSelect(offer)}
          aria-label={`نمایش ${offer.merchantName}`}
        >
          <span className="w-6 h-6 rounded-full overflow-hidden bg-canvas">
            <FoodImage src={offer.image} sizes="24px" className="w-full h-full object-cover" />
          </span>
          <small className="text-[10px] font-bold px-1 text-ink">{money(offer.price)}</small>
        </button>
      ))}
      <div className="absolute bottom-2 inset-x-2 text-center text-[10px] text-muted bg-surface/80 backdrop-blur-sm py-1 rounded-xl border border-line">
        <Icon name="info" className="w-3 h-3 inline me-1 text-muted" /> موقعیت فروشگاه‌ها تقریبی است.
      </div>
    </div>
  );
}

function ReservationsPage({
  active,
  history,
  view,
  setView,
  onCancel,
  onReview,
  onDiscover,
  onDirections,
}: {
  active: Reservation[];
  history: Reservation[];
  view: ReservationView;
  setView: (view: ReservationView) => void;
  onCancel: (id: string) => void;
  onReview: (id: string) => void;
  onDiscover: () => void;
  onDirections: () => void;
}) {
  const items = view === "active" ? active : history;
  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="رزروهای من"
        title="جعبه‌ات منتظرته"
        text="کد دریافت را فقط وقتی به فروشنده نشان بده که جعبه را تحویل می‌گیری."
      />
      <GlassSegmentedControl
        value={view}
        onChange={setView}
        ariaLabel="نوع رزرو"
        className="segmented-control"
        role="tablist"
        options={[
          { value: "active", label: <>فعال <span>({numberFa(active.length)})</span></> },
          { value: "history", label: <>گذشته <span>({numberFa(history.length)})</span></> },
        ]}
      />
      {items.length ? (
        <div className="grid gap-3.5">
          {items.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={onCancel}
              onReview={onReview}
              onDirections={onDirections}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bag"
          title={view === "active" ? "رزرو فعالی نداری" : "هنوز سابقه‌ای نیست"}
          text={view === "active" ? "یک جعبهٔ نزدیک پیدا کن و برای امشب رزرو کن." : "رزروهای دریافت‌شده یا لغوشده اینجا می‌مانند."}
          action={view === "active" ? "کشف جعبه‌ها" : undefined}
          onAction={onDiscover}
        />
      )}
    </div>
  );
}

function ReservationCard({
  reservation,
  onCancel,
  onReview,
  onDirections,
}: {
  reservation: Reservation;
  onCancel: (id: string) => void;
  onReview: (id: string) => void;
  onDirections: () => void;
}) {
  const status = reservation.orderStatus
    ? orderStatusLabel[reservation.orderStatus]
    : reservation.status === "active"
    ? "فعال"
    : reservation.status === "collected"
    ? "دریافت شد"
    : reservation.status === "cancelled"
    ? "لغو شد"
    : "زمان دریافت گذشته";

  const cancellable = reservation.orderStatus
    ? ["paid", "reviewed", "preparing", "ready_for_pickup"].includes(reservation.orderStatus)
    : reservation.status === "active";

  const statusTone =
    reservation.status === "collected"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : reservation.status === "cancelled"
      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
      : "bg-brand-soft text-brand-2 border-brand-2/20";

  return (
    <article className="rounded-3xl bg-surface border border-line p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusTone}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status}
        </span>
        <span className="text-[11px] font-mono text-muted">{reservation.id}</span>
      </div>

      <div>
        <h2 className="text-sm font-black text-ink">{reservation.merchantName}</h2>
        <p className="text-xs text-muted mt-0.5">{reservation.title} · {numberFa(reservation.quantity)} جعبه</p>
      </div>

      <div className="flex flex-col gap-1 text-xs text-muted bg-canvas/40 p-2.5 rounded-xl border border-line">
        <span className="flex items-center gap-1.5">
          <Icon name="clock" className="w-3.5 h-3.5 text-muted shrink-0" />
          <span>{reservation.pickup}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="pin" className="w-3.5 h-3.5 text-muted shrink-0" />
          <span>{reservation.address}</span>
        </span>
      </div>

      {reservation.status === "active" && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-soft text-brand-2 text-xs font-bold">
          <span>زمان باقی‌مانده تا شروع دریافت</span>
          <span>۲ ساعت و ۱۲ دقیقه</span>
        </div>
      )}

      <div className="flex items-center justify-between p-3 rounded-2xl bg-canvas border border-line">
        <div>
          <small className="block text-[10px] text-muted">کد دریافت</small>
          <strong className="block text-lg font-mono font-black text-ink tracking-widest">{reservation.code}</strong>
        </div>
        <MiniQr code={reservation.code} />
      </div>

      {reservation.reviewResponse && (
        <blockquote className="p-3 rounded-xl bg-brand-soft border-s-2 border-brand-2 text-xs text-ink space-y-1">
          <strong className="block font-bold text-brand-2">پاسخ فروشگاه</strong>
          <p className="opacity-90">{reservation.reviewResponse}</p>
        </blockquote>
      )}

      <div className="flex flex-wrap gap-2 pt-1 border-t border-line">
        {reservation.status === "active" && (
          <button
            type="button"
            onClick={onDirections}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-surface border border-line text-ink hover:bg-surface-raised transition-colors"
          >
            <Icon name="route" className="w-3.5 h-3.5 text-muted" />
            <span>مسیریابی</span>
          </button>
        )}
        {cancellable && (
          <button
            type="button"
            onClick={() => onCancel(reservation.id)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-500/10 transition-colors"
          >
            لغو رزرو
          </button>
        )}
        {reservation.status === "collected" && !reservation.hasReview && (
          <button
            type="button"
            onClick={() => onReview(reservation.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-2 text-white hover:opacity-90 transition-opacity"
          >
            <Icon name="star" className="w-3.5 h-3.5" />
            <span>ثبت نظر</span>
          </button>
        )}
        {reservation.status === "collected" && reservation.hasReview && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 rounded-xl">
            <Icon name="check" className="w-3.5 h-3.5" />
            <span>نظر ثبت شده</span>
          </span>
        )}
      </div>
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
  onAbout,
  showToast,
  customerName,
}: {
  savedMeals: number;
  favoriteOffers: Offer[];
  reservations: Reservation[];
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  installed: boolean;
  onInstall: () => void;
  onOpenOffer: (offer: Offer) => void;
  onAbout: () => void;
  showToast: (message: string) => void;
  customerName: string;
}) {
  const { theme, setTheme } = useMoftTheme();
  const preventedWaste = savedMeals * 0.78;
  const co2 = savedMeals * 2.4;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-surface border border-line shadow-xs">
        <div className="w-12 h-12 rounded-full bg-brand-soft text-brand-2 font-black text-lg grid place-items-center shrink-0">
          {customerName[0]}
        </div>
        <div>
          <p className="text-[11px] font-bold text-muted">همراه سبز دیبز</p>
          <h1 className="text-base font-black text-ink mt-0.5">{customerName}</h1>
        </div>
      </div>

      <section className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-brand-soft text-brand-2 grid place-items-center shrink-0">
            <Icon name="leaf" className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">اثر تو تا امروز</p>
            <h2 className="text-sm font-black text-ink mt-0.5">
              <AnimatedNumber value={savedMeals} /> وعده انتخاب‌شده
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-canvas border border-line text-center">
            <strong className="block text-sm font-black text-ink">{decimalFa(preventedWaste)}</strong>
            <small className="block text-[10px] text-muted mt-0.5">کیلو غذای برآوردی</small>
          </div>
          <div className="p-3 rounded-2xl bg-canvas border border-line text-center">
            <strong className="block text-sm font-black text-ink">{decimalFa(co2)}</strong>
            <small className="block text-[10px] text-muted mt-0.5">کیلو CO₂ برآوردی</small>
          </div>
          <div className="p-3 rounded-2xl bg-canvas border border-line text-center">
            <strong className="block text-sm font-black text-ink"><AnimatedNumber value={savedMeals * 11} /></strong>
            <small className="block text-[10px] text-muted mt-0.5">لیتر آب برآوردی</small>
          </div>
        </div>
        <p className="text-[10px] text-muted text-center">این برآوردها تقریبی‌اند و ادعای زیست‌محیطی قطعی نیستند.</p>
      </section>

      <section className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
        <SectionHeading eyebrow="ذخیره‌شده‌ها" title="فروشگاه‌های محبوب" />
        {favoriteOffers.length ? (
          <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {favoriteOffers.slice(0, 5).map((offer) => (
              <button
                type="button"
                onClick={() => onOpenOffer(offer)}
                key={offer.id}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl shrink-0 hover:bg-canvas transition-colors"
              >
                <span className="w-12 h-12 rounded-xl overflow-hidden bg-canvas border border-line shrink-0">
                  <FoodImage src={offer.image} sizes="50px" className="w-full h-full object-cover" />
                </span>
                <small className="text-[11px] font-bold text-ink truncate max-w-[80px]">{offer.merchantName}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted py-3">
            <Icon name="heart" className="w-4 h-4 text-muted" />
            <span>هنوز فروشگاهی را ذخیره نکردی.</span>
          </div>
        )}
      </section>

      <section className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">ظاهر برنامه</p>
          <h2 className="text-sm font-black text-ink mt-0.5">حال‌وهوای دلخواهت</h2>
        </div>
        <GlassSegmentedControl
          value={theme}
          onChange={setTheme}
          ariaLabel="انتخاب پوسته"
          className="theme-picker"
          role="radiogroup"
          options={[
            { value: "light", label: <><Icon name="sun" className="w-4 h-4" /> روشن</> },
            { value: "dark", label: <><Icon name="moon" className="w-4 h-4" /> تاریک</> },
          ]}
        />
        <p className="text-[10px] text-muted">انتخاب پوسته در همهٔ بخش‌های دیبز حفظ می‌شود.</p>
      </section>

      <div className="rounded-3xl bg-surface border border-line shadow-xs divide-y divide-line overflow-hidden">
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-canvas grid place-items-center text-muted shrink-0">
              <Icon name="bell" className="w-4 h-4" />
            </span>
            <div>
              <strong className="block text-xs font-bold text-ink">یادآوری زمان دریافت</strong>
              <small className="block text-[11px] text-muted mt-0.5">{notifications ? "یادآوری فعال است" : "یادآوری غیرفعال است"}</small>
            </div>
          </div>
          <GlassToggle checked={notifications} onCheckedChange={setNotifications} label="یادآوری زمان دریافت" />
        </div>

        <button type="button" onClick={onInstall} className="w-full flex items-center justify-between p-3.5 text-start hover:bg-canvas/40 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-canvas grid place-items-center text-muted shrink-0">
              <Icon name="share" className="w-4 h-4" />
            </span>
            <div>
              <strong className="block text-xs font-bold text-ink">{installed ? "دیبز روی دستگاه نصب است" : "نصب برنامه"}</strong>
              <small className="block text-[11px] text-muted mt-0.5">{installed ? "اجرای مستقل فعال است" : "افزودن به صفحهٔ اصلی"}</small>
            </div>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </button>

        <button type="button" onClick={() => showToast("هشدار آلرژی هر جعبه را پیش از رزرو بررسی کن.")} className="w-full flex items-center justify-between p-3.5 text-start hover:bg-canvas/40 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-canvas grid place-items-center text-muted shrink-0 text-sm">⚠️</span>
            <div>
              <strong className="block text-xs font-bold text-ink">آلرژی‌ها و ترجیحات</strong>
              <small className="block text-[11px] text-muted mt-0.5">هشدارهای هر جعبه را بررسی کن</small>
            </div>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </button>

        <button type="button" onClick={onAbout} className="w-full flex items-center justify-between p-3.5 text-start hover:bg-canvas/40 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-canvas grid place-items-center text-muted shrink-0">
              <Icon name="info" className="w-4 h-4" />
            </span>
            <div>
              <strong className="block text-xs font-bold text-ink">دربارهٔ دیبز</strong>
              <small className="block text-[11px] text-muted mt-0.5">ماموریت، ایمنی و نحوهٔ کار</small>
            </div>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </button>

        <Link href="/customer/support" className="flex items-center justify-between p-3.5 hover:bg-canvas/40 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-canvas grid place-items-center text-muted shrink-0 font-bold text-xs">؟</span>
            <div>
              <strong className="block text-xs font-bold text-ink">راهنما و پشتیبانی</strong>
              <small className="block text-[11px] text-muted mt-0.5">پرسش‌های رایج و پیگیری درخواست‌ها</small>
            </div>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </Link>

        <Link href="/business" className="flex items-center justify-between p-3.5 hover:bg-canvas/40 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-brand-soft text-brand-2 grid place-items-center shrink-0">
              <Icon name="store" className="w-4 h-4" />
            </span>
            <div>
              <strong className="block text-xs font-bold text-ink">رفتن به پنل کسب‌وکار</strong>
              <small className="block text-[11px] text-muted mt-0.5">مدیریت پیشنهادها و سفارش‌ها</small>
            </div>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </Link>

        <Link href="/" className="flex items-center justify-between p-3.5 hover:bg-canvas/40 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-canvas grid place-items-center text-muted shrink-0">
              <Icon name="home" className="w-4 h-4" />
            </span>
            <div>
              <strong className="block text-xs font-bold text-ink">انتخاب نوع ورود</strong>
              <small className="block text-[11px] text-muted mt-0.5">بازگشت به صفحه آغاز</small>
            </div>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-muted rtl:rotate-180" />
        </Link>
      </div>

      <p className="text-center text-[11px] text-muted py-2">{numberFa(reservations.length)} رزرو در این دستگاه</p>
    </div>
  );
}

function OfferDetails({
  offer,
  favorite,
  onFavorite,
  onClose,
  onReserve,
  related,
  onSelect,
  favorites,
}: {
  offer: Offer;
  favorite: boolean;
  onFavorite: (id: string) => void;
  onClose: () => void;
  onReserve: () => void;
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
    <DialogShell titleId="offer-title" onClose={onClose} size="detail">
      <button
        className={`absolute top-3.5 end-3.5 z-20 w-8 h-8 rounded-full border backdrop-blur-md grid place-items-center transition-colors ${
          favorite
            ? "bg-rose-500 text-white border-rose-500 shadow-xs"
            : "bg-surface/80 text-muted border-line hover:text-rose-500 hover:bg-surface"
        }`}
        type="button"
        onClick={() => onFavorite(offer.id)}
        aria-label={favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      >
        <Icon name="heart" filled={favorite} className="w-4 h-4" />
      </button>

      <div ref={detailScrollRef} className="overflow-y-auto max-h-[75vh] flex-1">
        <div className="relative w-full h-56 bg-canvas overflow-hidden">
          <FoodImage
            src={offer.image}
            alt={`تصویر ${offer.title}`}
            sizes="(max-width: 700px) 100vw, 540px"
            priority
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
            <small className="block text-[11px] font-bold text-emerald-300">{offer.categoryLabel}</small>
            <strong className="block text-sm font-black mt-0.5">{offer.title}</strong>
          </div>
          <span className="absolute top-3.5 start-14 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-black shadow-xs">
            {discountPercent(offer.originalPrice, offer.price)}٪ کمتر
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1 font-bold text-ink">
              <Icon name="star" filled className="w-3.5 h-3.5 text-amber-500" />
              <span>{decimalFa(offer.rating)}</span>
              <span className="text-muted font-normal text-[11px]">({numberFa(offer.reviewCount)} نظر)</span>
            </span>
            <span className="flex items-center gap-1">
              <Icon name="pin" className="w-3.5 h-3.5 text-muted" />
              <span>{distanceFa(offer.distanceKm)}</span>
            </span>
          </div>

          <div>
            <h2 id="offer-title" className="text-base font-black text-ink">{offer.merchantName}</h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">{offer.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-canvas border border-line">
            <div className="flex items-center gap-2">
              <Icon name="clock" className="w-4 h-4 text-brand-2 shrink-0" />
              <div>
                <small className="block text-[10px] text-muted">زمان دریافت حضوری</small>
                <strong className="block text-xs font-bold text-ink">{offer.pickup}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="bag" className="w-4 h-4 text-brand-2 shrink-0" />
              <div>
                <small className="block text-[10px] text-muted">موجودی این لحظه</small>
                <strong className="block text-xs font-bold text-ink">{numberFa(offer.quantityLeft)} جعبه</strong>
              </div>
            </div>
          </div>

          <section className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-soft text-brand-2">
            <Icon name="spark" className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <strong className="block font-bold">داخل جعبه غافلگیر می‌شوی</strong>
              <p className="opacity-90 leading-relaxed text-[11px]">
                ترکیب جعبه در همان روز آماده می‌شود؛ تصویر فقط حال‌وهوای بسته را نشان می‌دهد.
              </p>
            </div>
          </section>

          <section className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs grid place-items-center shrink-0">!</span>
            <div className="text-xs space-y-1">
              <strong className="block font-bold">هشدار آلرژی و ایمنی</strong>
              <p className="opacity-90 leading-relaxed text-[11px]">
                فقط غذای سالم عرضه می‌شود، اما ترکیب متغیر است. اگر آلرژی جدی داری، پیش از دریافت با فروشگاه هماهنگ کن.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {offer.allergens.map((item) => (
                  <span key={item} className="px-2 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-bold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="p-3.5 rounded-2xl bg-canvas border border-line space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">محل دریافت</p>
            <h3 className="text-xs font-bold text-ink">{offer.address}</h3>
            <small className="block text-[11px] text-muted">دریافت فقط حضوری و در بازهٔ مشخص‌شده است.</small>
          </section>

          {related.length > 0 && (
            <section className="space-y-3 pt-2">
              <SectionHeading eyebrow="همین اطراف" title="شاید این‌ها را هم دوست داشته باشی" />
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

      <div className="sticky bottom-0 p-4 border-t border-line bg-surface/90 backdrop-blur-md flex items-center justify-between gap-4">
        <div>
          <del className="block text-xs text-muted line-through">{money(offer.originalPrice)}</del>
          <strong className="block text-sm font-black text-ink">{money(offer.price)}</strong>
          <small className="block text-[10px] text-muted">برای هر جعبه</small>
        </div>
        <button
          className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity disabled:opacity-50"
          type="button"
          disabled={offer.quantityLeft < 1}
          onClick={onReserve}
        >
          {offer.quantityLeft > 0 ? "رزرو جعبه" : "تمام شد"}
        </button>
      </div>
    </DialogShell>
  );
}

function ReservationFlow({
  offer,
  step,
  setStep,
  quantity,
  setQuantity,
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
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">تنظیم رزرو</p>
              <h2 id="reservation-title" className="text-base font-black text-ink mt-0.5">همه‌چیز در یک نگاه</h2>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-canvas border border-line">
              <span className="w-14 h-14 rounded-xl overflow-hidden bg-surface shrink-0">
                <FoodImage src={offer.image} sizes="60px" className="w-full h-full object-cover" />
              </span>
              <div>
                <strong className="block text-xs font-bold text-ink">{offer.merchantName}</strong>
                <p className="text-xs text-muted mt-0.5">{offer.title}</p>
                <small className="block text-[11px] text-muted">{offer.neighborhood}</small>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                <span className="text-xs font-bold text-ink">تعداد جعبه</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-surface border border-line grid place-items-center text-ink disabled:opacity-40"
                  >
                    <Icon name="minus" className="w-3.5 h-3.5" />
                  </button>
                  <strong className="text-sm font-black min-w-[20px] text-center"><AnimatedNumber value={quantity} /></strong>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(Math.min(3, offer.quantityLeft), quantity + 1))}
                    disabled={quantity >= Math.min(3, offer.quantityLeft)}
                    className="w-8 h-8 rounded-lg bg-surface border border-line grid place-items-center text-ink disabled:opacity-40"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

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
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">مرور نهایی</p>
              <h2 id="reservation-title" className="text-base font-black text-ink mt-0.5">آمادهٔ ثبت رزرو</h2>
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
        <div className="p-4 border-t border-line flex items-center justify-end gap-2 bg-surface">
          {step > 1 && (
            <button
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-canvas border border-line text-ink hover:bg-surface-raised transition-colors"
              type="button"
              onClick={() => setStep(step - 1)}
            >
              برگشت
            </button>
          )}
          <button
            className="flex-1 h-10 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity disabled:opacity-50"
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
      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 grid place-items-center">
        <SuccessCheck />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-2">رزرو با موفقیت انجام شد</p>
        <h2 id="reservation-title" className="text-base font-black text-ink mt-0.5">جعبه‌ات کنار گذاشته شد!</h2>
        <p className="text-xs text-muted mt-1 leading-relaxed">در بازهٔ تعیین‌شده به فروشگاه برو و کد دریافت را نشان بده.</p>
      </div>

      <div className="p-4 rounded-2xl bg-canvas border border-line text-start space-y-3">
        <div className="flex items-center gap-2">
          <Image src="/icons/dibz-ios-default-180-v2.png" alt="" width={24} height={24} className="rounded-md" />
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
          className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl bg-canvas border border-line text-ink hover:bg-surface-raised transition-colors"
        >
          <Icon name="route" className="w-3.5 h-3.5 text-muted" />
          <span>مسیریابی</span>
        </button>
        <button
          type="button"
          onClick={onCalendar}
          className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl bg-canvas border border-line text-ink hover:bg-surface-raised transition-colors"
        >
          <Icon name="calendar" className="w-3.5 h-3.5 text-muted" />
          <span>افزودن به تقویم</span>
        </button>
      </div>

      <button
        className="w-full h-10 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity"
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
  maxPrice: number;
  setMaxPrice: (value: number) => void;
  pickup: "all" | PickupPeriod;
  setPickup: (value: "all" | PickupPeriod) => void;
  onReset: () => void;
  onClose: () => void;
  resultCount: number;
}) {
  return (
    <DialogShell titleId="filters-title" onClose={onClose}>
      <div className="p-5 space-y-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">پیدا کردن بهترین گزینه</p>
          <h2 id="filters-title" className="text-base font-black text-ink mt-0.5">فیلتر پیشنهادها</h2>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="distance-range" className="text-muted">حداکثر فاصله</label>
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
            className="w-full accent-brand-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="price-range" className="text-muted">حداکثر قیمت هر جعبه</label>
            <strong className="font-bold text-ink">{money(maxPrice)}</strong>
          </div>
          <input
            id="price-range"
            type="range"
            min="90000"
            max="300000"
            step="10000"
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
            className="w-full accent-brand-2"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs text-muted mb-1">زمان دریافت</legend>
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

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
          <button className="text-xs font-semibold text-muted hover:text-ink px-2 py-1" type="button" onClick={onReset}>
            پاک کردن همه
          </button>
          <button
            className="h-10 px-5 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity"
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">موقعیت فعلی</p>
          <h2 id="location-title" className="text-base font-black text-ink mt-0.5">کجای تهران هستی؟</h2>
          <p className="text-xs text-muted mt-1">محدودهٔ نزدیک خودت را انتخاب کن.</p>
        </div>
        <div className="divide-y divide-line rounded-2xl bg-canvas border border-line overflow-hidden">
          {locations.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => onChange(item)}
              className={`w-full flex items-center justify-between p-3.5 text-xs text-start transition-colors ${
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
          className="w-full h-10 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity"
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
            className="flex-1 h-10 text-xs font-bold rounded-xl bg-canvas border border-line text-ink hover:bg-surface-raised transition-colors"
            type="button"
            onClick={onClose}
          >
            نه، نگهش دار
          </button>
          <button
            className="flex-1 h-10 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition-colors"
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">تجربه دریافت</p>
          <h2 id="customer-review-title" className="text-base font-black text-ink mt-0.5">نظرت درباره این سفارش چیست؟</h2>
          <p className="text-xs text-muted mt-1">پاسخ شما در پنل کیفیت کسب‌وکار دیده می‌شود. سفارش: <b className="font-mono">{orderId}</b></p>
        </div>

        <div className="flex items-center justify-center gap-2 py-2" role="radiogroup" aria-label="امتیاز از پنج">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              role="radio"
              aria-checked={rating === value}
              className={`text-2xl transition-transform hover:scale-125 ${
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
          className="w-full h-11 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity"
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
  eyebrow: string;
  title: string;
  id?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{eyebrow}</p>
        <h2 id={id} className="text-sm font-black text-ink mt-0.5">{title}</h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-2 hover:opacity-80 transition-opacity"
        >
          <span>{action}</span>
          <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      )}
    </div>
  );
}

function PageTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="space-y-1 pb-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{eyebrow}</p>
      <h1 className="text-lg font-black text-ink">{title}</h1>
      <p className="text-xs text-muted leading-relaxed">{text}</p>
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
