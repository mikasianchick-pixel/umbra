// «Магнитные» кнопки [data-magnetic]: тянутся к курсору, когда он рядом, и пружинят обратно.
import { gsap } from "gsap";

const STRENGTH = 0.3;

export function initMagnetic(root: ParentNode = document) {
  const canUse =
    matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canUse) return;

  root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const toX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      toX((e.clientX - (r.left + r.width / 2)) * STRENGTH);
      toY((e.clientY - (r.top + r.height / 2)) * STRENGTH);
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
    });
  });
}
