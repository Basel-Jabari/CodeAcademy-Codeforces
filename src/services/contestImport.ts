import { getProblemUrl, ProblemReference } from "./problemLink";
import { waitForCodeforcesApiSlot } from "./submissions";

export type ContestKind = "official" | "publicGym" | "unknown";

export interface ParsedContestLink {
  contestId: number;
  isGymHint: boolean;
}

export interface ContestProblemImport {
  originalId: string;
  problem: ProblemReference;
  /** Same as originalId (no contest-letter prefix) */
  displayLabel: string;
  name: string;
  contestUrl: string;
  originalUrl?: string;
}

export interface ContestImportResult {
  contestId: number;
  contestName: string;
  kind: ContestKind;
  isGym: boolean;
  problems: ContestProblemImport[];
  messages: string[];
}

interface CfContest {
  id: number;
  name: string;
  type?: string;
  phase?: string;
}

interface CfProblem {
  contestId?: number;
  index: string;
  name: string;
  type?: string;
  rating?: number;
  tags?: string[];
}

interface StandingsResult {
  contest: CfContest;
  problems: CfProblem[];
}

export function parseContestUrl(input: string): ParsedContestLink | null {
  const text: string = input.trim();
  if (text.length === 0) return null;

  // Group / private gym links are not supported.
  if (/codeforces\.com\/group\//i.test(text)) {
    return null;
  }

  const gymMatch: RegExpMatchArray | null = text.match(
    /codeforces\.com\/gym\/(\d+)/i,
  );
  if (gymMatch) {
    return {
      contestId: Number(gymMatch[1]),
      isGymHint: true,
    };
  }

  const contestMatch: RegExpMatchArray | null = text.match(
    /codeforces\.com\/contest\/(\d+)/i,
  );
  if (contestMatch) {
    const contestId: number = Number(contestMatch[1]);
    return {
      contestId: contestId,
      isGymHint: contestId >= 100000,
    };
  }

  const bare: RegExpMatchArray | null = text.match(/^(\d{2,})$/);
  if (bare) {
    const contestId: number = Number(bare[1]);
    return {
      contestId: contestId,
      isGymHint: contestId >= 100000,
    };
  }

  return null;
}

function contestLetterAt(position: number): string {
  if (position < 26) return String.fromCharCode(65 + position);
  const cycle: number = Math.floor(position / 26);
  const letter: string = String.fromCharCode(65 + (position % 26));
  return `${letter}${cycle}`;
}

async function cfGet(
  method: string,
  params: { [key: string]: string | number | boolean },
): Promise<any> {
  const isStandings = method === "contest.standings";
  const contestId = params.contestId;
  const storageKey = `cf_standings_${contestId}`;

  if (isStandings && typeof window !== "undefined") {
    try {
      const cachedStr = localStorage.getItem(storageKey);
      if (cachedStr) {
        const stored = JSON.parse(cachedStr);
        // Cache for 1 hour (3600 * 1000 ms)
        if (Date.now() - stored.timestamp < 3600 * 1000) {
          return stored.data;
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }

  await waitForCodeforcesApiSlot();

  try {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      searchParams.append(k, String(v));
    }
    const url = `https://codeforces.com/api/${method}?${searchParams.toString()}`;

    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK") {
      if (isStandings && typeof window !== "undefined") {
        try {
          const cacheObj = {
            timestamp: Date.now(),
            data: data.result,
          };
          localStorage.setItem(storageKey, JSON.stringify(cacheObj));
        } catch {
          // ignore localStorage write errors
        }
      }
      return data.result;
    }
    const comment: string = data.comment || "Unknown API error";
    throw new Error(comment);
  } catch (e: any) {
    if (e.message) throw e;
    throw new Error(
      "Codeforces request failed. Check the contest link and connection.",
    );
  }
}

function resolveProblems(
  contestId: number,
  problems: CfProblem[],
): ContestProblemImport[] {
  return problems.map((problem: CfProblem, position: number) => {
    const index: string = (
      problem.index || contestLetterAt(position)
    ).toUpperCase();
    const sourceContestId: number =
      problem.contestId !== undefined ? problem.contestId : contestId;
    const originalId: string = `${sourceContestId}${index}`;
    const url: string = getProblemUrl({
      contestId: sourceContestId,
      index: index,
    });
    return {
      originalId: originalId,
      problem: { contestId: sourceContestId, index: index },
      displayLabel: originalId,
      name: problem.name || originalId,
      contestUrl: url,
      originalUrl: url,
    };
  });
}

/** Import public contest / public gym problems only (no participants, no auth). */
export async function importContestFromLink(
  linkOrId: string,
): Promise<ContestImportResult> {
  const parsed = parseContestUrl(linkOrId);
  if (!parsed) {
    throw new Error(
      "Could not parse contest link. Use a public contest or gym URL (https://codeforces.com/contest/2040, https://codeforces.com/gym/102644) or a numeric id. Private / group contests are not supported.",
    );
  }

  try {
    const standings: StandingsResult = await cfGet("contest.standings", {
      contestId: parsed.contestId,
    });
    const imported = resolveProblems(
      parsed.contestId,
      standings.problems || [],
    );
    const isGym: boolean =
      parsed.isGymHint || parsed.contestId >= 100000;
    return {
      contestId: parsed.contestId,
      contestName: standings.contest.name || `Contest ${parsed.contestId}`,
      kind: isGym ? "publicGym" : "official",
      isGym: isGym,
      problems: imported,
      messages: [
        `Imported ${imported.length} problem(s) from ${
          isGym ? "gym" : "contest"
        } (problems only).`,
      ],
    };
  } catch (e: any) {
    throw new Error(
      `Could not import this contest: ${e.message}. Only public contests/gyms are supported (no private or group contests).`,
    );
  }
}
