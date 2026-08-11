import { useState, useCallback, useRef } from 'react';
import { GameItem, GamePhase, Metric } from '../data/types';
import {
  getPoolForMetric,
  getMetricsForCategory,
  REAL_CATEGORY_IDS,
} from '../data';
import { isAnswerCorrect, calculatePoints, isStreakMilestone, calculateDifficulty } from '../utils/helpers';

// ---------------------------------------------------------------------------
// Rotation block helpers
// ---------------------------------------------------------------------------

/** Random int in [lo, hi] inclusive */
function randInt(lo: number, hi: number) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/** Pick a random element from arr, optionally excluding one value */
function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude !== undefined ? arr.filter(x => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/** Build a seenPairs key that is order-independent */
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/** Build a per-category+metric key for scoping seenPairs */
function seenPairsScope(catId: string, metricName: string, metricUnit: string): string {
  return `${catId}|${metricName}|${metricUnit}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RotationBlock {
  id: string;           // category id or metric key
  remaining: number;    // questions left in this block
}

interface GameState {
  phase: GamePhase | 'nameEntry';
  /** 'mixed' or a real category id like 'music' */
  selectedMode: string;
  /** The real category currently active (always a dataset key) */
  activeCategory: string;
  playerName: string;
  metric: Metric | null;
  currentItem: GameItem | null;
  challengerItem: GameItem | null;
  currentDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD' | null;
  score: number;
  streak: number;
  multiplier: number;
  highScore: number;
  lastPoints: number;
  isMilestone: boolean;
  isNewHighScore: boolean;
  bestStreak: number;
}

const INITIAL_STATE: GameState = {
  phase: 'landing',
  selectedMode: '',
  activeCategory: '',
  playerName: '',
  metric: null,
  currentItem: null,
  challengerItem: null,
  currentDifficulty: null,
  score: 0,
  streak: 0,
  multiplier: 1,
  highScore: 0,
  lastPoints: 0,
  isMilestone: false,
  isNewHighScore: false,
  bestStreak: 0,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('cherry-hl-highscore');
    return {
      ...INITIAL_STATE,
      highScore: saved ? parseInt(saved, 10) : 0,
    };
  });

  // ----- rotation refs (mutable, not in React state to avoid re-render churn) -----
  const categoryBlockRef = useRef<RotationBlock | null>(null);
  const metricBlockRef = useRef<RotationBlock | null>(null);

  // ----- dedup: Map<scope, Set<pairKey>> -----
  const seenPairsRef = useRef<Map<string, Set<string>>>(new Map());

  // -----------------------------------------------------------------------
  // Dedup helpers
  // -----------------------------------------------------------------------

  const getSeen = useCallback((scope: string): Set<string> => {
    if (!seenPairsRef.current.has(scope)) {
      seenPairsRef.current.set(scope, new Set());
    }
    return seenPairsRef.current.get(scope)!;
  }, []);

  const markPairSeen = useCallback((scope: string, idA: string, idB: string) => {
    getSeen(scope).add(pairKey(idA, idB));
  }, [getSeen]);

  const isPairSeen = useCallback((scope: string, idA: string, idB: string) => {
    return getSeen(scope).has(pairKey(idA, idB));
  }, [getSeen]);

  // -----------------------------------------------------------------------
  // Get next challenger within a known category+metric, respecting seenPairs
  // -----------------------------------------------------------------------

  const getNextChallenger = useCallback((
    catId: string,
    metricName: string,
    metricUnit: string,
    refId: string,
    previousRefId?: string,
  ): GameItem | null => {
    const pool = getPoolForMetric(catId, metricName, metricUnit);
    if (!pool.length) return null;

    const scope = seenPairsScope(catId, metricName, metricUnit);
    const seen = getSeen(scope);

    let available = pool.filter(e => e.id !== refId && !seen.has(pairKey(refId, e.id)));

    // Pool exhausted → reset, but re-add the last-shown pair to prevent immediate repeat
    if (available.length === 0) {
      seen.clear();
      if (previousRefId) {
        seen.add(pairKey(refId, previousRefId));
      }
      available = pool.filter(e => e.id !== refId && !seen.has(pairKey(refId, e.id)));
    }

    if (available.length === 0) return null;

    const chosen = available[Math.floor(Math.random() * available.length)];
    seen.add(pairKey(refId, chosen.id));
    return chosen;
  }, [getSeen]);

  // -----------------------------------------------------------------------
  // Rotation: pick the next category (Mixed mode only)
  // -----------------------------------------------------------------------

  const nextCategoryBlock = useCallback((lastCatId?: string): string => {
    const catId = pickRandom(REAL_CATEGORY_IDS, lastCatId);
    categoryBlockRef.current = { id: catId, remaining: randInt(2, 3) };
    return catId;
  }, []);

  // -----------------------------------------------------------------------
  // Rotation: pick the next metric within a category
  // -----------------------------------------------------------------------

  const nextMetricBlock = useCallback((catId: string, lastMetricKey?: string): Metric => {
    const metrics = getMetricsForCategory(catId);
    if (metrics.length <= 1) {
      // Single-metric category (e.g. Music) — no rotation needed
      metricBlockRef.current = { id: `${metrics[0].name}|${metrics[0].unit}`, remaining: 999 };
      return metrics[0];
    }
    const metricKeys = metrics.map(m => `${m.name}|${m.unit}`);
    const chosenKey = pickRandom(metricKeys, lastMetricKey);
    const chosen = metrics.find(m => `${m.name}|${m.unit}` === chosenKey)!;
    metricBlockRef.current = { id: chosenKey, remaining: randInt(2, 3) };
    return chosen;
  }, []);

  // -----------------------------------------------------------------------
  // Build the first question for a fresh category+metric (used on switches)
  // -----------------------------------------------------------------------

  const buildFirstPair = useCallback((catId: string, metric: Metric): {
    ref: GameItem;
    challenger: GameItem;
  } | null => {
    const pool = getPoolForMetric(catId, metric.name, metric.unit);
    if (pool.length < 2) return null;

    const ref = pool[Math.floor(Math.random() * pool.length)];
    const scope = seenPairsScope(catId, metric.name, metric.unit);

    let candidates = pool.filter(e => e.id !== ref.id && !isPairSeen(scope, ref.id, e.id));
    if (candidates.length === 0) {
      // Exhaust reset
      getSeen(scope).clear();
      candidates = pool.filter(e => e.id !== ref.id);
    }
    if (candidates.length === 0) return null;

    const challenger = candidates[Math.floor(Math.random() * candidates.length)];
    markPairSeen(scope, ref.id, challenger.id);
    return { ref, challenger };
  }, [getSeen, isPairSeen, markPairSeen]);

  // -----------------------------------------------------------------------
  // Public actions
  // -----------------------------------------------------------------------

  const goToCategory = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'category' }));
  }, []);

  const selectCategory = useCallback((modeId: string) => {
    // modeId is either 'mixed' or a real category id
    const isMixed = modeId === 'mixed';

    // Pick starting category
    const startingCatId = isMixed
      ? nextCategoryBlock()
      : modeId;

    if (!isMixed) {
      categoryBlockRef.current = null; // single-category, no outer rotation
    }

    // Pick starting metric within that category
    const startingMetric = nextMetricBlock(startingCatId);

    // Build first pair
    const pair = buildFirstPair(startingCatId, startingMetric);
    if (!pair) return;

    setState(prev => ({
      ...prev,
      phase: 'nameEntry',
      selectedMode: modeId,
      activeCategory: startingCatId,
      metric: startingMetric,
      currentItem: pair.ref,
      challengerItem: pair.challenger,
      currentDifficulty: calculateDifficulty(pair.ref.value, pair.challenger.value),
      score: 0,
      streak: 0,
      multiplier: 1,
      lastPoints: 0,
      isMilestone: false,
      isNewHighScore: false,
      bestStreak: 0,
    }));
  }, [nextCategoryBlock, nextMetricBlock, buildFirstPair]);

  const setNameAndStart = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      playerName: name,
      phase: 'countdown',
    }));
  }, []);

  const startPlaying = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'playing' }));
  }, []);

  const makeChoice = useCallback((choice: 'higher' | 'lower') => {
    setState(prev => {
      if (!prev.currentItem || !prev.challengerItem) return prev;
      const correct = isAnswerCorrect(
        prev.currentItem.value,
        prev.challengerItem.value,
        choice
      );
      return { ...prev, phase: 'revealing', _pendingChoice: correct };
    });
  }, []);

  const resolveReveal = useCallback((wasCorrect: boolean) => {
    setState(prev => {
      if (wasCorrect) {
        const newStreak = prev.streak + 1;
        const { points, multiplier } = calculatePoints(newStreak);
        const newScore = prev.score + points;
        const newHighScore = Math.max(newScore, prev.highScore);
        const milestone = isStreakMilestone(newStreak);

        if (newHighScore > prev.highScore) {
          localStorage.setItem('cherry-hl-highscore', newHighScore.toString());
        }

        return {
          ...prev,
          phase: 'correct' as GamePhase,
          score: newScore,
          streak: newStreak,
          multiplier,
          lastPoints: points,
          highScore: newHighScore,
          isMilestone: milestone,
          bestStreak: Math.max(newStreak, prev.bestStreak),
        };
      } else {
        const isNew = prev.score > prev.highScore;
        const finalHighScore = Math.max(prev.score, prev.highScore);
        if (isNew) {
          localStorage.setItem('cherry-hl-highscore', finalHighScore.toString());
        }
        return {
          ...prev,
          phase: 'wrong' as GamePhase,
          highScore: finalHighScore,
          isNewHighScore: isNew,
          bestStreak: Math.max(prev.streak, prev.bestStreak),
        };
      }
    });
  }, []);

  // -----------------------------------------------------------------------
  // advanceToNext — the core rotation engine
  // -----------------------------------------------------------------------

  const advanceToNext = useCallback(() => {
    setState(prev => {
      if (!prev.metric || !prev.challengerItem || !prev.currentItem) return prev;

      const isMixed = prev.selectedMode === 'mixed';
      let catId = prev.activeCategory;
      let metric = prev.metric;
      let needsSwitch = false;

      // ---- 1. Decrement metric block ----
      if (metricBlockRef.current) {
        metricBlockRef.current.remaining -= 1;
        if (metricBlockRef.current.remaining <= 0) {
          needsSwitch = true;
        }
      }

      // ---- 2. If in mixed mode, also check the category block ----
      let catSwitched = false;
      if (isMixed && categoryBlockRef.current) {
        categoryBlockRef.current.remaining -= 1;
        if (categoryBlockRef.current.remaining <= 0) {
          // Switch category
          catId = nextCategoryBlock(catId);
          catSwitched = true;
          needsSwitch = true; // force metric switch too since category changed
        }
      }

      // ---- 3. Switch metric if needed ----
      if (needsSwitch) {
        const lastMetricKey = catSwitched ? undefined : `${metric.name}|${metric.unit}`;
        metric = nextMetricBlock(catId, lastMetricKey);
      }

      // ---- 4. Build the next pair ----
      const metricKey = `${metric.name}|${metric.unit}`;
      const currentMetricKey = `${prev.metric.name}|${prev.metric.unit}`;
      const metricChanged = metricKey !== currentMetricKey || catId !== prev.activeCategory;

      let nextRef: GameItem;
      let nextChallenger: GameItem | null;

      if (metricChanged) {
        // Metric or category switched → fresh pair from new pool
        const pair = buildFirstPair(catId, metric);
        if (!pair) return prev;
        nextRef = pair.ref;
        nextChallenger = pair.challenger;
      } else {
        // Same metric — old challenger becomes reference, pick new challenger
        nextRef = prev.challengerItem;
        nextChallenger = getNextChallenger(
          catId,
          metric.name,
          metric.unit,
          prev.challengerItem.id,
          prev.currentItem.id,
        );
      }

      return {
        ...prev,
        phase: 'playing' as GamePhase,
        activeCategory: catId,
        metric,
        currentItem: nextRef,
        challengerItem: nextChallenger,
        currentDifficulty: nextChallenger
          ? calculateDifficulty(nextRef.value, nextChallenger.value)
          : null,
        isMilestone: false,
      };
    });
  }, [getNextChallenger, nextCategoryBlock, nextMetricBlock, buildFirstPair]);

  const goToGameOver = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'gameOver' }));
  }, []);

  const restart = useCallback(() => {
    seenPairsRef.current.clear();
    categoryBlockRef.current = null;
    metricBlockRef.current = null;
    setState(prev => ({
      ...INITIAL_STATE,
      phase: 'landing' as GamePhase,
      highScore: prev.highScore,
    }));
  }, []);

  const playAgain = useCallback(() => {
    if (state.selectedMode) {
      seenPairsRef.current.clear();
      categoryBlockRef.current = null;
      metricBlockRef.current = null;
      selectCategory(state.selectedMode);
    }
  }, [state.selectedMode, selectCategory]);

  return {
    ...state,
    // Expose `category` as `activeCategory` for backwards compat in App.tsx
    category: state.activeCategory,
    goToCategory,
    selectCategory,
    setNameAndStart,
    startPlaying,
    makeChoice,
    resolveReveal,
    advanceToNext,
    goToGameOver,
    restart,
    playAgain,
  };
}
