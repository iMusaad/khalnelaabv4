import { describe, expect, it } from "vitest";
import {
  canStillWin,
  hasWinningPath,
  hexNeighbors,
  type HexOwner,
} from "@/lib/hexBoard";

function board(cells: [number, HexOwner][]) {
  const owners: HexOwner[] = Array(25).fill(null);

  for (const [index, owner] of cells) {
    owners[index] = owner;
  }

  return owners;
}

describe("hex board", () => {
  it("finds neighbours on even and odd rows", () => {
    expect(hexNeighbors(0).sort((a, b) => a - b)).toEqual([1, 5]);
    expect(hexNeighbors(6).sort((a, b) => a - b)).toEqual([1, 2, 5, 7, 11, 12]);
    expect(hexNeighbors(12).sort((a, b) => a - b)).toEqual([
      6, 7, 11, 13, 16, 17,
    ]);
  });

  it("detects a left to right path for side1", () => {
    const owners = board([10, 11, 12, 13, 14].map((i) => [i, "side1"]));

    expect(hasWinningPath(owners, "side1")).toBe(true);
    expect(hasWinningPath(owners, "side2")).toBe(false);
  });

  it("detects a zigzag top to bottom path for side2", () => {
    const owners = board([2, 7, 12, 17, 22].map((i) => [i, "side2"]));

    expect(hasWinningPath(owners, "side2")).toBe(true);
  });

  it("does not count a broken path", () => {
    const owners = board([10, 11, 13, 14].map((i) => [i, "side1"]));

    expect(hasWinningPath(owners, "side1")).toBe(false);
  });
});

describe("blocked cells", () => {
  it("knows when a side can no longer connect", () => {
    const owners: HexOwner[] = Array(25).fill(null);

    for (const index of [2, 7, 12, 17, 22]) {
      owners[index] = "blocked";
    }

    expect(canStillWin(owners, "side1")).toBe(false);
    expect(canStillWin(owners, "side2")).toBe(true);
  });
});
