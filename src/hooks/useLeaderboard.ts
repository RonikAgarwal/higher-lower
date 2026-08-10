import { useState, useCallback, useEffect } from 'react';
import { LeaderboardEntry } from '../data/types';

const STORAGE_KEY = 'cherry-hl-leaderboard-v2';
const MAX_ENTRIES = 10;

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [];

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as LeaderboardEntry[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LEADERBOARD;
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(loadLeaderboard);

  useEffect(() => {
    saveLeaderboard(entries);
  }, [entries]);

  const addEntry = useCallback((entry: Omit<LeaderboardEntry, 'timestamp'>) => {
    setEntries(prev => {
      const newEntry: LeaderboardEntry = { ...entry, timestamp: Date.now() };
      const updated = [...prev, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);
      return updated;
    });
  }, []);

  const isHighScore = useCallback((score: number): boolean => {
    if (entries.length < MAX_ENTRIES) return true;
    return score > entries[entries.length - 1].score;
  }, [entries]);

  return { entries, addEntry, isHighScore };
}
