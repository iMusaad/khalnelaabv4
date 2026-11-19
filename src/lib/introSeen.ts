const KEY = "kn_intro_seen";

function read(): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");

    return Array.isArray(value)
      ? value.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function hasSeenIntro(game: string) {
  if (typeof window === "undefined") {
    return true;
  }

  return read().includes(game);
}

export function markIntroSeen(game: string) {
  try {
    const seen = read();

    if (!seen.includes(game)) {
      window.localStorage.setItem(KEY, JSON.stringify([...seen, game]));
    }
  } catch {}
}
