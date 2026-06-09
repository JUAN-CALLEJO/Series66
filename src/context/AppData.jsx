import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api, getToken, setToken, pingBackend } from '../api/client.js';
import { useLocalStorage, useLocalStorageSet } from '../hooks/useLocalStorage.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const union = (a, b) => [...new Set([...(a || []), ...(b || [])])];

export function AppDataProvider({ children }) {
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState(false);
  const [booted, setBooted] = useState(false);

  // Local-first state (works offline / as guest)
  const visited = useLocalStorageSet('s66.visited');
  const missed = useLocalStorageSet('s66.missed');
  const [plan, setPlan] = useLocalStorage('s66.plan', []);
  const [results, setResults] = useLocalStorage('s66.results', []);

  const syncTimer = useRef(null);
  const hydrating = useRef(false);

  // ---- boot: detect backend + restore session ----
  useEffect(() => {
    let alive = true;
    (async () => {
      const up = await pingBackend();
      if (!alive) return;
      setOnline(up);
      if (up && getToken()) {
        try {
          const { user: me } = await api.me();
          if (!alive) return;
          setUser(me);
          await hydrate();
        } catch {
          setToken(null);
        }
      }
      setBooted(true);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull server state and merge with local (nothing is lost), then push union up.
  const hydrate = useCallback(async () => {
    hydrating.current = true;
    try {
      const [prog, res] = await Promise.all([api.getProgress(), api.getResults()]);
      const mergedVisited = union(visited.items, prog.visited);
      const mergedMissed = union(missed.items, prog.missed);
      const mergedPlan = union(plan, prog.plan);
      visited.replace(mergedVisited);
      missed.replace(mergedMissed);
      setPlan(mergedPlan);
      // Results: server is source of truth once signed in.
      setResults(Array.isArray(res) ? res : []);
      await api.putProgress({ visited: mergedVisited, missed: mergedMissed, plan: mergedPlan });
    } finally {
      hydrating.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited.items, missed.items, plan]);

  // ---- debounced progress sync when signed in ----
  useEffect(() => {
    if (!user || !online || hydrating.current) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      api.putProgress({ visited: visited.items, missed: missed.items, plan }).catch(() => {});
    }, 700);
    return () => clearTimeout(syncTimer.current);
  }, [visited.items, missed.items, plan, user, online]);

  // ---- auth actions ----
  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login({ email, password });
    setToken(token);
    setUser(u);
    await hydrate();
    return u;
  }, [hydrate]);

  const register = useCallback(async (email, password, name) => {
    const { token, user: u } = await api.register({ email, password, name });
    setToken(token);
    setUser(u);
    await hydrate();
    return u;
  }, [hydrate]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // ---- record a finished exam/quiz ----
  const recordResult = useCallback(async (result) => {
    const local = {
      id: `local-${Date.now()}`,
      pct: Math.round((result.score / result.total) * 100),
      passed: Math.round((result.score / result.total) * 100) >= 73,
      createdAt: new Date().toISOString(),
      ...result,
    };
    setResults((prev) => [local, ...prev].slice(0, 200));
    if (user && online) {
      try {
        const saved = await api.addResult(result);
        setResults((prev) => [saved, ...prev.filter((r) => r.id !== local.id)].slice(0, 200));
      } catch { /* keep local copy */ }
    }
  }, [user, online, setResults]);

  const value = {
    user, online, booted,
    login, register, logout,
    visited, missed, plan, setPlan,
    results, recordResult,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
