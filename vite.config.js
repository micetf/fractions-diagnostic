import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
    base: "/fractions-diagnostic/",
    plugins: [react(), tailwindcss()],
    server: { open: true },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
