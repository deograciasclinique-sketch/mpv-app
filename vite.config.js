import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // La Bible complète (Louis Segond 1910, un fichier par livre) est gardée sur le téléphone
      // dès l'installation : tous les livres s'ouvrent avec ou sans connexion.
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,json,webmanifest}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "Life Word Mission",
        short_name: "LWM",
        description: "Application de Life Word Mission — assemblées, séminaires, rapports et finances de chaque pays d'Afrique et de la diaspora",
        theme_color: "#1E2A4A",
        background_color: "#EDEEE6",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});
