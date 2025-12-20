import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Property } from '../types';
import { BedIcon, BathIcon, AreaIcon } from './icons/PropertyIcons';
import { LocationPinIcon } from './icons/NavIcons';
import { HeartIcon, HeartIconSolid, CalculatorIcon, CalendarIcon, CheckBadgeIcon, StarIcon, SparklesIcon, Square2StackIcon, PencilIcon, TrashIcon, CubeTransparentIcon, EyeIcon, ShareIcon, LinkIcon, CheckIcon, VrHeadsetIcon } from './icons/ActionIcons';
import { FacebookIcon, TwitterIcon, WhatsAppIcon } from './icons/SocialIcons';
import { ListingType, PropertyType } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface ShareMenuProps {
  propertyTitle: string;
  propertyUrl: string;
}

const ShareMenu: React.FC<ShareMenuProps> = ({ propertyTitle, propertyUrl }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `Check out this amazing property I found on AfriProperty: ${propertyTitle}`;
  
  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(propertyUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${propertyUrl}`)}`
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(propertyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSocialClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200/80 dark:border-slate-700 py-2 z-20 animate-fade-in-up-sm">
        <button onClick={(e) => handleSocialClick(e, socialLinks.facebook)} className="share-button">
            <FacebookIcon className="w-5 h-5" /><span>Facebook</span>
        </button>
        <button onClick={(e) => handleSocialClick(e, socialLinks.twitter)} className="share-button">
            <TwitterIcon className="w-5 h-5" /><span>Twitter</span>
        </button>
        <button onClick={(e) => handleSocialClick(e, socialLinks.whatsapp)} className="share-button">
            <WhatsAppIcon className="w-5 h-5" /><span>WhatsApp</span>
        </button>
        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
        <button onClick={handleCopy} className="share-button">
            {copied ? <><CheckIcon className="w-5 h-5 text-green-500"/><span>Copied!</span></> : <><LinkIcon className="w-5 h-5" /><span>Copy Link</span></>}
        </button>
        <style>{`
            .share-button {
                @apply w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3;
            }
             @keyframes fadeInUpSm {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up-sm {
                animation: fadeInUpSm 0.2s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

interface PropertyCardProps {
  property: Property;
  isSaved: boolean;
  isCompared: boolean;
  isOwner: boolean;
  onSaveToggle: (propertyId: string) => void;
  onOpenCalculator: (property: Property) => void;
  onOpenTourModal: (property: Property) => void;
  onFindSimilar: (property: Property) => void;
  onOpenDetailModal: (property: Property) => void;
  onOpenVRTour: (url: string) => void;
  onToggleCompare: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
}


const PropertyCard: React.FC<PropertyCardProps> = (props) => {
    const { property, isSaved, isCompared, isOwner, onSaveToggle, onOpenCalculator, onOpenTourModal, onFindSimilar, onOpenDetailModal, onOpenVRTour, onToggleCompare, onEdit, onDelete } = props;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
                setIsShareMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const priceSuffix = useMemo(() => {
        if (property.propertyType === PropertyType.TRANSPORT) return '/day';
        if (property.perNightPrice) return '/night';
        if (property.listingType === ListingType.RENT) return '/mo';
        return '';
    }, [property.listingType, property.perNightPrice, property.propertyType]);

    const formattedPrice = `${formatCurrency(property.price)}${priceSuffix}`;

    const handleActionClick = (e: React.MouseEvent, action: (p: Property) => void) => {
        e.stopPropagation();
        e.preventDefault();
        action(property);
    };
    
    const handleIdActionClick = (e: React.MouseEvent, action: (id: string) => void) => {
        e.stopPropagation();
        e.preventDefault();
        action(property.id);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev === 0 ? property.images.length - 1 : prev - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev === property.images.length - 1 ? 0 : prev + 1));
    };

    const handleVrTourClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(property.vrTourUrl) {
            onOpenVRTour(property.vrTourUrl);
        }
    };
    
    const showStandardActions = property.propertyType !== PropertyType.TRANSPORT && property.propertyType !== PropertyType.WELLNESS;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group flex flex-col">
      <div className="relative overflow-hidden group/image">
        <button onClick={() => onOpenDetailModal(property)} className="absolute inset-0 z-0"></button>
        <img src={property.images[currentImageIndex] || 'https://picsum.photos/seed/placeholder/800/600'} alt={property.title} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
        
        {property.images.length > 1 && (
            <>
                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity z-10">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity z-10">
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {property.images.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                </div>
            </>
        )}

        <div className="absolute top-4 right-4 flex flex-col space-y-2" ref={shareRef}>
            <button
                onClick={(e) => handleIdActionClick(e, onSaveToggle)}
                className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:text-red-500 hover:bg-white transition-all duration-300 z-10"
                aria-label={isSaved ? "Unsave property" : "Save property"}
            >
                {isSaved ? (
                    <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                    <HeartIcon className="w-6 h-6" />
                )}
            </button>
            <button
                onClick={(e) => handleActionClick(e, onToggleCompare)}
                className={`bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-white transition-all duration-300 z-10 ${isCompared ? 'text-brand-primary' : ''}`}
                aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
            >
                <Square2StackIcon className="w-6 h-6" />
            </button>
            {property.vrTourUrl && (
                <button
                    onClick={handleVrTourClick}
                    className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:text-brand-primary hover:bg-white transition-all duration-300 z-10"
                    aria-label="Open VR Tour"
                >
                    <VrHeadsetIcon className="w-6 h-6" />
                </button>
            )}
             <div className="relative">
                <button
                    onClick={(e) => {e.stopPropagation(); setIsShareMenuOpen(prev => !prev);}}
                    className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:text-brand-primary hover:bg-white transition-all duration-300 z-10"
                    aria-label="Share property"
                >
                    <ShareIcon className="w-6 h-6" />
                </button>
                {isShareMenuOpen && (
                    <ShareMenu propertyTitle={property.title} propertyUrl={`${window.location.href.split('?')[0]}?propertyId=${property.id}`} />
                )}
            </div>
        </div>

        {isOwner && (
            <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
                <button onClick={(e) => handleActionClick(e, onEdit)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => handleIdActionClick(e, onDelete)} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col items-start gap-y-2">
            <div className="flex items-center gap-x-2">
                <div className={`px-2.5 py-1 text-xs font-bold text-white rounded-full shadow-md ${property.listingType === 'For Sale' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {property.listingType}
                </div>
                {property.verified && (
                    <div className="flex items-center gap-1 bg-brand-gold text-brand-dark px-2.5 py-1 text-xs font-bold rounded-full shadow-md">
                        <CheckBadgeIcon className="w-4 h-4" />
                        <span>Verified</span>
                    </div>
                )}
            </div>
            {property.smartContractReady && (
                <div className="flex items-center gap-1 bg-brand-dark/70 backdrop-blur-sm text-white px-2.5 py-1 text-xs font-bold rounded-full shadow-md">
                    <CubeTransparentIcon className="w-4 h-4" />
                    <span>Smart Contract</span>
                </div>
            )}
        </div>
      </div>
      <button onClick={() => onOpenDetailModal(property)} className="p-6 flex-grow flex flex-col text-left">
        <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-brand-primary">{property.propertyType}</span>
            <p className="text-2xl font-bold text-brand-dark dark:text-white">{formattedPrice}</p>
        </div>
        <h3 className="text-xl font-semibold text-brand-dark dark:text-white mb-1 truncate">{property.title}</h3>
        <div className="flex items-center text-slate-500 dark:text-slate-400 mb-4 text-sm">
          <LocationPinIcon className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{property.address.street}, {property.address.city}</span>
        </div>
        
        <div className="border-t border-b border-slate-100 dark:border-slate-700 my-4 py-3 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-white">{property.agent.name}</span>
                {property.agent.verified && <CheckBadgeIcon className="w-5 h-5 text-green-500" />}
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <StarIcon className="w-5 h-5 text-amber-400" />
                <span className="font-bold">{property.agent.rating}</span>
                <span className="text-slate-400">({property.agent.reviewCount})</span>
            </div>
          </div>
        </div>
        
        {property.details.beds > 0 && (
            <div className="flex flex-wrap justify-around items-center text-center text-slate-700 dark:text-slate-300 gap-x-4 gap-y-2">
                <div className="flex items-center space-x-2">
                    <BedIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                    <span className="text-sm font-medium">{property.details.beds} Beds</span>
                </div>
                <div className="flex items-center space-x-2">
                    <BathIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                    <span className="text-sm font-medium">{property.details.baths} Baths</span>
                </div>
                <div className="flex items-center space-x-2">
                    <AreaIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                    <span className="text-sm font-medium">{property.details.area.toLocaleString()} sqft</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <EyeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                    <span className="text-sm font-medium">{property.views}</span>
                </div>
            </div>
        )}

        {showStandardActions ? (
            <div className="mt-auto pt-6">
                <div className="flex items-center gap-3">
                   <button 
                      onClick={(e) => handleActionClick(e, onFindSimilar)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-brand-light dark:bg-slate-700 text-brand-primary dark:text-brand-gold py-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300">
                       <SparklesIcon className="w-5 h-5" />
                       <span>See Similar</span>
                   </button>
                   <button 
                      onClick={(e) => handleActionClick(e, onOpenTourModal)}
                      className="flex-shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 p-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300">
                       <CalendarIcon className="w-5 h-5" />
                   </button>
                   {property.listingType === ListingType.SALE && (
                     <button 
                        onClick={(e) => handleActionClick(e, onOpenCalculator)}
                        className="flex-shrink-0 bg-brand-primary text-white p-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300">
                         <CalculatorIcon className="w-5 h-5" />
                     </button>
                   )}
                </div>
            </div>
        ) : (
            <div className="mt-auto pt-6">
                <button onClick={() => onOpenDetailModal(property)} className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300">
                    View Details
                </button>
            </div>
        )}
      </button>
    </div>
  );
};

export default PropertyCard;