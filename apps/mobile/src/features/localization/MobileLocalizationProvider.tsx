import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { translate, type MobileCopyKey, type MobileLanguage } from './localizationModel';

interface MobileLocalizationValue {
  language: MobileLanguage;
  setLanguage: (language: MobileLanguage) => void;
  t: (key: MobileCopyKey) => string;
}

const MobileLocalizationContext = createContext<MobileLocalizationValue | null>(null);

export function MobileLocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<MobileLanguage>('en');
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: MobileCopyKey) => translate(language, key),
  }), [language]);

  return (
    <MobileLocalizationContext.Provider value={value}>
      {children}
    </MobileLocalizationContext.Provider>
  );
}

export function useMobileLocalization(): MobileLocalizationValue {
  const value = useContext(MobileLocalizationContext);
  if (!value) throw new Error('MobileLocalizationProvider is missing');
  return value;
}
