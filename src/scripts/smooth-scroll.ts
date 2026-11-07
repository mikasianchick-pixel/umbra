// Плавная прокрутка Lenis, синхронизированная с GSAP ScrollTrigger:
// оба работают от одного тикера, поэтому анимации при прокрутке не дёргаются.
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!calm) {
  const root = document.documentElement;
  // отступ под шапку берём из CSS (scroll-padding-top), а не из головы
  const headerOffset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;

  const lenis = new Lenis({
    autoRaf: false,
    anchors: { offset: -headerOffset },
    // внутри модалок и горизонтальных каруселей прокрутка остаётся родной
    prevent: (node) => node.closest("dialog, [data-lenis-prevent]") !== null,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // пока открыто мобильное меню или идёт загрузчик — страница стоит
  const sync = () => {
    const locked = root.classList.contains("menu-open") || root.classList.contains("is-loading");
    if (locked) lenis.stop();
    else lenis.start();
  };
  new MutationObserver(sync).observe(root, { attributeFilter: ["class"] });
  sync();
}
