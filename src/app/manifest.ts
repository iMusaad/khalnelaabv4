import type { MetadataRoute } from "next";
import { GAME_COUNT } from "@/data/quizCards";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "خل نلعب",
    short_name: "خل نلعب",
    description: `${GAME_COUNT} لعبة جماعية للجلسات: فريقين على جهاز واحد، وفريق واحد يفوز.`,
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar",
    background_color: "#070012",
    theme_color: "#070012",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
