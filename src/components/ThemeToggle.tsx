import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on load
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'dark' || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full border border-ink/20 dark:border-parchment/20 flex items-center justify-center hover:bg-ink/5 dark:hover:bg-parchment/5 transition"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <span className="text-parchment text-lg">☀️</span> // Sun for dark mode (to switch to light)
      ) : (
        <span className="text-ink text-lg">🌙</span> // Moon for light mode (to switch to dark)
      )}
    </button>
  );
}