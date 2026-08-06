export interface ProblemReference {
  contestId: number;
  index: string;
}

export interface ProblemParseResult {
  valid: Array<{ token: string; problem: ProblemReference }>;
  invalid: string[];
}

// codeforces serves the same problem under several paths
const urlPatterns: RegExp[] = [
  /\/(?:contest|gym)\/(\d+)\/problem\/([A-Za-z]\d{0,2})(?:[/?#]|$)/i,
  /\/problemset\/problem\/(\d+)\/([A-Za-z]\d{0,2})(?:[/?#]|$)/i,
  /\/problemset\/gymProblem\/(\d+)\/([A-Za-z]\d{0,2})(?:[/?#]|$)/i,
];

// "2240A", "2240 A", "2240/A", "2240-A"
const barePattern: RegExp = /^(\d+)\s*[/\-\s]?\s*([A-Za-z]\d{0,2})$/;

export function parseProblemReference(input: string): ProblemReference | null {
  const text: string = input.trim();
  if (text.length === 0) return null;

  for (const pattern of urlPatterns) {
    const match: RegExpMatchArray | null = text.match(pattern);
    if (match) {
      return { contestId: Number(match[1]), index: match[2].toUpperCase() };
    }
  }

  const bareMatch: RegExpMatchArray | null = text.match(barePattern);
  if (bareMatch) {
    return {
      contestId: Number(bareMatch[1]),
      index: bareMatch[2].toUpperCase(),
    };
  }

  return null;
}

export function getProblemLabel(problem: ProblemReference): string {
  return `${problem.contestId}${problem.index}`;
}

/** Direct link to a problem's statement/submit page. */
export function getProblemUrl(problem: ProblemReference): string {
  if (problem.contestId >= 100000) {
    return `https://codeforces.com/gym/${problem.contestId}/problem/${problem.index}`;
  }
  return `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
}

export function getProblemKey(problem: ProblemReference): string {
  return `${problem.contestId}:${problem.index}`;
}

function detectDelimiter(lines: string[]): string | null {
  if (lines.some((line: string) => line.indexOf("\t") !== -1)) return "\t";
  if (lines.some((line: string) => line.indexOf(",") !== -1)) return ",";
  if (lines.some((line: string) => line.indexOf(";") !== -1)) return ";";
  return null;
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current: string = "";
  let inQuotes: boolean = false;

  for (let i = 0; i < line.length; i++) {
    const character: string = line[i];

    if (inQuotes) {
      if (character !== '"') {
        current += character;
      } else if (line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (character === '"') {
      inQuotes = true;
    } else if (character === delimiter) {
      cells.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  cells.push(current);
  return cells;
}

// tokens from a textarea or uploaded file: one problem per cell / line / comma entry
export function collectProblemTokens(text: string): string[] {
  const lines: string[] = text
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  if (lines.length === 0) return [];

  const delimiter: string | null = detectDelimiter(lines);
  const tokens: string[] = [];

  if (delimiter === null) {
    lines.forEach((line: string) => tokens.push(line));
  } else {
    lines.forEach((line: string) => {
      splitDelimitedLine(line, delimiter).forEach((cell: string) => {
        const trimmed: string = cell.trim();
        if (trimmed.length > 0) tokens.push(trimmed);
      });
    });
  }

  return tokens;
}

export function parseProblemList(text: string): ProblemParseResult {
  const valid: Array<{ token: string; problem: ProblemReference }> = [];
  const invalid: string[] = [];
  const seen: Set<string> = new Set();

  collectProblemTokens(text).forEach((token: string) => {
    const problem: ProblemReference | null = parseProblemReference(token);
    if (!problem) {
      invalid.push(token);
      return;
    }

    const key: string = getProblemKey(problem);
    if (seen.has(key)) return;
    seen.add(key);
    valid.push({ token: token, problem: problem });
  });

  return { valid: valid, invalid: invalid };
}
