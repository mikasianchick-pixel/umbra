// Тарифы Umbra Pass: переключатель месяц/год и цены, которые плавно «перетекают».
// Это React-островок — единственное место секции, где нужно состояние.
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

type Billing = "monthly" | "yearly";

interface Tier {
  id: string;
  name: string;
  price: Record<Billing, number>;
  features: string[];
  cta: string;
  popular?: boolean;
}

const tiers: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    features: ["Store & wishlist", "Cloud saves (1 GB)", "Friends & chat"],
    cta: "Start free",
  },
  {
    id: "pass",
    name: "Pass",
    price: { monthly: 9.99, yearly: 7.99 },
    features: ["200+ games included", "Cloud saves (50 GB)", "Early access drops", "Exclusive badges"],
    cta: "Get pass",
    popular: true,
  },
  {
    id: "plus",
    name: "Pass+",
    price: { monthly: 14.99, yearly: 11.99 },
    features: ["Everything in Pass", "Day-one releases", "Family sharing (5)"],
    cta: "Go plus",
  },
];

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Число плавно доезжает до нового значения (easeOutCubic, 600 мс). */
function useTweened(value: number) {
  const [shown, setShown] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    if (reduceMotion()) {
      current.current = value;
      setShown(value);
      return;
    }
    const from = current.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / 600, 1);
      const eased = 1 - (1 - t) ** 3;
      current.current = from + (value - from) * eased;
      setShown(current.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return shown;
}

function Price({ value }: { value: number }) {
  const shown = useTweened(value);
  return <>{value === 0 ? "$0" : `$${shown.toFixed(2)}`}</>;
}

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5 9-10" />
  </svg>
);

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const name = useId();

  const options: { value: Billing; label: string; note?: string }[] = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly", note: "-20%" },
  ];

  return (
    <div className="pricing">
      <fieldset className="seg pricing__toggle" style={{ "--count": 2 } as CSSProperties}>
        <legend className="visually-hidden">Billing period</legend>
        {options.map((o) => (
          <label className="seg__option" key={o.value}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={billing === o.value}
              onChange={() => setBilling(o.value)}
            />
            <span>{o.label}</span>
            {o.note && <span className="seg__note">{o.note}</span>}
          </label>
        ))}
        <span className="seg__thumb" aria-hidden="true" />
      </fieldset>

      {/* скринридер узнаёт о смене цен одной фразой, а не каждым кадром анимации */}
      <p className="visually-hidden" aria-live="polite">
        {billing === "yearly" ? "Prices shown per month, billed yearly." : "Prices shown billed monthly."}
      </p>

      <ul className="pricing__tiers" role="list">
        {tiers.map((t) => (
          <li key={t.id} className={`tier${t.popular ? " tier--popular" : ""}`}>
            <div className="tier__head">
              <h3 className="tier__name">{t.name}</h3>
              {t.popular && <span className="tier__badge">Most popular</span>}
            </div>
            <p className="tier__price">
              <Price value={t.price[billing]} />
            </p>
            <p className="tier__per">
              {t.price[billing] === 0
                ? "forever"
                : billing === "yearly"
                  ? "/ month, billed yearly"
                  : "/ month"}
            </p>
            <ul className="tier__features" role="list">
              {t.features.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <a
              className={`btn btn--md tier__cta ${t.popular ? "btn--primary" : "btn--ghost"}`}
              href="/games"
            >
              <span>{t.cta}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="pricing__hint">Swipe for Free and Pass+</p>
    </div>
  );
}
