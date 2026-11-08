export type Season = "default" | "national" | "ramadan" | "founding";

export const ACTIVE_SEASON: Season = "default";

export const SEASONS: Season[] = ["default", "national", "ramadan", "founding"];

export function isSeason(value: string | null): value is Season {
  return value !== null && SEASONS.includes(value as Season);
}

export type SeasonTheme = {
  heroBg: string;
  heroText: string;
  heroSubText: string;
  headline: string;
  subline?: string;
  badge?: string;
  badgeBg: string;
  badgeText: string;
  buttonBg: string;
  buttonText: string;
  buttonEdge: string;
};

export const SEASON_THEMES: Record<Season, SeasonTheme> = {
  default: {
    heroBg: "#ffb21e",
    heroText: "#241339",
    heroSubText: "rgba(36,19,57,0.75)",
    headline: "جمعتكم ناقصها تحدي",
    badgeBg: "#241339",
    badgeText: "#ffffff",
    buttonBg: "#ffc23d",
    buttonText: "#241339",
    buttonEdge: "#c27700",
  },
  national: {
    heroBg: "#0b7a3e",
    heroText: "#ffffff",
    heroSubText: "rgba(255,255,255,0.8)",
    headline: "يومنا الوطني، وجمعتكم ناقصها تحدي",
    subline: "اجمعوا العيال والأهل، وخلوا السعودية تحضر في أسئلتكم",
    badge: "نسخة اليوم الوطني",
    badgeBg: "#ffffff",
    badgeText: "#0b7a3e",
    buttonBg: "#ffffff",
    buttonText: "#0b5a2e",
    buttonEdge: "#a8c9b4",
  },
  ramadan: {
    heroBg: "#1b1450",
    heroText: "#ffd36b",
    heroSubText: "rgba(255,255,255,0.75)",
    headline: "سهراتكم في رمضان ناقصها تحدي",
    subline: "بعد الفطور أو قبل السحور، فريقين وتحدي يطوّل السهرة",
    badge: "نسخة رمضان",
    badgeBg: "#ffd36b",
    badgeText: "#1b1450",
    buttonBg: "#ffd36b",
    buttonText: "#1b1450",
    buttonEdge: "#b8892a",
  },
  founding: {
    heroBg: "#7a4a2a",
    heroText: "#f6e7c8",
    heroSubText: "rgba(246,231,200,0.8)",
    headline: "يوم التأسيس، وجمعتكم ناقصها تحدي",
    subline: "من ١٧٢٧ والجمعة تجمعنا، فريقين وتحدي على السوالف",
    badge: "نسخة يوم التأسيس",
    badgeBg: "#f6e7c8",
    badgeText: "#7a4a2a",
    buttonBg: "#f6e7c8",
    buttonText: "#5a3018",
    buttonEdge: "#b8956a",
  },
};
