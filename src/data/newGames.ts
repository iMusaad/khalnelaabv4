export type NewCard = {
  key: string;
  until: string;
};

export const NEW_CARDS: NewCard[] = [];

export function newCardKeys(cards: NewCard[] = NEW_CARDS, now = Date.now()) {
  return new Set(
    cards
      .filter((card) => now < Date.parse(`${card.until}T00:00:00+03:00`))
      .map((card) => card.key),
  );
}
