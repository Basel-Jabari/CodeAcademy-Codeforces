import React, { ReactElement, useRef, useState } from "react";
import styled from "styled-components";
import {
  getHandleProblemStatuses,
  HandleCheck,
  HandleProblemStatus,
  ProblemStatus,
  verifyHandles,
} from "../../services/submissions";
import {
  getProblemKey,
  getProblemLabel,
  getProblemUrl,
  parseProblemList,
  ProblemReference,
} from "../../services/problemLink";
import {
  parseHandleListDetailed,
  readFileAsText,
} from "../../services/handleList";
import { downloadExcelSheets } from "../../services/excelExport";
import {
  moveItem,
  sortHandlesAz,
  sortNamesAz,
  sortProblemsByNumberThenLetter,
} from "../../services/tableSort";
import {
  importContestFromLink,
  ContestImportResult,
  ContestProblemImport,
} from "../../services/contestImport";
import OutlineButton from "../common/OutlineButton";
import ProblemLinkText from "../common/ProblemLinkText";
import theme from "../../theme";
import { usePersistentState } from "../../services/persistentState";

interface Props {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

interface ProblemColumn {
  key: string;
  problem: ProblemReference;
  /** e.g. "4C" when imported from a contest */
  displayLabel?: string;
  /** Link to this exact problem inside its contest/gym/group, if imported */
  contestUrl?: string;
  /** Public codeforces.com/problemset link, when confirmed to differ from contestUrl */
  originalUrl?: string;
  /** Which problem group (usually "one imported contest") this belongs to, if any */
  groupId?: string;
}

interface ProblemGroup {
  id: string;
  name: string;
}

type DragKind = "handle" | "problem" | "status";

interface DragState {
  kind: DragKind;
  tableId: string;
  index: number;
}

type Flags = { [key: string]: boolean };

const TABLE_HANDLE_STATUS = "handleStatus";
const TABLE_STATUS_NAMES = "statusNames";
const TABLE_STATUS_COUNTS = "statusCounts";
const TABLE_PROBLEMS_BY_PERSON = "problemsByPerson";
const TABLE_TOTALS = "totalsPerPerson";

const statusLabels: { [key in ProblemStatus]: string } = {
  accepted: "Accepted",
  attempted: "Tried, not accepted",
  untried: "Did not try",
};

const statusShort: { [key in ProblemStatus]: string } = {
  accepted: "Accepted",
  attempted: "Tried",
  untried: "Did not try",
};

const statusColors: { [key in ProblemStatus]: string } = {
  accepted: theme.success,
  attempted: theme.warning,
  untried: theme.textMuted,
};

const emptyMessages: { [key in ProblemStatus]: string } = {
  accepted: "Momin Won't Forgive You",
  attempted: "Math Math Easy Easy",
  untried: "Absolute Cinema",
};

const defaultStatusOrder: ProblemStatus[] = [
  "accepted",
  "attempted",
  "untried",
];

const Panel = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 20px;
  overflow: visible;
  background: linear-gradient(
    168deg,
    ${theme.surface} 0%,
    ${theme.background} 130%
  );
  border: 1px solid ${theme.border};
  border-radius: 16px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45), 0 0 40px ${theme.glowSoft};
`;

const HeaderBlock = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
`;

const Title = styled.div`
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: ${theme.text};
  text-shadow: 0 0 22px ${theme.glowSoft};
`;

const Subtitle = styled.div`
  margin-top: 8px;
  max-width: 620px;
  font-size: 13px;
  line-height: 1.5;
  color: ${theme.textMuted};
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const StatPill = styled.div`
  min-width: 124px;
  padding: 12px 16px;
  background: linear-gradient(
    150deg,
    rgba(61, 155, 255, 0.12),
    rgba(7, 11, 20, 0.6)
  );
  border: 1px solid ${theme.borderBright};
  border-radius: 12px;
  box-shadow: 0 0 18px ${theme.glowSoft};
`;

const StatLabel = styled.div`
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${theme.textMuted};
`;

const StatValue = styled.div`
  margin-top: 4px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  color: ${theme.accentBright};
`;

const StatSub = styled.span`
  margin-left: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.textMuted};
`;

const Divider = styled.div`
  height: 1px;
  margin: 22px 0 4px 0;
  background: linear-gradient(
    90deg,
    transparent,
    ${theme.borderBright},
    transparent
  );
`;

// auto-fit adapts to the pane width, so the two boxes stack when the half gets narrow
const InputsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 18px;
`;

const FieldBlock = styled.div`
  padding: 14px;
  background-color: rgba(7, 11, 20, 0.55);
  border: 1px solid ${theme.border};
  border-radius: 12px;
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 9px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: ${theme.text};
`;

const InputArea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  min-height: 92px;
  padding: 11px 13px;
  color: ${theme.text};
  background-color: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 9px;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: 0.25s;

  &::placeholder {
    color: ${theme.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 18px ${theme.glowSoft};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const MainActions = styled(Actions)`
  margin-top: 20px;
  overflow: visible;
  position: relative;
  z-index: 5;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FilterAnchor = styled.div`
  position: relative;
  z-index: 21;
`;

const FilterBackdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
`;

const FilterPanel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 20;
  box-sizing: border-box;
  width: min(300px, calc(100vw - 32px));
  max-width: 300px;
  padding: 12px;
  background-color: ${theme.surface};
  border: 1px solid ${theme.borderBright};
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55), 0 0 24px ${theme.glowSoft};
  overflow: visible;
`;

const FilterTitle = styled.div`
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${theme.textMuted};
`;

const SearchInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 8px 10px;
  color: ${theme.text};
  background-color: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  font: inherit;
  font-size: 13px;

  &::placeholder {
    color: ${theme.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 12px ${theme.glowSoft};
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 6px;
  margin: 10px 0;
`;

const MiniButton = styled.button`
  flex: 1;
  padding: 5px 8px;
  color: ${theme.textMuted};
  background: transparent;
  border: 1px solid ${theme.border};
  border-radius: 6px;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;

  &:hover {
    color: ${theme.accentBright};
    border-color: ${theme.accent};
  }

  &:focus {
    outline: none;
  }
`;

const FilterList = styled.div`
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${theme.borderBright};
    border-radius: 4px;
  }
`;

const FilterItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  font-size: 13px;
  color: ${theme.text};
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: ${theme.surfaceHover};
  }

  input {
    cursor: pointer;
  }
`;

const FilterEmpty = styled.div`
  padding: 10px 4px;
  font-size: 12px;
  font-style: italic;
  color: ${theme.textMuted};
`;

const GroupBlock = styled.div<{ $over?: boolean }>`
  margin: 8px 0;
  padding: 6px;
  border: 1px dashed
    ${(props) => (props.$over ? theme.accent : theme.border)};
  border-radius: 8px;
  background-color: ${(props) =>
    props.$over ? "rgba(61, 155, 255, 0.08)" : "transparent"};
  transition: 0.2s;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px;

  input[type="checkbox"] {
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const GroupNameInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 2px 4px;
  color: ${theme.accentBright};
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 700;

  &:hover,
  &:focus {
    border-bottom-color: ${theme.border};
  }

  &:focus {
    outline: none;
  }
`;

const GroupCount = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  color: ${theme.textMuted};
`;

const UngroupButton = styled.button`
  flex-shrink: 0;
  padding: 1px 6px;
  color: ${theme.textMuted};
  background: transparent;
  border: 1px solid ${theme.border};
  border-radius: 5px;
  font: inherit;
  font-size: 10px;
  cursor: pointer;

  &:hover {
    color: ${theme.accentBright};
    border-color: ${theme.accent};
  }
`;

const TableCard = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: rgba(16, 26, 46, 0.9);
  border: 1px solid ${theme.border};
  border-radius: 14px;
  box-shadow: 0 0 26px ${theme.glowSoft};
`;

const SectionHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: ${theme.accentBright};
`;

const SectionIndex = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: ${theme.background};
  background: linear-gradient(135deg, ${theme.accent}, ${theme.cyan});
  box-shadow: 0 0 14px ${theme.glow};
`;

const SectionHint = styled.div`
  margin: 8px 0 12px 0;
  font-size: 12px;
  line-height: 1.5;
  color: ${theme.textMuted};
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${theme.border};
  border-radius: 10px;
  background-color: ${theme.background};

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${theme.borderBright};
    border-radius: 5px;
  }
`;

const Table = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  font-size: 13px;

  tbody tr:nth-child(even) td {
    background-color: rgba(23, 36, 61, 0.35);
  }

  tbody tr:hover td {
    background-color: rgba(61, 155, 255, 0.08);
  }
`;

const Th = styled.th<{
  $dragging?: boolean;
  $static?: boolean;
  $sticky?: boolean;
}>`
  position: ${(props) => (props.$sticky ? "sticky" : "static")};
  left: ${(props) => (props.$sticky ? "0" : "auto")};
  z-index: ${(props) => (props.$sticky ? 3 : 1)};
  padding: 12px 14px;
  text-align: left;
  color: ${theme.accentBright};
  background-color: ${theme.surface};
  border-bottom: 1px solid ${theme.borderBright};
  border-right: 1px solid ${theme.border};
  white-space: nowrap;
  vertical-align: middle;
  cursor: ${(props) => (props.$static ? "default" : "grab")};
  opacity: ${(props) => (props.$dragging ? 0.35 : 1)};
`;

const Td = styled.td`
  padding: 11px 14px;
  color: ${theme.text};
  background-color: transparent;
  border-bottom: 1px solid ${theme.border};
  border-right: 1px solid ${theme.border};
  vertical-align: top;
  line-height: 1.55;
  word-break: break-word;
  transition: background-color 0.2s;
`;

const StickyTd = styled(Td)<{ $dragging?: boolean; $accent?: string }>`
  position: sticky;
  left: 0;
  z-index: 2;
  min-width: 160px;
  color: ${(props) => props.$accent || theme.text};
  font-weight: 600;
  white-space: nowrap;
  background-color: ${theme.surface} !important;
  cursor: grab;
  opacity: ${(props) => (props.$dragging ? 0.35 : 1)};
`;

const CountCell = styled(Td)<{ $accent?: string }>`
  color: ${(props) => props.$accent || theme.text};
  font-weight: 700;
  font-size: 15px;
  text-align: center;
`;

const StatusChip = styled.span<{ $accent: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: ${(props) => props.$accent};
  border: 1px solid ${(props) => props.$accent};
  background-color: rgba(255, 255, 255, 0.035);
`;

const EmptyCell = styled.span`
  color: ${theme.textMuted};
  font-style: italic;
`;

const HeaderCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const DeleteButton = styled.button`
  padding: 2px 8px;
  color: ${theme.danger};
  background: transparent;
  border: 1px solid ${theme.danger};
  border-radius: 5px;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: 0.25s;

  &:hover {
    background-color: ${theme.danger};
    color: white;
    box-shadow: 0 0 10px ${theme.dangerGlow};
  }

  &:focus {
    outline: none;
  }
`;

const ContestBlock = styled.div`
  margin-top: 18px;
  padding: 14px;
  background-color: rgba(7, 11, 20, 0.55);
  border: 1px solid ${theme.border};
  border-radius: 12px;
`;

const ContestTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.cyan};
  margin-bottom: 8px;
`;

const ContestHint = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: ${theme.textMuted};
  margin-bottom: 12px;
`;

const ContestNotes = styled.pre`
  margin: 12px 0 0 0;
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font: inherit;
  font-size: 12px;
  line-height: 1.45;
  color: ${theme.textMuted};
  background: rgba(34, 211, 238, 0.06);
  border: 1px solid rgba(34, 211, 238, 0.25);
  border-radius: 8px;
`;

const LoadingNote = styled.div`
  margin-top: 14px;
  padding: 10px 14px;
  font-size: 12px;
  color: ${theme.cyan};
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 9px;
  background-color: rgba(34, 211, 238, 0.07);
`;

function nextManualGroupNumber(groups: ProblemGroup[]): number {
  const highest: number = groups.reduce(
    (largest: number, group: ProblemGroup) => {
      const match: RegExpExecArray | null = /^manual-(\d+)$/.exec(group.id);
      return match ? Math.max(largest, Number(match[1])) : largest;
    },
    0,
  );

  return highest + 1;
}

const ProblemCheck: React.FC<Props> = (props: Props): ReactElement => {
  const [handlesInput, setHandlesInput] = usePersistentState<string>(
    "crossAnalysis.handlesInput",
    "",
  );
  const [problemsInput, setProblemsInput] = usePersistentState<string>(
    "crossAnalysis.problemsInput",
    "",
  );
  const [handles, setHandles] = usePersistentState<string[]>(
    "crossAnalysis.handles",
    [],
  );
  const [problems, setProblems] = usePersistentState<ProblemColumn[]>(
    "crossAnalysis.problems",
    [],
  );
  const [groups, setGroups] = usePersistentState<ProblemGroup[]>(
    "crossAnalysis.groups",
    [],
  );
  // seeded once from restored groups, so a reloaded page never reuses an id
  const manualGroupSeq = useRef<number>(0);
  if (manualGroupSeq.current === 0) {
    manualGroupSeq.current = nextManualGroupNumber(groups);
  }
  const [hiddenHandles, setHiddenHandles] = usePersistentState<Flags>(
    "crossAnalysis.hiddenHandles",
    {},
  );
  const [hiddenProblems, setHiddenProblems] = usePersistentState<Flags>(
    "crossAnalysis.hiddenProblems",
    {},
  );
  const [matrix, setMatrix] = usePersistentState<{
    [problemKey: string]: { [handleKey: string]: ProblemStatus };
  }>("crossAnalysis.matrix", {});
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [loadingNote, setLoadingNote] = useState<string>("");

  const [contestLink, setContestLink] = usePersistentState<string>(
    "crossAnalysis.contestLink",
    "",
  );
  const [isImportingContest, setIsImportingContest] = useState<boolean>(false);
  const [contestNotes, setContestNotes] = usePersistentState<string>(
    "crossAnalysis.contestNotes",
    "",
  );

  // each table keeps its own order, so dragging one never moves another
  const [handleOrders, setHandleOrders] = usePersistentState<{
    [id: string]: string[];
  }>("crossAnalysis.handleOrders", {});
  const [problemOrders, setProblemOrders] = usePersistentState<{
    [id: string]: string[];
  }>("crossAnalysis.problemOrders", {});
  const [statusOrders, setStatusOrders] = usePersistentState<{
    [id: string]: ProblemStatus[];
  }>("crossAnalysis.statusOrders", {});

  const [drag, setDrag] = useState<DragState | null>(null);
  const [openFilter, setOpenFilter] = useState<"handles" | "problems" | null>(
    null,
  );
  const [draggedProblemKey, setDraggedProblemKey] = useState<string | null>(
    null,
  );
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const UNGROUPED = "__ungrouped__";
  const [handleSearch, setHandleSearch] = useState<string>("");
  const [problemSearch, setProblemSearch] = useState<string>("");

  const handlesFileRef = useRef<HTMLInputElement>(null);
  const problemsFileRef = useRef<HTMLInputElement>(null);

  const keyOf = (handle: string): string => handle.toLowerCase();
  const labelOf = (column: ProblemColumn): string =>
    column.displayLabel || getProblemLabel(column.problem);

  const handleByKey: { [key: string]: string } = {};
  handles.forEach((handle: string) => {
    handleByKey[keyOf(handle)] = handle;
  });

  const problemByKey: { [key: string]: ProblemColumn } = {};
  problems.forEach((column: ProblemColumn) => {
    problemByKey[column.key] = column;
  });

  // ---------- ordering ----------

  const orderKeys = (order: string[], master: string[]): string[] => {
    const result: string[] = [];
    order.forEach((key: string) => {
      if (master.indexOf(key) !== -1 && result.indexOf(key) === -1)
        result.push(key);
    });
    master.forEach((key: string) => {
      if (result.indexOf(key) === -1) result.push(key);
    });
    return result;
  };

  const handleKeysFor = (tableId: string): string[] =>
    orderKeys(handleOrders[tableId] || [], handles.map(keyOf));

  const problemKeysFor = (tableId: string): string[] =>
    orderKeys(
      problemOrders[tableId] || [],
      problems.map((column: ProblemColumn) => column.key),
    );

  const visibleHandlesFor = (tableId: string): string[] =>
    handleKeysFor(tableId).filter((key: string) => !hiddenHandles[key]);

  const visibleProblemsFor = (tableId: string): ProblemColumn[] =>
    problemKeysFor(tableId)
      .filter((key: string) => !hiddenProblems[key])
      .map((key: string) => problemByKey[key]);

  const statusesFor = (tableId: string): ProblemStatus[] =>
    statusOrders[tableId] || defaultStatusOrder;

  const shownHandleKeys: string[] = handles
    .map(keyOf)
    .filter((key: string) => !hiddenHandles[key]);
  const shownProblems: ProblemColumn[] = problems.filter(
    (column: ProblemColumn) => !hiddenProblems[column.key],
  );

  // ---------- values ----------

  const statusAt = (
    handleKey: string,
    problemKey: string,
  ): ProblemStatus | null => {
    const column = matrix[problemKey];
    if (!column) return null;
    return column[handleKey] || null;
  };

  const namesForStatus = (
    problemKey: string,
    status: ProblemStatus,
  ): string[] =>
    sortNamesAz(
      shownHandleKeys
        .filter((key: string) => statusAt(key, problemKey) === status)
        .map((key: string) => handleByKey[key] || key),
    );

  const problemsForHandleStatus = (
    handleKey: string,
    status: ProblemStatus,
  ): string[] =>
    sortProblemsByNumberThenLetter(
      shownProblems.filter(
        (column: ProblemColumn) => statusAt(handleKey, column.key) === status,
      ),
    ).map((column: ProblemColumn) => labelOf(column));

  // ---------- fetching ----------

  const fetchMatrix = async (
    nextHandles: string[],
    nextProblems: ProblemColumn[],
  ): Promise<void> => {
    const nextMatrix: {
      [problemKey: string]: { [handleKey: string]: ProblemStatus };
    } = {};

    for (let i = 0; i < nextProblems.length; i++) {
      const column: ProblemColumn = nextProblems[i];
      setLoadingNote(
        `Loading ${labelOf(column)} (${i + 1}/${nextProblems.length})…`,
      );

      const statuses: HandleProblemStatus[] = await getHandleProblemStatuses(
        nextHandles,
        column.problem.contestId,
        column.problem.index,
      );

      const byHandle: { [handleKey: string]: ProblemStatus } = {};
      statuses.forEach((entry: HandleProblemStatus) => {
        byHandle[keyOf(entry.handle)] = entry.status;
      });
      nextMatrix[column.key] = byHandle;
    }

    setMatrix(nextMatrix);
    setLoadingNote("");
  };

  const runCheck = async (): Promise<void> => {
    const handleParse = parseHandleListDetailed(handlesInput);
    const problemParse = parseProblemList(problemsInput);

    if (
      handleParse.valid.length === 0 &&
      handleParse.invalid.length === 0 &&
      problemParse.valid.length === 0 &&
      problemParse.invalid.length === 0
    ) {
      props.onError("Enter handles and/or problems, then press Check.");
      return;
    }

    const messages: string[] = [];
    if (handleParse.invalid.length > 0) {
      messages.push(
        `${handleParse.invalid.length} bad handle${
          handleParse.invalid.length === 1 ? "" : "s"
        }: ${handleParse.invalid.join(", ")}`,
      );
    }
    if (problemParse.invalid.length > 0) {
      messages.push(
        `${problemParse.invalid.length} bad problem${
          problemParse.invalid.length === 1 ? "" : "s"
        }: ${problemParse.invalid.join(", ")}`,
      );
    }

    const knownHandleKeys: Flags = {};
    handles.forEach((handle: string) => {
      knownHandleKeys[keyOf(handle)] = true;
    });
    const candidates: string[] = handleParse.valid.filter(
      (handle: string) => !knownHandleKeys[keyOf(handle)],
    );

    setIsChecking(true);
    try {
      // a handle is only "valid" once codeforces confirms it exists
      const verified: string[] = [];
      const rejected: string[] = [];

      if (candidates.length > 0) {
        setLoadingNote(
          `Verifying ${candidates.length} handle${
            candidates.length === 1 ? "" : "s"
          } on Codeforces…`,
        );
        const checks: HandleCheck[] = await verifyHandles(candidates);
        checks.forEach((check: HandleCheck) => {
          if (check.ok) verified.push(check.handle);
          else rejected.push(check.handle);
        });

        if (rejected.length > 0) {
          messages.push(
            `${rejected.length} handle${
              rejected.length === 1 ? "" : "s"
            } not found on Codeforces: ${rejected.join(", ")}`,
          );
        }
      }

      const mergedProblems: ProblemColumn[] = problems.slice();
      const knownProblemKeys: Flags = {};
      problems.forEach((column: ProblemColumn) => {
        knownProblemKeys[column.key] = true;
      });
      problemParse.valid.forEach((item) => {
        const key: string = getProblemKey(item.problem);
        if (knownProblemKeys[key]) return;
        knownProblemKeys[key] = true;
        mergedProblems.push({ key: key, problem: item.problem });
      });

      const sortedHandles: string[] = sortHandlesAz(handles.concat(verified));
      const sortedProblems: ProblemColumn[] = sortProblemsByNumberThenLetter(
        mergedProblems,
      );

      setHandles(sortedHandles);
      setProblems(sortedProblems);
      setHandleOrders({});
      setProblemOrders({});
      setStatusOrders({});

      // only the accepted entries leave the boxes
      setHandlesInput(handleParse.invalid.concat(rejected).join(", "));
      setProblemsInput(problemParse.invalid.join("\n"));

      if (sortedHandles.length === 0 || sortedProblems.length === 0) {
        messages.push(
          "Need at least one valid handle and one valid problem to build the tables.",
        );
        props.onError(messages.join(" | "));
        return;
      }

      await fetchMatrix(sortedHandles, sortedProblems);
      if (messages.length > 0) props.onSuccess(messages.join(" | "));
      else
        props.onSuccess(
          `Checked ${sortedHandles.length} handle(s) × ${sortedProblems.length} problem(s).`,
        );
    } catch (e) {
      props.onError(e.message);
    } finally {
      setIsChecking(false);
      setLoadingNote("");
    }
  };

  // multiple links can be pasted together, separated by spaces/commas/newlines
  const splitContestLinks = (input: string): string[] => {
    const seen: Set<string> = new Set();
    const links: string[] = [];
    input
      .split(/[\s,]+/)
      .map((token: string) => token.trim())
      .filter((token: string) => token.length > 0)
      .forEach((token: string) => {
        if (seen.has(token)) return;
        seen.add(token);
        links.push(token);
      });
    return links;
  };

  // one group per imported contest — re-importing the same contest reuses its
  // group, and a problem already present from elsewhere is folded into it
  const mergeContestResult = (
    result: ContestImportResult,
    currentProblems: ProblemColumn[],
    currentGroups: ProblemGroup[],
  ): { problems: ProblemColumn[]; groups: ProblemGroup[] } => {
    if (result.problems.length === 0) {
      return { problems: currentProblems, groups: currentGroups };
    }

    const groupId: string = `contest-${result.contestId}`;
    const nextGroups: ProblemGroup[] = currentGroups.some(
      (group: ProblemGroup) => group.id === groupId,
    )
      ? currentGroups.map((group: ProblemGroup) =>
          group.id === groupId
            ? { ...group, name: result.contestName }
            : group,
        )
      : currentGroups.concat({ id: groupId, name: result.contestName });

    const nextProblems: ProblemColumn[] = currentProblems.slice();
    const indexByKey: { [key: string]: number } = {};
    nextProblems.forEach((column: ProblemColumn, index: number) => {
      indexByKey[column.key] = index;
    });

    result.problems.forEach((item: ContestProblemImport) => {
      const key: string = getProblemKey(item.problem);
      const existingIndex: number | undefined = indexByKey[key];
      if (existingIndex !== undefined) {
        const existing: ProblemColumn = nextProblems[existingIndex];
        nextProblems[existingIndex] = {
          ...existing,
          displayLabel: existing.displayLabel || item.displayLabel,
          contestUrl: existing.contestUrl || item.contestUrl,
          originalUrl: existing.originalUrl || item.originalUrl,
          groupId: groupId,
        };
        return;
      }
      indexByKey[key] = nextProblems.length;
      nextProblems.push({
        key: key,
        problem: item.problem,
        displayLabel: item.displayLabel,
        contestUrl: item.contestUrl,
        originalUrl: item.originalUrl,
        groupId: groupId,
      });
    });

    return { problems: nextProblems, groups: nextGroups };
  };

  const runContestImport = async (): Promise<void> => {
    const links: string[] = splitContestLinks(contestLink);
    if (links.length === 0) {
      props.onError("Paste a public Codeforces contest or gym link first.");
      return;
    }

    setIsImportingContest(true);
    try {
      let workingProblems: ProblemColumn[] = problems;
      let workingGroups: ProblemGroup[] = groups;
      const successNotes: string[] = [];
      const errorNotes: string[] = [];

      for (const link of links) {
        try {
          const result: ContestImportResult =
            await importContestFromLink(link);
          const merged = mergeContestResult(
            result,
            workingProblems,
            workingGroups,
          );
          workingProblems = merged.problems;
          workingGroups = merged.groups;
          successNotes.push(
            [`${result.contestName} (${result.kind})`, ...result.messages].join(
              "\n",
            ),
          );
        } catch (e) {
          errorNotes.push(`${link}: ${e.message}`);
        }
      }

      const sortedProblems: ProblemColumn[] =
        sortProblemsByNumberThenLetter(workingProblems);

      setProblems(sortedProblems);
      setGroups(workingGroups);
      setHandleOrders({});
      setProblemOrders({});
      setStatusOrders({});
      setContestNotes(successNotes.concat(errorNotes).join("\n\n"));

      if (handles.length > 0 && sortedProblems.length > 0) {
        await fetchMatrix(handles, sortedProblems);
      }

      if (errorNotes.length > 0) props.onError(errorNotes.join(" | "));
      if (successNotes.length > 0) {
        props.onSuccess(
          `Imported ${links.length - errorNotes.length}/${links.length} contest(s).`,
        );
      }
    } finally {
      setIsImportingContest(false);
      setLoadingNote("");
    }
  };

  const uploadInto = async (
    event: React.ChangeEvent<HTMLInputElement>,
    current: string,
    setValue: (value: string) => void,
    joinWith: string,
  ): Promise<void> => {
    const input: HTMLInputElement = event.target;
    const file: File | null = input.files && input.files[0];
    input.value = "";
    if (!file) return;

    try {
      const text: string = await readFileAsText(file);
      const merged: string =
        current.trim().length > 0 ? `${current}${joinWith}${text}` : text;
      setValue(merged);
    } catch (e) {
      props.onError(e.message);
    }
  };

  // ---------- edits ----------

  const deleteProblem = (key: string): void => {
    const remaining: ProblemColumn[] = problems.filter(
      (column: ProblemColumn) => column.key !== key,
    );
    setProblems(remaining);
    const remainingGroupIds: Flags = {};
    remaining.forEach((column: ProblemColumn) => {
      if (column.groupId) remainingGroupIds[column.groupId] = true;
    });
    setGroups(
      groups.filter((group: ProblemGroup) => remainingGroupIds[group.id]),
    );
    const nextMatrix = { ...matrix };
    delete nextMatrix[key];
    setMatrix(nextMatrix);
    const nextHidden = { ...hiddenProblems };
    delete nextHidden[key];
    setHiddenProblems(nextHidden);
  };

  // ---------- problem groups ----------

  const addGroup = (): void => {
    const id: string = `manual-${manualGroupSeq.current++}`;
    setGroups(groups.concat({ id: id, name: `New group ${groups.length + 1}` }));
  };

  const renameGroup = (groupId: string, name: string): void => {
    setGroups(
      groups.map((group: ProblemGroup) =>
        group.id === groupId ? { ...group, name: name } : group,
      ),
    );
  };

  const removeGroup = (groupId: string): void => {
    setGroups(groups.filter((group: ProblemGroup) => group.id !== groupId));
    setProblems(
      problems.map((column: ProblemColumn) =>
        column.groupId === groupId ? { ...column, groupId: undefined } : column,
      ),
    );
  };

  const setProblemGroup = (key: string, groupId: string | undefined): void => {
    setProblems(
      problems.map((column: ProblemColumn) =>
        column.key === key ? { ...column, groupId: groupId } : column,
      ),
    );
  };

  const toggleGroupVisibility = (groupId: string): void => {
    const memberKeys: string[] = problems
      .filter((column: ProblemColumn) => column.groupId === groupId)
      .map((column: ProblemColumn) => column.key);
    if (memberKeys.length === 0) return;
    const allVisible: boolean = memberKeys.every(
      (key: string) => !hiddenProblems[key],
    );
    const next: Flags = { ...hiddenProblems };
    memberKeys.forEach((key: string) => {
      next[key] = allVisible;
    });
    setHiddenProblems(next);
  };

  const deleteHandle = (handleKey: string): void => {
    setHandles(handles.filter((item: string) => keyOf(item) !== handleKey));

    const nextMatrix: {
      [problemKey: string]: { [handleKey: string]: ProblemStatus };
    } = {};
    Object.keys(matrix).forEach((problemKey: string) => {
      const column = { ...matrix[problemKey] };
      delete column[handleKey];
      nextMatrix[problemKey] = column;
    });
    setMatrix(nextMatrix);

    const nextHidden = { ...hiddenHandles };
    delete nextHidden[handleKey];
    setHiddenHandles(nextHidden);
  };

  // ---------- reorder (per table) ----------

  const reorder = (
    kind: DragKind,
    tableId: string,
    fromVisible: number,
    toVisible: number,
  ): void => {
    if (kind === "handle") {
      const full: string[] = handleKeysFor(tableId);
      const visible: string[] = full.filter((key) => !hiddenHandles[key]);
      const fromKey: string = visible[fromVisible];
      const toKey: string = visible[toVisible];
      if (!fromKey || !toKey) return;
      setHandleOrders({
        ...handleOrders,
        [tableId]: moveItem(full, full.indexOf(fromKey), full.indexOf(toKey)),
      });
      return;
    }

    if (kind === "problem") {
      const full: string[] = problemKeysFor(tableId);
      const visible: string[] = full.filter((key) => !hiddenProblems[key]);
      const fromKey: string = visible[fromVisible];
      const toKey: string = visible[toVisible];
      if (!fromKey || !toKey) return;
      setProblemOrders({
        ...problemOrders,
        [tableId]: moveItem(full, full.indexOf(fromKey), full.indexOf(toKey)),
      });
      return;
    }

    setStatusOrders({
      ...statusOrders,
      [tableId]: moveItem(statusesFor(tableId), fromVisible, toVisible),
    });
  };

  const isDragging = (
    kind: DragKind,
    tableId: string,
    index: number,
  ): boolean =>
    drag !== null &&
    drag.kind === kind &&
    drag.tableId === tableId &&
    drag.index === index;

  const dragHandlers = (kind: DragKind, tableId: string, index: number) => ({
    draggable: true,
    onDragStart: (event: React.DragEvent) => {
      // firefox refuses to start a drag without payload
      event.dataTransfer.setData("text/plain", `${tableId}:${kind}:${index}`);
      event.dataTransfer.effectAllowed = "move";
      setDrag({ kind: kind, tableId: tableId, index: index });
    },
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      // drops only apply inside the same table, so tables stay independent
      if (drag && drag.kind === kind && drag.tableId === tableId) {
        reorder(kind, tableId, drag.index, index);
      }
      setDrag(null);
    },
    onDragEnd: () => setDrag(null),
  });

  const sortHandleRows = (tableId: string): void => {
    const sorted: string[] = sortHandlesAz(
      handleKeysFor(tableId).map((key: string) => handleByKey[key] || key),
    ).map(keyOf);
    setHandleOrders({ ...handleOrders, [tableId]: sorted });
  };

  const sortProblemColumns = (tableId: string): void => {
    const columns: ProblemColumn[] = problemKeysFor(tableId)
      .map((key: string) => problemByKey[key])
      .filter(Boolean);
    setProblemOrders({
      ...problemOrders,
      [tableId]: sortProblemsByNumberThenLetter(columns).map(
        (column: ProblemColumn) => column.key,
      ),
    });
  };

  // ---------- export ----------

  const exportTables = (): void => {
    if (shownHandleKeys.length === 0 || shownProblems.length === 0) {
      props.onError("Nothing to export. Press Check and show at least one row.");
      return;
    }

    const buildProblemHeaders = (tableId: string): string[] =>
      visibleProblemsFor(tableId).map((column: ProblemColumn) =>
        labelOf(column),
      );

    const handleStatusRows: string[][] = [
      ["Handle"].concat(buildProblemHeaders(TABLE_HANDLE_STATUS)),
    ];
    visibleHandlesFor(TABLE_HANDLE_STATUS).forEach((handleKey: string) => {
      const row: string[] = [handleByKey[handleKey] || handleKey];
      visibleProblemsFor(TABLE_HANDLE_STATUS).forEach(
        (column: ProblemColumn) => {
          const status: ProblemStatus | null = statusAt(handleKey, column.key);
          row.push(status ? statusLabels[status] : "");
        },
      );
      handleStatusRows.push(row);
    });

    const statusNameRows: string[][] = [
      ["Status"].concat(buildProblemHeaders(TABLE_STATUS_NAMES)),
    ];
    statusesFor(TABLE_STATUS_NAMES).forEach((status: ProblemStatus) => {
      const row: string[] = [statusLabels[status]];
      visibleProblemsFor(TABLE_STATUS_NAMES).forEach(
        (column: ProblemColumn) => {
          const names: string[] = namesForStatus(column.key, status);
          row.push(names.length > 0 ? names.join(", ") : "none");
        },
      );
      statusNameRows.push(row);
    });

    const statusCountRows: string[][] = [
      ["Status"].concat(buildProblemHeaders(TABLE_STATUS_COUNTS)),
    ];
    statusesFor(TABLE_STATUS_COUNTS).forEach((status: ProblemStatus) => {
      const row: string[] = [statusLabels[status]];
      visibleProblemsFor(TABLE_STATUS_COUNTS).forEach(
        (column: ProblemColumn) => {
          row.push(String(namesForStatus(column.key, status).length));
        },
      );
      statusCountRows.push(row);
    });

    const problemsPerPersonRows: string[][] = [
      ["Handle"].concat(
        statusesFor(TABLE_PROBLEMS_BY_PERSON).map(
          (status: ProblemStatus) => statusLabels[status],
        ),
      ),
    ];
    visibleHandlesFor(TABLE_PROBLEMS_BY_PERSON).forEach((handleKey: string) => {
      const row: string[] = [handleByKey[handleKey] || handleKey];
      statusesFor(TABLE_PROBLEMS_BY_PERSON).forEach((status: ProblemStatus) => {
        const labels: string[] = problemsForHandleStatus(handleKey, status);
        row.push(labels.length > 0 ? labels.join(", ") : "none");
      });
      problemsPerPersonRows.push(row);
    });

    const totalsRows: string[][] = [
      ["Handle"].concat(
        statusesFor(TABLE_TOTALS).map(
          (status: ProblemStatus) => statusLabels[status],
        ),
      ),
    ];
    visibleHandlesFor(TABLE_TOTALS).forEach((handleKey: string) => {
      const row: string[] = [handleByKey[handleKey] || handleKey];
      statusesFor(TABLE_TOTALS).forEach((status: ProblemStatus) => {
        row.push(String(problemsForHandleStatus(handleKey, status).length));
      });
      totalsRows.push(row);
    });

    downloadExcelSheets("problem-status-tables.xls", [
      { name: "Handle status", rows: handleStatusRows },
      { name: "Status names", rows: statusNameRows },
      { name: "Status counts", rows: statusCountRows },
      { name: "Problems per person", rows: problemsPerPersonRows },
      { name: "Totals per person", rows: totalsRows },
    ]);
  };

  // ---------- render helpers ----------

  // Prefer the resolved original Codeforces problem link (same page the
  // "practice" button on codeforces.com opens); fall back to the in-contest
  // page when the API couldn't confirm an original source.
  const urlOf = (column: ProblemColumn): string =>
    column.originalUrl || column.contestUrl || getProblemUrl(column.problem);

  const renderProblemHeaders = (tableId: string) =>
    visibleProblemsFor(tableId).map((column: ProblemColumn, index: number) => (
      <Th
        key={column.key}
        $dragging={isDragging("problem", tableId, index)}
        title="Drag to reorder this table's columns"
        {...dragHandlers("problem", tableId, index)}
      >
        <HeaderCell>
          <ProblemLinkText
            href={urlOf(column)}
            target="_blank"
            rel="noreferrer"
            title={
              column.contestUrl && column.contestUrl !== urlOf(column)
                ? `In-contest page: ${column.contestUrl}`
                : urlOf(column)
            }
            onClick={(event) => event.stopPropagation()}
          >
            {labelOf(column)}
          </ProblemLinkText>
          <DeleteButton
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              deleteProblem(column.key);
            }}
          >
            Delete
          </DeleteButton>
        </HeaderCell>
      </Th>
    ));

  const renderStatusHeaders = (tableId: string) =>
    statusesFor(tableId).map((status: ProblemStatus, index: number) => (
      <Th
        key={status}
        $dragging={isDragging("status", tableId, index)}
        title="Drag to reorder this table's columns"
        {...dragHandlers("status", tableId, index)}
      >
        <span style={{ color: statusColors[status] }}>
          {statusLabels[status]}
        </span>
      </Th>
    ));

  const renderHandleCell = (
    tableId: string,
    handleKey: string,
    index: number,
  ) => (
    <StickyTd
      $dragging={isDragging("handle", tableId, index)}
      title="Drag to reorder this table's rows"
      {...dragHandlers("handle", tableId, index)}
    >
      <HeaderCell>
        <span>{handleByKey[handleKey] || handleKey}</span>
        <DeleteButton
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            deleteHandle(handleKey);
          }}
        >
          Delete
        </DeleteButton>
      </HeaderCell>
    </StickyTd>
  );

  const renderStatusCell = (
    tableId: string,
    status: ProblemStatus,
    index: number,
  ) => (
    <StickyTd
      $accent={statusColors[status]}
      $dragging={isDragging("status", tableId, index)}
      title="Drag to reorder this table's rows"
      {...dragHandlers("status", tableId, index)}
    >
      {statusLabels[status]}
    </StickyTd>
  );

  // ---------- filters ----------

  const sortedHandleFilterKeys: string[] = sortHandlesAz(handles).map(keyOf);
  const sortedProblemFilterColumns: ProblemColumn[] =
    sortProblemsByNumberThenLetter(problems);

  const setAllHandlesHidden = (hidden: boolean): void => {
    const next: Flags = {};
    if (hidden) handles.forEach((handle: string) => (next[keyOf(handle)] = true));
    setHiddenHandles(next);
  };

  const setAllProblemsHidden = (hidden: boolean): void => {
    const next: Flags = {};
    if (hidden)
      problems.forEach((column: ProblemColumn) => (next[column.key] = true));
    setHiddenProblems(next);
  };

  const filteredHandleKeys: string[] = sortedHandleFilterKeys.filter(
    (key: string) =>
      (handleByKey[key] || key)
        .toLowerCase()
        .indexOf(handleSearch.trim().toLowerCase()) !== -1,
  );

  const filteredProblemColumns: ProblemColumn[] =
    sortedProblemFilterColumns.filter(
      (column: ProblemColumn) =>
        labelOf(column)
          .toLowerCase()
          .indexOf(problemSearch.trim().toLowerCase()) !== -1,
    );

  const columnsInGroup = (groupId: string | undefined): ProblemColumn[] =>
    filteredProblemColumns.filter(
      (column: ProblemColumn) => (column.groupId || undefined) === groupId,
    );

  const ungroupedColumns: ProblemColumn[] = columnsInGroup(undefined);

  const hasTables: boolean = handles.length > 0 && problems.length > 0;
  const canShowTables: boolean =
    shownHandleKeys.length > 0 && shownProblems.length > 0;

  return (
    <Panel>
      <HeaderBlock>
        <div>
          <Title>Users-Problems Cross Analysis</Title>
          <Subtitle>
            Cross-check people against problems (formerly Tables). Check adds
            only handles that exist on Codeforces; invalid entries stay in the
            box. Each table sorts and drags independently.
          </Subtitle>
        </div>

        <StatsRow>
          <StatPill>
            <StatLabel>Handles shown</StatLabel>
            <StatValue>
              {shownHandleKeys.length}
              {handles.length !== shownHandleKeys.length ? (
                <StatSub>of {handles.length}</StatSub>
              ) : null}
            </StatValue>
          </StatPill>
          <StatPill>
            <StatLabel>Problems shown</StatLabel>
            <StatValue>
              {shownProblems.length}
              {problems.length !== shownProblems.length ? (
                <StatSub>of {problems.length}</StatSub>
              ) : null}
            </StatValue>
          </StatPill>
        </StatsRow>
      </HeaderBlock>

      <ContestBlock>
        <ContestTitle>Import from contest link</ContestTitle>
        <ContestHint>
          Paste one or more public contest/gym URLs (or numeric ids),
          separated by spaces, commas, or new lines. Import pulls the{" "}
          <strong>problem list only</strong> and groups each contest's
          problems together in "Filter problems" below. Private / group
          contests are not supported.
        </ContestHint>
        <FieldLabel htmlFor="contest-link">Contest link(s)</FieldLabel>
        <InputArea
          id="contest-link"
          placeholder={
            "https://codeforces.com/contest/2040, https://codeforces.com/gym/102644\n2043"
          }
          value={contestLink}
          onChange={(event) => setContestLink(event.target.value)}
          style={{ minHeight: 56 }}
        ></InputArea>

        <Actions>
          <OutlineButton
            type="button"
            disabled={isImportingContest || isChecking}
            onClick={runContestImport}
          >
            {isImportingContest ? "Importing…" : "Import contest(s)"}
          </OutlineButton>
        </Actions>

        {contestNotes ? <ContestNotes>{contestNotes}</ContestNotes> : null}
      </ContestBlock>

      <InputsGrid>
        <FieldBlock>
          <FieldLabel htmlFor="table-handles">
            Handles for cross analysis
          </FieldLabel>
          <InputArea
            id="table-handles"
            placeholder="haitham2005, Logic_PS, saado, taketaketake"
            value={handlesInput}
            onChange={(event) => setHandlesInput(event.target.value)}
          ></InputArea>
          <Actions>
            <OutlineButton
              type="button"
              onClick={() =>
                handlesFileRef.current && handlesFileRef.current.click()
              }
            >
              Upload handles
            </OutlineButton>
            <HiddenFileInput
              ref={handlesFileRef}
              type="file"
              accept=".txt,.csv,.tsv,text/plain,text/csv"
              onChange={(event) =>
                uploadInto(event, handlesInput, setHandlesInput, ", ")
              }
            ></HiddenFileInput>
          </Actions>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel htmlFor="table-problems">Problems</FieldLabel>
          <InputArea
            id="table-problems"
            placeholder={
              "https://codeforces.com/contest/2240/problem/A\n2240B\n2240C"
            }
            value={problemsInput}
            onChange={(event) => setProblemsInput(event.target.value)}
          ></InputArea>
          <Actions>
            <OutlineButton
              type="button"
              onClick={() =>
                problemsFileRef.current && problemsFileRef.current.click()
              }
            >
              Upload problems
            </OutlineButton>
            <HiddenFileInput
              ref={problemsFileRef}
              type="file"
              accept=".txt,.csv,.tsv,text/plain,text/csv"
              onChange={(event) =>
                uploadInto(event, problemsInput, setProblemsInput, "\n")
              }
            ></HiddenFileInput>
          </Actions>
        </FieldBlock>
      </InputsGrid>

      <MainActions>
        <OutlineButton type="button" disabled={isChecking} onClick={runCheck}>
          {isChecking ? "Checking…" : "Check"}
        </OutlineButton>

        {hasTables ? (
          <React.Fragment>
            {openFilter !== null ? (
              <FilterBackdrop onClick={() => setOpenFilter(null)}></FilterBackdrop>
            ) : null}

            <FilterAnchor>
              <OutlineButton
                type="button"
                onClick={() =>
                  setOpenFilter(openFilter === "handles" ? null : "handles")
                }
              >
                Filter handles ({shownHandleKeys.length}/{handles.length})
              </OutlineButton>
              {openFilter === "handles" ? (
                <FilterPanel>
                  <FilterTitle>Show handles</FilterTitle>
                  <SearchInput
                    placeholder="Search handle…"
                    value={handleSearch}
                    onChange={(event) => setHandleSearch(event.target.value)}
                  ></SearchInput>
                  <FilterActions>
                    <MiniButton
                      type="button"
                      onClick={() => setAllHandlesHidden(false)}
                    >
                      Show all
                    </MiniButton>
                    <MiniButton
                      type="button"
                      onClick={() => setAllHandlesHidden(true)}
                    >
                      Hide all
                    </MiniButton>
                    <MiniButton
                      type="button"
                      onClick={() => setOpenFilter(null)}
                    >
                      Close
                    </MiniButton>
                  </FilterActions>
                  <FilterList>
                    {filteredHandleKeys.length === 0 ? (
                      <FilterEmpty>No handle matches the search.</FilterEmpty>
                    ) : (
                      filteredHandleKeys.map((key: string) => (
                        <FilterItem key={key}>
                          <input
                            type="checkbox"
                            checked={!hiddenHandles[key]}
                            onChange={() =>
                              setHiddenHandles({
                                ...hiddenHandles,
                                [key]: !hiddenHandles[key],
                              })
                            }
                          ></input>
                          <span>{handleByKey[key] || key}</span>
                        </FilterItem>
                      ))
                    )}
                  </FilterList>
                </FilterPanel>
              ) : null}
            </FilterAnchor>

            <FilterAnchor>
              <OutlineButton
                type="button"
                onClick={() =>
                  setOpenFilter(openFilter === "problems" ? null : "problems")
                }
              >
                Filter problems ({shownProblems.length}/{problems.length})
              </OutlineButton>
              {openFilter === "problems" ? (
                <FilterPanel>
                  <FilterTitle>Show problems</FilterTitle>
                  <SearchInput
                    placeholder="Search problem…"
                    value={problemSearch}
                    onChange={(event) => setProblemSearch(event.target.value)}
                  ></SearchInput>
                  <FilterActions>
                    <MiniButton
                      type="button"
                      onClick={() => setAllProblemsHidden(false)}
                    >
                      Show all
                    </MiniButton>
                    <MiniButton
                      type="button"
                      onClick={() => setAllProblemsHidden(true)}
                    >
                      Hide all
                    </MiniButton>
                    <MiniButton type="button" onClick={addGroup}>
                      + New group
                    </MiniButton>
                    <MiniButton
                      type="button"
                      onClick={() => setOpenFilter(null)}
                    >
                      Close
                    </MiniButton>
                  </FilterActions>
                  <FilterList style={{ maxHeight: 320 }}>
                    {filteredProblemColumns.length === 0 ? (
                      <FilterEmpty>No problem matches the search.</FilterEmpty>
                    ) : null}

                    {groups.map((group: ProblemGroup) => {
                      const members: ProblemColumn[] = columnsInGroup(
                        group.id,
                      );
                      const allVisible: boolean =
                        members.length > 0 &&
                        members.every(
                          (column: ProblemColumn) =>
                            !hiddenProblems[column.key],
                        );
                      const someVisible: boolean = members.some(
                        (column: ProblemColumn) =>
                          !hiddenProblems[column.key],
                      );
                      return (
                        <GroupBlock
                          key={group.id}
                          $over={dragOverGroup === group.id}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOverGroup(group.id);
                          }}
                          onDragLeave={() => setDragOverGroup(null)}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (draggedProblemKey) {
                              setProblemGroup(draggedProblemKey, group.id);
                            }
                            setDragOverGroup(null);
                            setDraggedProblemKey(null);
                          }}
                        >
                          <GroupHeader>
                            <input
                              type="checkbox"
                              checked={allVisible}
                              ref={(el) => {
                                if (el)
                                  el.indeterminate =
                                    !allVisible && someVisible;
                              }}
                              onChange={() => toggleGroupVisibility(group.id)}
                              title="Show/hide every problem in this group"
                            ></input>
                            <GroupNameInput
                              value={group.name}
                              onChange={(event) =>
                                renameGroup(group.id, event.target.value)
                              }
                            ></GroupNameInput>
                            <GroupCount>{members.length}</GroupCount>
                            <UngroupButton
                              type="button"
                              onClick={() => removeGroup(group.id)}
                              title="Remove this group (problems stay, ungrouped)"
                            >
                              Ungroup
                            </UngroupButton>
                          </GroupHeader>
                          {members.length === 0 ? (
                            <FilterEmpty>Drag a problem here</FilterEmpty>
                          ) : (
                            members.map((column: ProblemColumn) => (
                              <FilterItem
                                key={column.key}
                                draggable
                                onDragStart={() =>
                                  setDraggedProblemKey(column.key)
                                }
                                onDragEnd={() => {
                                  setDraggedProblemKey(null);
                                  setDragOverGroup(null);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={!hiddenProblems[column.key]}
                                  onChange={() =>
                                    setHiddenProblems({
                                      ...hiddenProblems,
                                      [column.key]: !hiddenProblems[column.key],
                                    })
                                  }
                                ></input>
                                <span>{labelOf(column)}</span>
                              </FilterItem>
                            ))
                          )}
                        </GroupBlock>
                      );
                    })}

                    {ungroupedColumns.length > 0 || groups.length > 0 ? (
                      <GroupBlock
                        $over={dragOverGroup === UNGROUPED}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragOverGroup(UNGROUPED);
                        }}
                        onDragLeave={() => setDragOverGroup(null)}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggedProblemKey) {
                            setProblemGroup(draggedProblemKey, undefined);
                          }
                          setDragOverGroup(null);
                          setDraggedProblemKey(null);
                        }}
                      >
                        {groups.length > 0 ? (
                          <GroupHeader>
                            <GroupNameInput
                              as="span"
                              style={{ color: theme.textMuted }}
                            >
                              Ungrouped
                            </GroupNameInput>
                            <GroupCount>{ungroupedColumns.length}</GroupCount>
                          </GroupHeader>
                        ) : null}
                        {ungroupedColumns.map((column: ProblemColumn) => (
                          <FilterItem
                            key={column.key}
                            draggable
                            onDragStart={() =>
                              setDraggedProblemKey(column.key)
                            }
                            onDragEnd={() => {
                              setDraggedProblemKey(null);
                              setDragOverGroup(null);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!hiddenProblems[column.key]}
                              onChange={() =>
                                setHiddenProblems({
                                  ...hiddenProblems,
                                  [column.key]: !hiddenProblems[column.key],
                                })
                              }
                            ></input>
                            <span>{labelOf(column)}</span>
                          </FilterItem>
                        ))}
                      </GroupBlock>
                    ) : null}
                  </FilterList>
                </FilterPanel>
              ) : null}
            </FilterAnchor>

            <OutlineButton type="button" onClick={exportTables}>
              Export all tables
            </OutlineButton>
          </React.Fragment>
        ) : null}
      </MainActions>

      {loadingNote ? <LoadingNote>{loadingNote}</LoadingNote> : null}

      {hasTables && !canShowTables ? (
        <SectionHint>
          Everything is hidden by the filters. Use “Show all” to bring rows and
          columns back.
        </SectionHint>
      ) : null}

      {canShowTables ? (
        <React.Fragment>
          <Divider />

          <TableCard>
            <SectionHeader>
              <SectionTitle>
                <SectionIndex>1</SectionIndex>
                By handle — status per problem
              </SectionTitle>
              <Actions>
                <OutlineButton
                  type="button"
                  onClick={() => sortHandleRows(TABLE_HANDLE_STATUS)}
                >
                  Sort rows
                </OutlineButton>
                <OutlineButton
                  type="button"
                  onClick={() => sortProblemColumns(TABLE_HANDLE_STATUS)}
                >
                  Sort columns
                </OutlineButton>
              </Actions>
            </SectionHeader>
            <SectionHint>
              Rows are people, columns are problems, each cell is that person's
              status.
            </SectionHint>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th $static $sticky>
                      Handle
                    </Th>
                    {renderProblemHeaders(TABLE_HANDLE_STATUS)}
                  </tr>
                </thead>
                <tbody>
                  {visibleHandlesFor(TABLE_HANDLE_STATUS).map(
                    (handleKey: string, rowIndex: number) => (
                      <tr key={handleKey}>
                        {renderHandleCell(
                          TABLE_HANDLE_STATUS,
                          handleKey,
                          rowIndex,
                        )}
                        {visibleProblemsFor(TABLE_HANDLE_STATUS).map(
                          (column: ProblemColumn) => {
                            const status: ProblemStatus | null = statusAt(
                              handleKey,
                              column.key,
                            );
                            return (
                              <Td key={column.key}>
                                {status ? (
                                  <StatusChip $accent={statusColors[status]}>
                                    {statusShort[status]}
                                  </StatusChip>
                                ) : (
                                  <EmptyCell>—</EmptyCell>
                                )}
                              </Td>
                            );
                          },
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </Table>
            </TableScroll>
          </TableCard>

          <TableCard>
            <SectionHeader>
              <SectionTitle>
                <SectionIndex>2</SectionIndex>
                By status — names
              </SectionTitle>
              <Actions>
                <OutlineButton
                  type="button"
                  onClick={() => sortProblemColumns(TABLE_STATUS_NAMES)}
                >
                  Sort columns
                </OutlineButton>
              </Actions>
            </SectionHeader>
            <SectionHint>
              Rows are statuses, columns are problems, each cell lists the names
              (A→Z).
            </SectionHint>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th $static $sticky>
                      Status
                    </Th>
                    {renderProblemHeaders(TABLE_STATUS_NAMES)}
                  </tr>
                </thead>
                <tbody>
                  {statusesFor(TABLE_STATUS_NAMES).map(
                    (status: ProblemStatus, rowIndex: number) => (
                      <tr key={status}>
                        {renderStatusCell(
                          TABLE_STATUS_NAMES,
                          status,
                          rowIndex,
                        )}
                        {visibleProblemsFor(TABLE_STATUS_NAMES).map(
                          (column: ProblemColumn) => {
                            const names: string[] = namesForStatus(
                              column.key,
                              status,
                            );
                            return (
                              <Td key={column.key}>
                                {names.length > 0 ? (
                                  names.join(", ")
                                ) : (
                                  <EmptyCell>{emptyMessages[status]}</EmptyCell>
                                )}
                              </Td>
                            );
                          },
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </Table>
            </TableScroll>
          </TableCard>

          <TableCard>
            <SectionHeader>
              <SectionTitle>
                <SectionIndex>3</SectionIndex>
                By status — counts
              </SectionTitle>
              <Actions>
                <OutlineButton
                  type="button"
                  onClick={() => sortProblemColumns(TABLE_STATUS_COUNTS)}
                >
                  Sort columns
                </OutlineButton>
              </Actions>
            </SectionHeader>
            <SectionHint>
              Same shape as table 2, but each cell is how many people are in
              that group. Empty shows 0.
            </SectionHint>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th $static $sticky>
                      Status
                    </Th>
                    {renderProblemHeaders(TABLE_STATUS_COUNTS)}
                  </tr>
                </thead>
                <tbody>
                  {statusesFor(TABLE_STATUS_COUNTS).map(
                    (status: ProblemStatus, rowIndex: number) => (
                      <tr key={status}>
                        {renderStatusCell(
                          TABLE_STATUS_COUNTS,
                          status,
                          rowIndex,
                        )}
                        {visibleProblemsFor(TABLE_STATUS_COUNTS).map(
                          (column: ProblemColumn) => (
                            <CountCell
                              key={column.key}
                              $accent={statusColors[status]}
                            >
                              {namesForStatus(column.key, status).length}
                            </CountCell>
                          ),
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </Table>
            </TableScroll>
          </TableCard>

          <TableCard>
            <SectionHeader>
              <SectionTitle>
                <SectionIndex>4</SectionIndex>
                By handle — problems per status
              </SectionTitle>
              <Actions>
                <OutlineButton
                  type="button"
                  onClick={() => sortHandleRows(TABLE_PROBLEMS_BY_PERSON)}
                >
                  Sort rows
                </OutlineButton>
              </Actions>
            </SectionHeader>
            <SectionHint>
              Rows are people, columns are statuses, each cell lists that
              person's problems.
            </SectionHint>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th $static $sticky>
                      Handle
                    </Th>
                    {renderStatusHeaders(TABLE_PROBLEMS_BY_PERSON)}
                  </tr>
                </thead>
                <tbody>
                  {visibleHandlesFor(TABLE_PROBLEMS_BY_PERSON).map(
                    (handleKey: string, rowIndex: number) => (
                      <tr key={handleKey}>
                        {renderHandleCell(
                          TABLE_PROBLEMS_BY_PERSON,
                          handleKey,
                          rowIndex,
                        )}
                        {statusesFor(TABLE_PROBLEMS_BY_PERSON).map(
                          (status: ProblemStatus) => {
                            const labels: string[] = problemsForHandleStatus(
                              handleKey,
                              status,
                            );
                            return (
                              <Td key={status}>
                                {labels.length > 0 ? (
                                  labels.join(", ")
                                ) : (
                                  <EmptyCell>none</EmptyCell>
                                )}
                              </Td>
                            );
                          },
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </Table>
            </TableScroll>
          </TableCard>

          <TableCard>
            <SectionHeader>
              <SectionTitle>
                <SectionIndex>5</SectionIndex>
                Totals per person
              </SectionTitle>
              <Actions>
                <OutlineButton
                  type="button"
                  onClick={() => sortHandleRows(TABLE_TOTALS)}
                >
                  Sort rows
                </OutlineButton>
              </Actions>
            </SectionHeader>
            <SectionHint>
              How many problems each person accepted, tried, or never
              submitted.
            </SectionHint>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th $static $sticky>
                      Handle
                    </Th>
                    {renderStatusHeaders(TABLE_TOTALS)}
                  </tr>
                </thead>
                <tbody>
                  {visibleHandlesFor(TABLE_TOTALS).map(
                    (handleKey: string, rowIndex: number) => (
                      <tr key={handleKey}>
                        {renderHandleCell(TABLE_TOTALS, handleKey, rowIndex)}
                        {statusesFor(TABLE_TOTALS).map(
                          (status: ProblemStatus) => (
                            <CountCell
                              key={status}
                              $accent={statusColors[status]}
                            >
                              {problemsForHandleStatus(handleKey, status).length}
                            </CountCell>
                          ),
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </Table>
            </TableScroll>
          </TableCard>
        </React.Fragment>
      ) : null}
    </Panel>
  );
};

export default ProblemCheck;
