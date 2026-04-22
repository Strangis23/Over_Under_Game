import type { DeckItem, DeckKey, GamePair } from "../data/types";

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function defaultPairSessionKey(
  deckKey: DeckKey,
  a: DeckItem,
  b: DeckItem,
): string {
  return `${deckKey}:${[a.id, b.id].sort().join("|")}`;
}

function valueGap(a: number, b: number): number {
  const x = Math.abs(a);
  const y = Math.abs(b);
  if (x > 0 && y > 0) {
    return Math.abs(Math.log(x) - Math.log(y));
  }
  return Math.abs(a - b);
}

export interface DrawPairOptions {
  usedPairKeys?: Set<string>;
  buildPairKey?: (deckKey: DeckKey, a: DeckItem, b: DeckItem) => string;
  preferCloser?: boolean;
  maxAttempts?: number;
}

/**
 * Picks two distinct items with different values. Randomly orders first/second for fairness.
 * Optionally skips pairs in `usedPairKeys`, prefers closer values when `preferCloser`, and
 * returns null if no unused pair exists (caller may clear used keys and retry).
 */
export function drawPair(
  deck: DeckItem[],
  deckKey: DeckKey,
  options?: DrawPairOptions,
): GamePair | null {
  const maxAttempts = options?.maxAttempts ?? 400;
  const used = options?.usedPairKeys;
  const buildKey =
    options?.buildPairKey ??
    ((dk: DeckKey, a: DeckItem, b: DeckItem) => defaultPairSessionKey(dk, a, b));
  const preferCloser = options?.preferCloser ?? false;

  if (deck.length < 2) {
    return null;
  }

  const tryPick = (): GamePair | null => {
    const a = deck[randomInt(deck.length)];
    const b = deck[randomInt(deck.length)];
    if (a.id === b.id || a.value === b.value) {
      return null;
    }
    if (used?.has(buildKey(deckKey, a, b))) {
      return null;
    }
    const swap = Math.random() < 0.5;
    return {
      first: swap ? b : a,
      second: swap ? a : b,
      deckKey,
    };
  };

  if (!preferCloser) {
    for (let i = 0; i < maxAttempts; i++) {
      const p = tryPick();
      if (p) {
        return p;
      }
    }
    return null;
  }

  type Cand = { pair: GamePair; gap: number };
  const cands: Cand[] = [];
  for (let i = 0; i < maxAttempts; i++) {
    const a = deck[randomInt(deck.length)];
    const b = deck[randomInt(deck.length)];
    if (a.id === b.id || a.value === b.value) {
      continue;
    }
    if (used?.has(buildKey(deckKey, a, b))) {
      continue;
    }
    const gap = valueGap(a.value, b.value);
    const swap = Math.random() < 0.5;
    const pair: GamePair = {
      first: swap ? b : a,
      second: swap ? a : b,
      deckKey,
    };
    cands.push({ pair, gap });
    if (cands.length >= 48) {
      break;
    }
  }
  if (cands.length === 0) {
    return null;
  }
  let best = cands[0]!;
  for (const c of cands) {
    if (c.gap < best.gap) {
      best = c;
    }
  }
  const tied = cands.filter((c) => c.gap === best.gap);
  return tied[randomInt(tied.length)]!.pair;
}

/** True if "first" has the strictly higher raw value. */
export function isOverCorrect(pair: GamePair): boolean {
  return pair.first.value > pair.second.value;
}
