// 3D-наклон с бликом для элементов [data-tilt]. Только мышь (не тач) и только без reduced-motion.
const MAX_DEG = 8;

export function initTilt(root: ParentNode = document) {
  const canTilt =
    matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canTilt) return;

  // :not([data-tilt-ready]) — можно вызывать повторно (React-каталог дорисовывает карточки)
  root.querySelectorAll<HTMLElement>("[data-tilt]:not([data-tilt-ready])").forEach((el) => {
    el.dataset.tiltReady = "";
    let frame = 0;

    el.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width; // 0…1
        const y = (e.clientY - r.top) / r.height;
        el.classList.add("is-tilting");
        el.style.setProperty("--ry", `${(x - 0.5) * MAX_DEG * 2}deg`);
        el.style.setProperty("--rx", `${(0.5 - y) * MAX_DEG * 2}deg`);
        el.style.setProperty("--gx", `${x * 100}%`);
        el.style.setProperty("--gy", `${y * 100}%`);
      });
    });

    el.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      el.classList.remove("is-tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}
