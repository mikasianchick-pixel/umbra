// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react()],
  // плавные переходы между страницами включаются на этапе 7 (View Transitions через <ClientRouter />)
  prefetch: { prefetchAll: true },
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
