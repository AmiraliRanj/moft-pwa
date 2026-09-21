import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { decimalFa, distanceFa, moneyCompact, numberFa } from "@/lib/moft-format";
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
            <p className="text-[10px] font-medium text-muted truncate">{offer.merchantName}</p>

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
    <article className="relative group rounded-2xl sm:rounded-3xl bg-surface border border-line overflow-hidden shadow-xs hover:border-brand-2/40 hover:shadow-sm transition-all w-full">
      <button
        className="w-full text-start flex flex-col focus:outline-none cursor-pointer active:opacity-90"
        type="button"
        onClick={() => onSelect(offer)}
        aria-label={`مشاهده ${offer.title} از ${offer.merchantName}`}
      >
        {/* Top: Photo thumbnail and Information side-by-side */}
        <div className="flex items-center p-3 gap-3">
          {/* Photo thumbnail */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-canvas shrink-0">
            <FoodImage
              src={offer.image}
              sizes="(max-width: 640px) 80px, 96px"
              priority={priority}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {offer.quantityLeft > 0 && offer.quantityLeft <= 3 && (
              <span className="absolute bottom-1.5 start-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-black/70 text-white backdrop-blur-xs">
                {numberFa(offer.quantityLeft)} عدد
              </span>
            )}
          </div>

          {/* Information */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-ink truncate leading-snug">
                  {offer.title}
                </h3>
                <p className="text-[11px] font-medium text-muted truncate mt-0.5">
                  {offer.merchantName}
                </p>
              </div>

              {/* Star Rating on Top-Left: no background, green star icon */}
              <div className="inline-flex items-center gap-1 shrink-0 self-start text-xs font-black text-ink pt-0.5">
                <Icon name="star" filled className="w-3.5 h-3.5 text-brand-2" />
                <span>{decimalFa(offer.rating)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted mt-2 truncate">
              <Icon name="clock" className="w-3 h-3 text-muted/70 shrink-0" />
              <span className="truncate">{offer.pickup}</span>
              <span className="text-muted/40 shrink-0">•</span>
              <Icon name="pin" className="w-3 h-3 text-muted/70 shrink-0" />
              <span className="shrink-0">{distanceFa(offer.distanceKm)}</span>
            </div>
          </div>
        </div>

        {/* Bottom: Dedicated price row below information with prices together */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-line/60 bg-surface-subtle/30">
          {discountPercent > 0 ? (
            <span className="text-[11px] font-black text-rose-600">
              {numberFa(discountPercent)}٪ تخفیف
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-baseline gap-2">
            <del className="text-[11px] text-muted line-through" aria-label={`ارزش ${moneyCompact(offer.originalPrice)}`}>
              {moneyCompact(offer.originalPrice)}
            </del>
            <strong className="text-sm font-black text-ink">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
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
