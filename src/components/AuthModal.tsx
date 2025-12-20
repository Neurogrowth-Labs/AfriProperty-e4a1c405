
import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './icons/NavIcons';
import { authenticateUser, addUser } from '../lib/data';
import type { User } from '../types';
import { GoogleIcon, AppleIcon } from './icons/SocialIcons';
import { EyeIcon, EyeSlashIcon, CheckIcon, CameraIcon, ArrowUpTrayIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { BuildingStorefrontIcon, UserIcon } from '@heroicons/react/24/solid';
import { BanknotesIcon } from './icons/ActionIcons';


type AuthView = 'login' | 'signup' | 'userSignup' | 'agentSignup' | 'investorSignup' | 'pendingVerificationAgent' | 'pendingVerificationInvestor' | 'forgotPassword' | 'resetConfirmation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  initialView?: AuthView;
  onSwitchToPricing?: () => void;
}


const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialView, onSwitchToPricing }) => {
    const [view, setView] = useState<AuthView>(initialView || 'login');
    const [error, setError] = useState('');
    
    const handleLoginSuccess = (user: User) => {
        onLogin(user);
    };
    
    const switchView = (targetView: AuthView) => {
        setError('');
        setView(targetView);
    };
    
    useEffect(() => {
        if(isOpen) {
            setView(initialView || 'login');
            setError('');
        }
    }, [isOpen, initialView]);

    if (!isOpen) return null;
    
    const titles: Record<AuthView, string> = {
        login: 'Welcome Back',
        signup: 'Join AfriProperty',
        userSignup: 'Create Your Account',
        agentSignup: 'Agent & Agency Registration',
        investorSignup: 'Investor Registration',
        pendingVerificationAgent: 'Application Received',
        pendingVerificationInvestor: 'Application Received',
        forgotPassword: 'Reset Your Password',
        resetConfirmation: 'Check Your Email'
    };
    
    const currentTitle = titles[view] || 'Welcome';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] sm:p-4 animate-fade-in" onClick={onClose}>
        <div 
            className="bg-white dark:bg-slate-900 w-full h-full sm:h-auto sm:rounded-2xl shadow-2xl sm:max-w-md transform transition-all duration-300 opacity-0 animate-fade-in-scale flex flex-col sm:block" 
            onClick={e => e.stopPropagation()}
        >
            <header className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-brand-dark dark:text-white">
                    {currentTitle}
                </h2>
                <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>
            
            <div className="p-6 flex-grow overflow-y-auto sm:max-h-[75vh]">
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 text-sm" role="alert">{error}</div>}

                {view === 'login' && <LoginView onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => switchView('signup')} onSwitchToForgotPassword={() => switchView('forgotPassword')} setError={setError} />}
                {view === 'signup' && <SignupView onSwitchToLogin={() => switchView('login')} onSwitchToUserSignup={() => switchView('userSignup')} onSwitchToAgentSignup={() => switchView('agentSignup')} onSwitchToInvestorSignup={() => switchView('investorSignup')} />}
                {view === 'userSignup' && <UserSignupView onSignupSuccess={handleLoginSuccess} onSwitchToLogin={() => switchView('login')} setError={setError} />}
                {view === 'agentSignup' && <AgentSignupView onSignupSuccess={() => switchView('pendingVerificationAgent')} onSwitchToLogin={() => switchView('login')} setError={setError} />}
                {view === 'investorSignup' && <InvestorSignupView onSignupSuccess={() => switchView('pendingVerificationInvestor')} setError={setError} onSwitchToLogin={() => switchView('login')} />}
                {view === 'pendingVerificationAgent' && <PendingVerificationView onSwitchToLogin={() => switchView('login')} userType="agent" />}
                {view === 'pendingVerificationInvestor' && <PendingVerificationView onSwitchToLogin={() => switchView('login')} userType="investor" />}
                {view === 'forgotPassword' && <ForgotPasswordView onResetSent={() => switchView('resetConfirmation')} onBackToLogin={() => switchView('login')} />}
                {view === 'resetConfirmation' && <ResetConfirmationView onSwitchToLogin={() => switchView('login')} />}
            </div>
        </div>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            .animate-fade-in-scale { animation: fadeInScale 0.3s ease-out forwards; }
            
            .input-base {
                @apply w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-800 dark:text-slate-200 transition-colors placeholder:text-slate-400 disabled:bg-slate-100 dark:disabled:bg-slate-800;
            }
            .btn-primary {
                @apply w-full bg-brand-primary text-white px-5 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-[1.02];
            }
            .btn-secondary {
                @apply bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all;
            }
        `}</style>
    </div>
  );
};

// --- Sub-components for each view ---

const LoginView: React.FC<{onLoginSuccess: (user: User) => void, onSwitchToSignup: () => void, onSwitchToForgotPassword: () => void, setError: (e: string) => void}> = ({ onLoginSuccess, onSwitchToSignup, onSwitchToForgotPassword, setError }) => {
    const [email, setEmail] = useState('peter.vdm@example.com');
    const [password, setPassword] = useState('Password123!');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { user, error } = authenticateUser(email, password);
        if (user) {
            onLoginSuccess(user);
        } else {
            if (error === 'pending_verification_agent' || error === 'pending_verification_investor') {
                setError("Your account is pending verification. We'll notify you upon approval.");
            } else {
                setError("Invalid email or password.");
            }
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">Log in with a pre-created account or sign up.</p>
            <form onSubmit={handleLogin} className="space-y-4">
                 <InputField label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                 <InputField label="Password" id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} icon={showPassword ? EyeSlashIcon : EyeIcon} onIconClick={() => setShowPassword(!showPassword)} />
                 
                 <div className="flex items-center justify-between">
                     <Checkbox id="rememberMe" name="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}>Remember me</Checkbox>
                     <button type="button" onClick={onSwitchToForgotPassword} className="text-sm font-semibold text-brand-primary hover:underline">Forgot password?</button>
                 </div>
                 
                 <button type="submit" className="btn-primary">Log In</button>
            </form>
            <div className="flex items-center text-xs text-slate-400"><div className="flex-grow border-t dark:border-slate-700"></div><span className="flex-shrink mx-4">OR</span><div className="flex-grow border-t dark:border-slate-700"></div></div>
            <SocialLogins onLoginSuccess={onLoginSuccess} />
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">Don't have an account? <button onClick={onSwitchToSignup} className="font-semibold text-brand-primary hover:underline">Sign up</button></p>
        </div>
    );
};

const SignupView: React.FC<{ onSwitchToLogin: () => void; onSwitchToUserSignup: () => void; onSwitchToAgentSignup: () => void; onSwitchToInvestorSignup: () => void; }> = ({ onSwitchToLogin, onSwitchToUserSignup, onSwitchToAgentSignup, onSwitchToInvestorSignup }) => (
    <div className="animate-fade-in space-y-4">
        <p className="text-center text-slate-500 dark:text-slate-400">Choose your account type to get started.</p>
        <div className="space-y-3">
            <SignupOptionCard icon={UserIcon} title="Property Seeker" description="Browse, save, and tour properties." onClick={onSwitchToUserSignup} />
            <SignupOptionCard icon={BuildingStorefrontIcon} title="Agent / Agency" description="List and manage your properties." onClick={onSwitchToAgentSignup} />
            <SignupOptionCard icon={BanknotesIcon} title="Investor" description="Access exclusive investment deals." onClick={onSwitchToInvestorSignup} />
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">Already have an account? <button onClick={onSwitchToLogin} className="font-semibold text-brand-primary hover:underline">Log In</button></p>
    </div>
);

const UserSignupView: React.FC<{onSignupSuccess: (user: User) => void, onSwitchToLogin: () => void, setError: (e: string) => void}> = ({ onSignupSuccess, onSwitchToLogin, setError }) => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', agreeToTerms: false });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isPasswordStrong(formData.password).all) { setError("Password doesn't meet requirements."); return; }
        if (!formData.agreeToTerms) { setError("You must agree to the Terms & Conditions."); return; }

        const newUser: User = { username: formData.email, fullName: formData.fullName, email: formData.email, password: formData.password, role: 'user' };
        const result = addUser(newUser);
        if (result.success) onSignupSuccess(newUser); else setError(result.message);
    };

    return (
        <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
             <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
             <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
             <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} />
             <PasswordStrengthMeter criteria={isPasswordStrong(formData.password)} />
             <Checkbox id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}>I agree to the <a href="#" target="_blank" className="font-semibold text-brand-primary hover:underline">Terms & Conditions</a>.</Checkbox>
            <button type="submit" className="btn-primary">Create Account</button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-brand-primary hover:underline">Log In</button></p>
        </form>
    );
};

const AgentSignupView: React.FC<{ onSignupSuccess: () => void, onSwitchToLogin: () => void, setError: (e: string) => void }> = ({ onSignupSuccess, onSwitchToLogin, setError }) => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '', officeAddress: '', businessRegNumber: '', agentLicense: '', agreeToTerms: false });
    const [idDoc, setIdDoc] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isPasswordStrong(formData.password).all) { setError("Password doesn't meet requirements."); return; }
        if (!idDoc) { setError("Please upload your ID or Business Certificate for verification."); return; }
        if (!formData.agreeToTerms) { setError("You must agree to the Agent Terms & Conditions."); return; }
        
        const newAgent: User = { username: formData.email, fullName: formData.fullName, email: formData.email, password: formData.password, role: 'agent', phone: formData.phone, officeAddress: formData.officeAddress, businessRegNumber: formData.businessRegNumber, agentLicense: formData.agentLicense, idDocumentUrl: idDoc.name };
        const result = addUser(newAgent);
        if (result.success) onSignupSuccess(); else setError(result.message);
    };
    
    return (
         <form onSubmit={handleSignup} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 animate-fade-in">
            <FormSection title="Account Details">
                <InputField label="Full Name / Agency Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                <InputField label="Contact Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} />
                <PasswordStrengthMeter criteria={isPasswordStrong(formData.password)} />
            </FormSection>
            <FormSection title="Business Information">
                <InputField label="Contact Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                <InputField label="Office Address" name="officeAddress" value={formData.officeAddress} onChange={handleInputChange} />
                <InputField label="Business Reg. Number" name="businessRegNumber" value={formData.businessRegNumber} onChange={handleInputChange} note="(Optional for individuals)" required={false} />
            </FormSection>
            <FormSection title="Verification">
                <FileInput label="ID or Business Certificate" file={idDoc} onFileChange={setIdDoc} acceptedTypes=".pdf,.jpg,.png" required />
            </FormSection>
            
            <Checkbox id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}>I agree to the <a href="#" target="_blank" className