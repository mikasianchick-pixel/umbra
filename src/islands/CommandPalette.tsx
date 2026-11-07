// Командная палитра: Ctrl+K или «/» — быстрый поиск игр и страниц плюс пасхалки-команды.
// Окно — нативный <dialog> (фокус внутри, Esc закрывает), список — combobox + listbox по WAI-ARIA.
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

interface GameItem {
  slug: string;
  name: string;
  genre: string;
  price: string;
}

interface PageItem {
  label: string;
  href: string;
}

interface Props {
  games: GameItem[];
  pages: PageItem[];
}

type Fx = "neon" | "retro" | "calm";

type Item =
  | { kind: "game"; id: string; title: string; meta: string; href: string }
  | { kind: "page"; id: string; title: string; meta: string; href: string }
  | { kind: "fx"; id: string; title: string; meta: string; fx: Fx };

const FX: { fx: Fx; title: string; meta: string }[] = [
  { fx: "neon", title: "/neon", meta: "Boost the glow" },
  { fx: "retro", title: "/retro", meta: "CRT scanlines filter" },
  { fx: "calm", title: "/calm", meta: "Stop looping animations" },
];

const FX_KEY = "umbra-fx";

function readFx(): Fx[] {
  try {
    return JSON.parse(localStorage.getItem(FX_KEY) ?? "[]") as Fx[];
  } catch {
    return [];
  }
}

function toggleFx(fx: Fx) {
  const on = document.documentElement.classList.toggle(`fx-${fx}`);
  const list = new Set(readFx());
  if (on) list.add(fx);
  else list.delete(fx);
  try {
    localStorage.setItem(FX_KEY, JSON.stringify([...list]));
  } catch {
    /* без сохранения — эффект проживёт до перезагрузки */
  }
  return on;
}

/** Ввод в поле, где «/» — обычный символ, не должен открывать палитру. */
const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

const Icon = ({ kind }: { kind: Item["kind"] }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "game" && (
      <>
        <rect x="2" y="7" width="20" height="11" rx="5" />
        <path d="M7 11v3M5.5 12.5h3" />
      </>
    )}
    {kind === "page" && <path d="M5 12h14M13 6l6 6-6 6" />}
    {kind === "fx" && <path d="M13 2 4 14h7l-1 8 9-12h-7z" />}
  </svg>
);

export default function CommandPalette({ games, pages }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [fxOn, setFxOn] = useState<Fx[]>([]);
  const listId = useId();

  const open = useCallback(() => {
    const d = dialog.current;
    if (!d || d.open) return;
    setQuery("");
    setActive(0);
    setFxOn(readFx());
    d.showModal();
    input.current?.focus();
  }, []);

  // горячие клавиши и кнопки [data-palette-open]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const combo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const slash = e.key === "/" && !isTyping(e.target);
      if (combo || slash) {
        e.preventDefault();
        open();
      }
    };
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as Element).closest("[data-palette-open]");
      if (!trigger) return;
      e.preventDefault();
      open();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  /* ---------- результаты ---------- */
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\//, "");
    const match = (s: string) => !q || s.toLowerCase().includes(q);

    const g: Item[] = games
      .filter((x) => match(`${x.name} ${x.genre}`))
      .slice(0, q ? 6 : 3)
      .map((x) => ({ kind: "game", id: `g-${x.slug}`, title: x.name, meta: `${x.genre} · ${x.price}`, href: `/games/${x.slug}` }));
    const p: Item[] = pages
      .filter((x) => match(x.label))
      .map((x) => ({ kind: "page", id: `p-${x.href}`, title: x.label, meta: x.href, href: x.href }));
    const c: Item[] = FX.filter((x) => match(`${x.title} ${x.meta}`)).map((x) => ({
      kind: "fx",
      id: `c-${x.fx}`,
      title: x.title,
      meta: x.meta,
      fx: x.fx,
    }));

    return [
      { name: "Games", items: g },
      { name: "Pages", items: p },
      { name: "Commands", items: c },
    ].filter((grp) => grp.items.length);
  }, [query, games, pages]);

  const flat = groups.flatMap((grp) => grp.items);
  const current = flat[Math.min(active, flat.length - 1)];

  const run = (item: Item | undefined) => {
    if (!item) return;
    if (item.kind === "fx") {
      toggleFx(item.fx);
      setFxOn(readFx());
      return;
    }
    dialog.current?.close();
    location.href = item.href;
  };

  const onInputKey = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(flat.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + flat.length) % Math.max(flat.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(current);
    }
  };

  // активный пункт всегда виден при листании стрелками
  useEffect(() => {
    if (current) document.getElementById(current.id)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  return (
    <dialog
      ref={dialog}
      className="palette"
      aria-label="Command palette"
      onClick={(e) => {
        // клик по затемнению вокруг окна — закрыть
        if (e.target === dialog.current) dialog.current.close();
      }}
    >
      <div className="palette__search">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={input}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={current?.id}
          aria-label="Search games, pages and commands"
          placeholder="Search games, pages or type /"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKey}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd>Esc</kbd>
      </div>

      <div className="palette__list" id={listId} role="listbox" aria-label="Results">
        {flat.length === 0 && <p className="palette__empty">Nothing found. Try “neon” or “/retro”.</p>}
        {groups.map((grp) => (
          <div key={grp.name} role="group" aria-label={grp.name}>
            <p className="palette__group" aria-hidden="true">
              {grp.name}
            </p>
            {grp.items.map((item) => {
              const isActive = item.id === current?.id;
              const isOn = item.kind === "fx" && fxOn.includes(item.fx);
              return (
                <div
                  key={item.id}
                  id={item.id}
                  role="option"
                  aria-selected={isActive}
                  className={`palette__item palette__item--${item.kind}${isActive ? " is-active" : ""}`}
                  onMouseMove={() => setActive(flat.indexOf(item))}
                  onClick={() => run(item)}
                >
                  {item.kind !== "fx" && <Icon kind={item.kind} />}
                  <span className="palette__title">{item.title}</span>
                  <span className="palette__meta">{item.meta}</span>
                  {item.kind === "fx" && <span className="palette__state">{isOn ? "On" : "Off"}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="palette__foot" aria-hidden="true">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> navigate
        </span>
        <span>
          <kbd>Enter</kbd> open
        </span>
      </p>
    </dialog>
  );
}
