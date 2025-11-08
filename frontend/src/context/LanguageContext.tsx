import React, { useEffect, useState, createContext, useContext } from 'react';
import { translations } from '../utils/translations';
type Language = 'en' | 'rw';
interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: () => ''
});
export const useLanguage = () => useContext(LanguageContext);
export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage as Language || 'en';
  });
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'en' ? 'rw' : 'en');
  };
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  return <LanguageContext.Provider value={{
    language,
    toggleLanguage,
    t
  }}>
      {children}
    </LanguageContext.Provider>;
};