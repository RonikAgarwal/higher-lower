import type { GameItem } from '../data/types';

/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Format a raw number into a human-readable display value.
 */
export function formatValue(value: number): string {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return value.toLocaleString();
  return value.toString();
}

/**
 * Compare challenger value against current value.
 * Returns true if the player's choice was correct.
 */
export function isAnswerCorrect(
  currentValue: number,
  challengerValue: number,
  choice: 'higher' | 'lower'
): boolean {
  if (challengerValue === currentValue) return true; // tie = correct either way
  if (choice === 'higher') return challengerValue > currentValue;
  return challengerValue < currentValue;
}

/**
 * Calculate score for a correct answer based on streak.
 */
export function calculatePoints(streak: number): { points: number; multiplier: number } {
  let multiplier = 1;
  if (streak >= 10) multiplier = 3;
  else if (streak >= 6) multiplier = 2;
  else if (streak >= 3) multiplier = 1.5;

  return {
    points: Math.floor(100 * multiplier),
    multiplier,
  };
}

/**
 * Check if a streak value is a milestone.
 */
export function isStreakMilestone(streak: number): boolean {
  return [3, 5, 10, 15, 20, 25, 30, 50].includes(streak);
}

/**
 * Get a unique queue of items for the game, ensuring no immediate repeats.
 */
export function buildGameQueue(items: GameItem[]): GameItem[] {
  if (items.length < 2) return items;
  const shuffled = shuffle(items);
  // Ensure no adjacent items share the same id
  for (let i = 1; i < shuffled.length; i++) {
    if (shuffled[i].id === shuffled[i - 1].id) {
      // Find next non-duplicate and swap
      for (let j = i + 1; j < shuffled.length; j++) {
        if (shuffled[j].id !== shuffled[i - 1].id) {
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          break;
        }
      }
    }
  }
  return shuffled;
}

/**
 * Get streak milestone message.
 */
export function getStreakMessage(streak: number): string {
  if (streak >= 50) return 'LEGENDARY.';
  if (streak >= 30) return 'UNSTOPPABLE.';
  if (streak >= 20) return 'GODLIKE.';
  if (streak >= 15) return 'INSANE.';
  if (streak >= 10) return "YOU'RE ON FIRE.";
  if (streak >= 5) return 'KILLER STREAK.';
  if (streak >= 3) return 'NICE STREAK!';
  return '';
}
