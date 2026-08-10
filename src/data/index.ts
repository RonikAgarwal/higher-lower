import { Category, GameItem, CherryDataset, Question, Entity } from './types';
import datasetJson from './cherry_dataset.json';

const dataset = datasetJson as CherryDataset;

export const categories: Category[] = [
  { id: 'music', name: 'Music', icon: '🎵', description: 'Spotify listeners, streams & more', color: '#e63355' },
  { id: 'movies', name: 'Movies', icon: '🎬', description: 'Box office, ratings & budgets', color: '#c4a01e' },
  { id: 'internet', name: 'Internet', icon: '🌐', description: 'Followers, subscribers & reach', color: '#4682b4' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'Sales, players & downloads', color: '#228b22' },
  { id: 'random', name: 'Random', icon: '🎲', description: 'Expect the unexpected', color: '#9b59b6' },
];

export function getStartingQuestion(categoryId: string): Question | null {
  const catData = dataset.categories[categoryId];
  if (!catData || !catData.questions.length) return null;
  // Pick random question
  const randomIndex = Math.floor(Math.random() * catData.questions.length);
  return catData.questions[randomIndex];
}

export function getPoolForMetric(categoryId: string, metricName: string, metricUnit: string): Entity[] {
  const catData = dataset.categories[categoryId];
  if (!catData) return [];
  
  const entityMap = new Map<string, Entity>();
  
  catData.questions.forEach(q => {
    if (q.metric.name === metricName && q.metric.unit === metricUnit) {
      if (!entityMap.has(q.reference.id)) entityMap.set(q.reference.id, q.reference);
      if (!entityMap.has(q.challenger.id)) entityMap.set(q.challenger.id, q.challenger);
    }
  });
  
  return Array.from(entityMap.values());
}

// Deprecated: For compatibility if still used
export function getDataForCategory(categoryId: string): GameItem[] {
  const catData = dataset.categories[categoryId];
  if (!catData) return [];
  const entityMap = new Map<string, Entity>();
  catData.questions.forEach(q => {
    if (!entityMap.has(q.reference.id)) entityMap.set(q.reference.id, q.reference);
    if (!entityMap.has(q.challenger.id)) entityMap.set(q.challenger.id, q.challenger);
  });
  return Array.from(entityMap.values());
}
