import { useCallback, useMemo, useSyncExternalStore } from "react";
import { indexData } from "../data/loadDecks";

const STORAGE_VERSION = 2;
const PREFIX = `ou-game:v${STORAGE_VERSION}`;
const LEGACY_PREFIX = `ou-game:v1`;

export interface ModeScores {
  bestStreak: number;
  totalCorrect: number;
  /** Total answered rounds (correct + wrong). */
  totalRounds: number;
  lastPlayed?: number;
}

const listeners = new Set<() => void>();

function notifyScoresChanged(): void {
  for (const l of listeners) {
    l();
  }
}

function storageKey(modeId: string): string {
  return `${PREFIX}:scores:${modeId}`;
}

function legacyStorageKey(modeId: string): string {
  return `${LEGACY_PREFIX}:scores:${modeId}`;
}

function normalizeScores(parsed: Partial<ModeScores>): ModeScores {
  return {
    bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
    totalCorrect:
      typeof parsed.totalCorrect === "number" ? parsed.totalCorrect : 0,
    totalRounds: typeof parsed.totalRounds === "number" ? parsed.totalRounds : 0,
    lastPlayed: parsed.lastPlayed,
  };
}

/** Read persisted scores for a mode (subcategory id or `"global"`). */
export function readModeScores(modeId: string): ModeScores {
  if (typeof localStorage === "undefined") {
    return { bestStreak: 0, totalCorrect: 0, totalRounds: 0 };
  }
  try {
    let raw = localStorage.getItem(storageKey(modeId));
    if (!raw) {
      raw = localStorage.getItem(legacyStorageKey(modeId));
      if (raw) {
        const migrated = normalizeScores(JSON.parse(raw) as Partial<ModeScores>);
        writeScores(modeId, migrated);
        localStorage.removeItem(legacyStorageKey(modeId));
      }
    }
    if (!raw) {
      return { bestStreak: 0, totalCorrect: 0, totalRounds: 0 };
    }
    return normalizeScores(JSON.parse(raw) as Partial<ModeScores>);
  } catch {
    return { bestStreak: 0, totalCorrect: 0, totalRounds: 0 };
  }
}

function writeScores(modeId: string, scores: ModeScores): void {
  localStorage.setItem(storageKey(modeId), JSON.stringify(scores));
}

/** Call after each answered round. `streakAfter` is the new streak (0 if wrong). */
export function recordRound(
  subcategoryId: string,
  correct: boolean,
  streakAfter: number,
): void {
  const bump = (modeId: string) => {
    const prev = readModeScores(modeId);
    const bestStreak = Math.max(prev.bestStreak, streakAfter);
    const totalCorrect = prev.totalCorrect + (correct ? 1 : 0);
    const totalRounds = prev.totalRounds + 1;
    writeScores(modeId, {
      bestStreak,
      totalCorrect,
      totalRounds,
      lastPlayed: Date.now(),
    });
  };
  bump(subcategoryId);
  bump("global");
  notifyScoresChanged();
}

export function resetScores(modeId: string): void {
  localStorage.removeItem(storageKey(modeId));
  localStorage.removeItem(legacyStorageKey(modeId));
  notifyScoresChanged();
}

function subscribe(callback: () => void): () => void {
  const wrapped = () => callback();
  listeners.add(wrapped);
  window.addEventListener("storage", wrapped);
  return () => {
    listeners.delete(wrapped);
    window.removeEventListener("storage", wrapped);
  };
}

function getSnapshot(): number {
  const g = readModeScores("global");
  return g.totalCorrect + g.bestStreak + g.totalRounds;
}

export function useAllSubcategoryScores(): {
  subcategoryId: string;
  label: string;
  categoryLabel: string;
  scores: ModeScores;
}[] {
  const version = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(() => {
    void version;
    const rows: {
      subcategoryId: string;
      label: string;
      categoryLabel: string;
      scores: ModeScores;
    }[] = [];
    for (const cat of indexData.categories) {
      for (const sub of cat.subcategories) {
        rows.push({
          subcategoryId: sub.id,
          label: sub.label,
          categoryLabel: cat.label,
          scores: readModeScores(sub.id),
        });
      }
    }
    return rows;
  }, [version]);
}

export function readGlobalScores(): ModeScores {
  return readModeScores("global");
}

export function useGlobalScores(): ModeScores {
  const version = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(() => {
    void version;
    return readGlobalScores();
  }, [version]);
}

export function useResetAllScores(): () => void {
  return useCallback(() => {
    for (const cat of indexData.categories) {
      for (const sub of cat.subcategories) {
        localStorage.removeItem(storageKey(sub.id));
        localStorage.removeItem(legacyStorageKey(sub.id));
      }
    }
    localStorage.removeItem(storageKey("global"));
    localStorage.removeItem(legacyStorageKey("global"));
    notifyScoresChanged();
  }, []);
}
