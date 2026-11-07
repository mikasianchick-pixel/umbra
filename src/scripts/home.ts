// Анимации главной: загрузчик → интро hero → 3D → появление секций при прокрутке.
// При prefers-reduced-motion всё показывается сразу, без движения.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initTilt } from "./tilt";
import { initMagnetic } from "./magnetic";
import type { HeroScene } from "@/three/hero-scene";

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const lite =
  matchMedia("(max-width: 47.99rem)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;

/* ---------------- загрузчик ---------------- */

function runLoader(): Promise<void> {
  const loader = document.querySelector<HTMLElement>("[data-loader]");
  if (!root.classList.contains("is-loading") || !loader) return Promise.resolve();

  const pct = loader.querySelector<HTMLElement>("[data-loader-pct]");
  const bar = loader.querySelector<HTMLElement>("[data-loader-bar]");
  const finish = () => {
    root.classList.remove("is-loading");
    try {
      sessionStorage.setItem("umbra-loaded", "1");
    } catch {
      /* приватный режим — не страшно */
    }
  };

  if (calm) {
    finish();
    return Promise.resolve();
  }

  // настоящий прогресс: шрифты и вся страница; плюс минимальная длительность, чтобы успеть увидеть
  let target = 10;
  const minTime = new Promise((r) => setTimeout(r, 1300));
  document.fonts.ready.then(() => (target = Math.max(target, 60)));
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => addEventListener("load", () => r(), { once: true }));
  loaded.then(() => (target = Math.max(target, 85)));
  Promise.all([minTime, loaded, document.fonts.ready]).then(() => (target = 100));
  // страховка: что бы ни случилось с сетью, дольше 5 секунд не держим
  setTimeout(() => (target = 100), 5000);

  return new Promise((resolve) => {
    let shown = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // считаем по времени, а не по кадрам: на медленном устройстве скорость та же
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      shown += Math.max((target - shown) * dt * 5, 40 * dt);
      shown = Math.min(shown, target);
      if (pct) pct.textContent = String(Math.round(shown));
      if (bar) bar.style.scale = `${shown / 100} 1`;
      if (shown < 100) {
        requestAnimationFrame(tick);
        return;
      }
      // «раскрытие»: цифры гаснут, занавес уезжает вверх
      gsap
        .timeline({ onComplete: () => (finish(), resolve()) })
        .to(loader.firstElementChild, { autoAlpha: 0, y: -24, duration: 0.35, ease: "power2.in" })
        .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut" }, "-=0.05");
    };
    requestAnimationFrame(tick);
  });
}

/* ---------------- 3D ---------------- */

let scene: HeroScene | undefined;

async function initScene() {
  const host = document.querySelector<HTMLElement>("[data-hero-scene]");
  if (!host) return;
  // проверяем WebGL заранее — без него остаётся векторный кристалл
  const probe = document.createElement("canvas");
  if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

  try {
    // Three.js грузится отдельным файлом и только на главной
    const { createHeroScene } = await import("@/three/hero-scene");
    scene = createHeroScene(host, { calm, lite });
    host.classList.add("is-live");
  } catch (err) {
    console.warn("[umbra] 3D scene unavailable, showing fallback", err);
    return;
  }

  if (!calm) {
    ScrollTrigger.create({
      trigger: "[data-hero]",
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => scene?.setScroll(self.progress),
    });
  }

  addEventListener("pagehide", () => scene?.dispose(), { once: true });
}

/* ---------------- интро hero ---------------- */

function intro() {
  root.classList.remove("intro-pending");
  scene?.reveal();
  if (calm) return;

  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .from("[data-intro='line']", { yPercent: 110, duration: 1.1, stagger: 0.12 })
    .from(".hero__pill", { scale: 0, rotate: -30, duration: 0.8, ease: "back.out(2)" }, 0.35)
    .from("[data-intro='fade']", { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.08 }, 0.25)
    .from(".hero__fallback", { autoAlpha: 0, scale: 0.8, duration: 1.2 }, 0);

  countUp(document.querySelectorAll<HTMLElement>(".hero [data-count]"), 0.6);
}

/* ---------------- счётчики ---------------- */

function format(n: number, decimals: number) {
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function countUp(els: Iterable<HTMLElement>, delay = 0) {
  for (const el of els) {
    const end = Number(el.dataset.count);
    const decimals = String(el.dataset.count).includes(".") ? 1 : 0;
    const suffix = el.dataset.suffix ?? "";
    const state = { v: 0 };
    gsap.to(state, {
      v: end,
      delay,
      duration: 1.6,
      ease: "power3.out",
      onUpdate: () => (el.textContent = format(state.v, decimals) + suffix),
    });
  }
}

/* ---------------- появление при прокрутке ---------------- */

function reveals() {
  if (calm) return;

  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { autoAlpha: 0, y: 48 },
        { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.1 },
      ),
  });
  // до появления — спрятаны (только то, что ниже первого экрана)
  gsap.set(
    gsap.utils
      .toArray<HTMLElement>("[data-reveal]")
      .filter((el) => el.getBoundingClientRect().top > innerHeight),
    { autoAlpha: 0, y: 48 },
  );

  // цифры и прогресс-бар запускаются, когда видны
  document.querySelectorAll<HTMLElement>("main > :not(.hero) [data-count]").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => countUp([el]) });
  });
  document.querySelectorAll<HTMLElement>("[data-fill]").forEach((el) => {
    gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: Number(el.dataset.fill),
        duration: 1.6,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      },
    );
  });

  // карточки «Игр недели» влетают лесенкой
  gsap.from(".week__item", {
    autoAlpha: 0,
    x: 80,
    duration: 1,
    ease: "expo.out",
    stagger: 0.08,
    scrollTrigger: { trigger: ".week__track", start: "top 85%", once: true },
  });
}

/* ---------------- шаги «How it works» ---------------- */

function steps() {
  const section = document.querySelector("[data-steps]");
  if (!section) return;
  const items = [...section.querySelectorAll<HTMLElement>("[data-step]")];
  const panels = [...section.querySelectorAll<HTMLElement>("[data-panel]")];

  const activate = (i: number) => {
    items.forEach((el, j) => el.classList.toggle("is-active", i === j));
    panels.forEach((el, j) => el.classList.toggle("is-active", i === j));
  };

  items.forEach((el, i) =>
    ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "bottom 60%",
      onToggle: (self) => self.isActive && activate(i),
    }),
  );
}

/* ---------------- старт ---------------- */

const scenePromise = initScene();
initTilt();
initMagnetic();
steps();

runLoader().then(async () => {
  // интро ждёт сцену не дольше секунды, чтобы не тормозить показ текста
  await Promise.race([scenePromise, new Promise((r) => setTimeout(r, 1000))]);
  intro();
  reveals();
  ScrollTrigger.refresh();
});
