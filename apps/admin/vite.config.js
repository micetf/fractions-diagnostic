import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration Vite — Interface admin.
 *
 * URL de production : https://micetf.fr/fractions-diagnostic/
 * URL de développement : http://localhost:5173/fractions-diagnostic/
 */
export default defineConfig({
    base: "/fractions-diagnostic/",
    plugins: [react(), tailwindcss()],
    server: {
        open: true,
        port: 5173,
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
