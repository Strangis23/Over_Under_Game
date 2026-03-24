import { useCallback, useMemo, useSyncExternalStore } from "react";
import { indexData } from "../data/loadDecks";

const STORAGE_VERSION = 1;
const PREFIX = `ou-game:v${STORAGE_VERSION}`;

export interface ModeScores {
  bestStreak: number;
  totalCorrect: number;
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

function readScores(modeId: string): ModeScores {
  if (typeof localStorage === "undefined") {
    return { bestStreak: 0, totalCorrect: 0 };
  }
  try {
    const raw = localStorage.getItem(storageKey(modeId));
    if (!raw) {
      return { bestStreak: 0, totalCorrect: 0 };
    }
    const parsed = JSON.parse(raw) as ModeScores;
    return {
      bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
      totalCorrect: typeof parsed.totalCorrect === "number" ? parsed.totalCorrect : 0,
      lastPlayed: parsed.lastPlayed,
    };
  } catch {
    return { bestStreak: 0, totalCorrect: 0 };
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
    const prev = readScores(modeId);
    const bestStreak = Math.max(prev.bestStreak, streakAfter);
    const totalCorrect = prev.totalCorrect + (correct ? 1 : 0);
    writeScores(modeId, {
      bestStreak,
      totalCorrect,
      lastPlayed: Date.now(),
    });
  };
  bump(subcategoryId);
  bump("global");
  notifyScoresChanged();
}

export function resetScores(modeId: string): void {
  localStorage.removeItem(storageKey(modeId));
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
  return readScores("global").totalCorrect + readScores("global").bestStreak;
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
          scores: readScores(sub.id),
        });
      }
    }
    return rows;
  }, [version]);
}

export function readGlobalScores(): ModeScores {
  return readScores("global");
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
      }
    }
    localStorage.removeItem(storageKey("global"));
    notifyScoresChanged();
  }, []);
}
