// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react()],
  // переходы между страницами — родные View Transitions браузера (@view-transition в base.css), без JS-роутера;
  // предзагрузка делает их мгновенными
  prefetch: { prefetchAll: true },
  // Three.js (~700 КБ) грузится отдельным файлом и только на главной — предупреждение о размере тут лишнее
  vite: { build: { chunkSizeWarningLimit: 800 } },
  // шрифты скачиваются при сборке и раздаются с нашего сайта — без запросов к Google у посетителя
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Orbitron",
      cssVariable: "--font-orbitron",
      weights: ["600 900"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400 700"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains",
      weights: ["400 700"],
      subsets: ["latin"],
      fallbacks: ["monospace"],
    },
  ],
});
