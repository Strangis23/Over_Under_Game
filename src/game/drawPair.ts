import type { DeckItem, GamePair } from "../data/types";

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * Picks two distinct items with different values. Randomly orders first/second for fairness.
 */
export function drawPair(deck: DeckItem[], maxAttempts = 200): GamePair | null {
  if (deck.length < 2) {
    return null;
  }
  for (let i = 0; i < maxAttempts; i++) {
    const a = deck[randomInt(deck.length)];
    const b = deck[randomInt(deck.length)];
    if (a.id === b.id) {
      continue;
    }
    if (a.value === b.value) {
      continue;
    }
    const swap = Math.random() < 0.5;
    return {
      first: swap ? b : a,
      second: swap ? a : b,
    };
  }
  return null;
}

/** Over = first.value > second.value */
export function isOverCorrect(pair: GamePair): boolean {
  return pair.first.value > pair.second.value;
}
