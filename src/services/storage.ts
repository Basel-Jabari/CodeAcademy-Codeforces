import {Problem} from '../models/Problem';
import {ProblemStatistics} from '../models/ProblemStatistics';

const STORAGE_PREFIX = 'cfppu.';

export function getPromblemsListFromStorage(): Array<{
  problem: Problem;
  problemStatistics: ProblemStatistics;
}> {
  const result: string | null = localStorage.getItem('problemsList');
  if (!result) return [];

  const problemsList: Array<{
    problem: Problem;
    problemStatistics: ProblemStatistics;
  }> = JSON.parse(result).problemsList;
  return problemsList;
}

export function setProblemsListToStorage(
  list: Array<{problem: Problem; problemStatistics: ProblemStatistics}>
) {
  const storageObject = {
    problemsList: list,
  };

  localStorage.setItem('problemsList', JSON.stringify(storageObject));
}

export function clearProblemsList(): void {
  localStorage.setItem('problemsList', JSON.stringify({problemsList: []}));
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full. The in-memory state still works.
  }
}

export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw: string | null = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
