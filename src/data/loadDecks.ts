import type { DeckItem, DeckKey, GameIndex, Subcategory } from "./types";
import gameIndex from "./index.json";
import animalsWeight from "./decks/animals-weight.json";
import animalsHeight from "./decks/animals-height.json";
import nbaPpg from "./decks/nba-ppg.json";
import nflPassYds from "./decks/nfl-pass-yds.json";
import countriesPopulation from "./decks/countries-population.json";
import countriesArea from "./decks/countries-area.json";
import planetDiameter from "./decks/planet-diameter.json";
import riverLength from "./decks/river-length.json";
import buildingHeight from "./decks/building-height.json";
import movieRuntime from "./decks/movie-runtime.json";

const rawDecks: Record<DeckKey, DeckItem[]> = {
  animalsWeight: animalsWeight as DeckItem[],
  animalsHeight: animalsHeight as DeckItem[],
  nbaPpg: nbaPpg as DeckItem[],
  nflPassYds: nflPassYds as DeckItem[],
  countriesPopulation: countriesPopulation as DeckItem[],
  countriesArea: countriesArea as DeckItem[],
  planetDiameter: planetDiameter as DeckItem[],
  riverLength: riverLength as DeckItem[],
  buildingHeight: buildingHeight as DeckItem[],
  movieRuntime: movieRuntime as DeckItem[],
};

/** Labels for mixed mode; mirrors single-deck modes in index.json. */
export const deckPlayMeta: Record<
  DeckKey,
  { dimensionLabel: string; unit?: string }
> = {
  animalsWeight: { dimensionLabel: "Weight", unit: "kg" },
  animalsHeight: { dimensionLabel: "Height / length", unit: "cm" },
  countriesPopulation: { dimensionLabel: "Population", unit: "people" },
  countriesArea: { dimensionLabel: "Land area", unit: "km²" },
  nbaPpg: { dimensionLabel: "Career points per game", unit: "PPG" },
  nflPassYds: { dimensionLabel: "Career passing yards", unit: "yds" },
  planetDiameter: { dimensionLabel: "Equatorial diameter", unit: "km" },
  riverLength: { dimensionLabel: "River length (main stem)", unit: "km" },
  buildingHeight: { dimensionLabel: "Structural height", unit: "m" },
  movieRuntime: { dimensionLabel: "Theatrical runtime", unit: "min" },
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

function validateSubcategory(sub: Subcategory): void {
  const hasDeck = Boolean(sub.deckKey);
  const hasMixed = Boolean(sub.mixedPool && sub.mixedPool.length > 0);
  if (hasDeck === hasMixed) {
    throw new Error(
      `Subcategory ${sub.id}: set exactly one of deckKey or mixedPool`,
    );
  }
  if (hasMixed) {
    for (const k of sub.mixedPool!) {
      if (!rawDecks[k]) {
        throw new Error(`Subcategory ${sub.id}: unknown deckKey in mixedPool ${k}`);
      }
    }
  }
}

for (const cat of (gameIndex as GameIndex).categories) {
  for (const sub of cat.subcategories) {
    validateSubcategory(sub);
  }
}

export const indexData: GameIndex = gameIndex as GameIndex;

export function getDeck(key: DeckKey): DeckItem[] {
  return rawDecks[key];
}

export function resolveSubcategoryDeckKeys(sub: Subcategory): DeckKey[] {
  if (sub.mixedPool && sub.mixedPool.length > 0) {
    return sub.mixedPool;
  }
  if (sub.deckKey) {
    return [sub.deckKey];
  }
  throw new Error(`Subcategory ${sub.id}: missing deck source`);
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
