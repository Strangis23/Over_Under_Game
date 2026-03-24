export interface DeckItem {
  id: string;
  name: string;
  value: number;
  /** HTTPS URL shown as a visual cue (e.g. flag, photo). */
  image: string;
  meta?: string;
}

export interface Subcategory {
  id: string;
  label: string;
  description: string;
  dimensionLabel: string;
  unit?: string;
  deckKey: DeckKey;
}

export interface Category {
  id: string;
  label: string;
  description: string;
  subcategories: Subcategory[];
}

export interface GameIndex {
  categories: Category[];
}

export type DeckKey =
  | "animalsWeight"
  | "animalsHeight"
  | "nbaPpg"
  | "nflPassYds"
  | "countriesPopulation"
  | "countriesArea";

export interface GamePair {
  first: DeckItem;
  second: DeckItem;
}
