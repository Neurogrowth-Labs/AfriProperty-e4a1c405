import { ALL_PROPERTIES as initialProperties, MOCK_NOTIFICATIONS } from '../constants';
// @pre-existing-fix-comment
// FIX: Import NotificationType to resolve reference error.
import type { Property, TourRequest, User, SearchFilters, Message, Review, CalendarEvent, AgentProfile, Lead, LeadActivity, InvestorSettings, DashboardWidget, InvestmentRequest, PropertyAlert, UserDocument, Notification } from '../types';
import { EventType, ActivityType, NotificationType } from '../types';

// --- Agent Profile Management ---

// Seed initial data for demo agents
const initialAgentProfiles: Record<string, AgentProfile> = {
    'Jane Doe': {
        username: 'Jane Doe',
        bio: 'Top-producing agent specializing in luxury downtown condos and lofts. With over 10 years of experience in the Urbanville market, I bring a wealth of knowledge and a commitment to finding my clients their perfect home.',
        email: 'jane.doe@afriproperty.co.za',
        phone: '555-123-4567',
        profilePicture: 'https://i.pravatar.cc/150?u=janedoe',
        socials: {
            twitter: 'https://twitter.com/janedoe',
            linkedin: 'https://linkedin.com/in/janedoe',
        }
    },
    'Susan Miller': {
        username: 'Susan Miller',
        bio: 'Your friendly neighborhood expert in suburban family homes. I pride myself on my deep understanding of school districts, community amenities, and finding homes with heart.',
        email: 'susan.miller@afriproperty.co.za',
        phone: '555-111-2222',
        profilePicture: 'https://i.pravatar.cc/150?u=susanmiller',
        socials: {
            facebook: 'https://facebook.com/susanmiller',
        }
    }
};

const getAgentProfiles = (): Record<string, AgentProfile> => {
    const profilesJSON = localStorage.getItem('agent_profiles');
    if (profilesJSON) {
        return JSON.parse(profilesJSON);
    }
    // If no profiles in storage, seed with initial data
    localStorage.setItem('agent_profiles', JSON.stringify(initialAgentProfiles));
    return initialAgentProfiles;
};

export const getAgentProfile = (username: string): AgentProfile => {
    const profiles = getAgentProfiles();
    if (profiles[username]) {
        return profiles[username];
    }
    
    // Profile doesn't exist, create a default one.
    const defaultProfile: AgentProfile = {
        username: username,
        bio: `Welcome to AfriProperty! Tell clients a bit about yourself. You can edit this bio in your profile settings.`,
        email: `${username.toLowerCase().replace(/\s+/g, '.')}@afriproperty.co.za`,
        phone: 'Please add your phone number.',
        profilePicture: `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
        socials: {
            twitter: '',
            linkedin: '',
            facebook: '',
        }
    };
    
    // Add the new profile to the existing ones and save back to localStorage.
    profiles[username] = defaultProfile;
    localStorage.setItem('agent_profiles', JSON.stringify(profiles));
    
    return defaultProfile;
};

export const updateAgentProfile = (username: string, updatedProfile: AgentProfile): AgentProfile => {
    const profiles = getAgentProfiles();
    profiles[username] = updatedProfile;
    localStorage.setItem('agent_profiles', JSON.stringify(profiles));
    return updatedProfile;
};


// --- Review Management ---
export const getReviews = (): Review[] => {
    const reviewsJSON = localStorage.getItem('reviews');
    return reviewsJSON ? JSON.parse(reviewsJSON) : [];
};

export const getReviewsForAgent = (agentName: string): Review[] => {
    const allReviews = getReviews();
    return allReviews.filter(review => review.agentName === agentName).sort((a, b) => b.timestamp - a.timestamp);
};

export const addReview = (reviewData: Omit<Review, 'id' | 'timestamp'>): Review => {
    const allReviews = getReviews();
    const newReview: Review = {
        ...reviewData,
        id: `review_${Date.now()}`,
        timestamp: Date.now(),
    };
    allReviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(allReviews));
    return newReview;
};

// --- Property Management ---
export const getProperties = (): Property[] => {
    const propertiesJSON = localStorage.getItem('properties');
    let properties: Property[] = propertiesJSON ? JSON.parse(propertiesJSON) : initialProperties;

    // Dynamically calculate agent ratings
    const allReviews = getReviews();
    const agentRatings: Record<string, { totalRating: number; count: number }> = {};

    allReviews.forEach(review => {
        if (!agentRatings[review.agentName]) {
            agentRatings[review.agentName] = { totalRating: 0, count: 0 };
        }
        agentRatings[review.agentName].totalRating += review.rating;
        agentRatings[review.agentName].count++;
    });

    properties = properties.map((prop: Property) => {
        const ratingData = agentRatings[prop.agent.name];
        const originalAgentData = initialProperties.find(p => p.id === prop.id)?.agent;

        if (ratingData) {
            return {
                ...prop,
                agent: {
                    ...prop.agent,
                    rating: parseFloat((ratingData.totalRating / ratingData.count).toFixed(1)),
                    reviewCount: ratingData.count,
                }
            };
        }
        // If no reviews, return original or default values
        return {
            ...prop,
            agent: {
                ...prop.agent,
                rating: originalAgentData?.rating || 0,
                reviewCount: originalAgentData?.reviewCount || 0
            }
        };
    });

    if (!propertiesJSON) {
        // Seed with initial data if none exists
        localStorage.setItem('properties', JSON.stringify(properties));
    }
    
    return properties;
};

export const saveProperties = (properties: Property[]): void => {
    localStorage.setItem('properties', JSON.stringify(properties));
};

export const incrementPropertyView = (propertyId: string): Property[] => {
    const properties = getProperties();
    const newProperties = properties.map(p => {
        if (p.id === propertyId) {
            return { ...p, views: (p.views || 0) + 1 };
        }
        return p;
    });
    saveProperties(newProperties);
    return newProperties;
};

// --- User Management ---
const initialUsers: User[] = [
    { username: 'Jane Doe', fullName: 'Jane Doe Agency', email: 'jane.doe@example.com', password: 'Password123!', role: 'agent', isVerified: true, phone: '555-123-4567', officeAddress: '123 Main St, Urbanville' },
    { username: 'Peter Van der Merwe', fullName: 'Peter Van der Merwe', email: 'peter.vdm@example.com', password: 'Password123!', role: 'investor', isVerified: true, companyName: 'VDM Capital', investmentType: 'Corporate' },
];

export const getUsers = (): User[] => {
    const usersJSON = localStorage.getItem('users');
    if (usersJSON) {
        return JSON.parse(usersJSON);
    }
    localStorage.setItem('users', JSON.stringify(initialUsers));
    return initialUsers;
};

// In a real app, you would hash passwords before saving.
export const addUser = (user: User): { success: boolean, message: string } => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        return { success: false, message: "An account with this email already exists." };
    }
    // New agents/investors are not verified by default
    if (user.role === 'agent' || user.role === 'investor') {
        user.isVerified = false;
    } else {
        user.isVerified = true; // 'user' roles are auto-verified for now
    }
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: "User created successfully." };
};

export const findUserByEmail = (email: string): User | undefined => {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// This is a simplified authentication for demonstration.
// In a real app, you would use a secure method like hashing and salting.
export const authenticateUser = (email: string, password: string): { user: User | null; error?: string } => {
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
        return { user: null, error: 'Invalid email or password.' };
    }
    if (user.role === 'agent' && !user.isVerified) {
        return { user: null, error: 'pending_verification_agent' };
    }
    if (user.role === 'investor' && !user.isVerified) {
        return { user: null, error: 'pending_verification_investor' };
    }
    return { user };
};


// --- Saved Properties Management (Per User) ---
export const getSavedPropertiesForUser = (username: string): Set<string> => {
    const savedJSON = localStorage.getItem(`saved_properties_${username}`);
    return savedJSON ? new Set(JSON.parse(savedJSON) as string[]) : new Set<string>();
};

export const savePropertiesForUser = (username: string, propertyIds: string[]): void => {
    localStorage.setItem(`saved_properties_${username}`, JSON.stringify(propertyIds));
};

// --- Saved Searches Management (Per User) ---
export const getSavedSearchesForUser = (username: string): SearchFilters[] => {
    const searchesJSON = localStorage.getItem(`saved_searches_${username}`);
    return searchesJSON ? JSON.parse(searchesJSON) : [];
};

export const saveSearchesForUser = (username: string, searches: SearchFilters[]): void => {
    localStorage.setItem(`saved_searches_${username}`, JSON.stringify(searches));
};


// --- Tour Request Management ---
export const getTourRequests = (username: string): TourRequest[] => {
    const allRequestsJSON = localStorage.getItem('tour_requests');
    const allRequests: TourRequest[] = allRequestsJSON ? JSON.parse(allRequestsJSON) : [];
    return allRequests.filter(req => req.username === username);
};

export const getInquiriesForSeller = (username: string): TourRequest[] => {
    const allProperties = getProperties();
    const sellerPropertyIds = allProperties
        .filter(p => p.agent.name === username)
        .map(p => p.id);
    
    if (sellerPropertyIds.length === 0) return [];

    const allRequestsJSON = localStorage.getItem('tour_requests');
    const allRequests: TourRequest[] = allRequestsJSON ? JSON.parse(allRequestsJSON) : [];
    
    return allRequests.filter(req => sellerPropertyIds.includes(req.propertyId));
};

export const addTourRequest = (username: string, propertyId: string, propertyTitle: string, date: string, time: string): TourRequest => {
    const allRequestsJSON = localStorage.getItem('tour_requests');
    const allRequests: TourRequest[] = allRequestsJSON ? JSON.parse(allRequestsJSON) : [];
    
    const newRequest: TourRequest = {
        id: `tour_${Date.now()}`,
        propertyId,
        propertyTitle,
        username,
        date,
        time,
        status: 'Pending',
        timestamp: Date.now(),
    };
    
    allRequests.push(newRequest);
    localStorage.setItem('tour_requests', JSON.stringify(allRequests));
    return newRequest;
};

// @pre-existing-fix-comment
// --- User Profile (Alerts, Documents) ---
export const getPropertyAlerts = (username: string): PropertyAlert[] => {
    const alertsJSON = localStorage.getItem(`property_alerts_${username}`);
    return alertsJSON ? JSON.parse(alertsJSON) : [];
};

export const addPropertyAlert = (username: string, alertData: Omit<PropertyAlert, 'id'>): PropertyAlert => {
    const allAlerts = getPropertyAlerts(username);
    const newAlert: PropertyAlert = {
        ...alertData,
        id: `alert_${Date.now()}`,
    };
    allAlerts.unshift(newAlert);
    localStorage.setItem(`property_alerts_${username}`, JSON.stringify(allAlerts));
    return newAlert;
};

export const deletePropertyAlert = (username: string, alertId: string): void => {
    const allAlerts = getPropertyAlerts(username);
    const filteredAlerts = allAlerts.filter(a => a.id !== alertId);
    localStorage.setItem(`property_alerts_${username}`, JSON.stringify(filteredAlerts));
};

export const getUserDocuments = (username: string): UserDocument[] => {
    const docsJSON = localStorage.getItem(`user_documents_${username}`);
    return docsJSON ? JSON.parse(docsJSON) : [];
};

export const addUserDocument = (username: string, file: File): UserDocument => {
    const allDocs = getUserDocuments(username);
    const newDoc: UserDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image') ? 'image' : (file.type.includes('pdf') ? 'pdf' : 'doc'),
        uploadDate: Date.now(),
        url: URL.createObjectURL(file), // For demo purposes, in real app this would be an upload URL
    };
    allDocs.unshift(newDoc);
    localStorage.setItem(`user_documents_${username}`, JSON.stringify(allDocs));
    return newDoc;
};

export const deleteUserDocument = (username: string, docId: string): void => {
    const allDocs = getUserDocuments(username);
    const filteredDocs = allDocs.filter(d => d.id !== docId);
    localStorage.setItem(`user_documents_${username}`, JSON.stringify(filteredDocs));
};

// --- Messaging System ---
export const getMessages = (): Message[] => {
    const messagesJSON = localStorage.getItem('messages');
    // Seed messages if none exist
    if (!messagesJSON) {
        const seedMessages: Message[] = [
            { id: 'msg1', propertyId: '12', propertyTitle: 'Luxury Hotel Development', senderUsername: 'Peter Van der Merwe', receiverUsername: 'dev_team_1', text: 'What is the projected completion date for phase 1?', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
            { id: 'msg2', propertyId: '12', propertyTitle: 'Luxury Hotel Development', senderUsername: 'dev_team_1', receiverUsername: 'Peter Van der Merwe', text: 'Hi Peter, we are on track for Q4 2025 as per the prospectus. We will share a detailed timeline next week.', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
        ];
        localStorage.setItem('messages', JSON.stringify(seedMessages));
        return seedMessages;
    }
    return JSON.parse(messagesJSON);
};

export const getMessagesForUser = (username: string): Message[] => {
    const allMessages = getMessages();
    return allMessages.filter(m => m.senderUsername === username || m.receiverUsername === username);
};

export const sendMessage = (msgData: Omit<Message, 'id' | 'timestamp'>): Message => {
    const allMessages = getMessages();
    const newMessage: Message = {
        ...msgData,
        id: `msg_${Date.now()}`,
        timestamp: Date.now(),
    };
    allMessages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(newMessage));
    return newMessage;
};

// --- Calendar Event Management ---
const getInitialEvents = (): CalendarEvent[] => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return [
    {
      id: 'event1',
      title: 'Showing for Modern Downtown Loft',
      date: formatDate(today),
      startTime: '14:00',
      endTime: '15:00',
      type: EventType.SHOWING,
      notes: 'Client: John Smith. Interested in 2-bed units.'
    },
    {
      id: 'event2',
      title: 'Client Meeting - The Millers',
      date: formatDate(today),
      startTime: '10:00',
      endTime: '10:30',
      type: EventType.MEETING,
      notes: 'Discussing offer strategy for the suburbs.'
    },
     {
      id: 'event3',
      title: 'Contract Deadline - 45 Green Valley',
      date: formatDate(nextWeek),
      startTime: '17:00',
      endTime: '17:00',
      type: EventType.DEADLINE,
    }
  ];
};

export const getEvents = (username: string): CalendarEvent[] => {
    const eventsJSON = localStorage.getItem(`calendar_events_${username}`);
    if (eventsJSON) {
        return JSON.parse(eventsJSON);
    }
    // Seed with initial data for demo purposes
    if (username === 'Jane Doe' || username === 'Susan Miller') {
        const initialEvents = getInitialEvents();
        localStorage.setItem(`calendar_events_${username}`, JSON.stringify(initialEvents));
        return initialEvents;
    }
    return [];
};

const saveEvents = (username: string, events: CalendarEvent[]): void => {
    localStorage.setItem(`calendar_events_${username}`, JSON.stringify(events));
};

export const addEvent = (username: string, eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const allEvents = getEvents(username);
    const newEvent: CalendarEvent = {
        ...eventData,
        id: `event_${Date.now()}`
    };
    allEvents.push(newEvent);
    saveEvents(username, allEvents);
    return newEvent;
};

export const updateEvent = (username: string, updatedEvent: CalendarEvent): CalendarEvent => {
    const allEvents = getEvents(username);
    const eventIndex = allEvents.findIndex(e => e.id === updatedEvent.id);
    if (eventIndex > -1) {
        allEvents[eventIndex] = updatedEvent;
        saveEvents(username, allEvents);
    }
    return updatedEvent;
};

export const deleteEvent = (username: string, eventId: string): void => {
    const allEvents = getEvents(username);
    const filteredEvents = allEvents.filter(e => e.id !== eventId);
    saveEvents(username, allEvents);
};

// --- Lead Management ---
export const getLeadsForAgent = (agentUsername: string): Lead[] => {
    const allProperties = getProperties();
    const agentProperties = allProperties.filter(p => p.agent.name === agentUsername);
    const agentPropertyIds = new Set(agentProperties.map(p => p.id));

    if (agentPropertyIds.size === 0) return [];

    const allTourRequests: TourRequest[] = JSON.parse(localStorage.getItem('tour_requests') || '[]');
    const agentTourRequests = allTourRequests.filter(r => agentPropertyIds.has(r.propertyId));
    
    const allMessages = getMessages();
    const agentMessages = allMessages.filter(m => m.receiverUsername === agentUsername);

    const leadsData: Record<string, { activity: LeadActivity[], lastContact: number }> = {};

    // Process tour requests
    agentTourRequests.forEach(req => {
        const username = req.username;
        if (!leadsData[username]) {
            leadsData[username] = { activity: [], lastContact: 0 };
        }
        leadsData[username].activity.push({
            type: ActivityType.TOUR_REQUESTED,
            timestamp: req.timestamp,
            propertyTitle: req.propertyTitle,
            detail: `Requested for ${req.date} at ${req.time}`
        });
        if (req.timestamp > leadsData[username].lastContact) {
            leadsData[username].lastContact = req.timestamp;
        }
    });

    // Process messages
    agentMessages.forEach(msg => {
        const username = msg.senderUsername;
        if (!leadsData[username]) {
            leadsData[username] = { activity: [], lastContact: 0 };
        }
        leadsData[username].activity.push({
            type: ActivityType.MESSAGE_SENT,
            timestamp: msg.timestamp,
            propertyTitle: msg.propertyTitle,
            detail: msg.text
        });
        if (msg.timestamp > leadsData[username].lastContact) {
            leadsData[username].lastContact = msg.timestamp;
        }
    });

    const leads: Lead[] = Object.entries(leadsData).map(([username, data]) => {
        // Simple scoring: 5 points per tour request, 2 per message
        const score = data.activity.reduce((acc, act) => {
            if (act.type === ActivityType.TOUR_REQUESTED) return acc + 5;
            if (act.type === ActivityType.MESSAGE_SENT) return acc + 2;
            return acc;
        }, 0);

        return {
            id: username,
            username: username,
            // Mocking email and phone for display
            email: `${username.toLowerCase().replace(' ', '.')}@example.com`,
            phone: `555-XXX-${Math.floor(1000 + Math.random() * 9000)}`,
            score,
            lastContact: data.lastContact,
            activity: data.activity.sort((a, b) => b.timestamp - a.timestamp)
        };
    });

    // Sort leads by score (descending)
    return leads.sort((a, b) => b.score - a.score);
};

// --- Investor Specific Data ---
const defaultInvestorSettings: InvestorSettings = {
    widgets: [
        { id: 'total_investment', label: 'Total Investment', isVisible: true },
        { id: 'portfolio_value', label: 'Current Portfolio Value', isVisible: true },
        { id: 'asset_appreciation', label: 'Asset Appreciation', isVisible: true },
        { id: 'monthly_income', label: 'Monthly Rental Income', isVisible: true },
        { id: 'global_map', label: 'Global Asset Overview', isVisible: true },
        { id: 'watchlist_properties', label: 'Watchlist Properties', isVisible: true },
    ],
    alerts: {
        priceDrop: true,
        roiThreshold: {
            isEnabled: false,
            value: 20,
        },
        rentalVacancy: false,
    },
    apiToken: `prop_api_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`,
};


export const getInvestorSettings = (username: string): InvestorSettings => {
    const settingsJSON = localStorage.getItem(`investor_settings_${username}`);
    if (settingsJSON) {
        // Simple migration: if new widgets are added, merge them in.
        const savedSettings = JSON.parse(settingsJSON);
        const defaultWidgets = defaultInvestorSettings.widgets;
        const savedWidgetIds = new Set(savedSettings.widgets.map((w: DashboardWidget) => w.id));

        const mergedWidgets = [
            ...savedSettings.widgets,
            ...defaultWidgets.filter(w => !savedWidgetIds.has(w.id))
        ];
        
        return { ...defaultInvestorSettings, ...savedSettings, widgets: mergedWidgets };
    }
    // If no settings in storage, create and save default ones
    localStorage.setItem(`investor_settings_${username}`, JSON.stringify(defaultInvestorSettings));
    return defaultInvestorSettings;
};

export const saveInvestorSettings = (username: string, settings: InvestorSettings): void => {
    localStorage.setItem(`investor_settings_${username}`, JSON.stringify(settings));
};

export const getInvestmentRequests = (): InvestmentRequest[] => {
    const requestsJSON = localStorage.getItem('investment_requests');
    return requestsJSON ? JSON.parse(requestsJSON) : [];
};

export const addInvestmentRequest = (username: string, requestDetails: string): InvestmentRequest => {
    const allRequests = getInvestmentRequests();
    const newRequest: InvestmentRequest = {
        id: `inv_req_${Date.now()}`,
        investorUsername: username,
        requestDetails,
        timestamp: Date.now(),
        status: 'Open',
    };
    allRequests.unshift(newRequest);
    localStorage.setItem('investment_requests', JSON.stringify(allRequests));
    return newRequest;
};

export const getInvestorReturns = () => {
    // Mock data
    return [
        { id: 'div1', propertyId: '12', propertyTitle: 'Luxury Hotel Development', date: '2023-10-01', amount: 12500, type: 'Dividend' },
        { id: 'div2', propertyId: '13', propertyTitle: 'Downtown Office Block', date: '2023-10-01', amount: 8200, type: 'Dividend' },
        { id: 'div3', propertyId: '12', propertyTitle: 'Luxury Hotel Development', date: '2023-07-01', amount: 11800, type: 'Dividend' },
    ];
};

export const getInvestorDocuments = () => {
    // Mock data
    return [
        { id: 'doc1', name: 'Contract - Hotel Development.pdf', type: 'Contract', date: '2022-01-15', url: '#' },
        { id: 'doc2', name: 'Q3 2023 Portfolio Statement.pdf', type: 'Statement', date: '2023-10-05', url: '#' },
        { id: 'doc3', name: 'Contract - Office Block.pdf', type: 'Contract', date: '2021-06-20', url: '#' },
        { id: 'doc4', name: 'Q2 2023 Portfolio Statement.pdf', type: 'Statement', date: '2023-07-05', url: '#' },
    ];
};

// --- Notification System ---
export const getNotifications = (user: User): Omit<Notification, 'isRead'>[] => {
    // In a real app, this would be an API call tailored to the user.
    // Here, we'll just return the mock data for any logged-in user.
    // We'll filter out agent-specific notifications for non-agents.
    if (user.role !== 'agent') {
        return MOCK_NOTIFICATIONS.filter(n => n.type !== NotificationType.INQUIRY);
    }
    return MOCK_NOTIFICATIONS;
};

export const getReadNotificationIds = (username: string): Set<string> => {
    const idsJSON = localStorage.getItem(`read_notifications_${username}`);
    return idsJSON ? new Set(JSON.parse(idsJSON)) : new Set();
};

export const markNotificationsAsRead = (username: string, ids: string[]): Set<string> => {
    const currentReadIds = getReadNotificationIds(username);
    ids.forEach(id => currentReadIds.add(id));
    localStorage.setItem(`read_notifications_${username}`, JSON.stringify([...currentReadIds]));
    return currentReadIds;
};