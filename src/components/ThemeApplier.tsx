import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function ThemeApplier() {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    const ink = settings['theme.color.ink'];
    const gold = settings['theme.color.gold'];
    const parchment = settings['theme.color.parchment'];
    const deepgold = settings['theme.color.deepgold'];
    const warmgray = settings['theme.color.warmgray'];

    if (ink) root.style.setProperty('--color-ink', ink);
    if (gold) root.style.setProperty('--color-gold', gold);
    if (parchment) root.style.setProperty('--color-parchment', parchment);
    if (deepgold) root.style.setProperty('--color-deepgold', deepgold);
    if (warmgray) root.style.setProperty('--color-warmgray', warmgray);
  }, [settings]);

  return null;
}