import { describe, expect, it } from "vitest";
import type { DeckItem, DeckKey } from "../data/types";
import { defaultPairSessionKey, drawPair } from "./drawPair";

const sample: DeckItem[] = [
  { id: "a", name: "A", value: 1, image: "https://example.com/a.png" },
  { id: "b", name: "B", value: 2, image: "https://example.com/b.png" },
  { id: "c", name: "C", value: 3, image: "https://example.com/c.png" },
];

const dk: DeckKey = "nbaPpg";

describe("drawPair", () => {
  it("returns a pair with distinct ids and attaches deckKey", () => {
    const p = drawPair(sample, dk);
    expect(p).not.toBeNull();
    expect(p!.first.id).not.toBe(p!.second.id);
    expect(p!.first.value).not.toBe(p!.second.value);
    expect(p!.deckKey).toBe(dk);
  });

  it("excludes pairs listed in usedPairKeys until none remain", () => {
    const used = new Set<string>();
    for (let i = 0; i < 80; i++) {
      const p = drawPair(sample, dk, { usedPairKeys: used, maxAttempts: 600 });
      if (!p) {
        break;
      }
      used.add(defaultPairSessionKey(dk, p.first, p.second));
    }
    expect(used.size).toBe(3);
    expect(drawPair(sample, dk, { usedPairKeys: used, maxAttempts: 300 })).toBeNull();
  });

  it("preferCloser still returns valid pairs", () => {
    const p = drawPair(sample, dk, { preferCloser: true, maxAttempts: 400 });
    expect(p).not.toBeNull();
  });
});
