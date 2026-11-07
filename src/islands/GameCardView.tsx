// React-версия карточки игры: та же разметка и классы, что у GameCard.astro (стили — src/styles/ui.css).
import type { CSSProperties } from "react";
import type { Game } from "@/data/games";
import { badgeLabel, formatPrice } from "@/data/games";
import { link } from "@/data/link";

interface Props {
  game: Game;
  wished: boolean;
  onWish: () => void;
  row?: boolean;
}

const Heart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
  </svg>
);

const Star = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
);

export default function GameCardView({ game, wished, onWish, row = false }: Props) {
  const coverStyle = {
    "--cover-a": game.cover.a,
    "--cover-b": game.cover.b,
    viewTransitionName: `cover-${game.slug}`,
  } as CSSProperties;

  return (
    <article
      className={`game-card${row ? " game-card--row" : ""}`}
      style={{ "--card-glow": game.cover.b } as CSSProperties}
      data-tilt=""
    >
      <div className="cover" style={coverStyle} aria-hidden="true">
        <span className="cover__orb" />
        <span className="cover__title">{game.coverTitle}</span>
      </div>
      <span className="game-card__glare" aria-hidden="true" />

      {game.badge && <span className={`badge badge--${game.badge} game-card__badge`}>{badgeLabel(game)}</span>}

      <button
        type="button"
        className="icon-btn icon-btn--sm icon-btn--overlay game-card__wish"
        aria-label={`${game.name}: add to wishlist`}
        title={`${game.name}: add to wishlist`}
        aria-pressed={wished}
        onClick={onWish}
      >
        <Heart />
      </button>

      <div className="game-card__body">
        <p className="game-card__studio">{game.studio}</p>
        <h3 className="game-card__name">
          <a href={link(`/games/${game.slug}`)}>{game.name}</a>
        </h3>
        <ul className="game-card__tags" role="list" aria-label="Genres">
          {game.tags.map((t) => (
            <li key={t}>
              <span className="tag tag--sm">{t}</span>
            </li>
          ))}
        </ul>
        <div className="game-card__foot">
          <span className="rating">
            <Star />
            <span className="visually-hidden">Rated</span>
            <b>{game.rating.toFixed(1)}</b>
            <span className="visually-hidden">out of 5</span>
          </span>
          <p className="game-card__price">
            {game.oldPrice !== undefined && (
              <s>
                <span className="visually-hidden">Was</span> {formatPrice(game.oldPrice)}
              </s>
            )}
            <b className={game.oldPrice !== undefined ? "is-sale" : undefined}>
              {game.oldPrice !== undefined && <span className="visually-hidden">now </span>}
              {formatPrice(game.price)}
            </b>
          </p>
        </div>
      </div>
    </article>
  );
}
