import { FoodImage } from "@/components/moft/FoodImage";
import { Icon } from "@/components/moft/Icon";
import { decimalFa, distanceFa, moneyCompact, numberFa } from "@/lib/moft-format";
import type { Offer } from "@/types/moft";

export function OfferCard({ offer, favorite, onFavorite, onSelect, compact = false, priority = false }: { offer: Offer; favorite: boolean; onFavorite: (id: string) => void; onSelect: (offer: Offer) => void; compact?: boolean; priority?: boolean }) {
  return (
    <article className={`offer-card glass-subtle ${compact ? "compact" : ""}`}>
      <button className="offer-card-main" type="button" onClick={() => onSelect(offer)} aria-label={`مشاهده ${offer.title} از ${offer.merchantName}`}>
        <div className="offer-visual">
          <FoodImage src={offer.image} sizes={compact ? "320px" : "(max-width: 700px) 100vw, 340px"} priority={priority} />
          {offer.quantityLeft > 0 && offer.quantityLeft <= 3 && <span className={`availability-badge ${offer.quantityLeft <= 2 ? "low" : ""}`}>{numberFa(offer.quantityLeft)} جعبه موجود</span>}
        </div>
        <div className="offer-body">
          <div className="offer-topline">
            <span>{offer.categoryLabel}</span>
            <span className="rating"><Icon name="star" filled /> {decimalFa(offer.rating)} <i>از {numberFa(offer.reviewCount)} نظر</i></span>
          </div>
          <h3>{offer.merchantName}</h3>
          <p>{offer.title}</p>
          <div className="pickup-line"><span><Icon name="clock" /> {offer.pickup}</span><span><Icon name="pin" /> {distanceFa(offer.distanceKm)}</span></div>
          <div className="price-line">
            <div><del>ارزش {moneyCompact(offer.originalPrice)}</del><strong>{moneyCompact(offer.price)}</strong></div>
          </div>
        </div>
      </button>
      <button className={`favorite-button t-like ${favorite ? "active" : ""}`} data-liked={favorite} type="button" onClick={() => onFavorite(offer.id)} aria-label={favorite ? `حذف ${offer.merchantName} از علاقه‌مندی‌ها` : `افزودن ${offer.merchantName} به علاقه‌مندی‌ها`} aria-pressed={favorite}>
        <span className="t-like-icon"><Icon name="heart" filled={favorite} /></span>
      </button>
    </article>
  );
}

export function OfferList({ offers, favorites, onFavorite, onSelect }: { offers: Offer[]; favorites: Set<string>; onFavorite: (id: string) => void; onSelect: (offer: Offer) => void }) {
  return <div className="offer-list">{offers.map((offer, index) => <OfferCard key={offer.id} offer={offer} favorite={favorites.has(offer.id)} onFavorite={onFavorite} onSelect={onSelect} priority={index === 0} />)}</div>;
}
