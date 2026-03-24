import type { DeckItem, DeckKey, GameIndex } from "./types";
import gameIndex from "./index.json";
import animalsWeight from "./decks/animals-weight.json";
import animalsHeight from "./decks/animals-height.json";
import nbaPpg from "./decks/nba-ppg.json";
import nflPassYds from "./decks/nfl-pass-yds.json";
import countriesPopulation from "./decks/countries-population.json";
import countriesArea from "./decks/countries-area.json";

const rawDecks: Record<DeckKey, DeckItem[]> = {
  animalsWeight: animalsWeight as DeckItem[],
  animalsHeight: animalsHeight as DeckItem[],
  nbaPpg: nbaPpg as DeckItem[],
  nflPassYds: nflPassYds as DeckItem[],
  countriesPopulation: countriesPopulation as DeckItem[],
  countriesArea: countriesArea as DeckItem[],
};

function validateDeck(key: DeckKey, items: DeckItem[]): void {
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id || !item.name) {
      throw new Error(`Deck ${key}: item missing id or name`);
    }
    if (ids.has(item.id)) {
      throw new Error(`Deck ${key}: duplicate id ${item.id}`);
    }
    ids.add(item.id);
    if (typeof item.value !== "number" || Number.isNaN(item.value)) {
      throw new Error(`Deck ${key}: invalid value for ${item.id}`);
    }
    if (!item.image || typeof item.image !== "string") {
      throw new Error(`Deck ${key}: missing image URL for ${item.id}`);
    }
  }
}

for (const k of Object.keys(rawDecks) as DeckKey[]) {
  validateDeck(k, rawDecks[k]);
}

export const indexData: GameIndex = gameIndex as GameIndex;

export function getDeck(key: DeckKey): DeckItem[] {
  return rawDecks[key];
}

export function getSubcategoryById(subcategoryId: string) {
  for (const cat of indexData.categories) {
    const sub = cat.subcategories.find((s) => s.id === subcategoryId);
    if (sub) {
      return { category: cat, subcategory: sub };
    }
  }
  return undefined;
}
