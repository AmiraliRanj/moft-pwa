"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomNavigation } from "@/components/moft/BottomNavigation";
import { CategorySelector } from "@/components/moft/CategorySelector";
import { DialogShell } from "@/components/moft/DialogShell";
import { EmptyState } from "@/components/moft/EmptyState";
import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { LoadingSkeleton } from "@/components/moft/LoadingSkeleton";
import { OfferCard, OfferList } from "@/components/moft/OfferCard";
import { SearchBar } from "@/components/moft/SearchBar";
import { useMoftTheme } from "@/components/shared/ThemeToggle";
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

const storageKeys = {
  favorites: "moft-favorites-v2"
};

const faDigits = (value: string) => value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function customerOffer(offer: MarketplaceOffer): Offer {
  const dateLabel = offer.pickupPeriod === "tomorrow" ? "فردا" : "امروز";
  return {
    id: offer.id, merchantName: offer.merchantName, category: offer.category, categoryLabel: offer.categoryLabel,
    title: offer.title, description: offer.description, address: offer.address, neighborhood: offer.neighborhood,
    coordinates: offer.coordinates, distanceKm: offer.distanceKm, rating: offer.rating, reviewCount: offer.reviewCount,
    pickup: `${dateLabel}، ${faDigits(offer.pickupStart)} تا ${faDigits(offer.pickupEnd)}`, pickupPeriod: offer.pickupPeriod,
    quantityLeft: remainingQuantity(offer), originalPrice: offer.originalValue, price: offer.salePrice, allergens: offer.allergens,
    image: offer.image, endingSoon: offer.endingSoon, popular: offer.popular,
  };
}

function customerReservation(order: Order, offers: MarketplaceOffer[], reviews: import("@/types/demo").Review[]): Reservation {
  const offer = offers.find((item) => item.id === order.items[0].offerId);
  const review = reviews.find((item) => item.orderId === order.id);
  const status: Reservation["status"] = order.status === "completed" ? "collected" : ["cancelled", "refunded", "no_show"].includes(order.status) ? "cancelled" : "active";
  return {
    id: order.id, offerId: order.items[0].offerId, merchantName: offer?.merchantName ?? "کافه ویونا", title: order.items[0].title,
    pickup: `${faDigits(order.pickupDate)}، ${faDigits(order.pickupStart)} تا ${faDigits(order.pickupEnd)}`, address: offer?.address ?? "شعبه انتخاب‌شده",
    code: faDigits(order.pickupCode.value), quantity: order.items[0].quantity, total: order.total, status, orderStatus: order.status,
    hasReview: Boolean(review), reviewResponse: review?.response, createdAt: order.createdAt,
  };
}

type MoftPreviewProps = {
  initialTab?: AppTab;
  initialFavoritesOnly?: boolean;
  initialOfferId?: string;
};

export default function MoftPreview({ initialTab = "home", initialFavoritesOnly = false, initialOfferId }: MoftPreviewProps) {
  const { state, placeOrder, transitionOrder, submitReview } = useDemo();
  const [tab, setTab] = useState<AppTab>(initialTab);
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const offers = useMemo(() => state.offers.filter((offer) => ["active", "sold_out"].includes(offer.status)).map(customerOffer), [state.offers]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const reservations = useMemo(() => state.orders.filter((order) => order.customerId === state.customer.id).map((order) => customerReservation(order, state.offers, state.reviews)), [state.customer.id, state.offers, state.orders, state.reviews]);
  const [selected, setSelected] = useState<Offer | null>(null);
  const [layer, setLayer] = useState<Layer>(null);
  const [reservationStep, setReservationStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [successReservation, setSuccessReservation] = useState<Reservation | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reservationView, setReservationView] = useState<ReservationView>("active");
  const [toast, setToast] = useState("");
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
    setToast(message);
    window.setTimeout(() => setToast(""), 3400);
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
      setInstalled(window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
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
    const timer = window.setTimeout(() => { setSelected(offer); setLayer("detail"); }, 0);
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
    const filtered = baseFilteredOffers.filter((offer) =>
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
    setFavorites((current) => {
      const next = new Set(current);
      const removing = next.has(id);
      if (removing) next.delete(id); else next.add(id);
      localStorage.setItem(storageKeys.favorites, JSON.stringify([...next]));
      showToast(removing ? "از علاقه‌مندی‌ها حذف شد." : "به علاقه‌مندی‌ها اضافه شد.");
      return next;
    });
  };

  const switchTab = (nextTab: AppTab) => {
    if (nextTab === tab) return;
    setPageLoading(true);
    setTab(nextTab);
    const paths: Record<AppTab, string> = { home: "/customer", discover: "/customer/offers", reservations: "/customer/orders", profile: "/customer/profile" };
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
    const paths: Record<AppTab, string> = { home: "/customer", discover: "/customer/offers", reservations: "/customer/orders", profile: "/customer/profile" };
    window.history.replaceState({}, "", paths[tab]);
  };

  const openReservation = () => {
    if (!selected || selected.quantityLeft < 1) return;
    if (!online) { showToast("برای ثبت رزرو دوباره آنلاین شو."); return; }
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
      setSelected((current) => current ? { ...current, quantityLeft: Math.max(0, current.quantityLeft - quantity) } : current);
      setSuccessReservation(reservation);
      setReservationStep(5);
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
    if (!result.ok) { showToast(result.error); setLayer(null); setCancelId(null); return; }
    setLayer(null);
    setCancelId(null);
    showToast("رزرو لغو و موجودی مجاز بازگردانده شد.");
  };

  const install = async () => {
    if (!installPrompt) { showToast("برای نصب، گزینهٔ «افزودن به صفحهٔ اصلی» مرورگر را بزن."); return; }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") { setInstalled(true); showToast("دیبز به دستگاهت اضافه شد."); }
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

  const savedMeals = reservations.filter((item) => item.status === "active" || item.status === "collected").reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="app-shell">
      <a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      {!online && <div className="offline-banner" role="status"><Icon name="wifi" /> آفلاینی؛ پیشنهادهای ذخیره‌شده را می‌بینی، اما رزرو تازه ثبت نمی‌شود.</div>}
      {storageWarning && <div className="storage-warning" role="alert"><span>اطلاعات محلی قبلی خوانده نشد و برنامه تازه‌سازی شد.</span><button type="button" onClick={() => setStorageWarning(false)} aria-label="بستن هشدار"><Icon name="close" /></button></div>}
      {islandVisible && successReservation && <div className="island-notice" role="status"><span className="island-check"><Icon name="check" /></span><span><strong>رزرو آماده شد</strong><small>کد دریافت {successReservation.code}</small></span></div>}

      <section className="app-canvas">
        <header className="topbar glass-medium">
          <button className="location-button" type="button" onClick={() => setLayer("location")} aria-label={`تغییر موقعیت فعلی؛ ${location}`}>
            <span className="location-icon"><Icon name="pin" /></span>
            <span><small>نزدیک شما</small><strong>{location}</strong></span>
            <Icon name="chevron" />
          </button>
          <button className="round-button" type="button" onClick={openFavorites} aria-label="نمایش علاقه‌مندی‌ها"><Icon name="heart" filled={favorites.size > 0} />{favorites.size > 0 && <b>{numberFa(favorites.size)}</b>}</button>
        </header>

        <div id="main-content" tabIndex={-1}>
          {pageLoading ? <LoadingSkeleton /> : (
            <>
              {tab === "home" && <HomePage query={query} setQuery={setQuery} category={category} setCategory={setCategory} offers={baseFilteredOffers} allOffers={offers} favorites={favorites} onFavorite={toggleFavorite} onSelect={openOffer} onDiscover={() => switchTab("discover")} installPrompt={installPrompt} installed={installed} onInstall={install} savedMeals={savedMeals} />}
              {tab === "discover" && <DiscoverPage query={query} setQuery={setQuery} category={category} setCategory={setCategory} offers={discoverOffers} favorites={favorites} onFavorite={toggleFavorite} onSelect={openOffer} viewMode={viewMode} setViewMode={setViewMode} sort={sort} setSort={setSort} onFilters={() => setLayer("filters")} favoritesOnly={favoritesOnly} setFavoritesOnly={setFavoritesOnly} />}
              {tab === "reservations" && <ReservationsPage active={activeReservations} history={historyReservations} view={reservationView} setView={setReservationView} onCancel={requestCancel} onReview={requestReview} onDiscover={() => switchTab("discover")} onDirections={() => showToast("مسیریابی این فروشگاه اکنون در دسترس نیست.")} />}
              {tab === "profile" && <ProfilePage savedMeals={savedMeals} favoriteOffers={offers.filter((offer) => favorites.has(offer.id))} reservations={reservations} notifications={notifications} setNotifications={setNotifications} installed={installed} onInstall={install} onOpenOffer={openOffer} onAbout={() => setLayer("about")} showToast={showToast} customerName={state.customer.name} />}
            </>
          )}
        </div>

        <BottomNavigation value={tab} onChange={switchTab} reservationCount={activeReservations.length} />
      </section>

      {layer === "detail" && selected && <OfferDetails offer={selected} favorite={favorites.has(selected.id)} onFavorite={toggleFavorite} onClose={closeOffer} onReserve={openReservation} related={offers.filter((offer) => offer.category === selected.category && offer.id !== selected.id).slice(0, 2)} onSelect={openOffer} favorites={favorites} />}
      {layer === "reserve" && selected && <ReservationFlow offer={selected} step={reservationStep} setStep={setReservationStep} quantity={quantity} setQuantity={setQuantity} confirming={confirming} onConfirm={completeReservation} success={successReservation} onClose={() => setLayer(null)} onDone={() => { setLayer(null); switchTab("reservations"); }} onDirections={() => showToast("مسیریابی این فروشگاه اکنون در دسترس نیست.")} onCalendar={() => addToCalendar(successReservation, showToast)} />}
      {layer === "filters" && <FilterSheet maxDistance={maxDistance} setMaxDistance={setMaxDistance} maxPrice={maxPrice} setMaxPrice={setMaxPrice} pickup={pickupFilter} setPickup={setPickupFilter} onReset={() => { setMaxDistance(10); setMaxPrice(300000); setPickupFilter("all"); }} onClose={() => setLayer(null)} resultCount={discoverOffers.length} />}
      {layer === "location" && <LocationSheet value={location} onChange={(value) => { setLocation(value); setLayer(null); showToast("موقعیت تغییر کرد."); }} onClose={() => setLayer(null)} />}
      {layer === "about" && <AboutSheet onClose={() => setLayer(null)} />}
      {layer === "cancel" && <CancelDialog onClose={() => setLayer(null)} onConfirm={confirmCancel} />}
      {layer === "review" && reviewOrderId && <ReviewDialog orderId={reviewOrderId} onClose={() => { setLayer(null); setReviewOrderId(null); }} onSubmit={(rating, comment) => { const result = submitReview(reviewOrderId, rating, comment); if (!result.ok) { showToast(result.error); return false; } showToast("نظرت ثبت شد و در پنل کیفیت کسب‌وکار دیده می‌شود."); setLayer(null); setReviewOrderId(null); return true; }} />}
      {toast && <div className="toast" role="status"><Icon name="check" /> {toast}</div>}
    </main>
  );
}

function HomePage({ query, setQuery, category, setCategory, offers, allOffers, favorites, onFavorite, onSelect, onDiscover, installPrompt, installed, onInstall, savedMeals }: {
  query: string; setQuery: (value: string) => void; category: CategoryId; setCategory: (value: CategoryId) => void; offers: Offer[]; allOffers: Offer[]; favorites: Set<string>; onFavorite: (id: string) => void; onSelect: (offer: Offer) => void; onDiscover: () => void; installPrompt: InstallPromptEvent | null; installed: boolean; onInstall: () => void; savedMeals: number;
}) {
  const browsing = Boolean(query.trim()) || category !== "all";
  const popular = allOffers.filter((offer) => offer.popular).slice(0, 4);
  const ending = allOffers.filter((offer) => offer.endingSoon).slice(0, 5);
  return (
    <div className="page-content home-page">
      <p className="greeting">سلام سارا، عصر بخیر 👋</p>
      <section className="hero-card">
        <div className="hero-copy">
          <h1>غذای خوب، قبل از دورریز</h1>
          <p>جعبه‌های فروش‌نرفته را با قیمت کمتر رزرو کن و همان روز تحویل بگیر.</p>
          <button type="button" onClick={onDiscover}>دیدن فرصت‌های نزدیک <Icon name="arrow" /></button>
        </div>
        <div className="hero-image" aria-hidden="true">
          <FoodImage src="/images/offers/offer-16.webp" sizes="(max-width: 700px) 92vw, 440px" priority />
        </div>
      </section>

      {!installed && installPrompt && <button className="install-banner glass-subtle" type="button" onClick={onInstall}><span className="install-icon"><Image src="/brand/dibz-mascot-transparent.png" alt="" width={46} height={46} /></span><span><strong>دیبز را نصب کن</strong><small>سریع‌تر بازش کن و آفلاین هم ببین</small></span><Icon name="arrow" /></button>}

      <SearchBar value={query} onChange={setQuery} placeholder="کافه، رستوران یا محله..." />
      <CategorySelector value={category} onChange={setCategory} />

      {browsing ? (
        <section className="content-section" aria-labelledby="search-results-title">
          <SectionHeading eyebrow="نتیجهٔ جست‌وجو" title={`${numberFa(offers.length)} پیشنهاد پیدا شد`} id="search-results-title" />
          {offers.length ? <OfferList offers={offers} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} /> : <EmptyState title="این اطراف چیزی پیدا نشد" text="عبارت جست‌وجو یا دسته‌بندی را تغییر بده." />}
        </section>
      ) : (
        <>
          <section className="content-section" aria-labelledby="near-title">
            <SectionHeading eyebrow="نزدیک شما" title="همین امروز نجاتش بده" id="near-title" action="دیدن همه" onAction={onDiscover} />
            <OfferList offers={allOffers.slice(0, 4)} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} />
          </section>

          <section className="content-section" aria-labelledby="ending-title">
            <SectionHeading eyebrow="فرصت کوتاه" title="داره تموم می‌شه" id="ending-title" />
            <div className="ending-track">{ending.map((offer) => <OfferCard compact key={offer.id} offer={offer} favorite={favorites.has(offer.id)} onFavorite={onFavorite} onSelect={onSelect} />)}</div>
          </section>

          <section className="content-section" aria-labelledby="popular-title">
            <SectionHeading eyebrow="محبوب این هفته" title="همسایه‌های خوش‌سلیقه" id="popular-title" />
            <div className="store-strip">{popular.map((offer) => <button className="glass-subtle" type="button" key={offer.id} onClick={() => onSelect(offer)}><span className="store-logo"><FoodImage src={offer.image} sizes="52px" /></span><span><strong>{offer.merchantName}</strong><small>{offer.neighborhood} · امتیاز {decimalFa(offer.rating)}</small></span><Icon name="chevron" /></button>)}</div>
          </section>

          <section className="impact-home-card glass-subtle">
            <div><span className="impact-leaf"><Icon name="leaf" /></span><p className="eyebrow">اثر کوچک، حال خوب بزرگ</p><h2>تا امروز {numberFa(savedMeals || 1)} وعده از دورریز دور شده.</h2><p>{savedMeals ? "این عدد با رزروهای تو به‌روز می‌شود." : "اولین جعبه‌ات می‌تواند شروع این مسیر باشد."}</p></div>
            <div className="impact-ring"><strong>{numberFa((savedMeals || 1) * 11)}</strong><small>لیتر آب<br />تخمینی</small></div>
          </section>
        </>
      )}
    </div>
  );
}

function DiscoverPage({ query, setQuery, category, setCategory, offers, favorites, onFavorite, onSelect, viewMode, setViewMode, sort, setSort, onFilters, favoritesOnly, setFavoritesOnly }: {
  query: string; setQuery: (value: string) => void; category: CategoryId; setCategory: (value: CategoryId) => void; offers: Offer[]; favorites: Set<string>; onFavorite: (id: string) => void; onSelect: (offer: Offer) => void; viewMode: "list" | "map"; setViewMode: (value: "list" | "map") => void; sort: SortMode; setSort: (value: SortMode) => void; onFilters: () => void; favoritesOnly: boolean; setFavoritesOnly: (value: boolean) => void;
}) {
  return (
    <div className="page-content secondary-page">
      <PageTitle eyebrow="کشف" title="مزه‌های خوبِ اطراف" text="پیشنهادها را بر اساس فاصله، قیمت و زمان دریافت پیدا کن." />
      <SearchBar value={query} onChange={setQuery} />
      <CategorySelector value={category} onChange={setCategory} />
      <div className="discover-toolbar">
        <button className="filter-button" type="button" onClick={onFilters}><Icon name="sliders" /> فیلترها</button>
        <button className={`favorite-filter ${favoritesOnly ? "active" : ""}`} type="button" onClick={() => setFavoritesOnly(!favoritesOnly)} aria-pressed={favoritesOnly}><Icon name="heart" filled={favoritesOnly} /> علاقه‌مندی‌ها</button>
        <label><span className="sr-only">مرتب‌سازی</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="nearest">نزدیک‌ترین</option><option value="popular">محبوب‌ترین</option><option value="discount">بیشترین تخفیف</option></select></label>
      </div>
      <div className="results-heading"><span>{numberFa(offers.length)} پیشنهاد</span><div className="view-toggle" aria-label="نوع نمایش"><button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} aria-label="نمایش فهرستی"><Icon name="list" /></button><button type="button" className={viewMode === "map" ? "active" : ""} onClick={() => setViewMode("map")} aria-label="پیش‌نمایش نقشه"><Icon name="map" /></button></div></div>
      {offers.length ? viewMode === "list" ? <OfferList offers={offers} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} /> : <MapPreview offers={offers} onSelect={onSelect} /> : <EmptyState icon={favoritesOnly ? "heart" : "search"} title={favoritesOnly ? "علاقه‌مندی‌ای با این فیلتر نیست" : "پیشنهادی پیدا نشد"} text="فاصله یا سقف قیمت را بیشتر کن و دوباره ببین." action="پاک کردن جست‌وجو" onAction={() => { setQuery(""); setCategory("all"); setFavoritesOnly(false); }} />}
    </div>
  );
}

function MapPreview({ offers, onSelect }: { offers: Offer[]; onSelect: (offer: Offer) => void }) {
  return (
    <div className="map-preview" aria-label="موقعیت تقریبی فروشگاه‌ها">
      <div className="map-streets" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="map-user"><span /><small>شما</small></div>
      {offers.slice(0, 8).map((offer, index) => <button key={offer.id} type="button" className="map-pin" style={{ insetInlineStart: `${14 + (index * 23) % 72}%`, top: `${17 + (index * 31) % 62}%` }} onClick={() => onSelect(offer)} aria-label={`نمایش ${offer.merchantName}`}><span><FoodImage src={offer.image} sizes="44px" /></span><small>{money(offer.price)}</small></button>)}
      <div className="map-note"><Icon name="info" /> موقعیت فروشگاه‌ها تقریبی است.</div>
    </div>
  );
}

function ReservationsPage({ active, history, view, setView, onCancel, onReview, onDiscover, onDirections }: { active: Reservation[]; history: Reservation[]; view: ReservationView; setView: (view: ReservationView) => void; onCancel: (id: string) => void; onReview: (id: string) => void; onDiscover: () => void; onDirections: () => void }) {
  const items = view === "active" ? active : history;
  return (
    <div className="page-content secondary-page">
      <PageTitle eyebrow="رزروهای من" title="جعبه‌ات منتظرته" text="کد دریافت را فقط وقتی به فروشنده نشان بده که جعبه را تحویل می‌گیری." />
      <div className="segmented-control" role="tablist" aria-label="نوع رزرو"><button type="button" role="tab" aria-selected={view === "active"} className={view === "active" ? "active" : ""} onClick={() => setView("active")}>فعال <span>{numberFa(active.length)}</span></button><button type="button" role="tab" aria-selected={view === "history"} className={view === "history" ? "active" : ""} onClick={() => setView("history")}>گذشته <span>{numberFa(history.length)}</span></button></div>
      {items.length ? <div className="reservation-list">{items.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} onCancel={onCancel} onReview={onReview} onDirections={onDirections} />)}</div> : <EmptyState icon="bag" title={view === "active" ? "رزرو فعالی نداری" : "هنوز سابقه‌ای نیست"} text={view === "active" ? "یک جعبهٔ نزدیک پیدا کن و همین امشب نجاتش بده." : "رزروهای دریافت‌شده یا لغوشده اینجا می‌مانند."} action={view === "active" ? "کشف جعبه‌ها" : undefined} onAction={onDiscover} />}
    </div>
  );
}

function ReservationCard({ reservation, onCancel, onReview, onDirections }: { reservation: Reservation; onCancel: (id: string) => void; onReview: (id: string) => void; onDirections: () => void }) {
  const status = reservation.orderStatus ? orderStatusLabel[reservation.orderStatus] : reservation.status === "active" ? "فعال" : reservation.status === "collected" ? "دریافت شد" : reservation.status === "cancelled" ? "لغو شد" : "زمان دریافت گذشته";
  const cancellable = reservation.orderStatus ? ["paid", "reviewed", "preparing", "ready_for_pickup"].includes(reservation.orderStatus) : reservation.status === "active";
  return (
    <article className={`reservation-card glass-subtle status-${reservation.status}`}>
      <div className="reservation-status"><span className="status-dot" /> {status}</div>
      <h2>{reservation.merchantName}</h2><p>{reservation.title} · {numberFa(reservation.quantity)} جعبه</p>
      <div className="reservation-details"><span><Icon name="clock" /> {reservation.pickup}</span><span><Icon name="pin" /> {reservation.address}</span></div>
      {reservation.status === "active" && <div className="countdown"><span>زمان باقی‌مانده تا شروع دریافت</span><strong>۲ ساعت و ۱۲ دقیقه</strong></div>}
      <div className="pickup-code"><span><small>کد دریافت</small><strong>{reservation.code}</strong></span><MiniQr code={reservation.code} /></div>
      {reservation.reviewResponse && <blockquote className="customer-review-response"><strong>پاسخ فروشگاه</strong>{reservation.reviewResponse}</blockquote>}
      <div className="reservation-actions">{reservation.status === "active" && <button type="button" onClick={onDirections}><Icon name="route" /> مسیریابی</button>}{cancellable && <button className="danger" type="button" onClick={() => onCancel(reservation.id)}>لغو رزرو</button>}{reservation.status === "collected" && !reservation.hasReview && <button type="button" onClick={() => onReview(reservation.id)}><Icon name="star" /> ثبت نظر</button>}{reservation.status === "collected" && reservation.hasReview && <span className="review-submitted"><Icon name="check" /> نظر ثبت شده</span>}</div>
    </article>
  );
}

function ProfilePage({ savedMeals, favoriteOffers, reservations, notifications, setNotifications, installed, onInstall, onOpenOffer, onAbout, showToast, customerName }: { savedMeals: number; favoriteOffers: Offer[]; reservations: Reservation[]; notifications: boolean; setNotifications: (value: boolean) => void; installed: boolean; onInstall: () => void; onOpenOffer: (offer: Offer) => void; onAbout: () => void; showToast: (message: string) => void; customerName: string }) {
  const { theme, setTheme } = useMoftTheme();
  const preventedWaste = savedMeals * 0.78;
  const co2 = savedMeals * 2.4;
  return (
    <div className="page-content secondary-page profile-page">
      <div className="profile-head"><div className="avatar">{customerName[0]}</div><div><p>همراه سبز دیبز</p><h1>{customerName}</h1></div></div>
      <section className="impact-card glass-subtle"><div className="impact-card-head"><span><Icon name="leaf" /></span><div><p>اثر تو تا امروز</p><h2>{numberFa(savedMeals)} وعده نجات‌یافته</h2></div></div><div className="impact-grid"><span><strong>{decimalFa(preventedWaste)}</strong><small>کیلو غذای برآوردی</small></span><span><strong>{decimalFa(co2)}</strong><small>کیلو CO₂ برآوردی</small></span><span><strong>{numberFa(savedMeals * 11)}</strong><small>لیتر آب برآوردی</small></span></div><p className="estimate-note">این برآوردها تقریبی‌اند و ادعای زیست‌محیطی قطعی نیستند.</p></section>

      <section className="profile-section glass-subtle"><SectionHeading eyebrow="ذخیره‌شده‌ها" title="فروشگاه‌های محبوب" />{favoriteOffers.length ? <div className="favorite-stores">{favoriteOffers.slice(0, 5).map((offer) => <button type="button" onClick={() => onOpenOffer(offer)} key={offer.id}><span className="store-logo"><FoodImage src={offer.image} sizes="60px" /></span><small>{offer.merchantName}</small></button>)}</div> : <div className="inline-empty"><Icon name="heart" /><span>هنوز فروشگاهی را ذخیره نکردی.</span></div>}</section>

      <section className="profile-section glass-subtle"><p className="eyebrow">ظاهر برنامه</p><h2>حال‌وهوای دلخواهت</h2><div className="theme-picker" role="radiogroup" aria-label="انتخاب پوسته"><button type="button" role="radio" aria-checked={theme === "light"} className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}><Icon name="sun" /> روشن</button><button type="button" role="radio" aria-checked={theme === "dark"} className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}><Icon name="moon" /> تاریک</button></div><p className="theme-note">انتخاب پوسته در همهٔ بخش‌های دیبز حفظ می‌شود.</p></section>

      <div className="settings-card glass-subtle">
        <button type="button" onClick={() => setNotifications(!notifications)}><span className="setting-icon"><Icon name="bell" /></span><div><strong>یادآوری زمان دریافت</strong><small>{notifications ? "یادآوری فعال است" : "یادآوری غیرفعال است"}</small></div><span className={`switch ${notifications ? "on" : ""}`} aria-label={notifications ? "روشن" : "خاموش"}><i /></span></button>
        <button type="button" onClick={onInstall}><span className="setting-icon"><Icon name="share" /></span><div><strong>{installed ? "دیبز روی دستگاه نصب است" : "نصب برنامه"}</strong><small>{installed ? "اجرای مستقل فعال است" : "افزودن به صفحهٔ اصلی"}</small></div><Icon name="chevron" /></button>
        <button type="button" onClick={() => showToast("هشدار آلرژی هر جعبه را پیش از رزرو بررسی کن.")}><span className="setting-icon">⚠️</span><div><strong>آلرژی‌ها و ترجیحات</strong><small>هشدارهای هر جعبه را بررسی کن</small></div><Icon name="chevron" /></button>
        <button type="button" onClick={onAbout}><span className="setting-icon"><Icon name="info" /></span><div><strong>دربارهٔ دیبز</strong><small>ماموریت، ایمنی و نحوهٔ کار</small></div><Icon name="chevron" /></button>
        <Link href="/customer/support"><span className="setting-icon">؟</span><div><strong>راهنما و پشتیبانی</strong><small>پرسش‌های رایج و پیگیری درخواست‌ها</small></div><Icon name="chevron" /></Link>
        <Link href="/business"><span className="setting-icon"><Icon name="store" /></span><div><strong>رفتن به پنل کسب‌وکار</strong><small>مدیریت پیشنهادها و سفارش‌ها</small></div><Icon name="chevron" /></Link>
        <Link href="/"><span className="setting-icon"><Icon name="home" /></span><div><strong>انتخاب نوع ورود</strong><small>بازگشت به صفحه آغاز</small></div><Icon name="chevron" /></Link>
      </div>
      <p className="profile-footnote">{numberFa(reservations.length)} رزرو در این دستگاه</p>
    </div>
  );
}

function OfferDetails({ offer, favorite, onFavorite, onClose, onReserve, related, onSelect, favorites }: { offer: Offer; favorite: boolean; onFavorite: (id: string) => void; onClose: () => void; onReserve: () => void; related: Offer[]; onSelect: (offer: Offer) => void; favorites: Set<string> }) {
  const detailScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (detailScrollRef.current) detailScrollRef.current.scrollTop = 0;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [offer.id]);

  return (
    <DialogShell titleId="offer-title" onClose={onClose} size="detail">
      <button className={`dialog-favorite ${favorite ? "active" : ""}`} type="button" onClick={() => onFavorite(offer.id)} aria-label={favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}><Icon name="heart" filled={favorite} /></button>
      <div ref={detailScrollRef} className="detail-scroll">
        <div className="detail-visual"><FoodImage src={offer.image} alt={`تصویر ${offer.title}`} sizes="(max-width: 700px) 100vw, 540px" priority /><div><small>{offer.categoryLabel}</small><strong>{offer.title}</strong></div><em>{discountPercent(offer.originalPrice, offer.price)}٪ کمتر</em></div>
        <div className="detail-content">
          <div className="detail-rating"><span><Icon name="star" filled /> {decimalFa(offer.rating)} از {numberFa(offer.reviewCount)} نظر</span><span><Icon name="pin" /> {distanceFa(offer.distanceKm)}</span></div>
          <h2 id="offer-title">{offer.merchantName}</h2><p className="detail-description">{offer.description}</p>
          <div className="detail-stats"><div><Icon name="clock" /><span><small>زمان دریافت حضوری</small><strong>{offer.pickup}</strong></span></div><div><Icon name="bag" /><span><small>موجودی این لحظه</small><strong>{numberFa(offer.quantityLeft)} جعبه</strong></span></div></div>
          <section className="unknown-note"><span><Icon name="spark" /></span><div><strong>داخل جعبه غافلگیر می‌شوی</strong><p>فروشگاه تا پایان روز دقیقاً نمی‌داند چه چیزهایی باقی می‌ماند؛ تصویر فقط حال‌وهوای بسته را نشان می‌دهد.</p></div></section>
          <section className="allergy-note"><span>!</span><div><strong>هشدار آلرژی و ایمنی</strong><p>فقط غذای سالم عرضه می‌شود، اما ترکیب متغیر است. اگر آلرژی جدی داری، پیش از دریافت با فروشگاه هماهنگ کن.</p><div>{offer.allergens.map((item) => <em key={item}>{item}</em>)}</div></div></section>
          <section className="location-preview"><div><p className="eyebrow">محل دریافت</p><h3>{offer.address}</h3><small>دریافت فقط حضوری و در بازهٔ مشخص‌شده است.</small></div><div className="mini-map" aria-hidden="true"><i /><span><Icon name="pin" /></span></div></section>
          {related.length > 0 && <section className="related-section"><SectionHeading eyebrow="همین اطراف" title="شاید این‌ها را هم دوست داشته باشی" />{related.map((item) => <OfferCard compact key={item.id} offer={item} favorite={favorites.has(item.id)} onFavorite={onFavorite} onSelect={onSelect} />)}</section>}
        </div>
      </div>
      <div className="sticky-action"><div><del>{money(offer.originalPrice)}</del><strong>{money(offer.price)}</strong><small>برای هر جعبه</small></div><button className="primary-button" type="button" disabled={offer.quantityLeft < 1} onClick={onReserve}>{offer.quantityLeft > 0 ? "رزرو جعبه" : "تمام شد"}</button></div>
    </DialogShell>
  );
}

function ReservationFlow({ offer, step, setStep, quantity, setQuantity, confirming, onConfirm, success, onClose, onDone, onDirections, onCalendar }: { offer: Offer; step: number; setStep: (step: number) => void; quantity: number; setQuantity: (value: number) => void; confirming: boolean; onConfirm: () => void; success: Reservation | null; onClose: () => void; onDone: () => void; onDirections: () => void; onCalendar: () => void }) {
  const total = offer.price * quantity;
  return (
    <DialogShell titleId="reservation-title" onClose={onClose}>
      <div className="flow-header"><span>رزرو جعبه</span><strong>{step < 5 ? `${numberFa(step)} از ۴` : "انجام شد"}</strong></div>
      {step < 5 && <div className="flow-progress" aria-label={`مرحله ${numberFa(step)} از ۴`}>{[1, 2, 3, 4].map((item) => <i className={item <= step ? "active" : ""} key={item} />)}</div>}
      <div className="flow-content">
        {step === 1 && <><p className="eyebrow">مرور جعبه</p><h2 id="reservation-title">همین را می‌خواهی؟</h2><div className="review-box glass-subtle"><span className="store-logo large"><FoodImage src={offer.image} sizes="72px" /></span><div><strong>{offer.merchantName}</strong><p>{offer.title}</p><small>{offer.pickup}</small></div></div><div className="simulation-note"><Icon name="info" /><p><strong>جعبه غافلگیرکننده است.</strong> ترکیب دقیق بر اساس موجودی سالم پایان روز مشخص می‌شود.</p></div></>}
        {step === 2 && <><p className="eyebrow">تعداد جعبه</p><h2 id="reservation-title">چند تا نجات می‌دی؟</h2><p className="flow-subtitle">حداکثر {numberFa(Math.min(3, offer.quantityLeft))} جعبه در هر رزرو.</p><div className="quantity-picker"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="کم کردن تعداد"><Icon name="minus" /></button><strong>{numberFa(quantity)}</strong><button type="button" onClick={() => setQuantity(Math.min(Math.min(3, offer.quantityLeft), quantity + 1))} disabled={quantity >= Math.min(3, offer.quantityLeft)} aria-label="زیاد کردن تعداد"><Icon name="plus" /></button></div><div className="flow-price"><span>جمع رزرو</span><strong>{money(total)}</strong></div></>}
        {step === 3 && <><p className="eyebrow">زمان دریافت</p><h2 id="reservation-title">سر وقت می‌رسی؟</h2><button className="pickup-choice selected" type="button" aria-pressed="true"><span><Icon name="clock" /></span><div><strong>{offer.pickup}</strong><small>دریافت حضوری از {offer.neighborhood}</small></div><Icon name="check" /></button><div className="pickup-reminder"><Icon name="bell" /><p>یادآوری ۳۰ دقیقه قبل از شروع بازه برایت روشن می‌شود.</p></div></>}
        {step === 4 && <><p className="eyebrow">تأیید نهایی</p><h2 id="reservation-title">همه‌چیز آماده‌ست</h2><div className="confirmation-list"><span><small>فروشگاه</small><strong>{offer.merchantName}</strong></span><span><small>تعداد</small><strong>{numberFa(quantity)} جعبه</strong></span><span><small>دریافت</small><strong>{offer.pickup}</strong></span><span><small>مبلغ</small><strong>{money(total)}</strong></span></div><label className="confirm-check"><input type="checkbox" defaultChecked /><span><Icon name="check" /></span><p>می‌دانم محتویات دقیق جعبه متغیر است و باید هشدار آلرژی را بررسی کنم.</p></label></>}
        {step === 5 && success && <SuccessState reservation={success} onDirections={onDirections} onCalendar={onCalendar} onDone={onDone} />}
      </div>
      {step < 5 && <div className="flow-footer">{step > 1 && <button className="secondary-button" type="button" onClick={() => setStep(step - 1)}>برگشت</button>}<button className="primary-button" type="button" onClick={() => step === 4 ? onConfirm() : setStep(step + 1)} disabled={confirming}>{confirming ? <><span className="spinner" /> در حال ثبت...</> : step === 4 ? "تأیید رزرو" : "ادامه"}</button></div>}
    </DialogShell>
  );
}

function SuccessState({ reservation, onDirections, onCalendar, onDone }: { reservation: Reservation; onDirections: () => void; onCalendar: () => void; onDone: () => void }) {
  return (
    <div className="success-state">
      <div className="success-burst"><span><Icon name="check" /></span><i /><i /><i /></div>
      <p className="eyebrow">رزرو با موفقیت انجام شد</p><h2 id="reservation-title">جعبه‌ات کنار گذاشته شد!</h2><p>در بازهٔ تعیین‌شده به فروشگاه برو و کد دریافت را نشان بده.</p>
      <div className="pickup-pass"><div className="pass-brand"><span><Image src="/brand/dibz-mascot-transparent.png" alt="" width={32} height={32} /></span><small>برگهٔ دریافت دیبز</small></div><div className="pass-store"><strong>{reservation.merchantName}</strong><small>{reservation.pickup}</small></div><div className="pass-code"><MiniQr code={reservation.code} /><span><small>کد دریافت</small><strong>{reservation.code}</strong></span></div><div className="pass-cut" /><p>{reservation.address}</p></div>
      <div className="success-countdown"><small>تا شروع زمان دریافت</small><strong>۲ ساعت و ۱۲ دقیقه</strong></div>
      <div className="success-actions"><button type="button" onClick={onDirections}><Icon name="route" /> مسیریابی</button><button type="button" onClick={onCalendar}><Icon name="calendar" /> افزودن به تقویم</button></div>
      <button className="primary-button full" type="button" onClick={onDone}>دیدن در رزروهای من</button>
    </div>
  );
}

function FilterSheet({ maxDistance, setMaxDistance, maxPrice, setMaxPrice, pickup, setPickup, onReset, onClose, resultCount }: { maxDistance: number; setMaxDistance: (value: number) => void; maxPrice: number; setMaxPrice: (value: number) => void; pickup: "all" | PickupPeriod; setPickup: (value: "all" | PickupPeriod) => void; onReset: () => void; onClose: () => void; resultCount: number }) {
  return (
    <DialogShell titleId="filters-title" onClose={onClose}>
      <div className="filter-sheet"><p className="eyebrow">پیدا کردن بهترین گزینه</p><h2 id="filters-title">فیلتر پیشنهادها</h2><div className="range-field"><div><label htmlFor="distance-range">حداکثر فاصله</label><strong>{numberFa(maxDistance)} کیلومتر</strong></div><input id="distance-range" type="range" min="1" max="10" step="1" value={maxDistance} onChange={(event) => setMaxDistance(Number(event.target.value))} /></div><div className="range-field"><div><label htmlFor="price-range">حداکثر قیمت هر جعبه</label><strong>{money(maxPrice)}</strong></div><input id="price-range" type="range" min="90000" max="300000" step="10000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></div><fieldset className="pickup-filters"><legend>زمان دریافت</legend>{([['all', 'همهٔ زمان‌ها'], ['evening', 'امشب تا ۲۱'], ['late', 'آخر شب'], ['tomorrow', 'فردا']] as const).map(([id, label]) => <button type="button" key={id} className={pickup === id ? "active" : ""} onClick={() => setPickup(id)} aria-pressed={pickup === id}>{label}</button>)}</fieldset><div className="filter-footer"><button className="text-button" type="button" onClick={onReset}>پاک کردن همه</button><button className="primary-button" type="button" onClick={onClose}>نمایش {numberFa(resultCount)} نتیجه</button></div></div>
    </DialogShell>
  );
}

function LocationSheet({ value, onChange, onClose }: { value: string; onChange: (value: string) => void; onClose: () => void }) {
  const locations = ["تهران، ونک", "تهران، میدان ولیعصر", "تهران، یوسف‌آباد"];
  return <DialogShell titleId="location-title" onClose={onClose}><div className="simple-sheet"><p className="eyebrow">موقعیت فعلی</p><h2 id="location-title">کجای تهران هستی؟</h2><p>محدودهٔ نزدیک خودت را انتخاب کن.</p><div className="choice-list">{locations.map((item) => <button type="button" key={item} onClick={() => onChange(item)} className={value === item ? "active" : ""}><span><Icon name="pin" /></span><strong>{item}</strong>{value === item && <Icon name="check" />}</button>)}</div></div></DialogShell>;
}

function AboutSheet({ onClose }: { onClose: () => void }) {
  return <DialogShell titleId="about-title" onClose={onClose}><div className="simple-sheet about-sheet"><div className="about-mark"><span><Image src="/brand/dibz-mascot-transparent.png" alt="" width={88} height={88} /></span></div><p className="eyebrow">داستان دیبز</p><h2 id="about-title">غذای خوب، قبل از دورریز</h2><p>دیبز کاربران را به غذای سالمِ فروش‌نرفته و کالاهای نزدیک به پایان مهلت فروش وصل می‌کند.</p><ul><li><Icon name="spark" /><span><strong>جعبهٔ غافلگیرکننده</strong>محتوا دقیقاً از قبل معلوم نیست، اما ایمنی نامعلوم نیست.</span></li><li><Icon name="clock" /><span><strong>دریافت حضوری</strong>هر رزرو بازهٔ مشخص دارد و ارسال نداریم.</span></li><li><Icon name="info" /><span><strong>شفافیت و ایمنی</strong>محصول تاریخ‌گذشته یا نامناسب برای مصرف در دیبز عرضه نمی‌شود.</span></li></ul><button className="primary-button full" type="button" onClick={onClose}>متوجه شدم</button></div></DialogShell>;
}

function CancelDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return <DialogShell label="تأیید لغو رزرو" onClose={onClose} size="center"><div className="cancel-dialog"><span className="danger-icon"><Icon name="trash" /></span><h2>رزرو لغو شود؟</h2><p>پس از لغو، کد دریافت غیرفعال و موجودی مجاز به فروشگاه بازگردانده می‌شود.</p><div><button className="secondary-button" type="button" onClick={onClose}>نه، نگهش دار</button><button className="danger-button" type="button" onClick={onConfirm}>بله، لغو کن</button></div></div></DialogShell>;
}

function ReviewDialog({ orderId, onClose, onSubmit }: { orderId: string; onClose: () => void; onSubmit: (rating: number, comment: string) => boolean }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  return <DialogShell titleId="customer-review-title" onClose={onClose}><form className="customer-review-dialog" onSubmit={(event) => { event.preventDefault(); onSubmit(rating, comment); }}><p className="eyebrow">تجربه دریافت</p><h2 id="customer-review-title">نظرت درباره این سفارش چیست؟</h2><p>پاسخ شما در پنل کیفیت کسب‌وکار دیده می‌شود. سفارش: <b>{orderId}</b></p><div className="customer-rating" role="radiogroup" aria-label="امتیاز از پنج">{[1, 2, 3, 4, 5].map((value) => <button type="button" role="radio" aria-checked={rating === value} className={rating >= value ? "active" : ""} onClick={() => setRating(value)} key={value} aria-label={`${value} ستاره`}>★</button>)}</div><label><span>توضیح اختیاری</span><textarea rows={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="چه چیزی خوب بود یا بهتر می‌شد؟" /></label><button className="primary-button full" type="submit">ثبت نظر</button></form></DialogShell>;
}

function SectionHeading({ eyebrow, title, id, action, onAction }: { eyebrow: string; title: string; id?: string; action?: string; onAction?: () => void }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2 id={id}>{title}</h2></div>{action && <button type="button" onClick={onAction}>{action}<Icon name="arrow" /></button>}</div>;
}

function PageTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="page-title"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div>;
}

function MiniQr({ code }: { code: string }) {
  const seed = [...code].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return <span className="mini-qr" aria-label={`کد دیداری دریافت ${code}`}>{Array.from({ length: 81 }, (_, index) => <i className={(index * 7 + seed + index * index) % 5 < 2 ? "on" : ""} key={index} />)}</span>;
}

function addToCalendar(reservation: Reservation | null, showToast: (message: string) => void) {
  if (!reservation) return;
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `SUMMARY:دریافت جعبه از ${reservation.merchantName}`, `LOCATION:${reservation.address}`, "DTSTART:20260722T170000Z", "DTEND:20260722T180000Z", `DESCRIPTION:کد دریافت ${reservation.code}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "dibz-pickup.ics";
  link.click();
  URL.revokeObjectURL(url);
  showToast("یادآور دریافت برای تقویم آماده شد.");
}
