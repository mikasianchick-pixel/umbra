// Избранное: список slug'ов в localStorage. Один источник для Astro-карточек и React-каталога.
// Изменения рассылаются событием, поэтому сердечки на странице всегда синхронны.
import { toast } from "./toast";

const KEY = "umbra-wishlist";
const EVENT = "umbra:wishlist";

export function getWishlist(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function save(list: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...list]));
  } catch {
    /* хранилище недоступно (приватный режим) — избранное живёт до перезагрузки */
  }
  document.dispatchEvent(new CustomEvent(EVENT));
}

export function isWished(slug: string) {
  return getWishlist().has(slug);
}

/** Переключить игру в избранном и показать тост с «Undo». */
export function toggleWish(slug: string, name: string) {
  const list = getWishlist();
  const added = !list.has(slug);
  if (added) list.add(slug);
  else list.delete(slug);
  save(list);

  toast(added ? `${name} added to wishlist` : `${name} removed from wishlist`, {
    action: "Undo",
    onAction: () => {
      const again = getWishlist();
      if (added) again.delete(slug);
      else again.add(slug);
      save(again);
    },
  });
}

export function onWishlistChange(cb: () => void) {
  document.addEventListener(EVENT, cb);
  // изменения из другой вкладки
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  addEventListener("storage", onStorage);
  return () => {
    document.removeEventListener(EVENT, cb);
    removeEventListener("storage", onStorage);
  };
}

/** Кнопки [data-wish="slug"] в Astro-разметке: состояние из хранилища + клики. */
export function initWishlistButtons() {
  const sync = () => {
    const list = getWishlist();
    document.querySelectorAll<HTMLElement>("[data-wish]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(list.has(btn.dataset.wish ?? "")));
    });
  };

  document.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLElement>("[data-wish]");
    // кнопки внутри React-островка обрабатывает сам островок
    if (!btn || btn.closest("[data-react-wish]")) return;
    toggleWish(btn.dataset.wish ?? "", btn.dataset.wishName ?? "Game");
  });

  onWishlistChange(sync);
  sync();
}
