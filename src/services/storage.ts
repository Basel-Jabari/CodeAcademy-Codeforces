import {Problem} from '../models/Problem';
import {ProblemStatistics} from '../models/ProblemStatistics';

// Bump the version whenever a saved shape changes, so an old browser cache
// can never feed outdated data into a newer screen.
const STORAGE_NAMESPACE = 'cfppu.';
const STORAGE_VERSION = 'v1';
const STORAGE_PREFIX = `${STORAGE_NAMESPACE}${STORAGE_VERSION}.`;

export function dropOutdatedState(): void {
  try {
    const stale: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key: string | null = localStorage.key(index);
      if (key === null) continue;
      if (key.indexOf(STORAGE_NAMESPACE) !== 0) continue;
      if (key.indexOf(STORAGE_PREFIX) === 0) continue;
      stale.push(key);
    }
    stale.forEach((key: string) => localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable. Nothing to clean up in that case.
  }
}

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

    const parsed: T = JSON.parse(raw) as T;
    // a stored null would slip past the callers' revivers and break rendering
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

/** Drops every persisted key that starts with the given logical prefix. */
export function clearStateByPrefix(prefix: string): void {
  try {
    const fullPrefix: string = STORAGE_PREFIX + prefix;
    const stale: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key: string | null = localStorage.key(index);
      if (key === null) continue;
      if (key.indexOf(fullPrefix) !== 0) continue;
      stale.push(key);
    }
    stale.forEach((key: string) => localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable. Nothing to clear in that case.
  }
}
