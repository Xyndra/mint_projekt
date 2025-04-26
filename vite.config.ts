import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [svelte(), tailwindcss()],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:49177", // The API server's address
                changeOrigin: true, // Needed for virtual hosted sites
                rewrite: (path) => path.replace(/^\/api/, ""), // Remove '/api' prefix when forwarding
            },
        },
        watch: {
            ignored: ["server/**", "cache"],
        },
    },
});
