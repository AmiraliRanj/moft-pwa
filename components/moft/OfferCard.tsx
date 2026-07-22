import { Icon } from "@/components/moft/Icon";
import { decimalFa, discountPercent, distanceFa, money, numberFa } from "@/lib/moft-format";
import type { Offer } from "@/types/moft";

export function OfferCard({ offer, favorite, onFavorite, onSelect, compact = false }: { offer: Offer; favorite: boolean; onFavorite: (id: string) => void; onSelect: (offer: Offer) => void; compact?: boolean }) {
  return (
    <article className={`offer-card ${compact ? "compact" : ""}`}>
      <button className="offer-card-main" type="button" onClick={() => onSelect(offer)} aria-label={`مشاهده ${offer.title} از ${offer.merchantName}`}>
        <div className={`offer-visual tone-${offer.tone}`}>
          <span>{offer.visual}</span>
          <small>جعبهٔ سورپرایزی</small>
          <em>{discountPercent(offer.originalPrice, offer.price)}٪</em>
        </div>
        <div className="offer-body">
          <div className="offer-topline">
            <span>{offer.categoryLabel}</span>
            <span className="rating"><Icon name="star" filled /> {decimalFa(offer.rating)} <i>({numberFa(offer.reviewCount)})</i></span>
          </div>
          <h3>{offer.merchantName}</h3>
          <p>{offer.title}</p>
          <div className="pickup-line"><span><Icon name="clock" /> {offer.pickup}</span><span><Icon name="pin" /> {distanceFa(offer.distanceKm)}</span></div>
          <div className="price-line">
            <div><del>{money(offer.originalPrice)}</del><strong>{money(offer.price)}</strong></div>
            <span className={offer.quantityLeft <= 2 ? "low" : ""}>{numberFa(offer.quantityLeft)} جعبه مانده</span>
          </div>
        </div>
      </button>
      <button className={`favorite-button ${favorite ? "active" : ""}`} type="button" onClick={() => onFavorite(offer.id)} aria-label={favorite ? `حذف ${offer.merchantName} از علاقه‌مندی‌ها` : `افزودن ${offer.merchantName} به علاقه‌مندی‌ها`} aria-pressed={favorite}>
        <Icon name="heart" filled={favorite} />
      </button>
    </article>
  );
}

export function OfferList({ offers, favorites, onFavorite, onSelect }: { offers: Offer[]; favorites: Set<string>; onFavorite: (id: string) => void; onSelect: (offer: Offer) => void }) {
  return <div className="offer-list">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} favorite={favorites.has(offer.id)} onFavorite={onFavorite} onSelect={onSelect} />)}</div>;
}
