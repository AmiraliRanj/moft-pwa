import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { decimalFa, distanceFa, moneyCompact, numberFa } from "@/lib/moft-format";
import type { Offer } from "@/types/moft";

export function OfferCard({
  offer,
  favorite,
  onFavorite,
  onSelect,
  compact = false,
  priority = false,
}: {
  offer: Offer;
  favorite: boolean;
  onFavorite: (id: string) => void;
  onSelect: (offer: Offer) => void;
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      className={`relative group rounded-3xl bg-surface border border-line overflow-hidden shadow-xs hover:border-brand-2/40 transition-all ${
        compact ? "w-44 shrink-0" : "w-full"
      }`}
    >
      <button
        className="w-full text-start flex flex-col focus:outline-none"
        type="button"
        onClick={() => onSelect(offer)}
        aria-label={`مشاهده ${offer.title} از ${offer.merchantName}`}
      >
        <div className={`relative w-full overflow-hidden bg-canvas ${compact ? "h-28" : "h-36"}`}>
          <FoodImage
            src={offer.image}
            sizes={compact ? "200px" : "(max-width: 700px) 100vw, 340px"}
            priority={priority}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-3.5 flex-1 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-brand-2">{offer.categoryLabel}</span>
            <span className="flex items-center gap-1 text-muted">
              <Icon name="star" filled className="w-3 h-3 text-amber-500" />
              <b className="text-ink font-bold">{decimalFa(offer.rating)}</b>
              <i className="not-italic text-[10px] opacity-70">({numberFa(offer.reviewCount)})</i>
            </span>
          </div>

          <h3 className="text-xs font-black text-ink line-clamp-1">{offer.merchantName}</h3>
          <p className="text-[11px] text-muted line-clamp-1">{offer.title}</p>

          <div className="flex items-center gap-2.5 text-[10px] text-muted pt-1">
            <span className="flex items-center gap-1">
              <Icon name="clock" className="w-3 h-3" />
              <span>{offer.pickup}</span>
            </span>
            <span className="flex items-center gap-1">
              <Icon name="pin" className="w-3 h-3" />
              <span>{distanceFa(offer.distanceKm)}</span>
            </span>
          </div>

          {offer.quantityLeft > 0 && offer.quantityLeft <= 3 && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold w-fit ${
                offer.quantityLeft <= 2
                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}
            >
              {numberFa(offer.quantityLeft)} جعبه موجود
            </span>
          )}

          <div className="flex items-baseline justify-between pt-2 mt-auto border-t border-line/60">
            <div className="flex items-baseline gap-1.5">
              <del className="text-[11px] text-muted line-through" aria-label={`ارزش ${moneyCompact(offer.originalPrice)}`}>
                <span className="opacity-70">ارزش </span>{moneyCompact(offer.originalPrice)}
              </del>
              <strong className="text-xs font-black text-ink">{moneyCompact(offer.price)}</strong>
            </div>
          </div>
        </div>
      </button>

      <button
        className={`absolute top-2.5 end-2.5 w-8 h-8 rounded-full grid place-items-center backdrop-blur-md border transition-all ${
          favorite
            ? "bg-rose-500 text-white border-rose-500 shadow-xs"
            : "bg-surface/80 text-muted border-line hover:text-rose-500 hover:bg-surface"
        }`}
        type="button"
        onClick={() => onFavorite(offer.id)}
        aria-label={favorite ? `حذف ${offer.merchantName} از علاقه‌مندی‌ها` : `افزودن ${offer.merchantName} به علاقه‌مندی‌ها`}
        aria-pressed={favorite}
      >
        <Icon name="heart" filled={favorite} className="w-4 h-4" />
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
  favorites: Set<string>;
  onFavorite: (id: string) => void;
  onSelect: (offer: Offer) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {offers.map((offer, index) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          favorite={favorites.has(offer.id)}
          onFavorite={onFavorite}
          onSelect={onSelect}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
