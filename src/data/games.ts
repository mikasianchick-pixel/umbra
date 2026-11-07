// Выдуманные игры Umbra. Любые совпадения с реальными играми случайны.
// Обложки процедурные: градиент из двух цветов + светящийся шар (см. GameCover.astro).

export type BadgeKind = "new" | "sale" | "early";

export interface Achievement {
  name: string;
  text: string;
  /** 0…100; 100 — открыто */
  progress: number;
}

export interface Review {
  user: string;
  hours: number;
  stars: number;
  text: string;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface Game {
  slug: string;
  name: string;
  /** название на обложке; \n — перенос строки */
  coverTitle: string;
  studio: string;
  tags: string[];
  rating: number;
  reviewCount: string;
  /** цена в долларах; 0 — бесплатно */
  price: number;
  /** старая цена, если есть скидка */
  oldPrice?: number;
  badge?: BadgeKind;
  /** цвета обложки: a — основа градиента, b — свет и шар */
  cover: { a: string; b: string };
  tagline: string;
  about: string[];
  /** дата выхода, ISO */
  release: string;
  /** чем больше, тем выше в сортировке Trending */
  popularity: number;
  features: { pass: boolean; controller: boolean; cloud: boolean };
  modes: string;
  size: string;
  /** особый силуэт на параллаксе страницы игры */
  landmark?: "tower";
  achievements?: Achievement[];
  reviews?: Review[];
}

export const games: Game[] = [
  {
    slug: "hollow-signal",
    name: "Hollow Signal",
    coverTitle: "Hollow\nSignal",
    studio: "Static Moth",
    tags: ["Horror", "Radio", "Solo"],
    rating: 4.8,
    reviewCount: "2.1k",
    price: 14.99,
    badge: "new",
    cover: { a: "oklch(0.42 0.15 285)", b: "oklch(0.74 0.14 292)" },
    tagline: "A lonely radio tower keeps receiving voices that shouldn't exist.",
    about: [
      "You are the last operator of Hollow Ridge relay. Every night at 03:00 the tower picks up a broadcast — voices of people who never lived here. Tune the dial, decode the noise and decide which signals to answer.",
      "A slow, atmospheric horror about listening. No jump scares — just you, the static and something that is learning your voice.",
    ],
    release: "2026-10-31",
    popularity: 98,
    features: { pass: true, controller: true, cloud: true },
    modes: "Single-player",
    size: "4.2 GB",
    landmark: "tower",
    achievements: [
      { name: "First Contact", text: "Answer your first signal", progress: 100 },
      { name: "Night Owl", text: "Stay on air until dawn", progress: 100 },
      { name: "Static Poet", text: "Decode 50 broadcasts", progress: 64 },
      { name: "Silence", text: "Ignore every call for a night", progress: 3 },
    ],
    reviews: [
      {
        user: "nightshift_ana",
        hours: 4,
        stars: 5,
        text: "I played with headphones at 2am. Bad idea. Best idea. The radio dial is the most tactile UI I've touched in a game.",
      },
      {
        user: "kilowatt",
        hours: 11,
        stars: 4,
        text: "Slow, patient and genuinely unsettling. The sound design carries everything — wish there was a photo mode.",
      },
    ],
  },
  {
    slug: "glasswing",
    name: "Glasswing",
    coverTitle: "Glass\nwing",
    studio: "Paper Orbit",
    tags: ["Flight", "Co-op"],
    rating: 4.6,
    reviewCount: "1.4k",
    price: 8.99,
    oldPrice: 14.99,
    badge: "sale",
    cover: { a: "oklch(0.43 0.07 215)", b: "oklch(0.83 0.1 205)" },
    tagline: "Two pilots, one fragile glider and a sky made of glass.",
    about: [
      "Glide through crystal canyons with a friend on the other wing. One of you steers, the other reads the wind — and the glass sings when you get too close.",
      "Short, bright and made for couch co-op evenings.",
    ],
    release: "2026-05-14",
    popularity: 91,
    features: { pass: true, controller: true, cloud: true },
    modes: "Co-op (2 players)",
    size: "2.8 GB",
  },
  {
    slug: "last-lumen",
    name: "Last Lumen",
    coverTitle: "Last\nLumen",
    studio: "Northwake",
    tags: ["Roguelike", "Pixel"],
    rating: 4.9,
    reviewCount: "3.6k",
    price: 19.99,
    cover: { a: "oklch(0.38 0.11 350)", b: "oklch(0.74 0.14 352)" },
    tagline: "Carry the last light down a dungeon that rebuilds itself every run.",
    about: [
      "Every descent is different, but your lantern remembers. Burn oil to see further, or save it to survive the next floor.",
      "Tight pixel combat, hundreds of relics and a soundtrack that gets darker the deeper you go.",
    ],
    release: "2025-11-20",
    popularity: 96,
    features: { pass: false, controller: true, cloud: true },
    modes: "Single-player",
    size: "1.1 GB",
  },
  {
    slug: "neon-drift",
    name: "Neon Drift",
    coverTitle: "Neon\nDrift",
    studio: "Lowlight",
    tags: ["Racing", "Synth"],
    rating: 4.7,
    reviewCount: "2.9k",
    price: 12.99,
    cover: { a: "oklch(0.4 0.13 270)", b: "oklch(0.78 0.1 260)" },
    tagline: "Midnight streets, synth on the radio and nothing but the next corner.",
    about: [
      "Drift through an endless neon city where every track is generated from the music you pick.",
      "Ghost races against friends, weekly leaderboards and a photo mode built for wallpapers.",
    ],
    release: "2026-02-03",
    popularity: 88,
    features: { pass: true, controller: true, cloud: false },
    modes: "Single-player, online ghosts",
    size: "6.4 GB",
  },
  {
    slug: "ember-choir",
    name: "Ember Choir",
    coverTitle: "Ember\nChoir",
    studio: "Kiln & Co",
    tags: ["Rhythm", "Story"],
    rating: 4.5,
    reviewCount: "860",
    price: 9.99,
    cover: { a: "oklch(0.38 0.08 40)", b: "oklch(0.8 0.1 50)" },
    tagline: "Keep the village fire alive by singing in time with it.",
    about: [
      "A rhythm game about a choir that sings to a fire so it never goes out. Each verse tells the story of one villager.",
      "Gentle difficulty, a hard mode for purists and a soundtrack recorded by a real choir — of three people.",
    ],
    release: "2026-08-22",
    popularity: 70,
    features: { pass: true, controller: true, cloud: true },
    modes: "Single-player",
    size: "3.0 GB",
  },
  {
    slug: "subtide",
    name: "Subtide",
    coverTitle: "Sub\ntide",
    studio: "Deep Run",
    tags: ["Survival", "Ocean"],
    rating: 4.4,
    reviewCount: "1.1k",
    price: 16.99,
    badge: "early",
    cover: { a: "oklch(0.37 0.06 225)", b: "oklch(0.83 0.1 205)" },
    tagline: "Build a home on the seabed before the tide takes the surface.",
    about: [
      "Dive, scavenge and build a pressure-proof base as the ocean rises over the last islands.",
      "In early access: new biomes arrive every month, shaped by player feedback.",
    ],
    release: "2026-09-09",
    popularity: 84,
    features: { pass: false, controller: true, cloud: true },
    modes: "Single-player, co-op (4)",
    size: "9.7 GB",
  },
  {
    slug: "moth-lantern",
    name: "Moth Lantern",
    coverTitle: "Moth\nLantern",
    studio: "Hushfield",
    tags: ["Puzzle", "Cozy"],
    rating: 4.6,
    reviewCount: "740",
    price: 6.99,
    cover: { a: "oklch(0.4 0.07 80)", b: "oklch(0.85 0.1 85)" },
    tagline: "Guide a moth home by moving the lights of a sleeping town.",
    about: [
      "A small, warm puzzle game about light and shadow. Switch lamps on and off to lead a lost moth through rooftops and gardens.",
      "Sixty hand-made puzzles, no timers, no fail states.",
    ],
    release: "2026-03-18",
    popularity: 66,
    features: { pass: true, controller: false, cloud: true },
    modes: "Single-player",
    size: "0.6 GB",
  },
  {
    slug: "velvet-circuit",
    name: "Velvet Circuit",
    coverTitle: "Velvet\nCircuit",
    studio: "Lowlight",
    tags: ["Racing", "Arcade"],
    rating: 4.2,
    reviewCount: "5.2k",
    price: 0,
    cover: { a: "oklch(0.36 0.12 320)", b: "oklch(0.74 0.12 320)" },
    tagline: "Free-to-play arcade racing on tracks wrapped in velvet light.",
    about: [
      "Quick three-minute races, a season pass made of cosmetics only and no pay-to-win.",
      "Great for a short session before bed — or ten of them.",
    ],
    release: "2025-12-01",
    popularity: 93,
    features: { pass: false, controller: true, cloud: true },
    modes: "Online multiplayer (8)",
    size: "5.5 GB",
  },
  {
    slug: "coldharbor",
    name: "Coldharbor",
    coverTitle: "Cold\nharbor",
    studio: "Deep Run",
    tags: ["Stealth", "Story"],
    rating: 4.7,
    reviewCount: "1.9k",
    price: 17.99,
    cover: { a: "oklch(0.32 0.04 240)", b: "oklch(0.8 0.06 230)" },
    tagline: "A frozen port town, a missing ship and a smuggler who never gets caught.",
    about: [
      "Sneak through a harbour locked in ice. Every guard has a routine, every routine has a gap.",
      "A tight eight-hour story with multiple endings and zero forced combat.",
    ],
    release: "2026-01-27",
    popularity: 80,
    features: { pass: true, controller: true, cloud: true },
    modes: "Single-player",
    size: "12 GB",
  },
  {
    slug: "starling-run",
    name: "Starling Run",
    coverTitle: "Starling\nRun",
    studio: "Northwake",
    tags: ["Platformer", "Pixel", "Co-op"],
    rating: 4.5,
    reviewCount: "980",
    price: 11.99,
    cover: { a: "oklch(0.38 0.1 160)", b: "oklch(0.8 0.13 155)" },
    tagline: "A flock of four tiny birds racing the sunrise across rooftops.",
    about: [
      "Jump, glide and swap between birds mid-air. Play solo or bring three friends.",
      "Speedrun timer built in, ghost replays included.",
    ],
    release: "2026-06-30",
    popularity: 74,
    features: { pass: true, controller: true, cloud: false },
    modes: "Single-player, co-op (4)",
    size: "0.9 GB",
  },
  {
    slug: "quiet-engine",
    name: "Quiet Engine",
    coverTitle: "Quiet\nEngine",
    studio: "Static Moth",
    tags: ["Puzzle", "Solo"],
    rating: 4.3,
    reviewCount: "310",
    price: 7.99,
    badge: "new",
    cover: { a: "oklch(0.35 0.05 285)", b: "oklch(0.7 0.06 285)" },
    tagline: "Repair a machine that only works when nobody is listening.",
    about: [
      "A mechanical puzzle box with a secret. Each gear you fix changes the sound of the engine — and what it seems to say.",
      "From the team behind Hollow Signal.",
    ],
    release: "2026-11-01",
    popularity: 77,
    features: { pass: false, controller: false, cloud: true },
    modes: "Single-player",
    size: "0.4 GB",
  },
  {
    slug: "paper-kites",
    name: "Paper Kites",
    coverTitle: "Paper\nKites",
    studio: "Kiln & Co",
    tags: ["Flight", "Co-op", "Cozy"],
    rating: 4.6,
    reviewCount: "1.3k",
    price: 11.99,
    oldPrice: 19.99,
    badge: "sale",
    cover: { a: "oklch(0.4 0.09 20)", b: "oklch(0.78 0.11 30)" },
    tagline: "Fold a kite, catch the wind, deliver letters across a windy valley.",
    about: [
      "A relaxing flight game about a postal service that only uses kites.",
      "Fold your own kites, decorate them and fly together with up to three friends.",
    ],
    release: "2026-04-12",
    popularity: 72,
    features: { pass: true, controller: true, cloud: true },
    modes: "Single-player, co-op (4)",
    size: "2.2 GB",
  },
];

/* ---------------- помощники ---------------- */

export const formatPrice = (usd: number) => (usd === 0 ? "Free" : `$${usd.toFixed(2)}`);

export const getGame = (slug: string) => games.find((g) => g.slug === slug);

export const discountOf = (g: Game) =>
  g.oldPrice ? Math.round((1 - g.price / g.oldPrice) * 100) : 0;

export const badgeLabel = (g: Game) =>
  g.badge === "sale" ? `-${discountOf(g)}%` : g.badge === "early" ? "Early" : g.badge === "new" ? "New" : "";

/** Все жанры с количеством игр — для фильтров каталога. */
export const genreCounts = (): { name: string; count: number }[] => {
  const map = new Map<string, number>();
  for (const g of games) for (const t of g.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
};

/** Похожие игры: сначала с общими жанрами, потом самые популярные. */
export const similarGames = (game: Game, limit = 3) =>
  games
    .filter((g) => g.slug !== game.slug)
    .map((g) => ({ g, score: g.tags.filter((t) => game.tags.includes(t)).length * 100 + g.popularity }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ g }) => g);

const defaultAchievements: Achievement[] = [
  { name: "First Steps", text: "Finish the opening", progress: 100 },
  { name: "Night Shift", text: "Play after midnight", progress: 100 },
  { name: "Collector", text: "Find every secret", progress: 41 },
  { name: "Perfectionist", text: "Complete everything", progress: 6 },
];

const defaultReviews = (g: Game): Review[] => [
  {
    user: "nightshift_ana",
    hours: 9,
    stars: Math.round(g.rating),
    text: `${g.name} is exactly what I want after a long day. ${g.tagline}`,
  },
  {
    user: "kilowatt",
    hours: 23,
    stars: Math.max(3, Math.round(g.rating) - 1),
    text: "Small team, big heart. A few rough edges, but I keep coming back to it.",
  },
];

export const achievementsOf = (g: Game) => g.achievements ?? defaultAchievements;
export const reviewsOf = (g: Game) => g.reviews ?? defaultReviews(g);

export const requirements: Record<"minimum" | "recommended", SpecRow[]> = {
  minimum: [
    { label: "OS", value: "Windows 10 / SteamOS" },
    { label: "CPU", value: "Ryzen 3 3100" },
    { label: "GPU", value: "GTX 1050 Ti" },
    { label: "RAM", value: "8 GB" },
  ],
  recommended: [
    { label: "OS", value: "Windows 11 / SteamOS" },
    { label: "CPU", value: "Ryzen 5 5600" },
    { label: "GPU", value: "RTX 3060" },
    { label: "RAM", value: "16 GB" },
  ],
};
