import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { decimalFa, distanceFa, formatMerchantWithCategory, moneyCompact, numberFa } from "@/lib/moft-format";
import type { Offer } from "@/types/moft";

export function OfferCard({
  offer,
  onSelect,
  compact = false,
  priority = false,
}: {
  offer: Offer;
  favorite?: boolean;
  onFavorite?: (id: string) => void;
  onSelect: (offer: Offer) => void;
  compact?: boolean;
  priority?: boolean;
}) {
  if (compact) {
    return (
      <article className="relative group rounded-2xl bg-surface border border-line overflow-hidden shadow-xs hover:border-brand-2/40 transition-all w-38 sm:w-44 shrink-0">
        <button
          className="w-full text-start flex flex-col focus:outline-none cursor-pointer active:opacity-90"
          type="button"
          onClick={() => onSelect(offer)}
          aria-label={`مشاهده ${offer.title} از ${offer.merchantName}`}
        >
          <div className="relative w-full h-24 sm:h-28 overflow-hidden bg-canvas">
            <FoodImage
              src={offer.image}
              sizes="176px"
              priority={priority}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {offer.quantityLeft > 0 && offer.quantityLeft <= 3 && (
              <span className="absolute bottom-1.5 start-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-black/70 text-white backdrop-blur-xs">
                {numberFa(offer.quantityLeft)} عدد
              </span>
            )}
          </div>

          <div className="p-2.5 flex flex-col gap-0.5">
            <h3 className="text-xs font-black text-ink truncate">{offer.title}</h3>
            <p className="text-[10px] font-medium text-muted truncate">
              {formatMerchantWithCategory(offer.merchantName, offer.categoryLabel)}
            </p>

            <div className="flex items-center justify-between pt-1 mt-1 border-t border-line/50">
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-ink">
                <Icon name="star" filled className="w-3 h-3 text-brand-2" />
                <span>{decimalFa(offer.rating)}</span>
              </span>
              <strong className="text-xs font-black text-ink">
                {moneyCompact(offer.price)}
              </strong>
            </div>
          </div>
        </button>
      </article>
    );
  }

  const discountPercent =
    offer.originalPrice > offer.price
      ? Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
      : 0;

  return (
    <article className="relative group rounded-2xl bg-surface border border-line/80 hover:border-brand-2/40 hover:shadow-sm transition-all w-full overflow-hidden">
      <button
        className="w-full text-start flex items-center p-2.5 sm:p-3 gap-3 sm:gap-4 focus:outline-none cursor-pointer active:opacity-95"
        type="button"
        onClick={() => onSelect(offer)}
        aria-label={`مشاهده ${offer.title} از ${offer.merchantName}`}
      >
        {/* Photo thumbnail - compact & crisp */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-xl overflow-hidden bg-canvas shrink-0">
          <FoodImage
            src={offer.image}
            sizes="(max-width: 640px) 80px, 96px"
            priority={priority}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {offer.quantityLeft > 0 && offer.quantityLeft <= 3 && (
            <span className="absolute bottom-1 start-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/75 text-white backdrop-blur-xs">
              {numberFa(offer.quantityLeft)} عدد
            </span>
          )}
        </div>

        {/* Middle Information: Title, Merchant, Pickup & Distance */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-ink leading-snug font-morabba truncate">
            {offer.title}
          </h3>

          <p className="text-[11px] sm:text-xs font-medium text-muted truncate mt-0.5">
            {formatMerchantWithCategory(offer.merchantName, offer.categoryLabel)}
          </p>

          <div className="flex items-center gap-2 text-[10.5px] sm:text-xs text-muted/80 mt-1.5 truncate">
            <span className="inline-flex items-center gap-1 shrink-0">
              <Icon name="clock" className="w-3 h-3 text-muted/70 shrink-0" />
              <span>{offer.pickup}</span>
            </span>
            <span className="text-muted/40 shrink-0">•</span>
            <span className="inline-flex items-center gap-1 shrink-0">
              <Icon name="pin" className="w-3 h-3 text-muted/70 shrink-0" />
              <span>{distanceFa(offer.distanceKm)}</span>
            </span>
          </div>
        </div>

        {/* Left Flank (End in RTL): Rating at top, Price & Discount at bottom */}
        <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5 ps-2">
          {/* Rating */}
          <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-ink">
            <Icon name="star" filled className="w-3 h-3 text-brand-2" />
            <span>{decimalFa(offer.rating)}</span>
          </div>

          {/* Pricing & Discount */}
          <div className="flex flex-col items-end gap-0.5 mt-auto">
            <div className="flex items-center gap-1.5">
              {discountPercent > 0 && (
                <span className="text-[10px] sm:text-[11px] font-black text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  {numberFa(discountPercent)}٪
                </span>
              )}
              <del
                className="text-[10px] sm:text-xs text-muted line-through"
                aria-label={`ارزش ${moneyCompact(offer.originalPrice)}`}
              >
                {moneyCompact(offer.originalPrice)}
              </del>
            </div>
            <strong className="text-xs sm:text-sm md:text-base font-black text-ink whitespace-nowrap">
              {moneyCompact(offer.price)}
            </strong>
          </div>
        </div>
      </button>
    </article>
  );
}

export function OfferList({
  offers,
  favorites,
  onFavorite,
  onSelect,
}: {
  offers: Offer[];
  favorites?: Set<string>;
  onFavorite?: (id: string) => void;
  onSelect: (offer: Offer) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
      {offers.map((offer, index) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          favorite={favorites?.has(offer.id) ?? false}
          onFavorite={onFavorite}
          onSelect={onSelect}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
