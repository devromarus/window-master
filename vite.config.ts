import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { siteConfig } from "./src/site.config.ts";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default defineConfig({
  // относительный base — сайт работает и на user.github.io/repo/, и на своём домене
  base: "./",
  plugins: [
    react(),
    {
      name: "site-meta",
      transformIndexHtml: (html) =>
        html
          .replaceAll("%SITE_TITLE%", esc(siteConfig.seo.title))
          .replaceAll("%SITE_DESCRIPTION%", esc(siteConfig.seo.description)),
    },
  ],
});
