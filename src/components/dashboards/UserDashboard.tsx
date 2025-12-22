
import React, { useState, useMemo, useEffect } from 'react';
import { Property, TourRequest, User, SearchFilters, Message, PropertyAlert, UserDocument } from '../../types';
import { ListingType, PropertyType } from '../../types';
import { BookmarkIcon, CalendarIcon, ChatBubbleLeftRightIcon, TrashIcon, BanknotesIcon, BellIcon, ClipboardDocumentIcon as DocumentDuplicateIcon, ArrowUpTrayIcon } from '../icons/ActionIcons';
import { SearchIcon } from '../icons/SearchIcons';
import { useTranslations } from '../../contexts/LanguageContext';
import { getPropertyAlerts, addPropertyAlert, deletePropertyAlert, getUserDocuments, addUserDocument, deleteUserDocument } from '../../lib/data';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';


interface UserDashboardProps {
  user: User;
  tourRequests: TourRequest[];
  savedSearches: SearchFilters[];
  messages: Message[];
  onRunSearch: (filters: SearchFilters) => void;
  onDeleteSearch: (filters: SearchFilters) => void;
}

type UserDashboardTab = 'tours' | 'searches' | 'messages' | 'alerts' | 'documents' | 'payments';

const UserDashboard: React.FC<UserDashboardProps> = (props) => {
    const { user, tourRequests, savedSearches, messages, onRunSearch, onDeleteSearch } = props;
    const [activeTab, setActiveTab] = useState<UserDashboardTab>('tours');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { t } = useTranslations();

    const groupedMessages = useMemo(() => {
        return messages.reduce((acc: Record<string, Message[]>, msg) => {
            if (!acc[msg.propertyId]) {
                acc[msg.propertyId] = [];
            }
            acc[msg.propertyId].push(msg);
            return acc;
        }, {} as Record<string, Message[]>);
    }, [messages]);
    
    const handleTabClick = (tab: UserDashboardTab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

  return (
    <div className="flex h-full relative">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-700 w-full flex justify-between items-center absolute top-0 left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20">
            <h3 className="font-semibold capitalize text-slate-800 dark:text-white">{activeTab}</h3>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-800 dark:text-white">
                {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
        </div>

      <div className={`
            absolute lg:relative top-0 left-0 h-full z-10 transition-transform transform 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0
        `}>
        <nav className="w-64 p-5 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto h-full flex-shrink-0">
            <div className="flex items-center gap-3 mb-6">
                <img src={user.profilePicture || `https://i.pravatar.cc/150?u=${user.username}`} alt="Profile" className="w-10 h-10 rounded-full object-cover"/>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white truncate">{user.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Property Seeker</p>
                </div>
            </div>
            <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">My Journey</h3>
            <ul className="space-y-1">
                <DashboardTab id="tours" label="Tour Requests" icon={CalendarIcon} activeTab={activeTab} setActiveTab={handleTabClick} />
                <DashboardTab id="searches" label="Saved Searches" icon={BookmarkIcon} activeTab={activeTab} setActiveTab={handleTabClick} />
                <DashboardTab id="messages" label="Agent Messages" icon={ChatBubbleLeftRightIcon} activeTab={activeTab} setActiveTab={handleTabClick} />
            </ul>
            <h3 className="text-xs font-semibold uppercase text-slate-400 mt-6 mb-2">My Profile</h3>
            <ul className="space-y-1">
                <DashboardTab id="alerts" label="Property Alerts" icon={BellIcon} activeTab={activeTab} setActiveTab={handleTabClick} />
                <DashboardTab id="documents" label="Document Vault" icon={DocumentDuplicateIcon} activeTab={activeTab} setActiveTab={handleTabClick} />
                <DashboardTab id="payments" label="Payments" icon={BanknotesIcon} activeTab={activeTab} setActiveTab={handleTabClick} />
            </ul>
        </nav>
      </div>
      <main className="flex-1 p-6 bg-slate-50 dark:bg-slate-800/50 overflow-y-auto lg:pt-6 pt-[70px]">
        {activeTab === 'tours' && <TourRequestsView tourRequests={tourRequests} />}
        {activeTab === 'searches' && <SavedSearchesView savedSearches={savedSearches} onRunSearch={onRunSearch} onDeleteSearch={onDeleteSearch} />}
        {activeTab === 'messages' && <MessagesView groupedMessages={groupedMessages} user={user} />}
        {activeTab === 'alerts' && <PropertyAlertsView user={user} />}
        {activeTab === 'documents' && <DocumentVaultView user={user} />}
        {activeTab === 'payments' && <PaymentsView />}
      </main>
    </div>
  );
};

const DashboardTab: React.FC<{id: UserDashboardTab, label: string, icon: React.ElementType, activeTab: UserDashboardTab, setActiveTab: (tab: UserDashboardTab) => void}> = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
    <li>
        <button onClick={() => setActiveTab(id)} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === id ? 'bg-brand-primary/10 text-brand-primary dark:bg-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
            <Icon className="w-5 h-5"/> {label}
        </button>
    </li>
);

const TourRequestsView: React.FC<{ tourRequests: TourRequest[] }> = ({ tourRequests }) => (
    <div>
        <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">My Tour Requests ({tourRequests.length})</h2>
        <div className="space-y-4">
            {tourRequests.length > 0 ? tourRequests.map(r => (
                <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-brand-dark dark:text-white">{r.propertyTitle}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Date: {r.date} at {r.time}</p>
                    </div>
                    <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{r.status}</span>
                </div>
            )) : <EmptyState icon={CalendarIcon} title="No Tour Requests" message="When you schedule a tour for a property, your request will appear here." />}
        </div>
    </div>
);

const formatSearchFilters = (filters: SearchFilters) => {
    const parts = [];
    if(filters.location) parts.push(filters.location);
    if(filters.listingType !== ListingType.ALL) parts.push(filters.listingType);
    if(filters.propertyType !== 'All Types') parts.push(filters.propertyType);
    if(filters.bedrooms > 0) parts.push(`${filters.bedrooms}+ beds`);
    if(filters.bathrooms > 0) parts.push(`${filters.bathrooms}+ baths`);
    if(filters.amenities.length > 0) parts.push(`${filters.amenities.length} amenities`);
    return parts.join(', ') || 'Any property';
};

const SavedSearchesView: React.FC<{ savedSearches: SearchFilters[], onRunSearch: (f: SearchFilters) => void, onDeleteSearch: (f: SearchFilters) => void }> = ({ savedSearches, onRunSearch, onDeleteSearch }) => (
     <div>
        <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">Saved Searches ({savedSearches.length})</h2>
        <div className="space-y-4">
            {savedSearches.length > 0 ? savedSearches.map((search, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <BookmarkIcon className="w-6 h-6 text-brand-primary flex-shrink-0" />
                        <p className="text-sm text-slate-700 dark:text-slate-200">{formatSearchFilters(search)}</p>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                        <button onClick={() => onRunSearch(search)} className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2">
                            <SearchIcon className="w-4 h-4" /> Run
                        </button>
                        <button onClick={() => onDeleteSearch(search)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            )) : <EmptyState icon={BookmarkIcon} title="No Saved Searches" message='When you perform a search, click the "Save this Search" button to add it here for quick access later.' />}
        </div>
    </div>
);

const MessagesView: React.FC<{ groupedMessages: Record<string, Message[]>, user: User }> = ({ groupedMessages, user }) => (
    <div>
        <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">Agent Messages</h2>
        <div className="space-y-6">
            {Object.keys(groupedMessages).length > 0 ? Object.entries(groupedMessages).map(([propertyId, msgs]) => (
                <div key={propertyId} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-brand-dark dark:text-white mb-3 border-b pb-2 dark:border-slate-700">{msgs[0].propertyTitle}</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {msgs.map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderUsername === user.username ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-3 py-2 rounded-lg max-w-sm ${msg.senderUsername === user.username ? 'bg-brand-primary text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )) : <EmptyState icon={ChatBubbleLeftRightIcon} title="No Messages" message="Messages you send to agents about properties will appear here." />}
        </div>
    </div>
);

const PropertyAlertsView: React.FC<{ user: User }> = ({ user }) => {
    const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
    const [newAlertName, setNewAlertName] = useState('');

    useEffect(() => {
        const fetchAlerts = async () => {
            const data = await getPropertyAlerts(user.username);
            // FIX: Ensure data is an array before setting state to prevent mapping errors.
            setAlerts(Array.isArray(data) ? data : []);
        };
        fetchAlerts();
    }, [user.username]);

    const handleAddAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        const newAlert = await addPropertyAlert(user.username, { name: newAlertName, criteria: {} });
        setAlerts(prev => [newAlert, ...prev]);
        setNewAlertName('');
    };

    const handleDeleteAlert = async (id: string) => {
        await deletePropertyAlert(user.username, id);
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">Property Alerts</h2>
            <form onSubmit={handleAddAlert} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-2">
                <input type="text" value={newAlertName} onChange={e => setNewAlertName(e.target.value)} placeholder="e.g., '2-bed Apt in Urbanville'" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-primary focus:border-brand-primary dark:bg-slate-700 dark:border-slate-600" required />
                <button type="submit" className="w-full sm:w-auto bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 flex-shrink-0">Create Alert</button>
            </form>
             {alerts.length > 0 ? (
                <div className="space-y-3">
                    {alerts.map(alert => (
                        <div key={alert.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm flex items-center justify-between">
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{alert.name}</p>
                            <button onClick={() => handleDeleteAlert(alert.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
             ) : (
                <EmptyState icon={BellIcon} title="No Property Alerts" message="Create an alert to be notified about new properties that match your criteria." />
             )}
        </div>
    );
};

const DocumentVaultView: React.FC<{ user: User }> = ({ user }) => {
    const [docs, setDocs] = useState<UserDocument[]>([]);

    useEffect(() => {
        const fetchDocs = async () => {
            const data = await getUserDocuments(user.username);
            // FIX: Ensure data is an array before setting state to prevent mapping errors.
            setDocs(Array.isArray(data) ? data : []);
        };
        fetchDocs();
    }, [user.username]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newDoc = await addUserDocument(user.username, file);
            setDocs(prev => [newDoc, ...prev]);
        }
    };
    
    const handleDeleteDoc = async (id: string) => {
        await deleteUserDocument(user.username, id);
        setDocs(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">Document Vault</h2>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">Securely store documents like KYC, proof of funds, and rental applications.</p>
                <label htmlFor="doc-upload" className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center">
                    <ArrowUpTrayIcon className="w-5 h-5" /> Upload
                </label>
                <input type="file" id="doc-upload" className="hidden" onChange={handleFileChange} />
            </div>
             {docs.length > 0 ? (
                <div className="space-y-3">
                    {docs.map(doc => (
                        <div key={doc.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm flex items-center justify-between">
                            <p className="font-semibold text-slate-700 dark:text-slate-200 truncate pr-4">{doc.name}</p>
                            <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 flex-shrink-0"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
            ): <EmptyState icon={DocumentDuplicateIcon} title="Document Vault is Empty" message="Upload important documents here for easy access when you're ready to make an offer or apply for a rental." />}
        </div>
    );
};

const PaymentsView: React.FC = () => (
     <div>
        <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">Payments & Transactions</h2>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
             <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Payment Methods</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">No payment methods saved.</p>
             <button className="mt-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm">Add a Card</button>
             <hr className="my-6 dark:border-slate-700"/>
             <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Transaction History</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">No transactions yet.</p>
        </div>
    </div>
);


const EmptyState: React.FC<{ icon: React.ElementType, title: string, message: string }> = ({ icon: Icon, title, message }) => (
    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg">
        <Icon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mt-4">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">{message}</p>
    </div>
);

export default UserDashboard;
