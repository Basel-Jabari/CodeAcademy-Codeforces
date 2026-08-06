import axios from "axios";
import { Problem } from "../../models/Problem";
import { ProblemStatistics } from "../../models/ProblemStatistics";
import { TagNode } from "../../models/TagExpression";
import { getTags } from "./data";
import {
  countTags,
  createRootNode,
  createTagNode,
  evaluateExpression,
  findContradiction,
} from "../../expression/domain/tagExpression";
import {
  getAcceptedProblemKeys,
  getProblemKey,
  waitForCodeforcesApiSlot,
} from "../../codeforces/domain/submissions";

const baseUrl: string = "https://codeforces.com/api/problemset.problems";

interface Problemset {
  problems: Problem[];
  statistics: ProblemStatistics[];
}

export interface PickedProblem {
  problem: Problem;
  problemStatistics: ProblemStatistics;
}

// the tag tree can ask anything, so the API tag query cannot help;
// the whole problemset is fetched once and reused for the rest of the session
let problemsetCache: Problemset | null = null;

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

export async function getProblemset(): Promise<Problemset> {
  if (problemsetCache !== null) return problemsetCache;

  await waitForCodeforcesApiSlot();
  const response = await axios.get(baseUrl);

  if (response.data.status !== "OK")
    throw new Error("Could not load the Codeforces problemset. Try again.");

  const problemset: Problemset = {
    problems: response.data.result.problems as Problem[],
    statistics: response.data.result.problemStatistics as ProblemStatistics[],
  };

  problemsetCache = problemset;
  return problemset;
}

function buildFilter(expression: TagNode): TagNode {
  const tags: string[] = getTags();
  if (countTags(expression) === 0) {
    return createRootNode("LOOSE", [
      createTagNode(tags[getRandomInt(tags.length)]),
    ]);
  }
  return expression;
}

function collectCandidateIndices(
  problemset: Problemset,
  filter: TagNode,
  ratings: { min: number; max: number },
  acceptedProblemKeys: Set<string>,
  excludeProblemKeys: Set<string>,
): { candidates: number[]; matchedTags: number; excludedAsSolved: number } {
  const candidates: number[] = [];
  let matchedTags: number = 0;
  let excludedAsSolved: number = 0;

  problemset.problems.forEach((problem: Problem, index: number) => {
    if (!problem.rating) problem.rating = ratings.min;

    if (!evaluateExpression(filter, new Set(problem.tags))) return;
    matchedTags++;

    if (problem.rating < ratings.min || problem.rating > ratings.max) return;

    const key: string = getProblemKey(problem.contestId, problem.index);
    if (excludeProblemKeys.has(key)) return;

    if (acceptedProblemKeys.has(key)) {
      excludedAsSolved++;
      return;
    }

    candidates.push(index);
  });

  return { candidates, matchedTags, excludedAsSolved };
}

function emptyReason(
  matchedTags: number,
  excludedAsSolved: number,
  ratings: { min: number; max: number },
): string {
  if (excludedAsSolved > 0) {
    return `All ${excludedAsSolved} matching problems were already solved by the entered handles (or already used in this contest). Try another combination.`;
  }
  if (matchedTags > 0) {
    return `${matchedTags} problems match the tags, but none is rated ${ratings.min}–${ratings.max} (after exclusions). Widen the rating range.`;
  }
  return "No problem matches this tag expression. Try another combination.";
}

export async function getRandomProblem(
  expression: TagNode,
  ratings: { min: number; max: number },
  participantHandles: string[] = [],
  excludeProblemKeys: Set<string> = new Set(),
): Promise<PickedProblem> {
  const contradiction: string | null = findContradiction(expression);
  if (contradiction !== null) throw new Error(contradiction);

  const filter: TagNode = buildFilter(expression);
  const problemset: Problemset = await getProblemset();
  const acceptedProblemKeys: Set<string> = await getAcceptedProblemKeys(
    participantHandles,
  );

  const { candidates, matchedTags, excludedAsSolved } = collectCandidateIndices(
    problemset,
    filter,
    ratings,
    acceptedProblemKeys,
    excludeProblemKeys,
  );

  if (candidates.length === 0) {
    throw new Error(emptyReason(matchedTags, excludedAsSolved, ratings));
  }

  const chosen: number = candidates[getRandomInt(candidates.length)];
  return {
    problem: problemset.problems[chosen],
    problemStatistics: problemset.statistics[chosen],
  };
}

/** Pick up to `count` distinct problems; returns however many could be found. */
export async function getRandomProblems(
  expression: TagNode,
  ratings: { min: number; max: number },
  participantHandles: string[] = [],
  count: number = 1,
  excludeProblemKeys: Set<string> = new Set(),
): Promise<{ picked: PickedProblem[]; failureReason: string | null }> {
  const contradiction: string | null = findContradiction(expression);
  if (contradiction !== null) {
    return { picked: [], failureReason: contradiction };
  }

  const wanted: number = Math.max(0, Math.floor(count));
  if (wanted === 0) return { picked: [], failureReason: null };

  const filter: TagNode = buildFilter(expression);
  const problemset: Problemset = await getProblemset();
  const acceptedProblemKeys: Set<string> = await getAcceptedProblemKeys(
    participantHandles,
  );

  const excluded: Set<string> = new Set(excludeProblemKeys);
  const picked: PickedProblem[] = [];

  for (let i = 0; i < wanted; i++) {
    const { candidates, matchedTags, excludedAsSolved } =
      collectCandidateIndices(
        problemset,
        filter,
        ratings,
        acceptedProblemKeys,
        excluded,
      );

    if (candidates.length === 0) {
      if (picked.length === 0) {
        return {
          picked: [],
          failureReason: emptyReason(matchedTags, excludedAsSolved, ratings),
        };
      }
      return {
        picked: picked,
        failureReason: `Only found ${picked.length} of ${wanted} problems for this slot.`,
      };
    }

    const chosen: number = candidates[getRandomInt(candidates.length)];
    const problem: Problem = problemset.problems[chosen];
    const key: string = getProblemKey(problem.contestId, problem.index);
    excluded.add(key);
    picked.push({
      problem: problem,
      problemStatistics: problemset.statistics[chosen],
    });
  }

  return { picked: picked, failureReason: null };
}
