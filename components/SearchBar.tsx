
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SearchIcons';
import { useTranslations } from '../contexts/LanguageContext';
import { PropertyType, ListingType } from '../types';
import type { SearchFilters } from '../types';
import { BuildingStorefrontIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';
import { WellnessIcon } from './icons/CategoryIcons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearchingAI: boolean;
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: any) => void;
}

type SearchTab = 'buy_rent' | 'stays' | 'transport' | 'wellness';

const TabButton: React.FC<{
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors flex-shrink-0 ${
            isActive
                ? 'text-brand-primary border-brand-primary'
                : 'text-slate-400 border-transparent hover:text-brand-primary'
        }`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);


const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isSearchingAI, filters, onFilterChange }) => {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<SearchTab>('buy_rent');
    const { t } = useTranslations();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query); // AI search still uses the main query bar
    };
    
    const setTabAndPropertyType = (tab: SearchTab, propType: PropertyType) => {
        setActiveTab(tab);
        onFilterChange('propertyType', propType);
    };

    const renderFilters = () => {
        switch (activeTab) {
            case 'stays':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                        <input type="text" placeholder="Location: e.g. Cape Town" name="location" value={filters.location} onChange={(e) => onFilterChange('location', e.target.value)} className="input-field md:col-span-2" />
                        <input type="date" name="checkIn" value={filters.checkIn || ''} onChange={(e) => onFilterChange('checkIn', e.target.value)} className="input-field" title="Check-in Date" />
                        <input type="date" name="checkOut" value={filters.checkOut || ''} onChange={(e) => onFilterChange('checkOut', e.target.value)} className="input-field" title="Check-out Date" />
                        <input type="number" placeholder="Guests" name="guests" min="1" value={filters.guests || ''} onChange={(e) => onFilterChange('guests', Number(e.target.value))} className="input-field" />
                        <input type="number" placeholder="Max Price" name="priceMax" value={filters.priceMax === 10000000 ? '' : filters.priceMax} onChange={(e) => onFilterChange('priceMax', e.target.value === '' ? 10000000 : Number(e.target.value))} className="input-field" />
                    </div>
                );
            case 'transport':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <input type="text" placeholder="Pick-up location" name="location" value={filters.location} onChange={(e) => onFilterChange('location', e.target.value)} className="input-field md:col-span-2" />
                        <input type="date" name="checkIn" value={filters.checkIn || ''} onChange={(e) => onFilterChange('checkIn', e.target.value)} className="input-field" title="Pick-up Date" />
                        <select name="vehicleType" value={filters.vehicleType || ''} onChange={(e) => onFilterChange('vehicleType', e.target.value)} className="input-field">
                            <option value="">Any Vehicle</option>
                            <option>Sedan</option>
                            <option>SUV</option>
                            <option>Van</option>
                            <option>Luxury</option>
                        </select>
                        <input type="number" placeholder="Max Price" name="priceMax" value={filters.priceMax === 10000000 ? '' : filters.priceMax} onChange={(e) => onFilterChange('priceMax', e.target.value === '' ? 10000000 : Number(e.target.value))} className="input-field" />
                    </div>
                );
             case 'wellness':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input type="text" placeholder="Destination" name="location" value={filters.location} onChange={(e) => onFilterChange('location', e.target.value)} className="input-field md:col-span-2" />
                        <input type="date" name="checkIn" value={filters.checkIn || ''} onChange={(e) => onFilterChange('checkIn', e.target.value)} className="input-field" title="Start Date" />
                        <input type="number" placeholder="Max Price" name="priceMax" value={filters.priceMax === 10000000 ? '' : filters.priceMax} onChange={(e) => onFilterChange('priceMax', e.target.value === '' ? 10000000 : Number(e.target.value))} className="input-field" />
                    </div>
                );
            case 'buy_rent':
            default:
                return (
                     <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        <input type="text" placeholder="Location, City..." name="location" value={filters.location} onChange={(e) => onFilterChange('location', e.target.value)} className="input-field col-span-2" />
                        <select name="listingType" value={filters.listingType} onChange={(e) => onFilterChange('listingType', e.target.value)} className="input-field">
                            <option value={ListingType.ALL}>For Sale or Rent</option>
                            <option value={ListingType.SALE}>For Sale</option>
                            <option value={ListingType.RENT}>For Rent</option>
                        </select>
                        <input type="number" placeholder="Min Price" name="priceMin" value={filters.priceMin || ''} onChange={(e) => onFilterChange('priceMin', e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" />
                        <input type="number" placeholder="Max Price" name="priceMax" value={filters.priceMax === 10000000 ? '' : filters.priceMax} onChange={(e) => onFilterChange('priceMax', e.target.value === '' ? 10000000 : Number(e.target.value))} className="input-field" />
                        <div className="flex items-center gap-2 input-field">
                            <input type="number" name="bedrooms" min="0" value={filters.bedrooms || ''} onChange={(e) => onFilterChange('bedrooms', Number(e.target.value))} className="w-full bg-transparent focus:outline-none" placeholder="Beds"/>
                            <span className="text-slate-400">Beds</span>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-lg p-2 rounded-xl shadow-2xl w-full">
            <div className="bg-white dark:bg-slate-800 rounded-lg">
                <div className="overflow-x-auto">
                    <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4 whitespace-nowrap">
                        <TabButton label="Buy & Rent" icon={BuildingStorefrontIcon} isActive={activeTab === 'buy_rent'} onClick={() => setTabAndPropertyType('buy_rent', PropertyType.ALL)} />
                        <TabButton label="Stays" icon={MapPinIcon} isActive={activeTab === 'stays'} onClick={() => setTabAndPropertyType('stays', PropertyType.SHORT_TERM_RENTAL)} />
                        <TabButton label="Transport" icon={TruckIcon} isActive={activeTab === 'transport'} onClick={() => setTabAndPropertyType('transport', PropertyType.TRANSPORT)} />
                        <TabButton label="Wellness" icon={WellnessIcon} isActive={activeTab === 'wellness'} onClick={() => setTabAndPropertyType('wellness', PropertyType.WELLNESS)} />
                    </div>
                </div>
                <div className="p-4">
                    {renderFilters()}
                </div>
            </div>
             <form onSubmit={handleSearch} className="mt-2">
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                     <SparklesIcon className="absolute left-4 top-3 sm:top-1/2 sm:-translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="...or describe what you're looking for with AI"
                        className="w-full pl-12 pr-4 py-3 border-none rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-slate-700 dark:text-white placeholder:text-slate-500"
                    />
                     <button
                        type="submit"
                        disabled={isSearchingAI}
                        className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-slate-400 w-full sm:w-auto flex-shrink-0"
                    >
                        {isSearchingAI ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                        ) : "Search"}
                    </button>
                </div>
            </form>
             <style>{`.input-field { @apply w-full px-4 py-3 text-base border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-slate-700 dark:text-white placeholder:text-slate-500; }`}</style>
        </div>
    );
};

export default SearchBar;
