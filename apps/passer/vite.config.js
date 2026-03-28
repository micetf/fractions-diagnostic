import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration Vite — Interface passation.
 *
 * URL de production : https://micetf.fr/fractions-diagnostic/passer/
 * URL de développement : http://localhost:5174/fractions-diagnostic/passer/
 *
 * Port 5174 pour coexister avec l'app admin (5173) en développement.
 */
export default defineConfig({
    base: "/fractions-diagnostic/passer/",
    plugins: [react(), tailwindcss()],
    server: {
        open: true,
        port: 5174,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
});
