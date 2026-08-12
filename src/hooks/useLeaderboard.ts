import { useState, useCallback, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { LeaderboardEntry } from '../data/types';

const MAX_ENTRIES = 10;

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'leaderboards'),
      orderBy('score', 'desc'),
      limit(MAX_ENTRIES)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newEntries.push({
          name: data.name,
          score: data.score,
          streak: data.streak,
          category: data.category,
          timestamp: data.timestamp?.toMillis() || Date.now(),
        });
      });
      setEntries(newEntries);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
    });

    return () => unsubscribe();
  }, []);

  const addEntry = useCallback(async (entry: Omit<LeaderboardEntry, 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'leaderboards'), {
        ...entry,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding leaderboard entry:", error);
    }
  }, []);

  const isHighScore = useCallback((score: number): boolean => {
    if (entries.length < MAX_ENTRIES) return true;
    return score > entries[entries.length - 1].score;
  }, [entries]);

  return { entries, addEntry, isHighScore };
}
