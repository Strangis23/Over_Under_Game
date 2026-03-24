import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDeck, getSubcategoryById } from "../data/loadDecks";
import { drawPair } from "../game/drawPair";
import type { DeckItem, DeckKey, GamePair } from "../data/types";
import { recordRound } from "../hooks/useHighScores";
import {
  getWikipediaImageForEntity,
  isFlagDeck,
} from "../utils/wikipediaImage";

const EMPTY_DECK: DeckItem[] = [];

type Phase = "playing" | "feedback";

function formatValue(n: number): string {
  if (Math.abs(n) >= 1000) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function EntityThumb({
  item,
  deckKey,
}: {
  item: DeckItem;
  deckKey: DeckKey;
}) {
  const useFlag = isFlagDeck(deckKey);
  const [phase, setPhase] = useState<"loading" | "ready" | "failed">(
    useFlag ? "ready" : "loading",
  );
  const [src, setSrc] = useState<string | null>(useFlag ? item.image : null);

  useEffect(() => {
    if (useFlag) {
      setSrc(item.image);
      setPhase("ready");
      return;
    }
    let cancelled = false;
    setPhase("loading");
    getWikipediaImageForEntity(item.name, deckKey).then((url) => {
      if (cancelled) {
        return;
      }
      if (url) {
        setSrc(url);
        setPhase("ready");
      } else {
        setSrc(null);
        setPhase("failed");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [item.name, item.image, deckKey, useFlag]);

  if (phase === "loading") {
    return <div className="entity-thumb entity-thumb-loading" />;
  }
  if (phase === "failed" || !src) {
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
      onError={() => setPhase("failed")}
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
  const deck = useMemo(() => {
    if (!resolved) {
      return EMPTY_DECK;
    }
    return getDeck(resolved.subcategory.deckKey);
  }, [resolved]);

  const [pair, setPair] = useState<GamePair | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  /** `true` = tapped first (higher first), `false` = tapped second */
  const [pickedFirst, setPickedFirst] = useState<boolean | null>(null);

  const nextPair = useCallback(() => {
    const p = drawPair(deck);
    setPair(p);
    setPhase("playing");
    setLastCorrect(null);
    setPickedFirst(null);
  }, [deck]);

  useEffect(() => {
    setStreak(0);
    nextPair();
  }, [subcategoryId, nextPair]);

  const sub = resolved?.subcategory;
  const dimension = sub?.dimensionLabel ?? "Value";
  const unit = sub?.unit;

  const onPick = useCallback(
    (choseFirstAsHigher: boolean) => {
      if (!pair || phase !== "playing") {
        return;
      }
      const correct =
        choseFirstAsHigher === (pair.first.value > pair.second.value);
      setPickedFirst(choseFirstAsHigher);
      setLastCorrect(correct);
      const newStreak = correct ? streak + 1 : 0;
      setStreak(newStreak);
      recordRound(subcategoryId, correct, newStreak);
      setPhase("feedback");
    },
    [pair, phase, streak, subcategoryId],
  );

  if (!resolved || !sub) {
    return (
      <div className="page">
        <p>Mode not found.</p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  const deckKey = sub.deckKey;

  if (!pair) {
    return (
      <div className="page">
        <p>Not enough items in this deck to play.</p>
        <Link to={`/category/${resolved.category.id}`}>Back</Link>
      </div>
    );
  }

  return (
    <div className="page game">
      <header className="page-header game-header">
        <div className="game-header-row">
          <Link className="back" to={`/category/${resolved.category.id}`}>
            ← {resolved.category.label}
          </Link>
          <span className="streak-bar">Streak: {streak}</span>
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
      </header>

      <p className="question game-question">
        Higher <strong>{dimension}</strong>? Tap{" "}
        <strong>first</strong> or <strong>second</strong>.
      </p>

      <div className="game-play">
        {phase === "playing" ? (
          <div className="compare">
            <button
              type="button"
              className="entity entity-pick"
              onClick={() => onPick(true)}
              aria-label={`${pair.first.name} has the higher ${dimension}`}
            >
              <EntityBody
                item={pair.first}
                role="first"
                deckKey={deckKey}
              />
            </button>
            <div className="vs">vs</div>
            <button
              type="button"
              className="entity entity-pick"
              onClick={() => onPick(false)}
              aria-label={`${pair.second.name} has the higher ${dimension}`}
            >
              <EntityBody
                item={pair.second}
                role="second"
                deckKey={deckKey}
              />
            </button>
          </div>
        ) : (
          <>
            <div className="compare compare-static compare-revealed">
              <div
                className={`entity entity-result ${
                  pair.first.value > pair.second.value ? "entity-higher" : ""
                }`}
              >
                <EntityBody
                  item={pair.first}
                  role="first"
                  showValue
                  unit={unit}
                  deckKey={deckKey}
                />
              </div>
              <div className="vs">vs</div>
              <div
                className={`entity entity-result ${
                  pair.second.value > pair.first.value ? "entity-higher" : ""
                }`}
              >
                <EntityBody
                  item={pair.second}
                  role="second"
                  showValue
                  unit={unit}
                  deckKey={deckKey}
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
                Higher <strong>{dimension}</strong>:{" "}
                <strong>
                  {pair.first.value > pair.second.value
                    ? pair.first.name
                    : pair.second.name}
                </strong>
                {pickedFirst !== null && (
                  <>
                    {" "}
                    (you tapped{" "}
                    <strong>{pickedFirst ? "first" : "second"}</strong>)
                  </>
                )}
              </p>
              <button type="button" className="btn btn-next" onClick={nextPair}>
                Next question
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
