import { useState, useCallback, useRef } from 'react';
import { GameItem, GamePhase } from '../data/types';
import { getDataForCategory } from '../data';
import { buildGameQueue, isAnswerCorrect, calculatePoints, isStreakMilestone } from '../utils/helpers';

interface GameState {
  phase: GamePhase;
  category: string;
  currentItem: GameItem | null;
  challengerItem: GameItem | null;
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
  category: '',
  currentItem: null,
  challengerItem: null,
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

  const queueRef = useRef<GameItem[]>([]);
  const queueIndexRef = useRef(0);
  const usedPairsRef = useRef<Set<string>>(new Set());

  const getNextChallenger = useCallback((): GameItem | null => {
    const queue = queueRef.current;
    if (queueIndexRef.current >= queue.length) {
      // Reshuffle when exhausted
      queueRef.current = buildGameQueue(queue);
      queueIndexRef.current = 0;
    }
    const item = queueRef.current[queueIndexRef.current];
    queueIndexRef.current++;
    return item || null;
  }, []);

  const goToCategory = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'category' }));
  }, []);

  const selectCategory = useCallback((categoryId: string) => {
    const data = getDataForCategory(categoryId);
    const queue = buildGameQueue(data);
    queueRef.current = queue;
    queueIndexRef.current = 0;
    usedPairsRef.current = new Set();

    const first = queue[0];
    let second = queue[1];
    // Ensure different items
    if (second && second.id === first.id && queue.length > 2) {
      second = queue[2];
      queueIndexRef.current = 3;
    } else {
      queueIndexRef.current = 2;
    }

    setState(prev => ({
      ...prev,
      phase: 'countdown',
      category: categoryId,
      currentItem: first,
      challengerItem: second,
      score: 0,
      streak: 0,
      multiplier: 1,
      lastPoints: 0,
      isMilestone: false,
      isNewHighScore: false,
      bestStreak: 0,
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

      return { ...prev, phase: 'revealing', _pendingChoice: correct } as any;
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
      const nextChallenger = getNextChallenger();
      // Ensure we don't compare item against itself
      let challenger = nextChallenger;
      if (challenger && prev.challengerItem && challenger.id === prev.challengerItem.id) {
        challenger = getNextChallenger();
      }

      return {
        ...prev,
        phase: 'playing',
        currentItem: prev.challengerItem,
        challengerItem: challenger,
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
    startPlaying,
    makeChoice,
    resolveReveal,
    advanceToNext,
    goToGameOver,
    restart,
    playAgain,
  };
}
