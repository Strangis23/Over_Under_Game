import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  deckPlayMeta,
  getDeck,
  getSubcategoryById,
  resolveSubcategoryDeckKeys,
} from "../data/loadDecks";
import { defaultPairSessionKey, drawPair } from "../game/drawPair";
import type { DeckItem, DeckKey, GamePair } from "../data/types";
import { readModeScores, recordRound } from "../hooks/useHighScores";
import {
  getWikipediaImageForEntity,
  isFlagDeck,
  primaryLearnMoreWikipediaUrl,
} from "../utils/wikipediaImage";

type Phase = "playing" | "feedback" | "runComplete";

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function formatValue(n: number): string {
  if (Math.abs(n) >= 1000) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function firstWinsByGoal(
  pair: GamePair,
  goal: "higher" | "lower",
): boolean {
  if (goal === "higher") {
    return pair.first.value > pair.second.value;
  }
  return pair.first.value < pair.second.value;
}

function formatDeltaLine(
  pair: GamePair,
  unit: string | undefined,
): string {
  const hi = Math.max(pair.first.value, pair.second.value);
  const lo = Math.min(pair.first.value, pair.second.value);
  if (hi <= 0) {
    return "";
  }
  const pct = ((hi - lo) / hi) * 100;
  const gap = hi - lo;
  const gapStr = unit ? `${formatValue(gap)} ${unit}` : formatValue(gap);
  return `Difference: about ${pct.toFixed(1)}% (${gapStr.trim()}).`;
}

function EntityThumb({
  item,
  deckKey,
}: {
  item: DeckItem;
  deckKey: DeckKey;
}) {
  const useFlag = isFlagDeck(deckKey);
  const [thumbPhase, setThumbPhase] = useState<"loading" | "ready" | "failed">(
    useFlag ? "ready" : "loading",
  );
  const [src, setSrc] = useState<string | null>(useFlag ? item.image : null);

  useEffect(() => {
    if (useFlag) {
      setSrc(item.image);
      setThumbPhase("ready");
      return;
    }
    let cancelled = false;
    setThumbPhase("loading");
    getWikipediaImageForEntity(item.name, deckKey).then((url) => {
      if (cancelled) {
        return;
      }
      if (url) {
        setSrc(url);
        setThumbPhase("ready");
      } else {
        setSrc(null);
        setThumbPhase("failed");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [item.name, item.image, deckKey, useFlag]);

  if (thumbPhase === "loading") {
    return <div className="entity-thumb entity-thumb-loading" />;
  }
  if (thumbPhase === "failed" || !src) {
    return (
      <div className="entity-thumb entity-thumb-fallback" role="presentation" />
    );
  }
  return (
    <img
      className="entity-thumb"
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setThumbPhase("failed")}
    />
  );
}

function EntityBody({
  item,
  role,
  showValue,
  unit,
  deckKey,
}: {
  item: DeckItem;
  role: "first" | "second";
  showValue?: boolean;
  unit?: string;
  deckKey: DeckKey;
}) {
  return (
    <>
      <div className="entity-thumb-wrap">
        <EntityThumb item={item} deckKey={deckKey} />
      </div>
      <span className="label">{role === "first" ? "First" : "Second"}</span>
      <span className="name">{item.name}</span>
      {item.meta ? <span className="meta">{item.meta}</span> : null}
      {showValue ? (
        <span className="entity-value">
          {formatValue(item.value)}
          {unit ? ` ${unit}` : ""}
        </span>
      ) : null}
    </>
  );
}

export function GameScreen({ subcategoryId }: { subcategoryId: string }) {
  const resolved = getSubcategoryById(subcategoryId);
  const sub = resolved?.subcategory;

  const comparisonGoal = sub?.comparisonGoal ?? "higher";
  const runLength = sub?.runLength;
  const preferCloser = sub?.pairDifficulty === "hard";

  const usedPairKeysRef = useRef(new Set<string>());

  const [pair, setPair] = useState<GamePair | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreakThisRun, setBestStreakThisRun] = useState(0);
  const [correctThisRun, setCorrectThisRun] = useState(0);
  const [runRound, setRunRound] = useState(1);
  const [reshuffleNotice, setReshuffleNotice] = useState(false);
  /** `true` = tapped first as the winning side for the current goal */
  const [pickedFirst, setPickedFirst] = useState<boolean | null>(null);

  const persisted = readModeScores(subcategoryId);

  const drawOne = useCallback((): GamePair | null => {
    if (!sub) {
      return null;
    }
    const keys = resolveSubcategoryDeckKeys(sub);
    const tryOnce = (): GamePair | null => {
      const dk = keys[randomInt(keys.length)]!;
      const deck = getDeck(dk);
      if (deck.length < 2) {
        return null;
      }
      return drawPair(deck, dk, {
        usedPairKeys: usedPairKeysRef.current,
        preferCloser,
        maxAttempts: 500,
      });
    };

    let p = tryOnce();
    if (!p) {
      usedPairKeysRef.current.clear();
      setReshuffleNotice(true);
      p = tryOnce();
    }
    if (p) {
      usedPairKeysRef.current.add(
        defaultPairSessionKey(p.deckKey, p.first, p.second),
      );
    }
    return p;
  }, [sub, preferCloser]);

  const nextPair = useCallback(() => {
    const p = drawOne();
    setPair(p);
    setPhase("playing");
    setLastCorrect(null);
    setPickedFirst(null);
  }, [drawOne]);

  useEffect(() => {
    usedPairKeysRef.current = new Set();
    setStreak(0);
    setBestStreakThisRun(0);
    setCorrectThisRun(0);
    setRunRound(1);
    setReshuffleNotice(false);
    const p = drawOne();
    setPair(p);
    setPhase("playing");
    setLastCorrect(null);
    setPickedFirst(null);
  }, [subcategoryId, drawOne]);

  useEffect(() => {
    if (!reshuffleNotice) {
      return;
    }
    const t = window.setTimeout(() => setReshuffleNotice(false), 4500);
    return () => window.clearTimeout(t);
  }, [reshuffleNotice]);

  const unitForPair = (p: GamePair | null): string | undefined => {
    if (!p || !sub) {
      return undefined;
    }
    if (sub.mixedPool?.length) {
      return deckPlayMeta[p.deckKey]?.unit;
    }
    return sub.unit;
  };

  const dimensionForPair = (p: GamePair | null): string => {
    if (!p || !sub) {
      return "Value";
    }
    if (sub.mixedPool?.length) {
      return deckPlayMeta[p.deckKey]?.dimensionLabel ?? "Value";
    }
    return sub.dimensionLabel;
  };

  const goalWord = comparisonGoal === "higher" ? "Higher" : "Lower";
  const goalWordLower = comparisonGoal === "higher" ? "higher" : "lower";

  const onPick = useCallback(
    (choseFirstAsWinner: boolean) => {
      if (!pair || phase !== "playing") {
        return;
      }
      const correct = choseFirstAsWinner === firstWinsByGoal(pair, comparisonGoal);
      setPickedFirst(choseFirstAsWinner);
      setLastCorrect(correct);
      const newStreak = correct ? streak + 1 : 0;
      setStreak(newStreak);
      setBestStreakThisRun((m) => Math.max(m, newStreak));
      if (correct) {
        setCorrectThisRun((c) => c + 1);
      }
      recordRound(subcategoryId, correct, newStreak);
      setPhase("feedback");
    },
    [pair, phase, streak, subcategoryId, comparisonGoal],
  );

  const goNextOrFinishRun = useCallback(() => {
    if (!sub) {
      return;
    }
    if (runLength && runRound >= runLength) {
      setPhase("runComplete");
      return;
    }
    if (runLength) {
      setRunRound((r) => r + 1);
    }
    nextPair();
  }, [sub, runLength, runRound, nextPair]);

  const restartRun = useCallback(() => {
    usedPairKeysRef.current = new Set();
    setStreak(0);
    setBestStreakThisRun(0);
    setCorrectThisRun(0);
    setRunRound(1);
    setReshuffleNotice(false);
    nextPair();
  }, [nextPair]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
        return;
      }
      if (phase === "runComplete") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          restartRun();
        }
        return;
      }
      if (phase === "playing" && pair) {
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          onPick(true);
        } else if (e.key === "2" || e.key === "ArrowRight") {
          e.preventDefault();
          onPick(false);
        }
        return;
      }
      if (phase === "feedback") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goNextOrFinishRun();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, pair, onPick, goNextOrFinishRun, restartRun]);

  if (!resolved || !sub) {
    return (
      <div className="page">
        <p>Mode not found.</p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  if (phase === "runComplete" && runLength) {
    return (
      <div className="page game">
        <header className="page-header game-header">
          <div className="game-header-row">
            <Link className="back" to={`/category/${resolved.category.id}`}>
              ← {resolved.category.label}
            </Link>
          </div>
          <p className="mode-title">{sub.label}</p>
        </header>
        <div className="run-summary card">
          <h2 className="run-summary-title">Run complete</h2>
          <p className="muted">
            You answered {correctThisRun} of {runLength} correctly (
            {Math.round((correctThisRun / runLength) * 100)}%).
          </p>
          <p className="muted">Best streak this run: {bestStreakThisRun}</p>
          <div className="run-summary-actions">
            <button type="button" className="btn" onClick={restartRun}>
              Play again
            </button>
            <Link className="btn btn-secondary" to={`/category/${resolved.category.id}`}>
              Back to category
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="page">
        <p>Not enough items in this deck to play.</p>
        <Link to={`/category/${resolved.category.id}`}>Back</Link>
      </div>
    );
  }

  const activeDeckKey = pair.deckKey;
  const dimLabel = dimensionForPair(pair);
  const unit = unitForPair(pair);
  const winnerName = firstWinsByGoal(pair, comparisonGoal)
    ? pair.first.name
    : pair.second.name;
  const learnUrl = primaryLearnMoreWikipediaUrl(winnerName, activeDeckKey);
  const deltaLine = formatDeltaLine(pair, unit);
  const isFinalRunFeedback = Boolean(runLength && runRound >= runLength);

  return (
    <div className="page game">
      <header className="page-header game-header">
        <div className="game-header-row game-header-row-split">
          <Link className="back" to={`/category/${resolved.category.id}`}>
            ← {resolved.category.label}
          </Link>
          <div className="streak-block">
            <span className="streak-bar">Streak: {streak}</span>
            <span className="streak-bar streak-best" title="Best streak in this mode on this device">
              Best: {persisted.bestStreak}
            </span>
          </div>
        </div>
        <p className="mode-title">
          {sub.label}
          {unit ? (
            <span className="unit-badge" title="Unit">
              {" "}
              ({unit})
            </span>
          ) : null}
        </p>
        {runLength ? (
          <p className="muted run-round-label">
            Round {runRound} of {runLength}
          </p>
        ) : null}
        {reshuffleNotice ? (
          <p className="muted reshuffle-notice" role="status">
            Deck reshuffled — pairs can repeat.
          </p>
        ) : null}
      </header>

      <p className="question game-question">
        {goalWord} <strong>{dimLabel}</strong>? Tap <strong>first</strong> or{" "}
        <strong>second</strong>
        <span className="kbd-hint muted"> (1 / 2 or ← / →; Enter for next)</span>
        .
      </p>

      <div className="game-play">
        {phase === "playing" ? (
          <div className="compare">
            <button
              type="button"
              className="entity entity-pick"
              onClick={() => onPick(true)}
              aria-label={`${pair.first.name} has the ${goalWordLower} ${dimLabel}`}
            >
              <EntityBody
                item={pair.first}
                role="first"
                deckKey={activeDeckKey}
              />
            </button>
            <div className="vs">vs</div>
            <button
              type="button"
              className="entity entity-pick"
              onClick={() => onPick(false)}
              aria-label={`${pair.second.name} has the ${goalWordLower} ${dimLabel}`}
            >
              <EntityBody
                item={pair.second}
                role="second"
                deckKey={activeDeckKey}
              />
            </button>
          </div>
        ) : (
          <>
            <div className="compare compare-static compare-revealed">
              <div
                className={`entity entity-result ${
                  firstWinsByGoal(pair, comparisonGoal) ? "entity-winning" : ""
                }`}
              >
                <EntityBody
                  item={pair.first}
                  role="first"
                  showValue
                  unit={unit}
                  deckKey={activeDeckKey}
                />
              </div>
              <div className="vs">vs</div>
              <div
                className={`entity entity-result ${
                  !firstWinsByGoal(pair, comparisonGoal) ? "entity-winning" : ""
                }`}
              >
                <EntityBody
                  item={pair.second}
                  role="second"
                  showValue
                  unit={unit}
                  deckKey={activeDeckKey}
                />
              </div>
            </div>
            <div className="feedback game-feedback">
              <p
                className={
                  lastCorrect ? "result result-ok" : "result result-bad"
                }
              >
                {lastCorrect ? "Correct!" : "Not quite."}
              </p>
              <p className="answer-line">
                {goalWord} <strong>{dimLabel}</strong>:{" "}
                <strong>{winnerName}</strong>
                {pickedFirst !== null && (
                  <>
                    {" "}
                    (you tapped{" "}
                    <strong>{pickedFirst ? "first" : "second"}</strong>)
                  </>
                )}
              </p>
              {deltaLine ? <p className="muted delta-line">{deltaLine}</p> : null}
              {sub.sourceNote ? (
                <p className="muted source-note">{sub.sourceNote}</p>
              ) : null}
              <p className="learn-more-wrap">
                <a
                  href={learnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="learn-more-link"
                >
                  Learn more on Wikipedia ({winnerName})
                </a>
              </p>
              <button
                type="button"
                className="btn btn-next"
                onClick={goNextOrFinishRun}
              >
                {isFinalRunFeedback ? "See results" : "Next question"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
