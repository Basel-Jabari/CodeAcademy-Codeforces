import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { loadState, saveState } from "./storage";

type InitialValue<T> = T | (() => T);
type ReviveValue<T> = (stored: T) => T;

// Typing in a text field would otherwise write to localStorage on every
// keystroke, which is a synchronous main-thread cost on large tables.
const writeDelayMs: number = 200;

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

  const latest = useRef<T>(value);
  const isRestoredValue = useRef<boolean>(true);
  const hasPendingWrite = useRef<boolean>(false);

  useEffect(() => {
    latest.current = value;

    // the first value came straight out of storage, so re-saving it is noise
    if (isRestoredValue.current) {
      isRestoredValue.current = false;
      return;
    }

    hasPendingWrite.current = true;
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      saveState<T>(key, latest.current);
      hasPendingWrite.current = false;
    }, writeDelayMs);

    return () => clearTimeout(timer);
  }, [key, value]);

  // A delayed write must still land when the tab is hidden, closed, or
  // unmounted, otherwise leaving the site can drop the newest edit.
  useEffect(() => {
    const flush = (): void => {
      if (!hasPendingWrite.current) return;
      saveState<T>(key, latest.current);
      hasPendingWrite.current = false;
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
      flush();
    };
  }, [key]);

  return [value, setValue];
}
