'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DyslexicFontContextType {
  dyslexicFont: boolean;
  toggleDyslexicFont: () => void;
}

const DyslexicFontContext = createContext<DyslexicFontContextType | undefined>(undefined);

export function DyslexicFontProvider({ children }: { children: ReactNode }) {
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dyslexicFont');
    if (saved === 'true') {
      setDyslexicFont(true);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      if (dyslexicFont) {
        document.documentElement.classList.add('dyslexic-font');
      } else {
        document.documentElement.classList.remove('dyslexic-font');
      }
    }
  }, [dyslexicFont, mounted]);

  const toggleDyslexicFont = () => {
    const newValue = !dyslexicFont;
    setDyslexicFont(newValue);
    localStorage.setItem('dyslexicFont', String(newValue));
  };

  return (
    <DyslexicFontContext.Provider value={{ dyslexicFont, toggleDyslexicFont }}>
      {children}
    </DyslexicFontContext.Provider>
  );
}

export function useDyslexicFont() {
  const context = useContext(DyslexicFontContext);
  if (context === undefined) {
    // Return default values instead of throwing error during SSR
    return {
      dyslexicFont: false,
      toggleDyslexicFont: () => {},
    };
  }
  return context;
}
