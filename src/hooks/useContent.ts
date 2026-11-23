import { useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import type { BaseSettingsKey, SettingEntry } from '../lib/settingsKeys';

/**
 * Reads content from settings DB first, then falls back to translation JSON.
 *
 * Lookup order:
 *  1. Amharic DB value ("{key}.am") when the UI language is Amharic
 *  2. Default (English) DB value
 *  3. Translation JSON (locales/*.json) via the optional translationKey
 *
 * Parsing is driven by the settings `type` column:
 *  - type 'json'       → JSON.parse (arrays/objects)
 *  - key ends .tags    → pipe-separated list split into an array
 *  - anything else     → raw string
 *
 * The return type is `any` on purpose: values may be strings, arrays or
 * objects depending on the setting. Key typos ARE compile errors — the
 * first argument is typed against the registry in lib/settingsKeys.ts.
 */

// Pipe-separated convention: only applies to tag lists
// ("Strength|Conditioning|Mobility"), not to arbitrary text.
const TAGS_KEY_PATTERN = /\.tags$/;

const isBlank = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

export function useContent() {
  const { getEntry } = useSettings();
  const { i18n, t } = useTranslation();

  const isAmharic = i18n.language === 'am';

  return useMemo(() => {
    const lookup = (key: BaseSettingsKey, translationKey?: string): any => {
      let entry: SettingEntry | undefined;

      // 1. Amharic version from settings (blank values fall through)
      if (isAmharic) {
        const amEntry = getEntry(`${key}.am`);
        if (!isBlank(amEntry?.value)) entry = amEntry;
      }

      // 2. Default version from settings
      if (!entry) {
        const baseEntry = getEntry(key);
        if (!isBlank(baseEntry?.value)) entry = baseEntry;
      }

      // 3. Fall back to translation JSON
      if (!entry && translationKey) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const translated: any = t(translationKey, { returnObjects: true });
        if (translated !== translationKey && !isBlank(translated)) {
          if (typeof translated === 'object') return translated;
          entry = { value: String(translated), type: 'text' };
        }
      }

      const val = entry?.value;
      if (val === undefined || val === null) return '';

      // 4. Type-driven parsing
      if (entry?.type === 'json') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }

      // Pipe-separated tag lists
      if (TAGS_KEY_PATTERN.test(key) && val.includes('|')) {
        return val
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      return val;
    };

    return lookup;
  }, [getEntry, isAmharic, t]);
}
