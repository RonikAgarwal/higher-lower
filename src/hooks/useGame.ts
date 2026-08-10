import { useState, useCallback, useRef } from 'react';
import { GameItem, GamePhase, Metric } from '../data/types';
import { getStartingQuestion, getPoolForMetric } from '../data';
import { isAnswerCorrect, calculatePoints, isStreakMilestone, calculateDifficulty } from '../utils/helpers';

interface GameState {
  phase: GamePhase | 'nameEntry';
  category: string;
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
  _pendingChoice?: boolean;
}

const INITIAL_STATE: GameState = {
  phase: 'landing',
  category: '',
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

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('cherry-hl-highscore');
    return {
      ...INITIAL_STATE,
      highScore: saved ? parseInt(saved, 10) : 0,
    };
  });

  const usedEntitiesRef = useRef<Set<string>>(new Set());

  const getNextChallenger = useCallback((
    categoryId: string, 
    metricName: string, 
    metricUnit: string,
    currentRefId: string
  ): GameItem | null => {
    const pool = getPoolForMetric(categoryId, metricName, metricUnit);
    if (!pool.length) return null;

    let available = pool.filter(e => !usedEntitiesRef.current.has(e.id) && e.id !== currentRefId);

    // If pool exhausted, reset but still exclude the current reference
    if (available.length === 0) {
      usedEntitiesRef.current.clear();
      available = pool.filter(e => e.id !== currentRefId);
    }

    if (available.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];
    usedEntitiesRef.current.add(chosen.id);
    return chosen;
  }, []);

  const goToCategory = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'category' }));
  }, []);

  const selectCategory = useCallback((categoryId: string) => {
    const q = getStartingQuestion(categoryId);
    if (!q) return;

    usedEntitiesRef.current = new Set([q.reference.id, q.challenger.id]);

    setState(prev => ({
      ...prev,
      phase: 'nameEntry',
      category: categoryId,
      metric: q.metric,
      currentItem: q.reference,
      challengerItem: q.challenger,
      currentDifficulty: q.difficulty,
      score: 0,
      streak: 0,
      multiplier: 1,
      lastPoints: 0,
      isMilestone: false,
      isNewHighScore: false,
      bestStreak: 0,
    }));
  }, []);

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
          phase: 'correct',
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
          phase: 'wrong',
          highScore: finalHighScore,
          isNewHighScore: isNew,
          bestStreak: Math.max(prev.streak, prev.bestStreak),
        };
      }
    });
  }, []);

  const advanceToNext = useCallback(() => {
    setState(prev => {
      if (!prev.metric || !prev.challengerItem) return prev;

      const nextChallenger = getNextChallenger(
        prev.category, 
        prev.metric.name, 
        prev.metric.unit, 
        prev.challengerItem.id
      );

      return {
        ...prev,
        phase: 'playing',
        currentItem: prev.challengerItem, // Old challenger is now the reference
        challengerItem: nextChallenger,
        currentDifficulty: nextChallenger 
          ? calculateDifficulty(prev.challengerItem.value, nextChallenger.value) 
          : null,
        isMilestone: false,
      };
    });
  }, [getNextChallenger]);

  const goToGameOver = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'gameOver' }));
  }, []);

  const restart = useCallback(() => {
    setState(prev => ({
      ...INITIAL_STATE,
      phase: 'landing',
      highScore: prev.highScore,
    }));
  }, []);

  const playAgain = useCallback(() => {
    if (state.category) {
      selectCategory(state.category);
    }
  }, [state.category, selectCategory]);

  return {
    ...state,
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
