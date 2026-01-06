
import { ALL_PROPERTIES as initialProperties, MOCK_NOTIFICATIONS } from '../constants';
import type { Property, TourRequest, User, SearchFilters, Message, Review, CalendarEvent, AgentProfile, Lead, InvestorSettings, InvestmentRequest, PropertyAlert, UserDocument, Notification } from '../types';
import { ListingType, PropertyStatus } from '../types';
import { supabase } from './supabase';

// --- Helper for handling Supabase errors ---
const handleError = (error: any, message: string) => {
    if (error) {
        let errorMessage = 'Unknown error';
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && typeof error === 'object') {
            errorMessage = error.message || error.details || error.hint || JSON.stringify(error);
        }
        console.error(`[AfriProperty] ${message}: ${errorMessage}`);
        return true;
    }
    return false;
};

// --- Agent Profile Management ---
export const getAgentProfile = async (username: string): Promise<AgentProfile> => {
    try {
        const { data, error } = await supabase
            .from('agent_profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (error && error.code !== 'PGRST116') {
            handleError(error, 'Error fetching agent profile');
        }

        if (data) return data;
    } catch (e) {
        console.warn("Table 'agent_profiles' might be missing, using default.");
    }

    return {
        username: username,
        bio: `Welcome to AfriProperty! Tell clients a bit about yourself.`,
        email: `${username.toLowerCase().replace(/\s+/g, '.')}@afriproperty.co.za`,
        phone: 'Please add your phone number.',
        profilePicture: `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
        socials: { twitter: '', linkedin: '', facebook: '' }
    };
};

export const updateAgentProfile = async (username: string, updatedProfile: AgentProfile): Promise<AgentProfile> => {
    const { error } = await supabase
        .from('agent_profiles')
        .update(updatedProfile)
        .eq('username', username);
    
    handleError(error, 'Error updating agent profile');
    return updatedProfile;
};

// --- Review Management ---
export const getReviews = async (): Promise<Review[]> => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('timestamp', { ascending: false });
    
    if (error) {
        handleError(error, 'Error fetching reviews');
        return [];
    }
    return data || [];
};

export const getReviewsForAgent = async (agentName: string): Promise<Review[]> => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('agent_name', agentName)
        .order('timestamp', { ascending: false });
    
    if (error) return [];
    return data || [];
};

export const addReview = async (reviewData: Omit<Review, 'id' | 'timestamp'>): Promise<Review> => {
    const newReview: any = {
        ...reviewData,
        timestamp: Date.now(),
    };
    const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select()
        .single();
    
    handleError(error, 'Error adding review');
    return data;
};

// --- Property Management ---
export const getProperties = async (): Promise<Property[]> => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('date_listed', { ascending: false });

        if (error) {
            handleError(error, 'Error fetching properties (falling back to mock data)');
            return initialProperties;
        }

        if (!data || data.length === 0) return initialProperties;

        return data.map(p => ({
            ...p,
            dateListed: p.date_listed,
            listingType: p.listing_type,
            propertyType: p.property_type,
            purchasePrice: p.purchase_price,
            neighborhoodInfo: p.neighborhood_info,
            virtualTourUrl: p.virtual_tour_url,
            vrTourUrl: p.vr_tour_url,
            smartContractReady: p.smart_contract_ready,
            priceHistory: p.price_history,
            occupancyRate: p.occupancy_rate,
            marketROI: p.market_roi,
            perNightPrice: p.per_night_price,
            packageIncludes: p.package_includes,
            vehicleType: p.vehicle_type
        }));
    } catch (criticalErr) {
        console.warn("Failed to fetch from Supabase, using mock data.");
        return initialProperties;
    }
};

export const saveProperties = async (properties: Property[]): Promise<void> => {
    const { error } = await supabase.from('properties').upsert(properties.map(p => ({
        ...p,
        listing_type: p.listingType,
        property_type: p.propertyType
    })));
    handleError(error, 'Error upserting properties');
};

export const incrementPropertyView = async (propertyId: string): Promise<void> => {
    await supabase.rpc('increment_views', { prop_id: propertyId });
};

// --- User Management ---
export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return [];
    return data || [];
};

export const addUser = async (user: User): Promise<{ success: boolean, message: string }> => {
    const { error } = await supabase.from('profiles').insert({
        ...user,
        is_verified: user.role === 'user'
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "User created successfully." };
};

export const authenticateUser = async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error || !data) return { user: null, error: 'Invalid email or password.' };
        
        if ((data.role === 'agent' || data.role === 'investor') && !data.is_verified) {
            return { user: null, error: `pending_verification_${data.role}` };
        }
        
        return { user: data };
    } catch (e) {
        return { user: null, error: 'Database connection failed.' };
    }
};

// --- Saved Properties Management (Per User) ---
export const getSavedPropertiesForUser = async (username: string): Promise<Set<string>> => {
    const { data, error } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('username', username);
    
    if (error) return new Set();
    return new Set(data.map(item => item.property_id));
};

export const savePropertiesForUser = async (username: string, propertyIds: string[]): Promise<void> => {
    await supabase.from('saved_properties').delete().eq('username', username);
    if (propertyIds.length > 0) {
        await supabase.from('saved_properties').insert(propertyIds.map(id => ({ username, property_id: id })));
    }
};

// --- Saved Searches Management ---
export const getSavedSearchesForUser = async (username: string): Promise<SearchFilters[]> => {
    const { data, error } = await supabase
        .from('saved_searches')
        .select('filters')
        .eq('username', username);
    
    if (error) return [];
    return data.map(item => item.filters);
};

export const saveSearchesForUser = async (username: string, searches: SearchFilters[]): Promise<void> => {
    await supabase.from('saved_searches').delete().eq('username', username);
    if (searches.length > 0) {
        await supabase.from('saved_searches').insert(searches.map(s => ({ username, filters: s })));
    }
};

// --- Tour Request Management ---
export const getTourRequests = async (username: string): Promise<TourRequest[]> => {
    const { data, error } = await supabase
        .from('tour_requests')
        .select('*')
        .eq('username', username);
    
    if (error) return [];
    return data || [];
};

export const getInquiriesForSeller = async (username: string): Promise<TourRequest[]> => {
    const properties = await getProperties();
    const sellerPropertyIds = properties.filter(p => p.agent.name === username).map(p => p.id);
    if (sellerPropertyIds.length === 0) return [];

    const { data, error } = await supabase
        .from('tour_requests')
        .select('*')
        .in('property_id', sellerPropertyIds);
    
    if (error) return [];
    return data || [];
};

export const addTourRequest = async (username: string, propertyId: string, propertyTitle: string, date: string, time: string): Promise<TourRequest> => {
    const newRequest: any = {
        property_id: propertyId,
        property_title: propertyTitle,
        username,
        date,
        time,
        status: 'Pending',
        timestamp: Date.now(),
    };
    
    const { data, error } = await supabase.from('tour_requests').insert(newRequest).select().single();
    handleError(error, 'Error adding tour request');
    return data;
};

// --- Messages ---
export const getMessagesForUser = async (username: string): Promise<Message[]> => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_username.eq.${username},receiver_username.eq.${username}`)
        .order('timestamp', { ascending: true });
    
    if (error) return [];
    return data || [];
};

export const sendMessage = async (msgData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    const newMessage: any = {
        ...msgData,
        timestamp: Date.now(),
    };
    const { data, error } = await supabase.from('messages').insert(newMessage).select().single();
    handleError(error, 'Error sending message');
    return data;
};

// --- Calendar ---
export const getEvents = async (username: string): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase.from('calendar_events').select('*').eq('username', username);
    if (error) return [];
    return data || [];
};

export const addEvent = async (username: string, eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const { data, error } = await supabase.from('calendar_events').insert({ ...eventData, username }).select().single();
    return data;
};

export const updateEvent = async (username: string, event: CalendarEvent): Promise<CalendarEvent> => {
    const { data, error } = await supabase.from('calendar_events').update(event).eq('id', event.id).select().single();
    return data;
};

export const deleteEvent = async (username: string, eventId: string): Promise<void> => {
    await supabase.from('calendar_events').delete().eq('id', eventId);
};

// --- Notifications ---
export const getNotifications = async (user: User): Promise<Notification[]> => {
    try {
        const { data, error } = await supabase.from('notifications').select('*').eq('username', user.username);
        if (error) throw error;
        return data || (MOCK_NOTIFICATIONS as any);
    } catch (e) {
        return (MOCK_NOTIFICATIONS as any);
    }
};

export const markNotificationsAsRead = async (username: string, ids: string[]): Promise<Set<string>> => {
    await supabase.from('notifications').update({ is_read: true }).in('id', ids);
    const { data } = await supabase.from('notifications').select('id').eq('username', username).eq('is_read', true);
    return new Set(data?.map(n => n.id) || []);
};

export const getReadNotificationIds = async (username: string): Promise<Set<string>> => {
    const { data } = await supabase.from('notifications').select('id').eq('username', username).eq('is_read', true);
    return new Set(data?.map(n => n.id) || []);
};

// --- Leads ---
export const getLeadsForAgent = async (agentUsername: string): Promise<Lead[]> => {
    return [];
};

// --- Investor Settings ---
export const getInvestorSettings = async (username: string): Promise<InvestorSettings> => {
    const { data } = await supabase.from('investor_settings').select('settings').eq('username', username).single();
    return data?.settings || null;
};

export const saveInvestorSettings = async (username: string, settings: InvestorSettings): Promise<void> => {
    await supabase.from('investor_settings').upsert({ username, settings });
};

// --- Investment Requests ---
export const getInvestmentRequests = async (): Promise<InvestmentRequest[]> => {
    const { data } = await supabase.from('investment_requests').select('*').order('timestamp', { ascending: false });
    return data || [];
};

export const addInvestmentRequest = async (username: string, requestDetails: string): Promise<InvestmentRequest> => {
    const { data } = await supabase.from('investment_requests').insert({
        investor_username: username,
        request_details: requestDetails,
        timestamp: Date.now(),
        status: 'Open'
    }).select().single();
    return data;
};

export const getInvestorReturns = () => {
    return [
        { id: 'div1', propertyId: '12', propertyTitle: 'Luxury Hotel Development', date: '2023-10-01', amount: 12500, type: 'Dividend' },
        { id: 'div2', propertyId: '13', propertyTitle: 'Downtown Office Block', date: '2023-10-01', amount: 8200, type: 'Dividend' },
    ];
};

export const getInvestorDocuments = () => {
    return [
        { id: 'doc1', name: 'Contract - Hotel Development.pdf', type: 'Contract', date: '2022-01-15', url: '#' },
        { id: 'doc2', name: 'Q3 2023 Portfolio Statement.pdf', type: 'Statement', date: '2023-10-05', url: '#' },
    ];
};

export const getUserDocuments = async (username: string): Promise<UserDocument[]> => {
    const { data } = await supabase.from('user_documents').select('*').eq('username', username);
    return data || [];
};

export const addUserDocument = async (username: string, file: File): Promise<UserDocument> => {
    const newDoc = {
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'doc',
        upload_date: Date.now(),
        url: '#',
        username
    };
    const { data, error } = await supabase.from('user_documents').insert(newDoc).select().single();
    handleError(error, 'Error adding document');
    return data;
};

export const deleteUserDocument = async (username: string, docId: string): Promise<void> => {
    await supabase.from('user_documents').delete().eq('id', docId);
};

export const getPropertyAlerts = async (username: string): Promise<PropertyAlert[]> => {
    const { data } = await supabase.from('property_alerts').select('*').eq('username', username);
    return data || [];
};

export const addPropertyAlert = async (username: string, alertData: Omit<PropertyAlert, 'id'>): Promise<PropertyAlert> => {
    const { data } = await supabase.from('property_alerts').insert({ ...alertData, username }).select().single();
    return data;
};

export const deletePropertyAlert = async (username: string, alertId: string): Promise<void> => {
    await supabase.from('property_alerts').delete().eq('id', alertId);
};
