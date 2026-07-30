import axios from "axios";
import { Problem } from "../models/Problem";
import { ProblemStatistics } from "../models/ProblemStatistics";
import { getTags } from "./data";
import LogicalOperator from "../models/LogicalOperator";
import {
  getAcceptedProblemKeys,
  getProblemKey,
  waitForCodeforcesApiSlot,
} from "./submissions";

const baseUrl: string = "https://codeforces.com/api/problemset.problems";

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

// a problem and its statistics share the same index, so both are filtered together
function filterProblems(
  problems: Problem[],
  problemsStatistics: ProblemStatistics[],
  keep: (problem: Problem) => boolean,
): [Problem[], ProblemStatistics[]] {
  const keptProblems: Problem[] = [];
  const keptProblemsStatistics: ProblemStatistics[] = [];

  problems.forEach((problem: Problem, index: number) => {
    if (keep(problem)) {
      keptProblems.push(problem);
      keptProblemsStatistics.push(problemsStatistics[index]);
    }
  });

  return [keptProblems, keptProblemsStatistics];
}

// codeforces API only allows for AND operations
// OR, ONLY and NOT operations are implemented manually
async function getProblems(
  topics: string[],
  operator: LogicalOperator,
): Promise<[Problem[], ProblemStatistics[]]> {
  let problems: Problem[] = [];
  let problemsStatistics: ProblemStatistics[] = [];

  if (operator === "AND" || operator === "ONLY") {
    const tags: string = topics.reduce(
      (prev: string, current: string, _: number) => {
        return prev + ";" + current;
      },
    );

    await waitForCodeforcesApiSlot();
    const response = await axios.get(baseUrl, {
      params: {
        tags: tags,
      },
    });

    if (response.data.status !== "OK") throw new Error("Invalid combination");

    problems = response.data.result.problems as Array<Problem>;
    problemsStatistics = response.data.result
      .problemStatistics as Array<ProblemStatistics>;

    // the AND request already guarantees that every selected tag is present,
    // so ONLY only has to drop the problems carrying an extra tag
    if (operator === "ONLY") {
      const selectedTopics: Set<string> = new Set(topics);
      [problems, problemsStatistics] = filterProblems(
        problems,
        problemsStatistics,
        (problem: Problem) =>
          problem.tags.every((tag: string) => selectedTopics.has(tag)),
      );
    }
  } else if (operator === "OR") {
    for (const topic of topics) {
      await waitForCodeforcesApiSlot();
      const response = await axios.get(baseUrl, {
        params: {
          tags: topic,
        },
      });

      if (response.data.status !== "OK") throw new Error("Invalid combination");

      problems = problems.concat(response.data.result.problems as Problem);
      problemsStatistics = problemsStatistics.concat(
        response.data.result.problemStatistics as ProblemStatistics,
      );
    }
  } else if (operator === "NOT") {
    // the API cannot exclude tags, so the whole problemset is fetched and filtered
    await waitForCodeforcesApiSlot();
    const response = await axios.get(baseUrl);

    if (response.data.status !== "OK") throw new Error("Invalid combination");

    const excludedTopics: Set<string> = new Set(topics);
    [problems, problemsStatistics] = filterProblems(
      response.data.result.problems as Array<Problem>,
      response.data.result.problemStatistics as Array<ProblemStatistics>,
      (problem: Problem) =>
        problem.tags.every((tag: string) => !excludedTopics.has(tag)),
    );
  }

  return [problems, problemsStatistics];
}

export async function getRandomProblem(
  topics: Array<string>,
  ratings: { min: number; max: number },
  operator: LogicalOperator,
  participantHandles: string[] = [],
): Promise<{ problem: Problem; problemStatistics: ProblemStatistics }> {
  // an empty exclusion list keeps the whole problemset, so no fallback tag is needed
  if (topics.length === 0 && operator !== "NOT")
    topics = topics.concat(getTags()[getRandomInt(getTags().length)]);

  const [problems, problemsStatistics] = await getProblems(topics, operator);
  const acceptedProblemKeys = await getAcceptedProblemKeys(participantHandles);

  let filteredProblems: Array<number> = [];
  let excludedAsSolved: number = 0;
  problems.forEach((val: Problem, index: number) => {
    if (!val.rating) val.rating = ratings.min;

    if (val.rating < ratings.min || val.rating > ratings.max) return;

    if (acceptedProblemKeys.has(getProblemKey(val.contestId, val.index))) {
      excludedAsSolved++;
      return;
    }

    filteredProblems = filteredProblems.concat(index);
  });

  if (filteredProblems.length === 0)
    throw new Error(
      excludedAsSolved > 0
        ? `All ${excludedAsSolved} matching problems were already solved by the entered handles. Try another combination.`
        : `No problems found for the entered combination. Try another combination.`,
    );

  const probIndex: number =
    filteredProblems[getRandomInt(filteredProblems.length)];
  return {
    problem: problems[probIndex],
    problemStatistics: problemsStatistics[probIndex],
  };
}
