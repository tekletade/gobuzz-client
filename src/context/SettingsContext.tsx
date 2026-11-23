import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { SettingEntry, SettingsKey } from '../lib/settingsKeys';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Visitors re-fetch settings on this interval so admin edits show up
// without a manual page refresh.
const POLL_INTERVAL_MS = 60_000;

interface SettingsContextType {
  settings: Partial<Record<SettingsKey, string>>;
  loading: boolean;
  refresh: () => Promise<void>;
  get: (key: SettingsKey, fallback?: string) => string;
  getEntry: (key: SettingsKey) => SettingEntry | undefined;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  loading: true,
  refresh: async () => {},
  get: (_key, fallback) => fallback || '',
  getEntry: () => undefined,
});

// Avoid re-rendering the whole tree (and re-running ThemeApplier /
// FontLoader effects) when a poll returns identical data.
function shallowEqual(
  a: Record<string, SettingEntry>,
  b: Record<string, SettingEntry>
): boolean {
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) return false;
  return aKeys.every(
    (k) => a[k]?.value === b[k]?.value && a[k]?.type === b[k]?.type
  );
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, SettingEntry>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/settings`);
      const data: Record<string, SettingEntry> = res.data.data || {};
      setEntries((prev) => (shallowEqual(prev, data) ? prev : data));
    } catch (error) {
      // Keep the previous entries on poll failures; on first load this
      // simply leaves settings empty (same as before).
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const settings = useMemo(() => {
    const values: Partial<Record<SettingsKey, string>> = {};
    for (const [key, entry] of Object.entries(entries)) {
      values[key as SettingsKey] = entry?.value ?? '';
    }
    return values;
  }, [entries]);

  const getEntry = useCallback((key: SettingsKey) => entries[key], [entries]);

  const get = useCallback(
    (key: SettingsKey, fallback = '') => entries[key]?.value || fallback,
    [entries]
  );

  const value = useMemo(
    () => ({ settings, loading, refresh: load, get, getEntry }),
    [settings, loading, load, get, getEntry]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
