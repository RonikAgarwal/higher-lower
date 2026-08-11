import { Category, CherryDataset, Question, Entity, Metric } from './types';
import datasetJson from './cherry_dataset.json';

const dataset = datasetJson as CherryDataset;

/** The four real categories (no "random" or "mixed" — mixed is handled in the game hook) */
export const categories: Category[] = [
  { id: 'music', name: 'Music', icon: '🎵', description: 'Spotify listeners, streams & more', color: '#e63355' },
  { id: 'movies', name: 'Movies', icon: '🎬', description: 'Box office, ratings & budgets', color: '#c4a01e' },
  { id: 'internet', name: 'Internet', icon: '🌐', description: 'Followers, subscribers & reach', color: '#4682b4' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'Sales, players & downloads', color: '#228b22' },
];

/** IDs of the real dataset categories (not 'mixed') */
export const REAL_CATEGORY_IDS = categories.map(c => c.id);

export function getStartingQuestion(categoryId: string): Question | null {
  const catData = dataset.categories[categoryId];
  if (!catData || !catData.questions.length) return null;
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

/** Return de-duplicated list of metrics available in a category (keyed by name+unit) */
export function getMetricsForCategory(categoryId: string): Metric[] {
  const catData = dataset.categories[categoryId];
  if (!catData) return [];

  const seen = new Set<string>();
  const metrics: Metric[] = [];

  catData.questions.forEach(q => {
    const key = `${q.metric.name}|${q.metric.unit}`;
    if (!seen.has(key)) {
      seen.add(key);
      metrics.push(q.metric);
    }
  });

  return metrics;
}

/** Pick a random entity from a metric pool */
export function getRandomEntityFromPool(categoryId: string, metricName: string, metricUnit: string): Entity | null {
  const pool = getPoolForMetric(categoryId, metricName, metricUnit);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
