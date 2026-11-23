import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

// Google Fonts that require loading via <link>
const GOOGLE_FONTS = [
  'Playfair Display',
  'Inter',
  'Merriweather',
  'Poppins',
  'Lora',
  'Montserrat',
  'Cormorant Garamond',
  'DM Sans',
  'Space Grotesk',
  'Nunito',
];

// System fonts (no load needed)
const SYSTEM_FONTS = ['Georgia', 'Arial', 'Times New Roman', 'Helvetica'];

export default function FontLoader() {
  const { settings } = useSettings();

  useEffect(() => {
    const headingFont = settings['font.heading'] || 'Georgia';
    const bodyFont = settings['font.body'] || 'Arial';

    const root = document.documentElement;

    // Set CSS variables
    root.style.setProperty(
      '--font-heading',
      SYSTEM_FONTS.includes(headingFont)
        ? `${headingFont}, serif`
        : `'${headingFont}', sans-serif`
    );

    root.style.setProperty(
      '--font-body',
      SYSTEM_FONTS.includes(bodyFont)
        ? `${bodyFont}, sans-serif`
        : `'${bodyFont}', sans-serif`
    );

    // Load Google Fonts dynamically
    const fontsToLoad = [headingFont, bodyFont].filter((f) =>
      GOOGLE_FONTS.includes(f)
    );

    if (fontsToLoad.length > 0) {
      // Remove old fonts link
      const oldLink = document.getElementById('google-fonts-link');
      if (oldLink) oldLink.remove();

      // Build Google Fonts URL
      const families = fontsToLoad
        .map(
          (f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`
        )
        .join('&');

      const link = document.createElement('link');
      link.id = 'google-fonts-link';
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      document.head.appendChild(link);
    }
  }, [settings]);

  return null;
}