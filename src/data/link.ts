// Сайт живёт не в корне домена (GitHub Pages: /umbra/), поэтому все внутренние ссылки
// строим через link(): link("/games") → "/umbra/games". Префикс задаётся одним местом — base в astro.config.mjs.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export const link = (path: string) => (path.startsWith("/") ? `${BASE}${path}` : path);
