import { getProblemLabel, ProblemReference } from "./problemLink";

export function compareHandlesAz(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function sortHandlesAz(handles: string[]): string[] {
  return handles.slice().sort(compareHandlesAz);
}

// contest number first, then letter (2240A before 2240B, 100A before 200A)
export function compareProblems(
  a: { contestId: number; index: string },
  b: { contestId: number; index: string },
): number {
  if (a.contestId !== b.contestId) return a.contestId - b.contestId;
  return a.index.localeCompare(b.index, undefined, { sensitivity: "base" });
}

export function sortProblemsByNumberThenLetter<
  T extends { problem: ProblemReference }
>(columns: T[]): T[] {
  return columns.slice().sort((left: T, right: T) =>
    compareProblems(left.problem, right.problem),
  );
}

export function sortNamesAz(names: string[]): string[] {
  return names.slice().sort(compareHandlesAz);
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next: T[] = items.slice();
  const removed: T[] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed[0]);
  return next;
}

export function problemSortKey(problem: ProblemReference): string {
  return getProblemLabel(problem);
}
