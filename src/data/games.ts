// Выдуманные игры Umbra. Любые совпадения с реальными играми случайны.
// Обложки процедурные: градиент из двух цветов + светящийся шар (см. GameCover.astro).

export type BadgeKind = "new" | "sale" | "early";

export interface Game {
  slug: string;
  name: string;
  /** название на обложке; \n — перенос строки */
  coverTitle: string;
  studio: string;
  tags: string[];
  rating: number;
  /** цена в долларах; 0 — бесплатно */
  price: number;
  /** старая цена, если есть скидка */
  oldPrice?: number;
  badge?: BadgeKind;
  /** цвета обложки: a — основа градиента, b — свет и шар */
  cover: { a: string; b: string };
}

export const games: Game[] = [
  {
    slug: "hollow-signal",
    name: "Hollow Signal",
    coverTitle: "Hollow\nSignal",
    studio: "Static Moth",
    tags: ["Horror", "Radio", "Solo"],
    rating: 4.8,
    price: 14.99,
    badge: "new",
    cover: { a: "oklch(0.42 0.15 285)", b: "oklch(0.74 0.14 292)" },
  },
  {
    slug: "glasswing",
    name: "Glasswing",
    coverTitle: "Glass\nwing",
    studio: "Paper Orbit",
    tags: ["Flight", "Co-op"],
    rating: 4.6,
    price: 8.99,
    oldPrice: 14.99,
    badge: "sale",
    cover: { a: "oklch(0.43 0.07 215)", b: "oklch(0.83 0.1 205)" },
  },
  {
    slug: "last-lumen",
    name: "Last Lumen",
    coverTitle: "Last\nLumen",
    studio: "Northwake",
    tags: ["Roguelike", "Pixel"],
    rating: 4.9,
    price: 19.99,
    cover: { a: "oklch(0.38 0.11 350)", b: "oklch(0.74 0.14 352)" },
  },
  {
    slug: "neon-drift",
    name: "Neon Drift",
    coverTitle: "Neon\nDrift",
    studio: "Lowlight",
    tags: ["Racing", "Synth"],
    rating: 4.7,
    price: 12.99,
    cover: { a: "oklch(0.4 0.13 270)", b: "oklch(0.78 0.1 260)" },
  },
  {
    slug: "ember-choir",
    name: "Ember Choir",
    coverTitle: "Ember\nChoir",
    studio: "Kiln & Co",
    tags: ["Rhythm", "Story"],
    rating: 4.5,
    price: 9.99,
    cover: { a: "oklch(0.38 0.08 40)", b: "oklch(0.8 0.1 50)" },
  },
  {
    slug: "subtide",
    name: "Subtide",
    coverTitle: "Sub\ntide",
    studio: "Deep Run",
    tags: ["Survival", "Ocean"],
    rating: 4.4,
    price: 16.99,
    badge: "early",
    cover: { a: "oklch(0.37 0.06 225)", b: "oklch(0.83 0.1 205)" },
  },
];

export const formatPrice = (usd: number) => (usd === 0 ? "Free" : `$${usd.toFixed(2)}`);

export const getGame = (slug: string) => games.find((g) => g.slug === slug);
