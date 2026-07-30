import axios from "axios";

interface Submission {
  verdict?: string;
  problem: { contestId?: number; index?: string };
}

const statusUrl: string = "https://codeforces.com/api/user.status";
const pageSize: number = 10000;

// codeforces allows at most one API request every two seconds
const requestIntervalMs: number = 2100;
let nextRequestTime: number = 0;

const acceptedProblemsCache: Map<string, Set<string>> = new Map();

export function getProblemKey(contestId: number, index: string): string {
  return `${contestId}:${index}`;
}

export function parseHandles(handles: string): string[] {
  const parsed: string[] = handles
    .split(/[\s,;]+/)
    .map((handle: string) => handle.trim())
    .filter((handle: string) => handle.length > 0);

  const seen: Set<string> = new Set();
  return parsed.filter((handle: string) => {
    const key: string = handle.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function waitForCodeforcesApiSlot(): Promise<void> {
  const requestTime: number = Math.max(Date.now(), nextRequestTime);
  nextRequestTime = requestTime + requestIntervalMs;

  const waitTime: number = requestTime - Date.now();
  if (waitTime > 0)
    await new Promise((resolve) => setTimeout(resolve, waitTime));
}

async function getSubmissionsPage(
  handle: string,
  from: number,
): Promise<Submission[]> {
  await waitForCodeforcesApiSlot();

  try {
    const response = await axios.get(statusUrl, {
      params: { handle: handle, from: from, count: pageSize },
    });

    if (response.data.status !== "OK") throw new Error(response.data.comment);

    return response.data.result as Submission[];
  } catch (e) {
    // codeforces answers an unknown handle with 400 and an explanatory comment
    const comment = e.response && e.response.data && e.response.data.comment;
    throw new Error(
      comment
        ? `Could not load submissions for "${handle}": ${comment}`
        : `Could not load submissions for "${handle}". Check the handle and your connection.`,
    );
  }
}

async function getAcceptedProblemsForHandle(
  handle: string,
): Promise<Set<string>> {
  const cacheKey: string = handle.toLowerCase();
  const cached: Set<string> | undefined = acceptedProblemsCache.get(cacheKey);
  if (cached) return cached;

  const acceptedProblems: Set<string> = new Set();
  let from: number = 1;
  let pageLength: number = pageSize;

  while (pageLength === pageSize) {
    const submissions: Submission[] = await getSubmissionsPage(handle, from);
    pageLength = submissions.length;
    from += pageSize;

    submissions.forEach((submission: Submission) => {
      const { contestId, index } = submission.problem;
      if (submission.verdict === "OK" && contestId !== undefined && index)
        acceptedProblems.add(getProblemKey(contestId, index));
    });
  }

  acceptedProblemsCache.set(cacheKey, acceptedProblems);
  return acceptedProblems;
}

// problems accepted by any of the handles, so a single solver makes a problem ineligible
export async function getAcceptedProblemKeys(
  handles: string[],
): Promise<Set<string>> {
  const acceptedProblems: Set<string> = new Set();

  for (const handle of handles) {
    const handleProblems: Set<string> = await getAcceptedProblemsForHandle(
      handle,
    );
    handleProblems.forEach((key: string) => acceptedProblems.add(key));
  }

  return acceptedProblems;
}
