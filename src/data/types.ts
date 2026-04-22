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
  /** Shown when not using per-deck labels (single-deck modes). */
  dimensionLabel: string;
  unit?: string;
  /** Set when this mode uses one deck (omit if mixedPool is set). */
  deckKey?: DeckKey;
  /** Random deck each round; mutually exclusive with deckKey. */
  mixedPool?: DeckKey[];
  /** Default higher = larger value wins. */
  comparisonGoal?: "higher" | "lower";
  pairDifficulty?: "normal" | "hard";
  /** Fixed-length run; omit = endless. */
  runLength?: number;
  sourceNote?: string;
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
  | "countriesArea"
  | "planetDiameter"
  | "riverLength"
  | "buildingHeight"
  | "movieRuntime";

export interface GamePair {
  first: DeckItem;
  second: DeckItem;
  /** Deck this pair was drawn from (Wikipedia / flags). */
  deckKey: DeckKey;
}
