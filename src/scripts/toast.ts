// Тосты: короткие сообщения внизу экрана. Регион с aria-live (Toaster.astro)
// зачитывает их скринридером, не отбирая фокус.

export interface ToastOptions {
  /** текст кнопки действия, например «Undo» */
  action?: string | undefined;
  onAction?: (() => void) | undefined;
  /** сколько миллисекунд показывать */
  duration?: number | undefined;
}

const CHECK_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
const X_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

export function toast(message: string, { action, onAction, duration = 4000 }: ToastOptions = {}) {
  const region = document.getElementById("toasts");
  if (!region) return;

  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span class="toast__icon">${CHECK_ICON}</span><p class="toast__text"></p>`;
  el.querySelector(".toast__text")!.textContent = message;

  if (action) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "toast__action";
    btn.textContent = action;
    btn.addEventListener("click", () => {
      onAction?.();
      remove();
    });
    el.append(btn);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast__close";
  close.setAttribute("aria-label", "Dismiss");
  close.innerHTML = X_ICON;
  close.addEventListener("click", () => remove());
  el.append(close);

  // пока курсор или фокус на тосте — таймер стоит, чтобы успеть нажать «Undo»
  let timer = 0;
  const start = () => (timer = window.setTimeout(remove, duration));
  const stop = () => clearTimeout(timer);
  el.addEventListener("pointerenter", stop);
  el.addEventListener("pointerleave", start);
  el.addEventListener("focusin", stop);
  el.addEventListener("focusout", start);

  function remove() {
    stop();
    el.classList.add("is-leaving");
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) el.remove();
    else el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  region.append(el);
  start();
}
