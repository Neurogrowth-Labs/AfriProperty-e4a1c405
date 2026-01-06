import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import PropertyList from './components/PropertyList';
import { CATEGORIES, AGENT_ACHIEVEMENTS, INVESTOR_ACHIEVEMENTS } from './constants';
import type { Property, SearchFilters, TourRequest, User, Message, Review, CalendarEvent, AgentProfile, Lead, Achievement, InvestorSettings, InvestmentRequest, BlogPost, Notification } from './types';
import { ListingType, PropertyType, PropertyStatus, NotificationType } from './types';
import CategoryCard from './components/CategoryCard';
import Chatbot from './components/Chatbot';
import MortgageCalculator from './components/MortgageCalculator';
import ScheduleTourModal from './components/ScheduleTourModal';
import MarketInsights from './components/MarketInsights';
import RecommendedProperties from './components/RecommendedProperties';
import PropertyDetailModal from './components/PropertyDetailModal';
import CompareBar from './components/CompareBar';
import CompareModal from './components/CompareModal';
import { AuthModal } from './components/AuthModal';
import UserDashboardModal from './components/UserDashboardModal';
import PropertyFormModal from './components/PropertyFormModal';
import FinancialServices from './components/FinancialServices';
import AIResponseModal from './components/AIResponseModal';
import { getProperties, saveProperties, getTourRequests, addTourRequest, getSavedPropertiesForUser, savePropertiesForUser, getInquiriesForSeller, getSavedSearchesForUser, saveSearchesForUser, incrementPropertyView, getMessagesForUser, sendMessage, addReview, getEvents, addEvent, updateEvent, deleteEvent, getAgentProfile, updateAgentProfile, getReviewsForAgent as getAllReviewsForAgent, getLeadsForAgent, getInvestorSettings, saveInvestorSettings, getInvestmentRequests, addInvestmentRequest, getNotifications, getReadNotificationIds, markNotificationsAsRead } from './lib/data';
import PersonalizedMatches from './components/PersonalizedMatches';
import AgentContactModal from './components/AgentContactModal';
import VRTourModal from './components/VRTourModal';
import NeighborhoodSection from './components/NeighborhoodSection';
import BlogSection from './components/BlogSection';
import { BookmarkIcon, ChatBubbleLeftRightIcon } from './components/icons/ActionIcons';
import MessageModal from './components/MessageModal';
import AgentReviewModal from './components/AgentReviewModal';
import AIImprovementModal from './components/AIImprovementModal';
import { useTranslations } from './contexts/LanguageContext';
import InvestmentRequestModal from './components/InvestmentRequestModal';
import { useCurrency } from './contexts/CurrencyContext';
import UpgradeToInvestorModal from './components/UpgradeToInvestorModal';
import { GoogleGenAI, Type } from "@google/genai";
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import CareersModal from './components/CareersModal';
import ApplicationModal from './components/ApplicationModal';
import NeighborhoodExplorerModal from './components/NeighborhoodExplorerModal';
import ServiceRegistrationModal from './components/ServiceRegistrationModal';
import BlogDetailModal from './components/BlogDetailModal';
import ProviderServicesModal from './components/ProviderServicesModal';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import RealTimeNews from './components/RealTimeNews';
import AIVoiceChat from './components/AIVoiceChat';
import NewOfferings from './components/NewOfferings';

// Page components
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import ServicesPage from './components/pages/ServicesPage';
import PricingPage from './components/pages/PricingPage';


// FIX: Added 'userSignup' to the AuthView type to allow setting this view state, resolving a TypeScript error.
type AuthView = 'login' | 'signup' | 'userSignup' | 'agentSignup' | 'investorSignup' | 'pendingVerificationAgent' | 'pendingVerificationInvestor' | 'forgotPassword' | 'resetConfirmation';
type Page = 'home' | 'about' | 'services' | 'contact' | 'pricing';

const initialFilters: SearchFilters = {
    location: '',
    listingType: ListingType.ALL,
    propertyType: PropertyType.ALL,
    priceMin: 0,
    priceMax: 10000000,
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    checkIn: '',
    checkOut: '',
    guests: 0,
    vehicleType: '',
    wellnessType: '',
};

const aiFilterSchema = {
    type: Type.OBJECT,
    properties: {
        location: { type: Type.STRING, description: "The city or neighborhood the user is searching in." },
        listingType: { type: Type.STRING, enum: Object.values(ListingType), description: "The type of listing, e.g., For Sale or For Rent." },
        propertyType: { type: Type.STRING, enum: Object.values(PropertyType), description: "The type of property, e.g., Apartment or House." },
        priceMin: { type: Type.NUMBER, description: "The minimum price, if specified." },
        priceMax: { type: Type.NUMBER, description: "The maximum price, if specified." },
        bedrooms: { type: Type.NUMBER, description: "The minimum number of bedrooms." },
        bathrooms: { type: Type.NUMBER, description: "The minimum number of bathrooms." },
        amenities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of any requested amenities." },
    },
};

const blogSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A catchy, SEO-friendly title for the blog post." },
            author: { type: Type.STRING, description: "A realistic-sounding author name." },
            date: { type: Type.STRING, description: "A recent date in the format 'Month Day, Year'." },
            image: { type: Type.STRING, description: "A URL for a relevant image from picsum.photos, e.g., https://picsum.photos/seed/blog1/400/250." },
            summary: { type: Type.STRING, description: "A concise, one-sentence summary of the article." },
            content: { type: Type.STRING, description: "The full content of the blog post, formatted in Markdown with headings (e.g., ## My Heading), lists, and paragraphs. It should be 3-4 paragraphs long." },
        },
        required: ["title", "author", "date", "image", "summary", "content"]
    }
};

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [investmentProperties, setInvestmentProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Saved Properties State
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  
  // Tour Requests State
  const [tourRequests, setTourRequests] = useState<TourRequest[]>([]);

  // Saved Searches State
  const [savedSearches, setSavedSearches] = useState<SearchFilters[]>([]);
  
  // Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Calendar Events State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Investment Requests State
  const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequest[]>([]);

  // Agent Profile State
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [agentReviews, setAgentReviews] = useState<Review[]>([]);
  
  // Leads State
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Achievements State
  const [agentAchievements, setAgentAchievements] = useState<Achievement[]>(AGENT_ACHIEVEMENTS.map((a, i) => ({...a, id: `ach_${i}`})));
  const [investorAchievements, setInvestorAchievements] = useState<Achievement[]>(INVESTOR_ACHIEVEMENTS.map((a, i) => ({...a, id: `inv_ach_${i}`})));

  // Investor Settings State
  const [investorSettings, setInvestorSettings] = useState<InvestorSettings | null>(null);

  // Currency & Theme State from Context
  const { currency, setCurrency } = useCurrency();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
    }
    return 'light';
  });
  
  // AI Search State
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  // Modal States
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthView>('login');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [isAIResponseModalOpen, setIsAIResponseModalOpen] = useState(false);
  const [isAgentContactModalOpen, setIsAgentContactModalOpen] = useState(false);
  const [isVRTourOpen, setIsVRTourOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAIImprovementModalOpen, setIsAIImprovementModalOpen] = useState(false);
  const [isInvestmentRequestModalOpen, setIsInvestmentRequestModalOpen] = useState(false);
  const [isUpgradeToInvestorModalOpen, setIsUpgradeToInvestorModalOpen] = useState(false);
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);
  const [isTermsOfServiceModalOpen, setIsTermsOfServiceModalOpen] = useState(false);
  const [isCareersModalOpen, setIsCareersModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isNeighborhoodExplorerOpen, setIsNeighborhoodExplorerOpen] = useState(false);
  const [initialNeighborhoodId, setInitialNeighborhoodId] = useState<string | undefined>(undefined);
  const [isServiceRegistrationModalOpen, setIsServiceRegistrationModalOpen] = useState(false);
  const [isBlogDetailModalOpen, setIsBlogDetailModalOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isProviderServicesModalOpen, setIsProviderServicesModalOpen] = useState(false);
  const [providerServiceFilter, setProviderServiceFilter] = useState<string | undefined>(undefined);
  const [isAIVoiceChatOpen, setIsAIVoiceChatOpen] = useState(false);
  
  const [isSessionWarningOpen, setIsSessionWarningOpen] = useState(false);
  const [sessionCountdown, setSessionCountdown] = useState(60);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingBlog, setIsLoadingBlog] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [targetPropertyForSimilar, setTargetPropertyForSimilar] = useState<Property | null>(null);
  const [inquiryForResponse, setInquiryForResponse] = useState<TourRequest | null>(null);
  const [agentForReview, setAgentForReview] = useState<Property['agent'] | null>(null);
  const [agentContactMode, setAgentContactMode] = useState<'chat' | 'video'>('chat');
  const [agentContactName, setAgentContactName] = useState('');
  const [vrTourUrl, setVrTourUrl] = useState('');
  const [aiImprovementProperty, setAIImprovementProperty] = useState<Property | null>(null);
  const [applyingForJob, setApplyingForJob] = useState('');
  const [savedNeighborhoodIds, setSavedNeighborhoodIds] = useState<Set<string>>(new Set());
  const { t } = useTranslations();

  // Session Timeout Logic
  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
  const WARNING_TIMEOUT = 14 * 60 * 1000;

  // Data Fetching and Initial Setup
  useEffect(() => {
    const fetchData = async () => {
        setIsLoadingProperties(true);
        const allProps = await getProperties();
        const investmentProps = allProps.filter(p => p.listingType === ListingType.FOR_INVESTMENT);

        setAllProperties(allProps);
        setInvestmentProperties(investmentProps);
        setIsLoadingProperties(false);

        if (currentUser) {
            setSavedPropertyIds(await getSavedPropertiesForUser(currentUser.username));
            setTourRequests(await getTourRequests(currentUser.username));
            setSavedSearches(await getSavedSearchesForUser(currentUser.username));
            setMessages(await getMessagesForUser(currentUser.username));
            setNotifications((await getNotifications(currentUser)).map(n => ({...n, isRead: false })));
            setReadNotificationIds(await getReadNotificationIds(currentUser.username));

            if(currentUser.role === 'agent') {
                setCalendarEvents(await getEvents(currentUser.username));
                const profile = await getAgentProfile(currentUser.username);
                setAgentProfile(profile);
                setAgentReviews(await getAllReviewsForAgent(currentUser.username));
                setLeads(await getLeadsForAgent(currentUser.username));
                setInvestmentRequests(await getInvestmentRequests());
            }

            if (currentUser.role === 'investor') {
                setInvestorSettings(await getInvestorSettings(currentUser.username));
            }
        } else {
            setSavedPropertyIds(new Set<string>());
            setNotifications([]);
            setReadNotificationIds(new Set<string>());
        }
    }
    fetchData();
  }, [currentUser]);

  // AI Blog Generation
    useEffect(() => {
        const generateAndCacheBlogPosts = async () => {
            setIsLoadingBlog(true);
            const cachedPosts = localStorage.getItem('blogPosts');
            if (cachedPosts) {
                setBlogPosts(JSON.parse(cachedPosts));
                setIsLoadingBlog(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const prompt = `Generate 3 educational, industry-relevant blog posts for a real estate marketplace called AfriProperty. Provide a JSON array.

Each object must have the following fields: 'title', 'author', 'date', 'image', 'summary', and 'content'.

The 'content' field MUST be a single Markdown string adhering to these professional formatting guidelines:

1.  **Headings**: All section headings must be bold. Use H2 markdown ('## Major Section Heading') for main sections.
2.  **Paragraphs**: Write in short, readable paragraphs (2-4 sentences each). **Crucially, you MUST use a double line break (a completely empty line) between paragraphs in the Markdown to ensure proper spacing.**
3.  **Structure**: The article must follow this structure:
    *   An **Introduction** that grabs the reader's attention.
    *   A **Main Body** organized with clear, bold headings (H2s).
    *   A **Key Takeaways** section summarizing the main points, under its own bold heading.
    *   A **Call-to-Action (CTA)** at the end, under its own bold heading.
4.  **Formatting**: Use lists and bold text for emphasis where appropriate.

The other fields should follow these rules:
- 'title': A clear, concise, and keyword-optimized title.
- 'author': A realistic-sounding author name.
- 'date': A recent date, e.g., "October 28, 2023".
- 'image': A relevant, high-quality image URL from picsum.photos, e.g., https://picsum.photos/seed/blog1/400/250. Use a different seed for each post.
- 'summary': A concise one-sentence summary of the article.
`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: 'application/json', responseSchema: blogSchema }
                });
                
                const posts = JSON.parse(response.text.trim());
                if (Array.isArray(posts)) {
                    localStorage.setItem('blogPosts', JSON.stringify(posts));
                    setBlogPosts(posts);
                }
            } catch (error) {
                console.error("Failed to generate blog posts:", error);
            } finally {
                setIsLoadingBlog(false);
            }
        };
        
        generateAndCacheBlogPosts();
    }, []);
  
  // Centralized Filtering Logic
  useEffect(() => {
    const isTraditionalSearch = [PropertyType.ALL, PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.COMMERCIAL, PropertyType.STUDENT_HOUSING, PropertyType.TOWNSHIP, PropertyType.RURAL, PropertyType.LAND, PropertyType.LUXURY_ESTATE, PropertyType.IN_CONSTRUCTION].includes(filters.propertyType);
    const isStaySearch = [PropertyType.SHORT_TERM_RENTAL, PropertyType.HOTEL].includes(filters.propertyType);
    const isTransportSearch = filters.propertyType === PropertyType.TRANSPORT;
    const isWellnessSearch = filters.propertyType === PropertyType.WELLNESS;

    const filtered = allProperties.filter(p => {
        const matchesLocation = filters.location === '' || p.address.city.toLowerCase().includes(filters.location.toLowerCase()) || p.address.street.toLowerCase().includes(filters.location.toLowerCase());
        const matchesPrice = p.price >= filters.priceMin && p.price <= filters.priceMax;

        if (isTraditionalSearch) {
             const matchesListingType = filters.listingType === ListingType.ALL || p.listingType === filters.listingType;
             const matchesPropertyType = filters.propertyType === PropertyType.ALL || p.propertyType === filters.propertyType;
             const matchesBedrooms = filters.bedrooms === 0 || p.details.beds >= filters.bedrooms;
             const matchesBathrooms = filters.bathrooms === 0 || p.details.baths >= filters.bathrooms;
             const matchesAmenities = filters.amenities.length === 0 || filters.amenities.every(a => p.amenities.includes(a));
             return matchesLocation && matchesListingType && matchesPropertyType && matchesPrice && matchesBedrooms && matchesBathrooms && matchesAmenities;
        }

        if (isStaySearch) {
            const matchesGuests = !filters.guests || (p.guests || 0) >= filters.guests;
            return matchesLocation && [PropertyType.SHORT_TERM_RENTAL, PropertyType.HOTEL].includes(p.propertyType) && matchesGuests && matchesPrice;
        }

        if (isTransportSearch) {
            const matchesVehicleType = !filters.vehicleType || p.vehicleType === filters.vehicleType;
            return matchesLocation && p.propertyType === filters.propertyType && matchesVehicleType && matchesPrice;
        }

        if (isWellnessSearch) {
            return matchesLocation && p.propertyType === filters.propertyType && matchesPrice;
        }

        return matchesLocation && matchesPrice;
    });
    setFilteredProperties(filtered);
  }, [filters, allProperties]);


  // Derived State
  const featuredProperties = useMemo(() => {
    return allProperties.filter(p => p.featured && p.status === PropertyStatus.ACTIVE);
  }, [allProperties]);

  const recentProperties = useMemo(() => {
    return [...allProperties].sort((a, b) => b.dateListed - a.dateListed).slice(0, 3);
  }, [allProperties]);

  const savedProperties = useMemo(() => {
    return Array.from(savedPropertyIds).map(id => allProperties.find(p => p.id === id)).filter((p): p is Property => p !== undefined);
  }, [savedPropertyIds, allProperties]);
  
  const receivedInquiries = useMemo(() => {
      return tourRequests; 
  }, [tourRequests]);
  
  const notificationsWithReadStatus = useMemo(() => {
      return notifications
        .map(n => ({ ...n, isRead: readNotificationIds.has(n.id) }))
        .sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, readNotificationIds]);
  
  // Handlers
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingAI(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `Parse the following user query into a JSON object of search filters. Use the provided schema. If a value isn't specified, omit the key.
        Query: "${query}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: aiFilterSchema
            }
        });
        
        const parsedFilters = JSON.parse(response.text.trim());
        const newFilters = { ...initialFilters, ...parsedFilters };

        setFilters(newFilters);
        setActiveTab('all');

    } catch (error) {
        console.error("AI Search Error:", error);
        alert("Sorry, I couldn't understand that search. Please try rephrasing.");
    } finally {
        setIsSearchingAI(false);
    }
  };
  
  const withRoleGate = (property: Property, action: (p: Property) => void) => {
      if (property.listingType === ListingType.FOR_INVESTMENT && currentUser?.role === 'user') {
          setIsUpgradeToInvestorModalOpen(true);
      } else {
          action(property);
      }
  };

  const withIdRoleGate = (propertyId: string, action: (id: string) => void) => {
      const property = [...allProperties, ...investmentProperties].find(p => p.id === propertyId);
      if (property && property.listingType === ListingType.FOR_INVESTMENT && currentUser?.role === 'user') {
          setIsUpgradeToInvestorModalOpen(true);
      } else {
          action(propertyId);
      }
  };

  const handleOpenDetailModal = async (property: Property) => {
    withRoleGate(property, async (p) => {
        setSelectedProperty(p);
        setIsDetailModalOpen(true);
        await incrementPropertyView(p.id);
        setAllProperties(prev => prev.map(item => item.id === p.id ? { ...item, views: (item.views || 0) + 1 } : item));
    });
  };

  const handleSaveToggle = async (propertyId: string) => {
    withIdRoleGate(propertyId, async (id) => {
        if (!currentUser) {
            setAuthModalView('login');
            setIsAuthModalOpen(true);
            return;
        }
        const newSaved = new Set(savedPropertyIds);
        let updatedProperties = [...allProperties];
        if (newSaved.has(id)) {
            newSaved.delete(id);
            updatedProperties = updatedProperties.map(p => p.id === id ? {...p, saves: p.saves - 1} : p);
        } else {
            newSaved.add(id);
            updatedProperties = updatedProperties.map(p => p.id === id ? {...p, saves: p.saves + 1} : p);
        }
        setSavedPropertyIds(newSaved);
        // FIX: Added explicit type cast to string[] for Array.from result to fix line 460 error
        await savePropertiesForUser(currentUser.username, Array.from(newSaved) as string[]);
        await saveProperties(updatedProperties);
        setAllProperties(updatedProperties);
    });
  };

  const handleToggleCompare = (property: Property) => {
    withRoleGate(property, (p) => {
        setCompareList(prev => {
            if (prev.some(item => item.id === p.id)) {
                return prev.filter(item => item.id !== p.id);
            }
            if (prev.length < 4) {
                return [...prev, p];
            }
            return prev;
        });
    });
  };
  
  const handleOpenCalculator = (property: Property) => {
    withRoleGate(property, (p) => {
      setSelectedProperty(p);
      setIsCalculatorOpen(true);
    });
  };
  
  const handleOpenTourModal = (property: Property) => {
    withRoleGate(property, (p) => {
      if (!currentUser) {
        setAuthModalView('login');
        setIsAuthModalOpen(true);
        return;
      }
      setSelectedProperty(p);
      setIsTourModalOpen(true);
    });
  };

  const handleFindSimilar = (property: Property) => {
    withRoleGate(property, (p) => {
      setTargetPropertyForSimilar(p);
      setTimeout(() => {
        const recs = document.getElementById('recommendations');
        if (recs) recs.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  };

  const handleOpenVRTour = (url: string) => {
    setVrTourUrl(url);
    setIsVRTourOpen(true);
  };
  
  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setIsAuthModalOpen(false);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setIsDashboardOpen(false);
    setIsSessionWarningOpen(false);
  };

  const handleListPropertyClick = () => {
    if (!currentUser) {
        setPage('pricing');
        return;
    }
    
    if (currentUser.role === 'investor') {
        setIsInvestmentRequestModalOpen(true);
    } else if (currentUser.role === 'agent') {
        setPropertyToEdit(null);
        setIsPropertyFormOpen(true);
    } else if (currentUser.role === 'user') {
        setIsServiceRegistrationModalOpen(true);
    }
  };

  const handleEditProperty = (property: Property) => {
    setPropertyToEdit(property);
    setIsPropertyFormOpen(true);
    setIsDashboardOpen(false);
  };

  const handleDeleteProperty = async (propertyId: string) => {
      if (window.confirm("Are you sure you want to delete this property?")) {
        const newProperties = allProperties.filter(p => p.id !== propertyId);
        setAllProperties(newProperties);
        await saveProperties(newProperties);
      }
  };

  const handleSaveProperty = async (property: Property) => {
    let newProperties;
    const existing = allProperties.find(p => p.id === property.id);
    if (existing) {
        newProperties = allProperties.map(p => p.id === property.id ? property : p);
    } else {
        newProperties = [...allProperties, property];
    }
    setAllProperties(newProperties);
    await saveProperties(newProperties);
    setIsPropertyFormOpen(false);
    setIsDashboardOpen(true);
  };
  
  const handleScheduleTour = async (request: Omit<TourRequest, 'id' | 'username' | 'status' | 'timestamp'>) => {
      if(currentUser) {
          const newRequest = await addTourRequest(currentUser.username, request.propertyId, request.propertyTitle, request.date, request.time);
          setTourRequests(prev => [...prev, newRequest]);
          setIsTourModalOpen(false);
          alert("Tour requested successfully! The agent will be in touch.");
      }
  };
  
  const handleSaveSearch = async () => {
    if (!currentUser) {
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      return;
    }
    const newSavedSearches = [...savedSearches, filters];
    setSavedSearches(newSavedSearches);
    await saveSearchesForUser(currentUser.username, newSavedSearches);
    alert("Search saved!");
  };

  const handleDeleteSearch = async (searchToDelete: SearchFilters) => {
      if (!currentUser) return;
      const newSavedSearches = savedSearches.filter(s => JSON.stringify(s) !== JSON.stringify(searchToDelete));
      setSavedSearches(newSavedSearches);
      await saveSearchesForUser(currentUser.username, newSavedSearches);
  };
  
  const handleRunSearch = (searchToRun: SearchFilters) => {
    setIsDashboardOpen(false);
    setFilters(searchToRun);
  };
  
  const handleMessageAgent = (property: Property) => {
      withRoleGate(property, (p) => {
          if (!currentUser) {
            setAuthModalView('login');
            setIsAuthModalOpen(true);
            return;
          }
          setSelectedProperty(p);
          setIsMessageModalOpen(true);
      });
  };

  const handleSendMessage = async (text: string) => {
      if(currentUser && selectedProperty) {
          const newMessage = await sendMessage({
              propertyId: selectedProperty.id,
              propertyTitle: selectedProperty.title,
              senderUsername: currentUser.username,
              receiverUsername: selectedProperty.agent.name,
              text: text,
          });
          setMessages(prev => [...prev, newMessage]);
          setIsMessageModalOpen(false);
      }
  };
  
  const handleLeaveReview = (agent: Property['agent']) => {
    setAgentForReview(agent);
    setIsReviewModalOpen(true);
  };
  
  const handleSubmitReview = async (reviewData: Omit<Review, 'id'|'timestamp'|'reviewerUsername'|'agentName'>) => {
      if(currentUser && agentForReview) {
          const newReview = await addReview({
              ...reviewData,
              agentName: agentForReview.name,
              reviewerUsername: currentUser.username,
          });
          setAgentReviews(prev => [...prev, newReview]);
          setIsReviewModalOpen(false);
          setAgentForReview(null);
      }
  };
  
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.theme = newTheme;
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAddEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
      if (!currentUser) return;
      const newEvent = await addEvent(currentUser.username, eventData);
      setCalendarEvents(prev => [...prev, newEvent]);
  };
  
  const handleUpdateEvent = async (event: CalendarEvent) => {
      if (!currentUser) return;
      const updatedEvent = await updateEvent(currentUser.username, event);
      setCalendarEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };
  
  const handleDeleteEvent = async (eventId: string) => {
      if (!currentUser) return;
      await deleteEvent(currentUser.username, eventId);
      setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleUpdateAgentProfile = async (profile: AgentProfile) => {
      if (!currentUser) return;
      const updatedProfile = await updateAgentProfile(currentUser.username, profile);
      setAgentProfile(updatedProfile);
  };
  
  const handleOpenAIImprovementModal = (property: Property) => {
    setAIImprovementProperty(property);
    setIsAIImprovementModalOpen(true);
  };
  
  const handleUpdateInvestorSettings = async (settings: InvestorSettings) => {
      if(!currentUser) return;
      await saveInvestorSettings(currentUser.username, settings);
      setInvestorSettings(settings);
  };
  
  const handleSendInvestmentRequest = async (details: string) => {
      if (!currentUser) return;
      const newRequest = await addInvestmentRequest(currentUser.username, details);
      setInvestmentRequests(prev => [newRequest, ...prev]);
      setIsInvestmentRequestModalOpen(false);
      alert('Your request has been sent to agents!');
  };

  const handleUpgradeAccountRequest = () => {
      setIsUpgradeToInvestorModalOpen(false);
      handlePlanSelect('investor');
  };
  
  const handleBlogClick = (post: BlogPost) => {
    setSelectedBlogPost(post);
    setIsBlogDetailModalOpen(true);
  };

  const handleOpenApplicationModal = (jobTitle: string) => {
    setIsCareersModalOpen(false);
    setApplyingForJob(jobTitle);
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmit = () => {
    setIsApplicationModalOpen(false);
    alert(`Your application for '${applyingForJob}' has been successfully submitted! We'll be in touch.`);
    setApplyingForJob('');
  };

  const handleOpenNeighborhoodExplorer = (neighborhoodId?: string) => {
    setInitialNeighborhoodId(neighborhoodId);
    setIsNeighborhoodExplorerOpen(true);
  };
  
  const handleSaveNeighborhoodToggle = (neighborhoodId: string) => {
    if (!currentUser) {
        setAuthModalView('login');
        setIsAuthModalOpen(true);
        return;
    }
    setSavedNeighborhoodIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(neighborhoodId)) {
            newSet.delete(neighborhoodId);
        } else {
            newSet.add(neighborhoodId);
        }
        return newSet;
    });
};

  const handleContactProvider = (providerName: string) => {
    setAgentContactMode('chat');
    setAgentContactName(providerName);
    setIsAgentContactModalOpen(true);
  };

  const handleOpenProviderServices = (service: string) => {
    setPage('home');
    setProviderServiceFilter(service);
    setIsProviderServicesModalOpen(true);
  };

  const handlePlanSelect = (role: 'user' | 'agent' | 'investor') => {
      setPage('home');
      if (role === 'user') {
          setAuthModalView('userSignup');
      } else if (role === 'agent') {
          setAuthModalView('agentSignup');
      } else {
          setAuthModalView('investorSignup');
      }
      setIsAuthModalOpen(true);
  };
  
  const handleMarkAsRead = async (id: string) => {
      if (!currentUser) return;
      const updatedReadIds = await markNotificationsAsRead(currentUser.username, [id]);
      setReadNotificationIds(updatedReadIds);
  };
  
  const handleMarkAllAsRead = async () => {
      if (!currentUser) return;
      const allIds = (notifications as any[]).map(n => n.id) as string[];
      const updatedReadIds = await markNotificationsAsRead(currentUser.username, allIds);
      setReadNotificationIds(updatedReadIds);
  };
  
  const handleNotificationClick = (notification: Notification) => {
      handleMarkAsRead(notification.id);
      if (notification.type === NotificationType.NEW_LISTING && notification.propertyId) {
          const property = allProperties.find(p => p.id === notification.propertyId);
          if (property) {
              handleOpenDetailModal(property);
          }
      }
      if (notification.type === NotificationType.INQUIRY) {
          setIsDashboardOpen(true);
      }
  };
  
  const clearTimers = () => {
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
  };

  const handleStayLoggedIn = () => {
      setIsSessionWarningOpen(false);
      resetTimer();
  };

  const resetTimer = () => {
      clearTimers();
      if (currentUser) {
          warningTimerRef.current = window.setTimeout(() => {
              setSessionCountdown(60);
              setIsSessionWarningOpen(true);
              countdownIntervalRef.current = window.setInterval(() => {
                  setSessionCountdown(prev => prev - 1);
              }, 1000);
          }, WARNING_TIMEOUT);

          logoutTimerRef.current = window.setTimeout(() => {
              handleLogout();
          }, INACTIVITY_TIMEOUT);
      }
  };

  useEffect(() => {
      if (currentUser) {
          const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
          events.forEach(event => window.addEventListener(event, resetTimer));
          resetTimer();

          return () => {
              events.forEach(event => window.removeEventListener(event, resetTimer));
              clearTimers();
          };
      } else {
          clearTimers();
      }
  }, [currentUser]);

  const renderPage = () => {
    switch(page) {
      case 'about':
          return <AboutPage />;
      case 'services':
          return <ServicesPage onServiceClick={handleOpenProviderServices} />;
      case 'contact':
          return <ContactPage />;
      case 'pricing':
          return <PricingPage onPlanSelect={handlePlanSelect} />;
      case 'home':
      default:
          return (
              <>
                  <Hero 
                      onSearch={handleAISearch} 
                      isSearchingAI={isSearchingAI}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                  />

                  <NewOfferings />
                  
                  <section id="just-listed" className="py-12 lg:py-16 bg-white dark:bg-slate-900">
                  <div className="container mx-auto px-4 sm:px-6">
                      <h2 className="text-3xl font-bold text-center text-brand-dark dark:text-white mb-12">Just Listed</h2>
                      <PropertyList 
                          properties={recentProperties}
                          currentUser={currentUser}
                          onSaveToggle={handleSaveToggle}
                          savedPropertyIds={savedPropertyIds}
                          onOpenCalculator={handleOpenCalculator}
                          onOpenTourModal={handleOpenTourModal}
                          onFindSimilar={handleFindSimilar}
                          onOpenDetailModal={handleOpenDetailModal}
                          onToggleCompare={handleToggleCompare}
                          onOpenVRTour={handleOpenVRTour}
                          compareList={compareList}
                          onEdit={handleEditProperty}
                          onDelete={handleDeleteProperty}
                          isLoading={isLoadingProperties}
                      />
                  </div>
                  </section>

                  <section id="featured-listings" className="py-12 lg:py-16 bg-brand-light dark:bg-brand-dark/40">
                  <div className="container mx-auto px-4 sm:px-6">
                      <h2 className="text-3xl font-bold text-center text-brand-dark dark:text-white mb-12">{t.app.featuredListings}</h2>
                      <PropertyList 
                      properties={featuredProperties}
                      currentUser={currentUser}
                      onSaveToggle={handleSaveToggle}
                      savedPropertyIds={savedPropertyIds}
                      onOpenCalculator={handleOpenCalculator}
                      onOpenTourModal={handleOpenTourModal}
                      onFindSimilar={handleFindSimilar}
                      onOpenDetailModal={handleOpenDetailModal}
                      onToggleCompare={handleToggleCompare}
                      onOpenVRTour={handleOpenVRTour}
                      compareList={compareList}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                      isLoading={isLoadingProperties}
                      />
                  </div>
                  </section>

                  <section className="py-12 lg:py-16 bg-white dark:bg-slate-900">
                      <div className="container mx-auto px-4 sm:px-6">
                          <div className="text-center mb-12">
                              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white">{t.app.exploreByLifestyle}</h2>
                              <p className="text-center text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">{t.app.exploreByLifestyleSubtitle}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                          {CATEGORIES.map(category => (
                              <CategoryCard key={category.titleKey} title={t.categories[category.titleKey as keyof typeof t.categories]} description={t.categories[category.descriptionKey as keyof typeof t.categories]} Icon={category.Icon} />
                          ))}
                          </div>
                      </div>
                  </section>

                  <section id="all-listings" className="py-12 lg:py-16 bg-brand-light dark:bg-brand-dark/40">
                  <div className="container mx-auto px-4 sm:px-6">
                      <h2 className="text-3xl font-bold text-center text-brand-dark dark:text-white mb-4">{t.app.findYourProperty}</h2>
                      <div className="flex justify-center items-center gap-4 mb-10">
                          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === 'all' ? 'bg-brand-primary text-white' : 'bg-white/50 text-brand-dark'}`}>{t.app.allListings}</button>
                          <button onClick={() => setActiveTab('saved')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors relative ${activeTab === 'saved' ? 'bg-brand-primary text-white' : 'bg-white/50 text-brand-dark'}`}>
                          {t.app.savedProperties}
                          {savedPropertyIds.size > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-white text-xs font-bold">{savedPropertyIds.size}</span>}
                          </button>
                      </div>
                      {activeTab === 'all' && <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t.app.showingResults.replace('{{count}}', String(filteredProperties.length))}</p>}
                      {activeTab === 'saved' && <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t.app.savedCount.replace('{{count}}', String(savedProperties.length))}</p>}
                      
                      <div className="flex justify-center mb-8">
                          <button onClick={handleSaveSearch} className="flex items-center gap-2 bg-white/50 text-brand-dark dark:text-white px-4 py-2 rounded-lg font-semibold hover:bg-white transition-colors border border-brand-primary/20">
                              <BookmarkIcon className="w-5 h-5 text-brand-primary" />
                              {t.app.saveSearch}
                          </button>
                      </div>

                      {activeTab === 'all' ? (
                          filteredProperties.length > 0 ? (
                              <PropertyList 
                                  properties={filteredProperties}
                                  currentUser={currentUser}
                                  onSaveToggle={handleSaveToggle}
                                  savedPropertyIds={savedPropertyIds}
                                  onOpenCalculator={handleOpenCalculator}
                                  onOpenTourModal={handleOpenTourModal}
                                  onFindSimilar={handleFindSimilar}
                                  onOpenDetailModal={handleOpenDetailModal}
                                  onToggleCompare={handleToggleCompare}
                                  onOpenVRTour={handleOpenVRTour}
                                  compareList={compareList}
                                  onEdit={handleEditProperty}
                                  onDelete={handleDeleteProperty}
                                  isLoading={isLoadingProperties}
                              />
                          ) : <p className="text-center text-slate-500 dark:text-slate-400">{t.app.noPropertiesFound}<br/>{t.app.adjustFilters}</p>
                      ) : (
                          savedProperties.length > 0 ? (
                              <PropertyList 
                                  properties={savedProperties}
                                  currentUser={currentUser}
                                  onSaveToggle={handleSaveToggle}
                                  savedPropertyIds={savedPropertyIds}
                                  onOpenCalculator={handleOpenCalculator}
                                  onOpenTourModal={handleOpenTourModal}
                                  onFindSimilar={handleFindSimilar}
                                  onOpenDetailModal={handleOpenDetailModal}
                                  onToggleCompare={handleToggleCompare}
                                  onOpenVRTour={handleOpenVRTour}
                                  compareList={compareList}
                                  onEdit={handleEditProperty}
                                  onDelete={handleDeleteProperty}
                                  isLoading={isLoadingProperties}
                              />
                          ) : <p className="text-center text-slate-500 dark:text-slate-400">{t.app.noSavedProperties}</p>
                      )}

                  </div>
                  </section>
                  
                  {currentUser && savedProperties.length > 0 && 
                      <PersonalizedMatches 
                          savedProperties={savedProperties}
                          allProperties={allProperties}
                          currentUser={currentUser}
                          onSaveToggle={handleSaveToggle}
                          savedPropertyIds={savedPropertyIds}
                          onOpenCalculator={handleOpenCalculator}
                          onOpenTourModal={handleOpenTourModal}
                          onFindSimilar={handleFindSimilar}
                          onOpenDetailModal={handleOpenDetailModal}
                          onToggleCompare={handleToggleCompare}
                          onOpenVRTour={handleOpenVRTour}
                          compareList={compareList}
                          onEdit={handleEditProperty}
                          onDelete={handleDeleteProperty}
                      />
                  }
                  
                  <MarketInsights />
                  <RealTimeNews />

                  {targetPropertyForSimilar && 
                      <RecommendedProperties
                          targetProperty={targetPropertyForSimilar}
                          allProperties={allProperties}
                          currentUser={currentUser}
                          onSaveToggle={handleSaveToggle}
                          savedPropertyIds={savedPropertyIds}
                          onOpenCalculator={handleOpenCalculator}
                          onOpenTourModal={handleOpenTourModal}
                          onFindSimilar={handleFindSimilar}
                          onOpenDetailModal={handleOpenDetailModal}
                          onToggleCompare={handleToggleCompare}
                          onOpenVRTour={handleOpenVRTour}
                          compareList={compareList}
                          onEdit={handleEditProperty}
                          onDelete={handleDeleteProperty}
                      />
                  }

                  <FinancialServices />
                  <NeighborhoodSection onOpenExplorer={handleOpenNeighborhoodExplorer} />
                  <BlogSection posts={blogPosts} onPostClick={handleBlogClick} isLoading={isLoadingBlog}/>
              </>
          );
      }
  };


  return (
    <div className={`font-sans min-h-screen flex flex-col ${theme}`}>
      <Header
        currentUser={currentUser}
        notifications={notificationsWithReadStatus}
        readNotificationIds={readNotificationIds}
        onLoginClick={() => { setAuthModalView('login'); setIsAuthModalOpen(true); }}
        onSignUpClick={() => setPage('pricing')}
        onDashboardClick={() => setIsDashboardOpen(true)}
        onListPropertyClick={handleListPropertyClick}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsAsRead={handleMarkAllAsRead}
        onHomeClick={() => setPage('home')}
        onAboutClick={() => setPage('about')}
        onServicesClick={() => setPage('services')}
        onContactClick={() => setPage('contact')}
      />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer 
        onAboutClick={() => setPage('about')}
        onContactClick={() => setPage('contact')}
        onBlogClick={() => {
            setPage('home');
            setTimeout(() => {
                const blog = document.getElementById('blog');
                if (blog) blog.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }}
        onPrivacyPolicyClick={() => setIsPrivacyPolicyModalOpen(true)}
        onTermsOfServiceClick={() => setIsTermsOfServiceModalOpen(true)}
        onCareersClick={() => setIsCareersModalOpen(true)}
        onFindAProClick={() => setIsProviderServicesModalOpen(true)}
      />
      <Chatbot />
      
      <div className="fixed bottom-20 right-4 sm:right-6 z-50">
          <button
              onClick={() => setIsAIVoiceChatOpen(true)}
              className="bg-brand-gold text-brand-dark rounded-full p-4 shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 transition-transform duration-200 border-4 border-white"
              aria-label="Start AI Voice Chat"
          >
              <ChatBubbleLeftRightIcon className="w-8 h-8" />
          </button>
      </div>
      <AIVoiceChat isOpen={isAIVoiceChatOpen} onClose={() => setIsAIVoiceChatOpen(false)} />

      {selectedProperty && <MortgageCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} propertyPrice={selectedProperty.price} propertyTitle={selectedProperty.title} />}
      {selectedProperty && <ScheduleTourModal isOpen={isTourModalOpen} onClose={() => setIsTourModalOpen(false)} propertyTitle={selectedProperty.title} propertyId={selectedProperty.id} agentName={selectedProperty.agent.name} onSubmit={handleScheduleTour} />}
      {selectedProperty && <PropertyDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} property={selectedProperty} currentUser={currentUser} onOpenAgentContact={(mode, name) => { setAgentContactMode(mode); setAgentContactName(name); setIsAgentContactModalOpen(true); }} onOpenVRTour={handleOpenVRTour} onMessageAgent={handleMessageAgent} onLeaveReview={handleLeaveReview} />}
      {compareList.length > 0 && <CompareBar properties={compareList} onCompare={() => setIsCompareModalOpen(true)} onClear={() => setCompareList([])} onRemove={(p) => setCompareList(prev => prev.filter(item => item.id !== p.id))} />}
      <CompareModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} properties={compareList} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
        initialView={authModalView}
        onSwitchToPricing={() => {
            setIsAuthModalOpen(false);
            setPage('pricing');
        }}
      />
      {currentUser && 
          <UserDashboardModal
            isOpen={isDashboardOpen}
            onClose={() => setIsDashboardOpen(false)}
            user={currentUser}
            allProperties={allProperties}
            investmentProperties={investmentProperties}
            tourRequests={tourRequests}
            receivedInquiries={receivedInquiries}
            savedSearches={savedSearches}
            savedProperties={savedProperties}
            propertiesToCompare={compareList}
            messages={messages}
            calendarEvents={calendarEvents}
            agentProfile={agentProfile}
            agentReviews={agentReviews}
            leads={leads}
            agentAchievements={agentAchievements}
            investorAchievements={investorAchievements}
            investmentRequests={investmentRequests}
            investorSettings={investorSettings}
            currency={currency}
            theme={theme}
            onLogout={handleLogout}
            onEditProperty={handleEditProperty}
            onDeleteProperty={handleDeleteProperty}
            onDraftReply={(inquiry) => {setInquiryForResponse(inquiry); setIsAIResponseModalOpen(true);}}
            onRunSearch={handleRunSearch}
            onDeleteSearch={handleDeleteSearch}
            onListPropertyClick={handleListPropertyClick}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenAIImprovementModal={handleOpenAIImprovementModal}
            onUpdateAgentProfile={handleUpdateAgentProfile}
            onUpdateAgentAchievements={setAgentAchievements}
            onUpdateInvestorAchievements={setInvestorAchievements}
            onUpdateInvestorSettings={handleUpdateInvestorSettings}
            onThemeToggle={handleThemeToggle}
            onCompareClick={() => setIsCompareModalOpen(true)}
            onCurrencyChange={setCurrency}
            onUpgradeAccountRequest={handleUpgradeAccountRequest}
            onSaveToggle={handleSaveToggle}
            savedPropertyIds={savedPropertyIds}
            onOpenCalculator={handleOpenCalculator}
            onOpenTourModal={handleOpenTourModal}
            onFindSimilar={handleFindSimilar}
            onOpenDetailModal={handleOpenDetailModal}
            onToggleCompare={handleToggleCompare}
            onOpenVRTour={handleOpenVRTour}
          />
      }
      {currentUser && <PropertyFormModal isOpen={isPropertyFormOpen} onClose={() => setIsPropertyFormOpen(false)} onSave={handleSaveProperty} propertyToEdit={propertyToEdit} currentUser={currentUser} />}
      {inquiryForResponse && <AIResponseModal isOpen={isAIResponseModalOpen} onClose={() => setIsAIResponseModalOpen(false)} tourRequest={inquiryForResponse} />}
      <AgentContactModal isOpen={isAgentContactModalOpen} onClose={() => setIsAgentContactModalOpen(false)} mode={agentContactMode} agentName={agentContactName} />
      <VRTourModal isOpen={isVRTourOpen} onClose={() => setIsVRTourOpen(false)} url={vrTourUrl} />
      {selectedProperty && <MessageModal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} property={selectedProperty} onSend={handleSendMessage} />}
      {agentForReview && <AgentReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} agentName={agentForReview.name} onSubmit={handleSubmitReview} />}
      {aiImprovementProperty && <AIImprovementModal isOpen={isAIImprovementModalOpen} onClose={() => setIsAIImprovementModalOpen(false)} property={aiImprovementProperty} />}
      {currentUser?.role === 'investor' && <InvestmentRequestModal isOpen={isInvestmentRequestModalOpen} onClose={() => setIsInvestmentRequestModalOpen(false)} onSendRequest={handleSendInvestmentRequest} />}
      <UpgradeToInvestorModal 
        isOpen={isUpgradeToInvestorModalOpen}
        onClose={() => setIsUpgradeToInvestorModalOpen(false)}
        onConfirm={handleUpgradeAccountRequest}
      />
      <PrivacyPolicyModal isOpen={isPrivacyPolicyModalOpen} onClose={() => setIsPrivacyPolicyModalOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOfServiceModalOpen} onClose={() => setIsTermsOfServiceModalOpen(false)} />
      <CareersModal 
        isOpen={isCareersModalOpen} 
        onClose={() => setIsCareersModalOpen(false)}
        onApplyClick={handleOpenApplicationModal}
      />
      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        jobTitle={applyingForJob}
        onSubmit={handleApplicationSubmit}
      />
      <NeighborhoodExplorerModal 
        isOpen={isNeighborhoodExplorerOpen}
        onClose={() => setIsNeighborhoodExplorerOpen(false)}
        initialNeighborhoodId={initialNeighborhoodId}
        savedNeighborhoodIds={savedNeighborhoodIds}
        onSaveToggle={handleSaveNeighborhoodToggle}
      />
      <ServiceRegistrationModal 
        isOpen={isServiceRegistrationModalOpen}
        onClose={() => setIsServiceRegistrationModalOpen(false)}
      />
       {selectedBlogPost && (
          <BlogDetailModal
              isOpen={isBlogDetailModalOpen}
              onClose={() => setIsBlogDetailModalOpen(false)}
              post={selectedBlogPost}
              onContactClick={() => {
                  setIsBlogDetailModalOpen(false);
                  setPage('contact');
              }}
          />
       )}
       <ProviderServicesModal 
          isOpen={isProviderServicesModalOpen}
          onClose={() => {
              setIsProviderServicesModalOpen(false);
              setProviderServiceFilter(undefined);
          }}
          onContactProvider={handleContactProvider}
          initialServiceFilter={providerServiceFilter}
       />
       <SessionTimeoutModal
            isOpen={isSessionWarningOpen}
            onClose={handleStayLoggedIn}
            onLogout={handleLogout}
            countdown={sessionCountdown}
        />
    </div>
  );
};

export default App;