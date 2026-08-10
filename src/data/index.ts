import { Category, GameItem } from './types';
import { musicData } from './music';
import { moviesData } from './movies';
import { internetData } from './internet';
import { gamingData } from './gaming';
import { randomData } from './random';

export const categories: Category[] = [
  { id: 'music', name: 'Music', icon: '🎵', description: 'Spotify listeners, streams & more', color: '#e63355' },
  { id: 'movies', name: 'Movies', icon: '🎬', description: 'Box office, ratings & budgets', color: '#c4a01e' },
  { id: 'internet', name: 'Internet', icon: '🌐', description: 'Followers, subscribers & reach', color: '#4682b4' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'Sales, players & downloads', color: '#228b22' },
  { id: 'random', name: 'Random', icon: '🎲', description: 'Expect the unexpected', color: '#9b59b6' },
];

export const categoryDataMap: Record<string, GameItem[]> = {
  music: musicData,
  movies: moviesData,
  internet: internetData,
  gaming: gamingData,
  random: randomData,
};

export function getDataForCategory(categoryId: string): GameItem[] {
  return categoryDataMap[categoryId] ?? [];
}

export function getAllData(): GameItem[] {
  return Object.values(categoryDataMap).flat();
}
