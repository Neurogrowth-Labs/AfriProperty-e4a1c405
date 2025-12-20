import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HomeIcon, GlobeAltIcon } from './icons/NavIcons';
import { BellIcon, UserCircleIcon, CheckBadgeIcon, BanknotesIcon } from './icons/ActionIcons';
import type { User, Notification } from '../types';
import { Language, Currency } from '../types';
import { useTranslations } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { languageOptions, currencyOptions } from '../constants';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  currentUser: User | null;
  notifications: Notification[];
  readNotificationIds: Set<string>;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onDashboardClick: () => void;
  onListPropertyClick: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllNotificationsAsRead: () => void;
  onHomeClick: () => void;
  onAboutClick: () => void;
  onServicesClick: () => void;
  onContactClick: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { currentUser, notifications, onLoginClick, onSignUpClick, onDashboardClick, onListPropertyClick, onNotificationClick, onMarkAllNotificationsAsRead, onHomeClick, onAboutClick, onServicesClick, onContactClick } = props;
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const langRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { language, setLanguage, t, isTranslating } = useTranslations();
  const { currency, setCurrency } = useCurrency();

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (langRef.current && !langRef.current.contains(event.target as Node)) setIsLangOpen(false);
        if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) setIsCurrencyOpen(false);
        if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getButtonText = () => {
    if (!currentUser) return t.header.signUp;
    switch (currentUser.role) {
      case 'investor':
        return t.header.makeRequest;
      case 'user':
        return t.header.listService;
      case 'agent':
      default:
        return t.header.listProperty;
    }
  };

  const mobileLinkClick = (handler: () => void) => {
    handler();
    setIsMobileMenuOpen(false);
  }

  const handleNotificationItemClick = (notification: Notification) => {
    onNotificationClick(notification);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="bg-white/80 dark:bg-brand-dark/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <button onClick={onHomeClick} className="flex items-center space-x-2 flex-shrink-0">
          <HomeIcon className="w-8 h-8 text-brand-gold" />
          <span className="text-2xl font-semibold text-brand-dark dark:text-white tracking-tight">AfriProperty</span>
        </button>
        <nav className="hidden lg:flex items-center space-x-8 font-medium">
          <a href="#" onClick={(e) => { e.preventDefault(); onHomeClick(); }} className="text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-gold transition duration-300">{t.header.home}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onAboutClick(); }} className="text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-gold transition duration-300">{t.header.about}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onServicesClick(); }} className="text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-gold transition duration-300">{t.header.services}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); }} className="text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-gold transition duration-300">{t.header.contact}</a>
        </nav>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative" ref={currencyRef}>
            <button onClick={() => setIsCurrencyOpen(!isCurrencyOpen)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-primary dark:hover:text-brand-gold transition-colors flex items-center gap-2">
                <BanknotesIcon className="w-6 h-6" />
                <span className="text-sm font-medium hidden sm:inline">{currencyOptions[currency].symbol}</span>
            </button>
            {isCurrencyOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200/80 dark:border-slate-700 py-1 z-50">
                    {Object.entries(currencyOptions).map(([code, details]) => (
                         <button 
                            key={code}
                            onClick={() => {
                                setCurrency(code as Currency);
                                setIsCurrencyOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
                         >
                            <span>{details.symbol} {details.name}</span>
                            {currency === code && <CheckBadgeIcon className="w-5 h-5 text-brand-primary"/>}
                         </button>
                    ))}
                </div>
            )}
          </div>
          <div className="relative" ref={langRef}>
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-primary dark:hover:text-brand-gold transition-colors flex items-center gap-2">
                <GlobeAltIcon className="w-6 h-6" />
                {isTranslating ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <span className="text-sm font-medium hidden sm:inline">{languageOptions[language].flag}</span>
                )}
            </button>
            {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200/80 dark:border-slate-700 py-1 z-50">
                    {Object.entries(languageOptions).map(([langCode, langDetails]) => (
                         <button 
                            key={langCode}
                            onClick={() => {
                                setLanguage(langCode as Language);
                                setIsLangOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
                         >
                            <span>{langDetails.flag} {langDetails.name}</span>
                            {language === langCode && <CheckBadgeIcon className="w-5 h-5 text-brand-primary"/>}
                         </button>
                    ))}
                </div>
            )}
          </div>
          <div className="relative" ref={notificationsRef}>
            <button
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-primary dark:hover:text-brand-gold transition-colors relative"
            >
                <BellIcon className="w-6 h-6" />
                {currentUser && unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                    {unreadCount}
                </span>
                )}
            </button>
            {isNotificationsOpen && currentUser && (
                <NotificationsPanel 
                    notifications={notifications} 
                    onNotificationClick={handleNotificationItemClick}
                    onMarkAllAsRead={onMarkAllNotificationsAsRead}
                />
            )}
          </div>
          
          {currentUser ? (
            <div className="relative">
              <button onClick={onDashboardClick} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-primary dark:hover:text-brand-gold transition-colors">
                <UserCircleIcon className="w-6 h-6" />
              </button>
              {currentUser.isVerified && (currentUser.role === 'agent' || currentUser.role === 'investor') && (
                <CheckBadgeIcon className="absolute -bottom-0.5 -right-0.5 w-5 h-5 text-brand-gold" />
              )}
            </div>
          ) : (
            <button onClick={onLoginClick} className="text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-gold font-semibold transition duration-300 hidden md:block">{t.header.login}</button>
          )}

          <button onClick={currentUser ? onListPropertyClick : onSignUpClick} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md hidden sm:block">
              {getButtonText()}
          </button>

          <div className="lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
       {/* Mobile Menu */}
      <div className={`absolute top-full left-0 w-full bg-white/95 dark:bg-brand-dark/95 backdrop-blur-lg lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 shadow-lg' : 'max-h-0'}`}>
        <nav className="flex flex-col p-4 space-y-2">
            <a href="#" onClick={() => mobileLinkClick(onHomeClick)} className="mobile-nav-link">{t.header.home}</a>
            <a href="#" onClick={() => mobileLinkClick(onAboutClick)} className="mobile-nav-link">{t.header.about}</a>
            <a href="#" onClick={() => mobileLinkClick(onServicesClick)} className="mobile-nav-link">{t.header.services}</a>
            <a href="#" onClick={() => mobileLinkClick(onContactClick)} className="mobile-nav-link">{t.header.contact}</a>
            {!currentUser && <a href="#" onClick={() => mobileLinkClick(onLoginClick)} className="mobile-nav-link md:hidden">{t.header.login}</a>}
            <button onClick={() => mobileLinkClick(currentUser ? onListPropertyClick : onSignUpClick)} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-semibold w-full mt-2 sm:hidden">
              {getButtonText()}
          </button>
        </nav>
      </div>
      <style>{`.mobile-nav-link { @apply text-slate-600 dark:text-slate-200 font-semibold p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700; }`}</style>
    </header>
  );
};

export default Header;