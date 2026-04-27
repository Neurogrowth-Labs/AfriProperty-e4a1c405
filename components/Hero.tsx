
import React from 'react';
import SearchBar from './SearchBar';
import type { SearchFilters } from '../types';
import { useTranslations } from '../contexts/LanguageContext';

interface HeroProps {
    onSearch: (query: string) => void;
    isSearchingAI: boolean;
    filters: SearchFilters;
    onFilterChange: (key: keyof SearchFilters, value: any) => void;
}

const Hero: React.FC<HeroProps> = (props) => {
  const { t } = useTranslations();

  return (
    <div className="relative pt-16 pb-20 flex items-center justify-center text-center overflow-hidden bg-white">
      <div className="relative z-10 px-4 w-full max-w-5xl mx-auto">
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight animate-fade-in-up text-brand-dark dark:text-brand-light" 
        >
          {t.hero.title}
        </h1>
        <p 
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium opacity-90 animate-fade-in-up delay-100 text-brand-dark dark:text-brand-light"
        >
          {t.hero.subtitle}
        </p>
        <div className="animate-fade-in-up delay-200">
          <SearchBar {...props} />
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};

export default Hero;