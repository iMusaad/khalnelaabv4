export const SOURCE_COOKIE = "kn_src";

export const SOURCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type TrafficSource = {
  source: string;
  campaign: string;
};

export const SOURCE_LABELS: Record<string, string> = {
  tiktok: "تيك توك",
  instagram: "إنستقرام",
  snapchat: "سناب",
  x: "إكس",
  google: "قوقل",
  whatsapp: "واتساب",
  facebook: "فيسبوك",
  youtube: "يوتيوب",
  ref: "مسوّقين",
  direct: "مباشر",
};

const REFERRER_SOURCES: [RegExp, string][] = [
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)snapchat\.com$/, "snapchat"],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "x"],
  [/(^|\.)google\.[a-z.]+$/, "google"],
  [/(^|\.)whatsapp\.(com|net)$/, "whatsapp"],
  [/(^|\.)(facebook\.com|fb\.com)$/, "facebook"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
];

function clean(value: string | null | undefined, max: number) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
}

function normalizeSource(value: string) {
  const source = clean(value, 24);

  if (source === "ig") {
    return "instagram";
  }

  if (source === "twitter") {
    return "x";
  }

  if (source === "snap") {
    return "snapchat";
  }

  return source;
}

export function detectSource(
  search: string,
  referrer: string,
  ownHost: string,
): TrafficSource | null {
  const params = new URLSearchParams(search);
  const campaign = clean(params.get("utm_campaign"), 40);
  const ref = params.get("ref")?.toUpperCase().replace(/[\s-]/g, "");

  if (ref && /^[A-Z0-9]{3,16}$/.test(ref)) {
    return { source: "ref", campaign: ref.toLowerCase() };
  }

  const utm = normalizeSource(params.get("utm_source") ?? "");

  if (utm) {
    return { source: utm, campaign };
  }

  if (params.has("ttclid")) {
    return { source: "tiktok", campaign };
  }

  if (params.has("ScCid") || params.has("sccid")) {
    return { source: "snapchat", campaign };
  }

  if (params.has("fbclid")) {
    return { source: "facebook", campaign };
  }

  if (params.has("gclid")) {
    return { source: "google", campaign };
  }

  let host = "";

  try {
    host = referrer ? new URL(referrer).hostname.toLowerCase() : "";
  } catch {}

  if (!host || host === ownHost || host.endsWith(`.${ownHost}`)) {
    return null;
  }

  for (const [pattern, source] of REFERRER_SOURCES) {
    if (pattern.test(host)) {
      return { source, campaign };
    }
  }

  return { source: clean(host.replace(/^www\./, ""), 24), campaign };
}

export function encodeSource(value: TrafficSource) {
  return `${value.source}.${value.campaign}`;
}

export function parseSource(value: string | null | undefined): TrafficSource {
  const [source, campaign] = (value ?? "").split(".");
  const cleanSource = clean(source, 24);

  return {
    source: cleanSource || "direct",
    campaign: cleanSource ? clean(campaign, 40) : "",
  };
}

export function sourceLabel(source: string) {
  return SOURCE_LABELS[source] ?? source;
}
