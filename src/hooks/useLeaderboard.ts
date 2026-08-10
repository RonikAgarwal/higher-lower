import { useState, useCallback, useEffect } from 'react';
import { LeaderboardEntry } from '../data/types';

const STORAGE_KEY = 'cherry-hl-leaderboard';
const MAX_ENTRIES = 10;

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'AARAV', score: 5420, streak: 14, category: 'music', timestamp: Date.now() - 86400000 },
  { name: 'ANANYA', score: 4870, streak: 12, category: 'movies', timestamp: Date.now() - 172800000 },
  { name: 'RONIK', score: 4310, streak: 11, category: 'internet', timestamp: Date.now() - 259200000 },
  { name: 'KUNAL', score: 3920, streak: 10, category: 'gaming', timestamp: Date.now() - 345600000 },
  { name: 'RIYA', score: 3640, streak: 9, category: 'random', timestamp: Date.now() - 432000000 },
  { name: 'ARJUN', score: 3100, streak: 8, category: 'music', timestamp: Date.now() - 518400000 },
  { name: 'PRIYA', score: 2840, streak: 7, category: 'movies', timestamp: Date.now() - 604800000 },
  { name: 'VIKRAM', score: 2560, streak: 7, category: 'internet', timestamp: Date.now() - 691200000 },
];

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as LeaderboardEntry[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
