export type HexOwner = "side1" | "side2" | "blocked" | null;

export const HEX_SIZE = 5;

export function hexNeighbors(index: number, size = HEX_SIZE) {
  const row = Math.floor(index / size);
  const col = index % size;
  const odd = row % 2 === 1;
  const offsets = odd
    ? [
        [0, -1],
        [0, 1],
        [-1, 0],
        [-1, 1],
        [1, 0],
        [1, 1],
      ]
    : [
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 0],
        [1, -1],
        [1, 0],
      ];

  return offsets
    .map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
    .map(([r, c]) => r * size + c);
}

export function hasWinningPath(
  owners: HexOwner[],
  side: "side1" | "side2",
  size = HEX_SIZE,
) {
  return pathExists(owners, side, (owner) => owner === side, size);
}

export function canStillWin(
  owners: HexOwner[],
  side: "side1" | "side2",
  size = HEX_SIZE,
) {
  return pathExists(
    owners,
    side,
    (owner) => owner === side || owner === null,
    size,
  );
}

function pathExists(
  owners: HexOwner[],
  side: "side1" | "side2",
  usable: (owner: HexOwner) => boolean,
  size: number,
) {
  const starts: number[] = [];

  for (let i = 0; i < size; i += 1) {
    const index = side === "side1" ? i * size : i;

    if (usable(owners[index])) {
      starts.push(index);
    }
  }

  const seen = new Set(starts);
  const queue = [...starts];

  while (queue.length > 0) {
    const index = queue.shift()!;
    const row = Math.floor(index / size);
    const col = index % size;

    if (side === "side1" ? col === size - 1 : row === size - 1) {
      return true;
    }

    for (const next of hexNeighbors(index, size)) {
      if (!seen.has(next) && usable(owners[next])) {
        seen.add(next);
        queue.push(next);
      }
    }
  }

  return false;
}
