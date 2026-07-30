import axios from "axios";
import { Problem } from "../models/Problem";
import { ProblemStatistics } from "../models/ProblemStatistics";
import { TagNode } from "../models/TagExpression";
import { getTags } from "./data";
import {
  countTags,
  createRootNode,
  createTagNode,
  evaluateExpression,
  findContradiction,
} from "./tagExpression";
import {
  getAcceptedProblemKeys,
  getProblemKey,
  waitForCodeforcesApiSlot,
} from "./submissions";

const baseUrl: string = "https://codeforces.com/api/problemset.problems";

interface Problemset {
  problems: Problem[];
  statistics: ProblemStatistics[];
}

// the tag tree can ask anything, so the API tag query cannot help;
// the whole problemset is fetched once and reused for the rest of the session
let problemsetCache: Problemset | null = null;

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

async function getProblemset(): Promise<Problemset> {
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

export async function getRandomProblem(
  expression: TagNode,
  ratings: { min: number; max: number },
  participantHandles: string[] = [],
): Promise<{ problem: Problem; problemStatistics: ProblemStatistics }> {
  const contradiction: string | null = findContradiction(expression);
  if (contradiction !== null) throw new Error(contradiction);

  // no tag anywhere in the tree: stay random by picking one tag
  const tags: string[] = getTags();
  const filter: TagNode =
    countTags(expression) === 0
      ? createRootNode("LOOSE", [
          createTagNode(tags[getRandomInt(tags.length)]),
        ])
      : expression;

  const problemset: Problemset = await getProblemset();
  const acceptedProblemKeys: Set<string> = await getAcceptedProblemKeys(
    participantHandles,
  );

  const candidates: number[] = [];
  let matchedTags: number = 0;
  let excludedAsSolved: number = 0;

  problemset.problems.forEach((problem: Problem, index: number) => {
    if (!problem.rating) problem.rating = ratings.min;

    if (!evaluateExpression(filter, new Set(problem.tags))) return;
    matchedTags++;

    if (problem.rating < ratings.min || problem.rating > ratings.max) return;

    if (acceptedProblemKeys.has(getProblemKey(problem.contestId, problem.index))) {
      excludedAsSolved++;
      return;
    }

    candidates.push(index);
  });

  if (candidates.length === 0) {
    if (excludedAsSolved > 0)
      throw new Error(
        `All ${excludedAsSolved} matching problems were already solved by the entered handles. Try another combination.`,
      );

    if (matchedTags > 0)
      throw new Error(
        `${matchedTags} problems match the tags, but none is rated ${ratings.min}–${ratings.max}. Widen the rating range.`,
      );

    throw new Error(
      "No problem matches this tag expression. Try another combination.",
    );
  }

  const chosen: number = candidates[getRandomInt(candidates.length)];
  return {
    problem: problemset.problems[chosen],
    problemStatistics: problemset.statistics[chosen],
  };
}
