import type { DeckKey } from "../data/types";

const SUMMARY =
  "https://en.wikipedia.org/api/rest_v1/page/summary";

/** Avoid duplicate network work for the same page title. */
const titleAttemptCache = new Map<string, string | null>();

/** Cached final image URL per entity within a deck. */
const entityCache = new Map<string, string | null>();

function cacheKeyForEntity(deckKey: DeckKey, displayName: string): string {
  return `${deckKey}::${displayName}`;
}

export function isFlagDeck(deckKey: DeckKey): boolean {
  return (
    deckKey === "countriesPopulation" || deckKey === "countriesArea"
  );
}

/** Page titles to try, in order, for Wikipedia’s summary API. */
export function wikipediaTitlesToTry(
  displayName: string,
  deckKey: DeckKey,
): string[] {
  const name = displayName.trim();
  const titles = new Set<string>();
  titles.add(name);

  switch (deckKey) {
    case "animalsWeight":
    case "animalsHeight":
      titles.add(`${name} (animal)`);
      break;
    case "nbaPpg":
      titles.add(`${name} (basketball)`);
      break;
    case "nflPassYds":
      titles.add(`${name} (American football)`);
      break;
    case "planetDiameter":
      titles.add(`${name} (planet)`);
      titles.add(`${name} (moon)`);
      titles.add(`${name} (dwarf planet)`);
      titles.add(`${name} (asteroid)`);
      break;
    case "riverLength":
      titles.add(`${name} (river)`);
      break;
    case "buildingHeight":
      titles.add(`${name} (building)`);
      titles.add(`${name} (skyscraper)`);
      titles.add(`${name} (structure)`);
      break;
    case "movieRuntime":
      titles.add(`${name} (film)`);
      break;
    default:
      break;
  }

  return [...titles];
}

async function fetchSummaryThumbnail(pageTitle: string): Promise<string | null> {
  const key = pageTitle.trim();
  if (titleAttemptCache.has(key)) {
    return titleAttemptCache.get(key)!;
  }

  const path = encodeURIComponent(key.replace(/ /g, "_"));
  const url = `${SUMMARY}/${path}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      titleAttemptCache.set(key, null);
      return null;
    }
    const data = (await res.json()) as {
      thumbnail?: { source?: string };
    };
    const src = data.thumbnail?.source;
    if (src && typeof src === "string") {
      titleAttemptCache.set(key, src);
      return src;
    }
    titleAttemptCache.set(key, null);
    return null;
  } catch {
    titleAttemptCache.set(key, null);
    return null;
  }
}

/**
 * Returns a thumbnail image URL from English Wikipedia for this card, or null.
 * Results are cached per deck + display name.
 */
export async function getWikipediaImageForEntity(
  displayName: string,
  deckKey: DeckKey,
): Promise<string | null> {
  const ck = cacheKeyForEntity(deckKey, displayName);
  if (entityCache.has(ck)) {
    return entityCache.get(ck)!;
  }

  const titles = wikipediaTitlesToTry(displayName, deckKey);
  for (const t of titles) {
    const thumb = await fetchSummaryThumbnail(t);
    if (thumb) {
      entityCache.set(ck, thumb);
      return thumb;
    }
  }

  entityCache.set(ck, null);
  return null;
}

/** Canonical article URL for a Wikipedia page title (underscores, encoded). */
export function wikipediaArticleUrlForTitle(pageTitle: string): string {
  const t = pageTitle.trim().replace(/ /g, "_");
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(t)}`;
}

/** First title we would try for summary lookup — good default for “Learn more”. */
export function primaryLearnMoreWikipediaUrl(
  displayName: string,
  deckKey: DeckKey,
): string {
  const titles = wikipediaTitlesToTry(displayName, deckKey);
  return wikipediaArticleUrlForTitle(titles[0]!);
}
