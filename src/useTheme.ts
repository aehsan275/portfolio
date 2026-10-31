import { useEffect, useState } from 'react';

export type Theme = 'paper' | 'charcoal';
const STORAGE_KEY = 'portfolio-theme';

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'paper' || value === 'charcoal' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'charcoal' : 'paper';
}

export function useTheme() {
  const [preference, setPreference] = useState<Theme | null>(savedTheme);
  const [system, setSystem] = useState<Theme>(systemTheme);
  const theme = preference ?? system;

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystem(query.matches ? 'charcoal' : 'paper');
    const storage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) setPreference(savedTheme());
    };
    query.addEventListener('change', update);
    window.addEventListener('storage', storage);
    return () => {
      query.removeEventListener('change', update);
      window.removeEventListener('storage', storage);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'charcoal' ? '#211f1b' : '#faf7ef');
  }, [theme]);

  const chooseTheme = (value: Theme) => {
    setPreference(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // The current visit still works when browser storage is unavailable.
    }
  };
  return { theme, chooseTheme };
}
