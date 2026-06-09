import { useState, useEffect, useCallback } from 'react';

// Persist a piece of state to localStorage, surviving reloads.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [key, value]);

  return [value, setValue];
}

// Convenience hook for a Set persisted as an array.
export function useLocalStorageSet(key) {
  const [arr, setArr] = useLocalStorage(key, []);
  const has = useCallback((id) => arr.includes(id), [arr]);
  const add = useCallback((id) => setArr((prev) => (prev.includes(id) ? prev : [...prev, id])), [setArr]);
  const remove = useCallback((id) => setArr((prev) => prev.filter((x) => x !== id)), [setArr]);
  const toggle = useCallback(
    (id) => setArr((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setArr]
  );
  const clear = useCallback(() => setArr([]), [setArr]);
  const replace = useCallback((next) => setArr([...new Set(next)]), [setArr]);
  return { items: arr, has, add, remove, toggle, clear, replace, size: arr.length };
}
