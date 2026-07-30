import axios from "axios";

interface Submission {
  verdict?: string;
  problem: { contestId?: number; index?: string };
}

export type ProblemStatus = "accepted" | "attempted" | "untried";

export interface HandleProblemStatus {
  handle: string;
  status: ProblemStatus;
}

// codeforces only sends a comment when it rejects the request itself,
// so its absence means the network failed instead of the handle being wrong
interface CodeforcesError extends Error {
  apiComment?: string;
}

// a handle's whole public history, split once so both features reuse one fetch
interface HandleHistory {
  accepted: Set<string>;
  attempted: Set<string>;
}

const statusUrl: string = "https://codeforces.com/api/user.status";
const pageSize: number = 10000;

// codeforces allows at most one API request every two seconds
const requestIntervalMs: number = 2100;
let nextRequestTime: number = 0;

const historyCache: Map<string, HandleHistory> = new Map();

export function getProblemKey(contestId: number, index: string): string {
  return `${contestId}:${index.toUpperCase()}`;
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

  let comment: string | undefined;

  try {
    const response = await axios.get(statusUrl, {
      params: { handle: handle, from: from, count: pageSize },
    });

    if (response.data.status === "OK") return response.data.result as Submission[];
    comment = response.data.comment;
  } catch (e) {
    // codeforces answers an unknown handle with 400 and an explanatory comment
    comment = e.response && e.response.data && e.response.data.comment;
  }

  const error: CodeforcesError = new Error(
    comment
      ? `Could not load submissions for "${handle}": ${comment}`
      : `Could not load submissions for "${handle}". Check the handle and your connection.`,
  );
  error.apiComment = comment;
  throw error;
}

async function getHandleHistory(handle: string): Promise<HandleHistory> {
  const cacheKey: string = handle.toLowerCase();
  const cached: HandleHistory | undefined = historyCache.get(cacheKey);
  if (cached) return cached;

  const history: HandleHistory = { accepted: new Set(), attempted: new Set() };
  let from: number = 1;
  let pageLength: number = pageSize;

  while (pageLength === pageSize) {
    const submissions: Submission[] = await getSubmissionsPage(handle, from);
    pageLength = submissions.length;
    from += pageSize;

    submissions.forEach((submission: Submission) => {
      const { contestId, index } = submission.problem;
      if (contestId === undefined || !index) return;

      const key: string = getProblemKey(contestId, index);
      if (submission.verdict === "OK") history.accepted.add(key);
      else history.attempted.add(key);
    });
  }

  historyCache.set(cacheKey, history);
  return history;
}

export interface HandleCheck {
  handle: string;
  ok: boolean;
  message?: string;
}

// a handle only counts as valid once codeforces actually returns its history
export async function verifyHandles(
  handles: string[],
): Promise<HandleCheck[]> {
  const checks: HandleCheck[] = [];

  for (const handle of handles) {
    try {
      await getHandleHistory(handle);
      checks.push({ handle: handle, ok: true });
    } catch (e) {
      const apiComment: string | undefined = (e as CodeforcesError).apiComment;
      // without a comment this is a connection problem, not a bad handle
      if (!apiComment) throw e;
      checks.push({ handle: handle, ok: false, message: apiComment });
    }
  }

  return checks;
}

// problems accepted by any of the handles, so a single solver makes a problem ineligible
export async function getAcceptedProblemKeys(
  handles: string[],
): Promise<Set<string>> {
  const acceptedProblems: Set<string> = new Set();

  for (const handle of handles) {
    const history: HandleHistory = await getHandleHistory(handle);
    history.accepted.forEach((key: string) => acceptedProblems.add(key));
  }

  return acceptedProblems;
}

export async function getHandleProblemStatuses(
  handles: string[],
  contestId: number,
  index: string,
): Promise<HandleProblemStatus[]> {
  const key: string = getProblemKey(contestId, index);
  const statuses: HandleProblemStatus[] = [];

  for (const handle of handles) {
    const history: HandleHistory = await getHandleHistory(handle);

    let status: ProblemStatus = "untried";
    if (history.accepted.has(key)) status = "accepted";
    else if (history.attempted.has(key)) status = "attempted";

    statuses.push({ handle: handle, status: status });
  }

  return statuses;
}
