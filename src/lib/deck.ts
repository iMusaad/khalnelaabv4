export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export type Deck<T> = {
  draw: (count: number) => T[];
};

export type SeenStorage = {
  read: (key: string) => string | null;
  write: (key: string, value: string) => void;
};

const STORAGE_PREFIX = "kn_seen:";

const browserStorage: SeenStorage = {
  read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
};

export function itemKey(item: unknown) {
  const text = typeof item === "string" ? item : JSON.stringify(item);
  let hash = 2166136261;

  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

export function createDeck<T>(
  items: readonly T[],
  name?: string,
  storage: SeenStorage | null = typeof window === "undefined"
    ? null
    : browserStorage,
): Deck<T> {
  const keys = items.map(itemKey);
  const valid = new Set(keys);
  const storageKey = name ? `${STORAGE_PREFIX}${name}` : null;
  let seen: Set<string> | null = null;

  function load() {
    if (seen) {
      return seen;
    }

    seen = new Set();

    if (storageKey && storage) {
      try {
        const saved = JSON.parse(storage.read(storageKey) ?? "[]");

        if (Array.isArray(saved)) {
          saved.forEach((key) => {
            if (typeof key === "string" && valid.has(key)) {
              seen?.add(key);
            }
          });
        }
      } catch {}
    }

    return seen;
  }

  function save(current: Set<string>) {
    if (storageKey && storage) {
      storage.write(storageKey, JSON.stringify([...current]));
    }
  }

  return {
    draw(count) {
      const target = Math.max(
        0,
        Math.min(Math.floor(count) || 0, items.length),
      );

      if (target === 0) {
        return [];
      }

      const current = load();
      const picked: number[] = [];

      const take = (pool: number[]) => {
        for (const index of shuffle(pool)) {
          if (picked.length >= target) {
            break;
          }

          picked.push(index);
        }
      };

      take(keys.flatMap((key, index) => (current.has(key) ? [] : [index])));

      if (picked.length < target) {
        current.clear();
        take(
          keys.flatMap((_, index) => (picked.includes(index) ? [] : [index])),
        );
      }

      picked.forEach((index) => current.add(keys[index]));
      save(current);

      return picked.map((index) => items[index]);
    },
  };
}
