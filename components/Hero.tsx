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
    <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center text-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://picsum.photos/seed/hero/1920/1080)' }}
      ></div>
      <div className="absolute inset-0 bg-brand-dark bg-opacity-50"></div>
      <div className="relative z-10 text-white px-4">
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4" 
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          {t.hero.title}
        </h1>
        <p 
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          {t.hero.subtitle}
        </p>
        <div className="max-w-3xl mx-auto">
          <SearchBar {...props} />
        </div>
      </div>
    </div>
  );
};

export default Hero;