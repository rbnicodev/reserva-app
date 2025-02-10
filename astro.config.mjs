// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react"; // 👈 Importamos React


// https://astro.build/config
export default defineConfig({
    integrations: [react()]
});
