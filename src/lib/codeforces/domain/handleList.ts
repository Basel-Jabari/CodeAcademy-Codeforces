// Participant list from paste or upload (.txt / .csv / .tsv).
// Every non-empty cell becomes a handle; handles are joined with ", ".

const handlePattern: RegExp = /^[A-Za-z0-9_][A-Za-z0-9_.-]{1,23}$/;
const letterPattern: RegExp = /[A-Za-z]/;

function isHandleLike(token: string): boolean {
  if (!handlePattern.test(token)) return false;
  return letterPattern.test(token);
}

function detectDelimiter(lines: string[]): string | null {
  if (lines.some((line: string) => line.indexOf("\t") !== -1)) return "\t";
  if (lines.some((line: string) => line.indexOf(",") !== -1)) return ",";
  if (lines.some((line: string) => line.indexOf(";") !== -1)) return ";";
  return null;
}

// quoted cells may themselves contain the delimiter
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

function collectNonEmptyCells(text: string): string[] {
  const lines: string[] = text
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  if (lines.length === 0) return [];

  const delimiter: string | null = detectDelimiter(lines);
  const cells: string[] = [];

  if (delimiter === null) {
    // plain list: whitespace-separated tokens on each line
    lines.forEach((line: string) => {
      line.split(/\s+/).forEach((token: string) => {
        if (token.length > 0) cells.push(token);
      });
    });
  } else {
    lines.forEach((line: string) => {
      splitDelimitedLine(line, delimiter).forEach((cell: string) => {
        const trimmed: string = cell.trim();
        if (trimmed.length > 0) cells.push(trimmed);
      });
    });
  }

  return cells;
}

// valid handles leave the box after Check; anything that is not handle-like stays
export function parseHandleListDetailed(
  text: string,
): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  const seen: Set<string> = new Set();

  collectNonEmptyCells(text).forEach((cell: string) => {
    if (isHandleLike(cell)) {
      const key: string = cell.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      valid.push(cell);
    } else {
      invalid.push(cell);
    }
  });

  return { valid: valid, invalid: invalid };
}

export function parseHandleList(text: string): string[] {
  return parseHandleListDetailed(text).valid;
}

// joins handles the way they land in the editable text box
export function formatHandleList(handles: string[]): string {
  return handles.join(", ");
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsText(file);
  });
}
