// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react()],
  // плавные переходы между страницами включаются на этапе 7 (View Transitions через <ClientRouter />)
  prefetch: { prefetchAll: true },
});
