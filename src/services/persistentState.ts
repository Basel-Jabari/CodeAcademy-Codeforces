import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { loadState, saveState } from "./storage";

type InitialValue<T> = T | (() => T);
type ReviveValue<T> = (stored: T) => T;

function resolveInitial<T>(initialValue: InitialValue<T>): T {
  return typeof initialValue === "function"
    ? (initialValue as () => T)()
    : initialValue;
}

/**
 * React state that behaves normally in memory and mirrors itself to
 * localStorage. A reviver can repair data that needs fresh runtime IDs.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: InitialValue<T>,
  revive?: ReviveValue<T>,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const fallback: T = resolveInitial(initialValue);
    const stored: T = loadState<T>(key, fallback);

    if (!revive) return stored;
    try {
      return revive(stored);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    saveState<T>(key, value);
  }, [key, value]);

  return [value, setValue];
}
