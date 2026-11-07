// Каталог /games: поиск, фильтры, сортировка, вид сетка/список, избранное.
// Состояние фильтров живёт в адресе страницы (?genre=roguelike), поэтому ссылкой можно поделиться.
// При смене фильтров карточки плавно переезжают на новые места (FLIP-анимация).
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { games, genreCounts, type Game } from "@/data/games";
import { getWishlist, onWishlistChange, toggleWish } from "@/scripts/wishlist";
import { initTilt } from "@/scripts/tilt";
import GameCardView from "./GameCardView";

type Sort = "trending" | "rating" | "newest" | "price-asc" | "price-desc";
type Feature = "pass" | "controller" | "cloud" | "sale" | "wish";
type View = "grid" | "list";

interface Filters {
  q: string;
  genres: string[];
  /** максимальная цена; MAX_PRICE — без ограничения */
  max: number;
  rating: number;
  features: Feature[];
  sort: Sort;
  view: View;
}

const MAX_PRICE = 20;
const PAGE = 6;
const DEFAULTS: Filters = { q: "", genres: [], max: MAX_PRICE, rating: 0, features: [], sort: "trending", view: "grid" };

const SORTS: { value: Sort; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const FEATURES: { value: Feature; label: string }[] = [
  { value: "pass", label: "In Umbra Pass" },
  { value: "controller", label: "Controller" },
  { value: "cloud", label: "Cloud saves" },
  { value: "sale", label: "On sale" },
  { value: "wish", label: "My wishlist" },
];

const RATINGS = [
  { value: 4.5, label: "4.5+" },
  { value: 4, label: "4.0+" },
  { value: 0, label: "Any" },
];

const GENRES = genreCounts();

/* ---------- адрес страницы <-> фильтры ---------- */

function fromUrl(): Filters {
  const p = new URLSearchParams(location.search);
  const list = (k: string) => p.get(k)?.split(",").filter(Boolean) ?? [];
  const sort = p.get("sort") as Sort | null;
  return {
    q: p.get("q") ?? "",
    genres: list("genre"),
    max: Number(p.get("max")) || MAX_PRICE,
    rating: Number(p.get("rating")) || 0,
    features: list("f") as Feature[],
    sort: sort && SORTS.some((s) => s.value === sort) ? sort : "trending",
    view: p.get("view") === "list" ? "list" : "grid",
  };
}

function toUrl(f: Filters) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.genres.length) p.set("genre", f.genres.join(","));
  if (f.max < MAX_PRICE) p.set("max", String(f.max));
  if (f.rating) p.set("rating", String(f.rating));
  if (f.features.length) p.set("f", f.features.join(","));
  if (f.sort !== "trending") p.set("sort", f.sort);
  if (f.view !== "grid") p.set("view", f.view);
  const qs = p.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

/* ---------- фильтрация ---------- */

function apply(f: Filters, wish: Set<string>): Game[] {
  const q = f.q.trim().toLowerCase();
  const list = games.filter((g) => {
    if (q && !`${g.name} ${g.studio} ${g.tags.join(" ")}`.toLowerCase().includes(q)) return false;
    if (f.genres.length && !f.genres.some((t) => g.tags.includes(t))) return false;
    if (g.price > f.max) return false;
    if (g.rating < f.rating) return false;
    for (const feat of f.features) {
      if (feat === "sale" && !g.oldPrice) return false;
      if (feat === "wish" && !wish.has(g.slug)) return false;
      if ((feat === "pass" || feat === "controller" || feat === "cloud") && !g.features[feat]) return false;
    }
    return true;
  });

  const by: Record<Sort, (a: Game, b: Game) => number> = {
    trending: (a, b) => b.popularity - a.popularity,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => b.release.localeCompare(a.release),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
  };
  return list.sort(by[f.sort]);
}

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- иконки ---------- */

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5 9-10" />
  </svg>
);

/* ---------- компонент ---------- */

export default function Catalog() {
  const [f, setF] = useState<Filters>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [wish, setWish] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // первое чтение адреса и избранного — только в браузере, чтобы серверная разметка совпала
  useEffect(() => {
    setF(fromUrl());
    setWish(getWishlist());
    setReady(true);
    return onWishlistChange(() => setWish(getWishlist()));
  }, []);

  useEffect(() => {
    if (ready) toUrl(f);
  }, [f, ready]);

  const update = (patch: Partial<Filters>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setLimit(PAGE);
  };
  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const results = useMemo(() => apply(f, wish), [f, wish]);
  const visible = results.slice(0, limit);

  /* ---------- FLIP: карточки переезжают с прежних мест на новые ---------- */
  const nodes = useRef(new Map<string, HTMLElement>());
  const prev = useRef(new Map<string, { x: number; y: number }>());
  const gridRef = useRef<HTMLUListElement>(null);
  const order = visible.map((g) => g.slug).join("|") + f.view;

  useLayoutEffect(() => {
    const animate = !reduceMotion() && prev.current.size > 0;
    const next = new Map<string, { x: number; y: number }>();
    nodes.current.forEach((el, slug) => {
      const r = el.getBoundingClientRect();
      const pos = { x: r.left + scrollX, y: r.top + scrollY };
      next.set(slug, pos);
      if (!animate) return;
      const old = prev.current.get(slug);
      if (old) {
        const dx = old.x - pos.x;
        const dy = old.y - pos.y;
        if (dx || dy) {
          el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
            duration: 550,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          });
        }
      } else {
        el.animate([{ opacity: 0, transform: "scale(0.92)" }, { opacity: 1, transform: "none" }], {
          duration: 400,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        });
      }
    });
    prev.current = next;
    if (gridRef.current) initTilt(gridRef.current);
  }, [order]);

  /* ---------- активные фильтры (чипы над сеткой) ---------- */
  const chips: { label: string; remove: () => void }[] = [
    ...f.genres.map((g) => ({ label: g, remove: () => update({ genres: f.genres.filter((x) => x !== g) }) })),
    ...(f.max < MAX_PRICE ? [{ label: `Under $${f.max}`, remove: () => update({ max: MAX_PRICE }) }] : []),
    ...(f.rating ? [{ label: `${f.rating.toFixed(1)}+`, remove: () => update({ rating: 0 }) }] : []),
    ...f.features.map((x) => ({
      label: FEATURES.find((o) => o.value === x)?.label ?? x,
      remove: () => update({ features: f.features.filter((y) => y !== x) }),
    })),
  ];
  const activeCount = chips.length;

  return (
    <div className="catalog">
      {/* ---------- строка поиска ---------- */}
      <div className="catalog__bar">
        <div className="field catalog__search">
          <label htmlFor="catalog-q" className="visually-hidden">
            Search games
          </label>
          <div className="field__box">
            <SearchIcon />
            <input
              id="catalog-q"
              className="field__input"
              type="search"
              placeholder="Search games, genres, studios…"
              value={f.q}
              onChange={(e) => update({ q: e.target.value })}
              autoComplete="off"
            />
            <span className="field__kbd" aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          </div>
        </div>

        <label className="catalog__sort">
          <span>Sort:</span>
          <select value={f.sort} onChange={(e) => update({ sort: e.target.value as Sort })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="catalog__view" role="group" aria-label="View">
          {(["grid", "list"] as View[]).map((v) => (
            <button key={v} type="button" aria-pressed={f.view === v} onClick={() => update({ view: v })}>
              {v}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn--ghost btn--sm catalog__filters-btn"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <span>Filters{activeCount ? ` (${activeCount})` : ""}</span>
        </button>
      </div>

      {/* ---------- выбранные фильтры ---------- */}
      {activeCount > 0 && (
        <ul className="catalog__chips" role="list" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.label}>
              <button type="button" className="tag tag--chip" onClick={c.remove} aria-label={`Remove filter ${c.label}`}>
                {c.label} <XIcon />
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="catalog__clear" onClick={() => update({ ...DEFAULTS, q: f.q, sort: f.sort, view: f.view })}>
              Clear all
            </button>
          </li>
        </ul>
      )}

      <div className="catalog__layout">
        {/* ---------- фильтры ---------- */}
        <aside id="catalog-filters" className={`filters${filtersOpen ? " is-open" : ""}`} aria-label="Filters">
          <h2 className="filters__title">Filters</h2>

          <fieldset className="filters__group">
            <legend>Genre</legend>
            {GENRES.map((g) => (
              <label key={g.name} className="toggle toggle--checkbox filters__row">
                <input
                  className="toggle__input"
                  type="checkbox"
                  checked={f.genres.includes(g.name)}
                  onChange={() => update({ genres: toggleIn(f.genres, g.name) })}
                />
                <span className="toggle__ui" aria-hidden="true">
                  <Check />
                </span>
                <span className="toggle__text">{g.name}</span>
                <span className="filters__count">{g.count}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="filters__group">
            <legend>Price</legend>
            <label className="filters__range">
              <span className="visually-hidden">Maximum price</span>
              <input
                type="range"
                min={5}
                max={MAX_PRICE}
                step={1}
                value={f.max}
                onChange={(e) => update({ max: Number(e.target.value) })}
                style={{ "--p": `${((f.max - 5) / (MAX_PRICE - 5)) * 100}%` } as CSSProperties}
                aria-valuetext={f.max >= MAX_PRICE ? "Any price" : `Under $${f.max}`}
              />
            </label>
            <p className="filters__range-meta">
              <span>Free</span>
              <b>{f.max >= MAX_PRICE ? "Any" : `≤ $${f.max}`}</b>
              <span>${MAX_PRICE}+</span>
            </p>
          </fieldset>

          <fieldset className="filters__group">
            <legend>Rating</legend>
            <div className="filters__pills">
              {RATINGS.map((r) => (
                <label key={r.label} className="filters__pill">
                  <input
                    type="radio"
                    name="rating"
                    checked={f.rating === r.value}
                    onChange={() => update({ rating: r.value })}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="filters__group">
            <legend>Features</legend>
            {FEATURES.map((o) => (
              <label key={o.value} className="toggle toggle--switch filters__row filters__row--switch">
                <span className="toggle__text">{o.label}</span>
                <input
                  className="toggle__input"
                  type="checkbox"
                  role="switch"
                  checked={f.features.includes(o.value)}
                  onChange={() => update({ features: toggleIn(f.features, o.value) })}
                />
                <span className="toggle__ui" aria-hidden="true" />
              </label>
            ))}
          </fieldset>
        </aside>

        {/* ---------- результаты ---------- */}
        <div className="catalog__results">
          {results.length === 0 ? (
            <div className="catalog__empty">
              <p className="catalog__empty-title">Nothing glows here</p>
              <p>No games match these filters. Try fewer filters or another search.</p>
              <button type="button" className="btn btn--primary btn--md" onClick={() => setF({ ...DEFAULTS, view: f.view })}>
                <span>Reset filters</span>
              </button>
            </div>
          ) : (
            <ul ref={gridRef} className={`catalog__grid catalog__grid--${f.view}`} role="list">
              {visible.map((g) => (
                <li
                  key={g.slug}
                  ref={(el) => {
                    if (el) nodes.current.set(g.slug, el);
                    else nodes.current.delete(g.slug);
                  }}
                >
                  <GameCardView
                    game={g}
                    row={f.view === "list"}
                    wished={wish.has(g.slug)}
                    onWish={() => toggleWish(g.slug, g.name)}
                  />
                </li>
              ))}
            </ul>
          )}

          {results.length > 0 && (
            <div className="catalog__more">
              {limit < results.length && (
                <button type="button" className="btn btn--ghost btn--md" onClick={() => setLimit((l) => l + PAGE)}>
                  <span>+ Load more</span>
                </button>
              )}
              <p>
                Showing {visible.length} of {results.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
