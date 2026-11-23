/**
 * Client-side registry of settings keys.
 *
 * The DB source of truth is server/src/db/seed-settings.ts. When you add a
 * key there (or a new content() call here), add the English base key to
 * BASE_SETTINGS_KEYS — the `.am` Amharic variant is derived automatically.
 *
 * Some keys are listed even though they are not seeded (hero.cta,
 * footer.instagram, method.*.tags, …) — those fall back to the translation
 * JSON / inline defaults when absent from the DB.
 */

export const SECTION_KEYS = [
  'hero',
  'method',
  'founding',
  'posts',
  'social',
  'newsletter',
  'form',
  'push',
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const BASE_SETTINGS_KEYS = [
  // Hero
  'hero.label',
  'hero.title',
  'hero.subtitle',
  'hero.comingSoon',
  'hero.cta',

  // Method
  'method.label',
  'method.title',
  'method.subtitle',
  'method.move.title',
  'method.move.description',
  'method.move.tags',
  'method.think.title',
  'method.think.description',
  'method.think.tags',
  'method.recover.title',
  'method.recover.description',
  'method.recover.tags',

  // Founding
  'founding.label',
  'founding.title',
  'founding.subtitle',
  'founding.maxSpots',
  'founding.benefits',
  'founding.registered',
  'founding.founding',
  'founding.remaining',
  'founding.claimed',

  // Lead form
  'form.title',
  'form.subtitle',
  'form.firstName',
  'form.lastName',
  'form.email',
  'form.phone',
  'form.interest',
  'form.founding',
  'form.submit',
  'form.submitting',
  'form.success',
  'form.successMessage',
  'form.waitlistPosition',
  'form.foundingNumber',

  // Newsletter
  'newsletter.label',
  'newsletter.title',
  'newsletter.subtitle',
  'newsletter.namePlaceholder',
  'newsletter.emailPlaceholder',
  'newsletter.button',

  // Footer
  'footer.tagline',
  'footer.location',
  'footer.copyright',
  'footer.instagram',
  'footer.facebook',
  'footer.tiktok',

  // Theme
  'theme.color.ink',
  'theme.color.gold',
  'theme.color.parchment',
  'theme.color.deepgold',
  'theme.color.warmgray',
  'theme.preset',
  'theme.presets',

  // Fonts
  'font.heading',
  'font.body',
  'font.available',

  // Section visibility
  'section.hero.enabled',
  'section.method.enabled',
  'section.founding.enabled',
  'section.posts.enabled',
  'section.social.enabled',
  'section.newsletter.enabled',
  'section.form.enabled',
  'section.push.enabled',
] as const;

export type BaseSettingsKey = (typeof BASE_SETTINGS_KEYS)[number];
export type AmharicSettingsKey = `${BaseSettingsKey}.am`;
export type SettingsKey = BaseSettingsKey | AmharicSettingsKey;

export interface SettingEntry {
  value: string;
  type: string;
}
