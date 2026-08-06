import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import { Problem } from "../../../lib/models/Problem";
import { ProblemStatistics } from "../../../lib/models/ProblemStatistics";
import { TagNode } from "../../../lib/models/TagExpression";
import ExpressionBuilder from "../../expression/views/ExpressionBuilder";
import Slider from "../../randomizer/views/Slider";
import OutlineButton from "../../../lib/ui/common/OutlineButton";
import { minRating, maxRating } from "../../../lib/problems/domain/data";
import { getRandomProblem, getRandomProblems } from "../../../lib/problems/domain/problems";
import { parseHandles, getProblemKey } from "../../../lib/codeforces/domain/submissions";
import { getProblemUrl } from "../../../lib/codeforces/domain/problemLink";
import { moveItem } from "../../../lib/util/tableSort";
import {
  createDefaultExpression,
  regenerateNodeIds,
} from "../../../lib/expression/domain/tagExpression";
import {
  formatHandleList,
  parseHandleList,
  readFileAsText,
} from "../../../lib/codeforces/domain/handleList";
import { downloadJson } from "../../../lib/export/domain/jsonFile";
import { downloadExcelSheets } from "../../../lib/export/domain/excelExport";
import ProblemLinkText from "../../../lib/ui/common/ProblemLinkText";
import theme from "../../../lib/theme/theme";
import { usePersistentState } from "../../../lib/storage/domain/persistentState";

interface Props {
  onError: (message: string) => void;
}

interface ContestSlot {
  id: string;
  name: string;
  expression: TagNode;
  rating: { min: number; max: number };
  excludeUsers: string;
  count: number;
  folded: boolean;
}

interface BuiltRow {
  rowId: string;
  slotId: string;
  slotIndex: number;
  problem: Problem;
  problemStatistics: ProblemStatistics;
}

// what an exported/imported contest-filters JSON file looks like
interface ExportedSlot {
  name?: string;
  expression?: TagNode;
  rating?: { min?: number; max?: number };
  excludeUsers?: string;
  count?: number;
}

interface ExportedConfig {
  version?: number;
  slots?: ExportedSlot[];
}

type ColumnKey = "id" | "title" | "rating" | "tags" | "solved";

const defaultColumnOrder: ColumnKey[] = [
  "id",
  "title",
  "rating",
  "tags",
  "solved",
];

const columnLabels: { [key in ColumnKey]: string } = {
  id: "Codeforces id",
  title: "Title",
  rating: "Rating",
  tags: "Tags",
  solved: "Count solved by",
};

let slotSeq = 1;
let rowSeq = 1;
const newSlot = (): ContestSlot => ({
  id: `slot-${slotSeq++}`,
  name: "",
  expression: createDefaultExpression(),
  rating: { min: minRating, max: maxRating },
  excludeUsers: "",
  count: 1,
  folded: false,
});

function nextSequence(ids: string[], prefix: string, current: number): number {
  return ids.reduce((next: number, id: string) => {
    const match: RegExpExecArray | null = new RegExp(`^${prefix}-(\\d+)$`).exec(
      id,
    );
    return match ? Math.max(next, Number(match[1]) + 1) : next;
  }, current);
}

function reviveSlots(stored: ContestSlot[]): ContestSlot[] {
  if (!Array.isArray(stored) || stored.length === 0) return [newSlot()];

  slotSeq = nextSequence(
    stored.map((slot: ContestSlot) => slot.id),
    "slot",
    slotSeq,
  );

  return stored.map((slot: ContestSlot): ContestSlot => ({
    ...slot,
    expression:
      slot.expression && typeof slot.expression.type === "string"
        ? regenerateNodeIds(slot.expression)
        : createDefaultExpression(),
    rating: {
      min: Number.isFinite(Number(slot.rating && slot.rating.min))
        ? Number(slot.rating.min)
        : minRating,
      max: Number.isFinite(Number(slot.rating && slot.rating.max))
        ? Number(slot.rating.max)
        : maxRating,
    },
    count: Math.max(0, Math.floor(Number(slot.count) || 0)),
    folded: Boolean(slot.folded),
  }));
}

function reviveRows(stored: BuiltRow[]): BuiltRow[] {
  if (!Array.isArray(stored)) return [];
  rowSeq = nextSequence(
    stored.map((row: BuiltRow) => row.rowId),
    "row",
    rowSeq,
  );
  return stored;
}

function reviveColumnOrder(stored: ColumnKey[]): ColumnKey[] {
  const restored: ColumnKey[] = [];
  if (Array.isArray(stored)) {
    stored.forEach((column: ColumnKey) => {
      if (
        defaultColumnOrder.indexOf(column) !== -1 &&
        restored.indexOf(column) === -1
      ) {
        restored.push(column);
      }
    });
  }
  defaultColumnOrder.forEach((column: ColumnKey) => {
    if (restored.indexOf(column) === -1) restored.push(column);
  });
  return restored;
}

function reviveSortColumn(stored: ColumnKey | null): ColumnKey | null {
  return stored !== null && defaultColumnOrder.indexOf(stored) !== -1
    ? stored
    : null;
}

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const PaneHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${theme.border};
`;

const PaneTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${theme.accentBright};
  text-shadow: 0 0 16px ${theme.glowSoft};
`;

const PaneSubtitle = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: ${theme.textMuted};
`;

const SlotCard = styled.div<{ $dragging?: boolean; $dragOver?: boolean }>`
  box-sizing: border-box;
  padding: 16px;
  background-color: ${theme.surface};
  border: 1px solid
    ${(props) => (props.$dragOver ? theme.accent : theme.border)};
  border-radius: 14px;
  box-shadow: 0 0 26px ${theme.glowSoft};
  opacity: ${(props) => (props.$dragging ? 0.4 : 1)};
  transition: border-color 0.2s, opacity 0.2s;
`;

const SlotHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const SlotTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const SlotTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.accentBright};
`;

const DragHandle = styled.span`
  cursor: grab;
  color: ${theme.textMuted};
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    color: ${theme.accentBright};
  }
`;

const SlotNameInput = styled.input`
  box-sizing: border-box;
  min-width: 120px;
  max-width: 260px;
  padding: 5px 8px;
  color: ${theme.accentBright};
  background-color: ${theme.background};
  border: 1px solid ${theme.accent};
  border-radius: 6px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;

  &:focus {
    outline: none;
  }
`;

const SlotBody = styled.div`
  margin-top: 12px;
`;

const FoldButton = styled(OutlineButton)`
  min-width: 88px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.text};
`;

const Hint = styled.div`
  font-size: 12px;
  line-height: 1.45;
  color: ${theme.textMuted};
`;

const TextArea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  min-height: 64px;
  padding: 10px;
  color: ${theme.text};
  background-color: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  font: inherit;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 14px ${theme.glowSoft};
  }
`;

const NumberInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  max-width: 140px;
  padding: 8px 10px;
  color: ${theme.text};
  background-color: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  font: inherit;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${theme.accent};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const Report = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 184, 77, 0.35);
  background: rgba(255, 184, 77, 0.08);
  color: ${theme.warning};
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const TableCard = styled.div`
  padding: 16px;
  background-color: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: 14px;
  box-shadow: 0 0 26px ${theme.glowSoft};
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${theme.border};
  border-radius: 10px;
  background-color: ${theme.background};
`;

const Table = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  font-size: 13px;

  th {
    padding: 11px 12px;
    text-align: left;
    color: ${theme.accentBright};
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.borderBright};
    border-right: 1px solid ${theme.border};
    white-space: nowrap;
  }

  td {
    padding: 10px 12px;
    color: ${theme.text};
    border-bottom: 1px solid ${theme.border};
    border-right: 1px solid ${theme.border};
    vertical-align: top;
  }

  tbody tr:nth-child(even) td {
    background-color: rgba(23, 36, 61, 0.35);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const TableCardHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const DragTh = styled.th<{ $dragging?: boolean; $sorted?: boolean }>`
  cursor: pointer;
  opacity: ${(props) => (props.$dragging ? 0.4 : 1)};
  color: ${(props) => (props.$sorted ? theme.cyan : theme.accentBright)};

  &:hover {
    color: ${theme.cyan};
  }
`;

const SortArrow = styled.span`
  margin-left: 5px;
  font-size: 11px;
`;

const DragIndexCell = styled.td<{ $dragging?: boolean }>`
  cursor: grab;
  font-weight: 700;
  color: ${theme.accentBright};
  opacity: ${(props) => (props.$dragging ? 0.4 : 1)};
`;

const ContestBuilder: React.FC<Props> = (props: Props): ReactElement => {
  const [slots, setSlots] = usePersistentState<ContestSlot[]>(
    "contestBuilder.slots",
    () => [newSlot()],
    reviveSlots,
  );
  const [rows, setRows] = usePersistentState<BuiltRow[]>(
    "contestBuilder.rows",
    [],
    reviveRows,
  );
  const [report, setReport] = usePersistentState<string>(
    "contestBuilder.report",
    "",
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [columnOrder, setColumnOrder] = usePersistentState<ColumnKey[]>(
    "contestBuilder.columnOrder",
    defaultColumnOrder,
    reviveColumnOrder,
  );
  const [dragRowIndex, setDragRowIndex] = useState<number | null>(null);
  const [dragColumn, setDragColumn] = useState<ColumnKey | null>(null);
  const [dragSlotIndex, setDragSlotIndex] = useState<number | null>(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(
    null,
  );
  const [renamingSlotId, setRenamingSlotId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = usePersistentState<ColumnKey | null>(
    "contestBuilder.sortColumn",
    null,
    reviveSortColumn,
  );
  const [sortDirection, setSortDirection] = usePersistentState<"asc" | "desc">(
    "contestBuilder.sortDirection",
    "asc",
    (stored: "asc" | "desc") => (stored === "desc" ? "desc" : "asc"),
  );
  const [redrawingRowId, setRedrawingRowId] = useState<string | null>(null);
  const fileRefs = React.useRef<{ [id: string]: HTMLInputElement | null }>({});
  const importFileRef = React.useRef<HTMLInputElement | null>(null);

  const updateSlot = (id: string, patch: Partial<ContestSlot>): void => {
    setSlots(
      slots.map((slot: ContestSlot) =>
        slot.id === id ? { ...slot, ...patch } : slot,
      ),
    );
  };

  const removeSlot = (id: string): void => {
    if (slots.length <= 1) {
      props.onError("Contest must keep at least one problem slot.");
      return;
    }
    setSlots(slots.filter((slot: ContestSlot) => slot.id !== id));
  };

  const duplicateSlot = (id: string): void => {
    const index: number = slots.findIndex(
      (slot: ContestSlot) => slot.id === id,
    );
    if (index === -1) return;
    const original: ContestSlot = slots[index];
    const copy: ContestSlot = {
      ...original,
      id: `slot-${slotSeq++}`,
      name: original.name ? `${original.name} (copy)` : "",
    };
    const next: ContestSlot[] = slots.slice();
    next.splice(index + 1, 0, copy);
    setSlots(next);
  };

  // reordering slots only changes the order used the *next* time Generate
  // is pressed — it never touches an already-built table
  const slotHandleDragProps = (index: number) => ({
    draggable: true,
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.setData("text/plain", String(index));
      event.dataTransfer.effectAllowed = "move";
      setDragSlotIndex(index);
    },
    onDragEnd: () => {
      setDragSlotIndex(null);
      setDragOverSlotIndex(null);
    },
  });

  const slotDropProps = (index: number) => ({
    onDragOver: (event: React.DragEvent) => {
      if (dragSlotIndex === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDragOverSlotIndex(index);
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      if (dragSlotIndex !== null) {
        setSlots(moveItem(slots, dragSlotIndex, index));
      }
      setDragSlotIndex(null);
      setDragOverSlotIndex(null);
    },
  });

  const uploadExcludeUsers = async (
    slotId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const input: HTMLInputElement = event.target;
    const file: File | null = input.files && input.files[0];
    input.value = "";
    if (!file) return;

    try {
      const uploaded: string[] = parseHandleList(await readFileAsText(file));
      if (uploaded.length === 0) {
        props.onError(`No handles found in ${file.name}.`);
        return;
      }
      const slot: ContestSlot | undefined = slots.find((s) => s.id === slotId);
      const merged: string[] = parseHandles(
        `${slot ? slot.excludeUsers : ""}, ${formatHandleList(uploaded)}`,
      );
      updateSlot(slotId, { excludeUsers: formatHandleList(merged) });
    } catch (e) {
      props.onError(e.message);
    }
  };

  const generateContest = async (): Promise<void> => {
    setIsGenerating(true);
    setReport("");
    const usedKeys: Set<string> = new Set();
    const nextRows: BuiltRow[] = [];
    const failures: string[] = [];

    try {
      for (let i = 0; i < slots.length; i++) {
        const slot: ContestSlot = slots[i];
        const count: number = Math.max(0, Math.floor(Number(slot.count) || 0));
        if (count === 0) {
          failures.push(`Slot ${i + 1}: count is 0 — nothing added.`);
          continue;
        }

        const result = await getRandomProblems(
          slot.expression,
          slot.rating,
          parseHandles(slot.excludeUsers),
          count,
          usedKeys,
        );

        if (result.picked.length === 0) {
          failures.push(
            `Slot ${i + 1}: ${result.failureReason || "no matching problems."}`,
          );
          continue;
        }

        // plain for-of (not a nested closure) so the shared rowSeq
        // counter isn't captured by a function declared inside the loop
        for (const item of result.picked) {
          const key: string = getProblemKey(
            item.problem.contestId,
            item.problem.index,
          );
          usedKeys.add(key);
          nextRows.push({
            rowId: `row-${rowSeq++}`,
            slotId: slot.id,
            slotIndex: i + 1,
            problem: item.problem,
            problemStatistics: item.problemStatistics,
          });
        }

        if (result.failureReason) {
          failures.push(`Slot ${i + 1}: ${result.failureReason}`);
        }
      }

      setRows(nextRows);
      if (failures.length > 0) {
        setReport(failures.join("\n"));
        props.onError(
          `${failures.length} slot issue${failures.length === 1 ? "" : "s"} — see report below.`,
        );
      } else if (nextRows.length === 0) {
        props.onError("Generate produced an empty contest.");
      }
    } catch (e) {
      props.onError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // exports just the slot settings (the filters), not the generated table
  const exportSlots = (): void => {
    const payload: ExportedConfig = {
      version: 1,
      slots: slots.map((slot: ContestSlot) => ({
        name: slot.name,
        expression: slot.expression,
        rating: slot.rating,
        excludeUsers: slot.excludeUsers,
        count: slot.count,
      })),
    };
    downloadJson("contest-filters.json", payload);
  };

  const importSlots = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const input: HTMLInputElement = event.target;
    const file: File | null = input.files && input.files[0];
    input.value = "";
    if (!file) return;

    try {
      const parsed: ExportedConfig = JSON.parse(await readFileAsText(file));
      if (!parsed || !Array.isArray(parsed.slots) || parsed.slots.length === 0) {
        throw new Error(
          `${file.name} doesn't look like a contest filters export.`,
        );
      }

      const imported: ContestSlot[] = parsed.slots.map(
        (raw: ExportedSlot): ContestSlot => ({
          id: `slot-${slotSeq++}`,
          name: typeof raw.name === "string" ? raw.name : "",
          expression:
            raw.expression && typeof raw.expression.type === "string"
              ? regenerateNodeIds(raw.expression)
              : createDefaultExpression(),
          rating: {
            min: Number(raw.rating && raw.rating.min),
            max: Number(raw.rating && raw.rating.max),
          },
          excludeUsers:
            typeof raw.excludeUsers === "string" ? raw.excludeUsers : "",
          count: Math.max(0, Math.floor(Number(raw.count) || 0)),
          folded: false,
        }),
      );

      imported.forEach((slot: ContestSlot) => {
        if (!Number.isFinite(slot.rating.min)) slot.rating.min = minRating;
        if (!Number.isFinite(slot.rating.max)) slot.rating.max = maxRating;
      });

      setSlots(imported);
      setRows([]);
      setReport("");
    } catch (e) {
      props.onError(e.message || `Could not import ${file.name}.`);
    }
  };

  // a "Link" column always rides right after "id", wherever the user has
  // dragged that column to, since the on-screen id cell is itself a link
  const exportTable = (): void => {
    const header: string[] = [];
    columnOrder.forEach((column: ColumnKey) => {
      header.push(columnLabels[column]);
      if (column === "id") header.push("Link");
    });

    const body: string[][] = displayRows.map((row: BuiltRow) => {
      const id = `${row.problem.contestId}${row.problem.index}`;
      const link: string = getProblemUrl({
        contestId: row.problem.contestId,
        index: row.problem.index,
      });

      const cells: string[] = [];
      columnOrder.forEach((column: ColumnKey) => {
        switch (column) {
          case "id":
            cells.push(id);
            cells.push(link);
            break;
          case "title":
            cells.push(row.problem.name);
            break;
          case "rating":
            cells.push(row.problem.rating ? String(row.problem.rating) : "");
            break;
          case "tags":
            cells.push((row.problem.tags || []).join(", "));
            break;
          case "solved":
            cells.push(String(row.problemStatistics.solvedCount));
            break;
          default:
            cells.push("");
        }
      });
      return cells;
    });

    downloadExcelSheets("contest-problems.xls", [
      { name: "Contest", rows: [header, ...body] },
    ]);
  };

  // redraws a single row, reusing the exact slot the problem came from and
  // excluding every problem currently in the table (including this row)
  const redrawRow = async (rowId: string): Promise<void> => {
    const target: BuiltRow | undefined = rows.find(
      (row: BuiltRow) => row.rowId === rowId,
    );
    if (!target) return;

    const slot: ContestSlot | undefined = slots.find(
      (s: ContestSlot) => s.id === target.slotId,
    );
    if (!slot) {
      props.onError(
        "The problem slot this problem came from no longer exists.",
      );
      return;
    }

    const excludeKeys: Set<string> = new Set(
      rows.map((row: BuiltRow) =>
        getProblemKey(row.problem.contestId, row.problem.index),
      ),
    );

    setRedrawingRowId(rowId);
    try {
      const picked = await getRandomProblem(
        slot.expression,
        slot.rating,
        parseHandles(slot.excludeUsers),
        excludeKeys,
      );
      setRows(
        rows.map((row: BuiltRow) =>
          row.rowId === rowId
            ? {
                ...row,
                problem: picked.problem,
                problemStatistics: picked.problemStatistics,
              }
            : row,
        ),
      );
    } catch (e) {
      props.onError(e.message);
    } finally {
      setRedrawingRowId(null);
    }
  };

  // shuffles only the display order of already-generated rows — the
  // problems, ratings, etc. never change
  const shuffleOrder = (): void => {
    const shuffled: BuiltRow[] = rows.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1));
      const temp: BuiltRow = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    setRows(shuffled);
    setSortColumn(null);
  };

  const moveRow = (fromIndex: number, toIndex: number): void => {
    setRows(moveItem(rows, fromIndex, toIndex));
    setSortColumn(null);
  };

  const moveColumn = (from: ColumnKey, to: ColumnKey): void => {
    setColumnOrder(
      moveItem(columnOrder, columnOrder.indexOf(from), columnOrder.indexOf(to)),
    );
  };

  // manual drag reordering only makes sense on the unsorted, hand-picked
  // order, so it's disabled while a column sort is active
  const rowDragHandlers = (index: number) => ({
    draggable: sortColumn === null,
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.setData("text/plain", String(index));
      event.dataTransfer.effectAllowed = "move";
      setDragRowIndex(index);
    },
    onDragOver: (event: React.DragEvent) => {
      if (sortColumn !== null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      if (dragRowIndex !== null) moveRow(dragRowIndex, index);
      setDragRowIndex(null);
    },
    onDragEnd: () => setDragRowIndex(null),
  });

  const columnDragHandlers = (column: ColumnKey) => ({
    draggable: true,
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.setData("text/plain", column);
      event.dataTransfer.effectAllowed = "move";
      setDragColumn(column);
    },
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      if (dragColumn) moveColumn(dragColumn, column);
      setDragColumn(null);
    },
    onDragEnd: () => setDragColumn(null),
  });

  const compareRows = (a: BuiltRow, b: BuiltRow, column: ColumnKey): number => {
    switch (column) {
      case "id":
        return a.problem.contestId !== b.problem.contestId
          ? a.problem.contestId - b.problem.contestId
          : a.problem.index.localeCompare(b.problem.index);
      case "title":
        return a.problem.name.localeCompare(b.problem.name);
      case "rating":
        return (a.problem.rating || 0) - (b.problem.rating || 0);
      case "tags":
        return (a.problem.tags || [])
          .join(", ")
          .localeCompare((b.problem.tags || []).join(", "));
      case "solved":
        return a.problemStatistics.solvedCount - b.problemStatistics.solvedCount;
      default:
        return 0;
    }
  };

  const toggleSort = (column: ColumnKey): void => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const displayRows: BuiltRow[] =
    sortColumn === null
      ? rows
      : rows
          .slice()
          .sort((a: BuiltRow, b: BuiltRow) =>
            sortDirection === "asc"
              ? compareRows(a, b, sortColumn)
              : compareRows(b, a, sortColumn),
          );

  const renderCell = (
    row: BuiltRow,
    column: ColumnKey,
    id: string,
    href: string,
  ): ReactElement => {
    switch (column) {
      case "id":
        return (
          <td key={column}>
            <ProblemLinkText
              href={href}
              target="_blank"
              rel="noreferrer"
              draggable={false}
            >
              {id}
            </ProblemLinkText>
          </td>
        );
      case "title":
        return <td key={column}>{row.problem.name}</td>;
      case "rating":
        return <td key={column}>{row.problem.rating || "—"}</td>;
      case "tags":
        return (
          <td key={column}>{(row.problem.tags || []).join(", ") || "—"}</td>
        );
      case "solved":
        return <td key={column}>{row.problemStatistics.solvedCount}</td>;
      default:
        return <td key={column}></td>;
    }
  };

  return (
    <Pane>
      <PaneHead>
        <PaneTitle>Contest Builder</PaneTitle>
        <PaneSubtitle>
          Empty contest → add slots with their own randomizer rules → Generate
        </PaneSubtitle>
        <Actions>
          <OutlineButton
            type="button"
            onClick={() => setSlots(slots.concat(newSlot()))}
          >
            Add problem slot
          </OutlineButton>
          <OutlineButton type="button" onClick={exportSlots}>
            Export filters
          </OutlineButton>
          <OutlineButton
            type="button"
            onClick={() => {
              if (importFileRef.current) importFileRef.current.click();
            }}
          >
            Import filters
          </OutlineButton>
          <HiddenFileInput
            ref={importFileRef}
            type="file"
            accept=".json,application/json"
            onChange={importSlots}
          ></HiddenFileInput>
        </Actions>
      </PaneHead>

      {slots.map((slot: ContestSlot, index: number) => (
        <SlotCard
          key={slot.id}
          $dragging={dragSlotIndex === index}
          $dragOver={dragOverSlotIndex === index && dragSlotIndex !== index}
          {...slotDropProps(index)}
        >
          <SlotHeader>
            <SlotTitleGroup>
              <DragHandle title="Drag to reorder slots" {...slotHandleDragProps(index)}>
                ⠿
              </DragHandle>
              {renamingSlotId === slot.id ? (
                <SlotNameInput
                  autoFocus
                  value={slot.name}
                  placeholder={`Problem slot ${index + 1}`}
                  onChange={(event) =>
                    updateSlot(slot.id, { name: event.target.value })
                  }
                  onBlur={() => setRenamingSlotId(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setRenamingSlotId(null);
                  }}
                ></SlotNameInput>
              ) : (
                <SlotTitle>{slot.name || `Problem slot ${index + 1}`}</SlotTitle>
              )}
              <FoldButton
                type="button"
                onClick={() =>
                  setRenamingSlotId(
                    renamingSlotId === slot.id ? null : slot.id,
                  )
                }
              >
                {renamingSlotId === slot.id ? "Done" : "Rename"}
              </FoldButton>
              <FoldButton
                type="button"
                onClick={() => updateSlot(slot.id, { folded: !slot.folded })}
                aria-expanded={!slot.folded}
              >
                {slot.folded ? "Unfold" : "Fold"}
              </FoldButton>
            </SlotTitleGroup>
            <Actions>
              <OutlineButton
                type="button"
                onClick={() => duplicateSlot(slot.id)}
              >
                Duplicate
              </OutlineButton>
              <OutlineButton type="button" onClick={() => removeSlot(slot.id)}>
                Remove slot
              </OutlineButton>
            </Actions>
          </SlotHeader>

          {!slot.folded ? (
            <SlotBody>
              <ExpressionBuilder
                expression={slot.expression}
                onChange={(expression: TagNode) =>
                  updateSlot(slot.id, { expression: expression })
                }
              ></ExpressionBuilder>

              <Slider
                minRating={slot.rating.min}
                maxRating={slot.rating.max}
                onChange={(rating: { min: number; max: number }) =>
                  updateSlot(slot.id, { rating: rating })
                }
              ></Slider>

              <FieldGrid>
                <Field>
                  <Label htmlFor={`exclude-${slot.id}`}>
                    Exclude solved by the following users
                  </Label>
                  <TextArea
                    id={`exclude-${slot.id}`}
                    placeholder="handle1, handle2, …"
                    value={slot.excludeUsers}
                    onChange={(event) =>
                      updateSlot(slot.id, { excludeUsers: event.target.value })
                    }
                  ></TextArea>
                  <Actions>
                    <OutlineButton
                      type="button"
                      onClick={() => {
                        const el = fileRefs.current[slot.id];
                        if (el) el.click();
                      }}
                    >
                      Upload list
                    </OutlineButton>
                    <HiddenFileInput
                      ref={(el) => {
                        fileRefs.current[slot.id] = el;
                      }}
                      type="file"
                      accept=".txt,.csv,.tsv,text/plain,text/csv"
                      onChange={(event) => uploadExcludeUsers(slot.id, event)}
                    ></HiddenFileInput>
                  </Actions>
                  <Hint>
                    Problems already Accepted by any of these handles are
                    skipped for this slot.
                  </Hint>
                </Field>

                <Field>
                  <Label htmlFor={`count-${slot.id}`}>
                    Number of generated problems
                  </Label>
                  <NumberInput
                    id={`count-${slot.id}`}
                    type="number"
                    min={0}
                    max={50}
                    value={slot.count}
                    onChange={(event) =>
                      updateSlot(slot.id, {
                        count: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                  ></NumberInput>
                  <Hint>
                    How many distinct problems to pull for this slot. Duplicates
                    across the whole contest are never reused.
                  </Hint>
                </Field>
              </FieldGrid>
            </SlotBody>
          ) : (
            <Hint style={{ marginTop: 10 }}>
              Randomizer folded — {slot.count} problem
              {slot.count === 1 ? "" : "s"}, rating {slot.rating.min}–
              {slot.rating.max}.
            </Hint>
          )}
        </SlotCard>
      ))}

      <Actions>
        <OutlineButton
          type="button"
          disabled={isGenerating}
          onClick={generateContest}
        >
          {isGenerating ? "Generating…" : "Generate"}
        </OutlineButton>
      </Actions>

      {report ? <Report>{report}</Report> : null}

      <TableCard>
        <TableCardHead>
          <SlotTitle>Contest problems</SlotTitle>
          <Actions>
            <OutlineButton
              type="button"
              disabled={rows.length < 2}
              onClick={shuffleOrder}
              title="Reorders the problems below without changing which ones are picked"
            >
              Shuffle order
            </OutlineButton>
            <OutlineButton
              type="button"
              disabled={rows.length === 0}
              onClick={exportTable}
              title="Download the table below as an Excel sheet"
            >
              Export table
            </OutlineButton>
          </Actions>
        </TableCardHead>
        <Hint style={{ margin: "8px 0 12px" }}>
          Attempted count is not exposed by the public Codeforces problemset
          API. Drag a row (via its # handle) or a column header to reorder;
          click a column header to sort by it (click again to flip
          ascending/descending). Sorting and dragging rows are mutually
          exclusive — reordering a row clears any active sort.
        </Hint>
        {rows.length === 0 ? (
          <Hint>Press Generate to build the contest.</Hint>
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  {columnOrder.map((column: ColumnKey) => (
                    <DragTh
                      key={column}
                      $dragging={dragColumn === column}
                      $sorted={sortColumn === column}
                      title="Click to sort · drag to reorder this column"
                      onClick={() => toggleSort(column)}
                      {...columnDragHandlers(column)}
                    >
                      {columnLabels[column]}
                      {sortColumn === column ? (
                        <SortArrow>
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </SortArrow>
                      ) : null}
                    </DragTh>
                  ))}
                  <th title="Generate an alternative problem for this slot">
                    Redraw
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row: BuiltRow, index: number) => {
                  const id = `${row.problem.contestId}${row.problem.index}`;
                  const href = getProblemUrl({
                    contestId: row.problem.contestId,
                    index: row.problem.index,
                  });
                  return (
                    <tr key={row.rowId}>
                      <DragIndexCell
                        $dragging={dragRowIndex === index}
                        title={
                          sortColumn === null
                            ? "Drag to reorder this row"
                            : "Clear the sort to drag rows manually"
                        }
                        {...rowDragHandlers(index)}
                      >
                        {index + 1}
                      </DragIndexCell>
                      {columnOrder.map((column: ColumnKey) =>
                        renderCell(row, column, id, href),
                      )}
                      <td>
                        <OutlineButton
                          type="button"
                          disabled={redrawingRowId !== null || isGenerating}
                          onClick={() => redrawRow(row.rowId)}
                          title="Pick a different problem for this slot — the same filter, rating and exclusions apply, and problems already in this table are skipped"
                        >
                          {redrawingRowId === row.rowId
                            ? "Redrawing…"
                            : "Redraw"}
                        </OutlineButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </TableCard>
    </Pane>
  );
};

export default ContestBuilder;
