/**
 * Builds deck JSON files under src/data/decks/.
 * Requires: scripts/_countries-raw.json (from restcountries.com)
 *
 * Run: node scripts/generate-decks.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  ANIMALS_HEIGHT,
  ANIMALS_WEIGHT,
  NBA_PPG,
} from "./seeds-data.mjs";
import { NFL_PASS } from "./seeds-nfl.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const decksDir = path.join(root, "src/data/decks");

function flagUrl(code) {
  return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
}

function picsumSeed(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/320/240`;
}

function dedupeValues(items) {
  const seen = new Set();
  return items.map((it) => {
    let v = it.value;
    while (seen.has(v)) {
      v = Math.round((v + 0.00001) * 100000) / 100000;
    }
    seen.add(v);
    return { ...it, value: v };
  });
}

function withIdsAndImages(items, prefix, imageFn) {
  return items.map((it, i) => ({
    id: `${prefix}-${i + 1}`,
    name: it.name,
    value: it.value,
    meta: it.meta,
    image: imageFn(it, i),
  }));
}

function writeJson(name, data) {
  if (data.length < 100) {
    throw new Error(`${name}: expected at least 100 items, got ${data.length}`);
  }
  const out = path.join(decksDir, name);
  fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", out, `(${data.length} items)`);
}

const countriesRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_countries-raw.json"), "utf8"),
);
const valid = countriesRaw.filter(
  (c) => c.population > 0 && c.area > 0 && c.cca2,
);
const top100 = [...valid]
  .sort((a, b) => b.population - a.population)
  .slice(0, 100);

const popItems = dedupeValues(
  top100.map((c) => ({
    name: c.name.common,
    value: c.population,
  })),
);

const popDeck = popItems.map((it, i) => ({
  id: `c-pop-${top100[i].cca2.toLowerCase()}`,
  name: it.name,
  value: it.value,
  image: flagUrl(top100[i].cca2),
}));

const areaItems = dedupeValues(
  top100.map((c) => ({
    name: c.name.common,
    value: Math.round(c.area),
  })),
);

const areaDeck = areaItems.map((it, i) => ({
  id: `c-area-${top100[i].cca2.toLowerCase()}`,
  name: it.name,
  value: it.value,
  image: flagUrl(top100[i].cca2),
}));

const animalsWeight = dedupeValues([...ANIMALS_WEIGHT]);
const animalsHeight = dedupeValues([...ANIMALS_HEIGHT]);
const nba = dedupeValues([...NBA_PPG]);
const nfl = dedupeValues([...NFL_PASS]);

writeJson("countries-population.json", popDeck);
writeJson("countries-area.json", areaDeck);

writeJson(
  "animals-weight.json",
  withIdsAndImages(animalsWeight, "aw", (_it, i) => picsumSeed(`aw-${i}`)),
);

writeJson(
  "animals-height.json",
  withIdsAndImages(animalsHeight, "ah", (_it, i) => picsumSeed(`ah-${i}`)),
);

writeJson(
  "nba-ppg.json",
  withIdsAndImages(nba, "nba", (_it, i) => picsumSeed(`nba-${i}`)),
);

writeJson(
  "nfl-pass-yds.json",
  withIdsAndImages(nfl, "nfl", (_it, i) => picsumSeed(`nfl-${i}`)),
);

console.log("Done.");
