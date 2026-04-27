import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './icons/NavIcons';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { GoogleIcon, AppleIcon } from './icons/SocialIcons';
import { EyeIcon, EyeSlashIcon, CheckIcon, CameraIcon, ArrowUpTrayIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { BuildingStorefrontIcon, UserIcon } from '@heroicons/react/24/solid';
import { BanknotesIcon } from './icons/ActionIcons';

type AuthView = 'login' | 'signup' | 'userSignup' | 'agentSignup' | 'investorSignup' | 'pendingVerificationAgent' | 'pendingVerificationInvestor' | 'forgotPassword' | 'resetConfirmation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  initialView?: AuthView;
  onSwitchToPricing?: () => void;
}

// --- Helper Components ---
const InputField: React.FC<{label: string, id?: string, type?: string, value: string, name?: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, icon?: React.ElementType, onIconClick?: () => void, disabled?: boolean, placeholder?: string, containerClassName?: string, note?: string, required?: boolean}> = ({ label, id, type = 'text', value, name, onChange, icon: Icon, onIconClick, disabled, placeholder, containerClassName, note, required=true }) => (
    <div className={containerClassName}>
        <label htmlFor={id || name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <div className="relative">
            {type === 'textarea' ? ( <textarea id={id || name} name={name || id} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} required={required} className="input-base" rows={2}></textarea>
            ) : ( <input id={id || name} name={name || id} type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} required={required} className="input-base" /> )}
            {Icon && <button type="button" onClick={onIconClick} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500"><Icon className="h-5 w-5" /></button>}
        </div>
        {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
    </div>
);

const FileInput: React.FC<{ label: string; file: File | null; onFileChange: (file: File | null) => void; acceptedTypes: string, required?: boolean }> = ({ label, file, onFileChange, acceptedTypes, required=false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
        <div className="mt-1">
            <label htmlFor={label} className="relative cursor-pointer glass-panel rounded-lg font-medium text-brand-primary hover:text-brand-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-brand-primary border border-slate-300 dark:border-slate-600 p-3 flex justify-center items-center gap-2">
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span className="text-sm">{file ? 'Change file' : 'Upload file'}</span>
                <input id={label} name={label} type="file" className="sr-only" onChange={(e) => onFileChange(e.target.files ? e.target.files[0] : null)} accept={acceptedTypes} required={required} />
            </label>
            {file && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Selected: {file.name}</p>}
        </div>
    </div>
);

const Checkbox: React.FC<{id: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, children: React.ReactNode}> = ({id, name, checked, onChange, children}) => (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" id={id} name={name} checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
        {children}
    </label>
);

const SocialButton: React.FC<{onClick: () => void, icon: React.ElementType, children: React.ReactNode}> = ({ onClick, icon: Icon, children }) => (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        <Icon className="w-5 h-5"/>{children}
    </button>
);

const SocialLogins: React.FC<{onLoginSuccess: () => void}> = ({ onLoginSuccess }) => (
    <div className="grid grid-cols-2 gap-3">
        <SocialButton onClick={() => onLoginSuccess()} icon={GoogleIcon}>Google</SocialButton>
        <SocialButton onClick={() => onLoginSuccess()} icon={AppleIcon}>Apple</SocialButton>
    </div>
);

const SignupOptionCard: React.FC<{icon: React.ElementType, title: string, description: string, onClick: () => void}> = ({ icon: Icon, title, description, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-4 border border-slate-300 dark:border-slate-700 rounded-lg flex items-center gap-4 hover:bg-brand-light dark:hover:bg-slate-800 hover:border-brand-primary transition-all">
        <div className="glass-card p-3 rounded-lg"><Icon className="w-6 h-6 text-brand-primary"/></div>
        <div>
            <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    </button>
);

const FormSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-brand-dark dark:text-white border-b border-slate-200 dark:border-slate-700 w-full pb-2 mb-2">{title}</legend>
        {children}
    </fieldset>
);

const ProgressBar: React.FC<{currentStep: number, totalSteps: number}> = ({ currentStep, totalSteps }) => (
    <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Step {currentStep} of {totalSteps}</p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-brand-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>
    </div>
);

interface PasswordCriteria { length: boolean; uppercase: boolean; lowercase: boolean; number: boolean; special: boolean; all: boolean; }
const isPasswordStrong = (password: string): PasswordCriteria => {
    const criteria = { length: password.length >= 8, uppercase: /[A-Z]/.test(password), lowercase: /[a-z]/.test(password), number: /[0-9]/.test(password), special: /[!@#$%^&*]/.test(password) };
    return { ...criteria, all: Object.values(criteria).every(v => v) };
};

const CriteriaItem: React.FC<{ label: string, met: boolean }> = ({ label, met }) => (
    <div className={`flex items-center gap-1.5 transition-colors ${met ? 'text-green-600 dark:text-green-500' : 'text-slate-400'}`}>
        <div className={`w-3.5 h-3.5 flex-shrink-0 rounded-full flex items-center justify-center ${met ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
            {met && <CheckIcon className="w-2.5 h-2.5 text-white stroke-2" />}
        </div>
        {label}
    </div>
);

const PasswordStrengthMeter: React.FC<{ criteria: PasswordCriteria }> = ({ criteria }) => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <CriteriaItem label="8+ characters" met={criteria.length} />
        <CriteriaItem label="1 uppercase" met={criteria.uppercase} />
        <CriteriaItem label="1 lowercase" met={criteria.lowercase} />
        <CriteriaItem label="1 number" met={criteria.number} />
        <CriteriaItem label="1 special" met={criteria.special} />
    </div>
);

// --- Sub-components for each view ---

const LoginView: React.FC<{onLoginSuccess: () => void, onSwitchToSignup: () => void, onSwitchToForgotPassword: () => void, setError: (e: string) => void}> = ({ onLoginSuccess, onSwitchToSignup, onSwitchToForgotPassword, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            onLoginSuccess();
            // The onAuthStateChange event in App.tsx will handle updating the user context
        } catch (error: any) {
            console.error("Supabase Email Login Error", error);
            setError(error.message || "Failed to log in.");
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error("Supabase Login Error", error);
            setError(error.message || "Failed to log in with Google.");
        }
    };

    return (
        <div className="space-y-4 animate-fade-in text-center py-2">
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                <InputField label="Email Address" id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <div>
                   <InputField 
                       label="Password" 
                       id="login-password" 
                       type={showPassword ? "text" : "password"} 
                       value={password} 
                       onChange={e => setPassword(e.target.value)} 
                       icon={showPassword ? EyeSlashIcon : EyeIcon} 
                       onIconClick={() => setShowPassword(!showPassword)}
                   />
                   <div className="flex justify-end mt-1">
                       <button type="button" onClick={onSwitchToForgotPassword} className="text-xs font-semibold text-brand-primary hover:underline">Forgot password?</button>
                   </div>
                </div>
                <button type="submit" className="w-full btn-primary">Log In</button>
            </form>
            
            <div className="relative flex items-center justify-center pt-2">
                <div className="border-t border-slate-200 dark:border-slate-700 w-full absolute"></div>
                <span className="bg-white dark:bg-brand-dark px-2 text-xs text-slate-500 relative z-10 uppercase tracking-wider">or continue with</span>
            </div>

            <button 
                onClick={handleGoogleLogin} 
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                type="button"
            >
                <GoogleIcon className="w-5 h-5"/>
                Google
            </button>
            <div className="pt-2 flex items-center justify-center gap-2">
                <span className="text-sm text-slate-500">Not an investor/user yet?</span>
                <button type="button" onClick={onSwitchToSignup} className="text-sm font-semibold text-brand-primary hover:underline focus:outline-none">Sign up</button>
            </div>
        </div>
    );
};

const SignupView: React.FC<{ onSwitchToLogin: () => void; onSignupRole: (role: 'user'|'agent'|'investor') => void; }> = ({ onSwitchToLogin, onSignupRole }) => (
    <div className="animate-fade-in space-y-4 text-center py-4">
        <p className="text-center text-slate-500 pb-2">Choose your account type to sign up.</p>
        <div className="space-y-3">
            <SignupOptionCard icon={UserIcon} title="Property Seeker" description="Browse, save, and tour properties." onClick={() => onSignupRole('user')} />
            <SignupOptionCard icon={BuildingStorefrontIcon} title="Agent / Agency" description="List and manage your properties." onClick={() => onSignupRole('agent')} />
            <SignupOptionCard icon={BanknotesIcon} title="Investor" description="Access exclusive investment deals." onClick={() => onSignupRole('investor')} />
        </div>
        
        <div className="relative flex items-center justify-center pt-4">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full absolute"></div>
            <span className="bg-white px-2 text-xs text-slate-500 relative z-10 uppercase tracking-wider">or continue with</span>
        </div>

        <button 
            onClick={async () => {
                try {
                    await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            queryParams: { access_type: 'offline', prompt: 'consent' },
                        },
                    });
                } catch (error) {
                    console.error('Google signup error', error);
                }
            }} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors mt-4"
            type="button"
        >
            <GoogleIcon className="w-5 h-5"/>
            Google
        </button>

        <p className="text-center text-sm text-slate-500 pt-4">Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-brand-primary hover:underline focus:outline-none">Log In</button></p>
    </div>
);

const UserSignupView: React.FC<{onSignupSuccess: () => void, onSwitchToLogin: () => void, setError: (e: string) => void}> = ({ onSignupSuccess, onSwitchToLogin, setError }) => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', agreeToTerms: false });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isPasswordStrong(formData.password).all) { setError("Password doesn't meet requirements."); return; }
        if (!formData.agreeToTerms) { setError("You must agree to the Terms & Conditions."); return; }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'user',
                    }
                }
            });
            if (error) throw error;
            
            // Check if we need email verification
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 setError('This email is already in use. Please log in.');
                 return;
            }

            onSignupSuccess();
        } catch (error: any) {
            console.error("Supabase Signup Error", error);
            setError(error.message || "Failed to sign up.");
        }
    };

    return (
        <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
             <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
             <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
             <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} />
             <PasswordStrengthMeter criteria={isPasswordStrong(formData.password)} />
             <Checkbox id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}>I agree to the <a href="#" target="_blank" className="font-semibold text-brand-primary hover:underline">Terms & Conditions</a>.</Checkbox>
            <button type="submit" className="w-full btn-primary">Create Account</button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-brand-primary hover:underline">Log In</button></p>
        </form>
    );
};

const AgentSignupView: React.FC<{ onSignupSuccess: () => void, onSwitchToLogin: () => void, setError: (e: string) => void }> = ({ onSignupSuccess, onSwitchToLogin, setError }) => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '', officeAddress: '', businessRegNumber: '', agentLicense: '', agreeToTerms: false });
    const [idDoc, setIdDoc] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isPasswordStrong(formData.password).all) { setError("Password doesn't meet requirements."); return; }
        if (!idDoc) { setError("Please upload your ID or Business Certificate for verification."); return; }
        if (!formData.agreeToTerms) { setError("You must agree to the Agent Terms & Conditions."); return; }
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'agent',
                        phone: formData.phone,
                        officeAddress: formData.officeAddress,
                        businessRegNumber: formData.businessRegNumber,
                        agentLicense: formData.agentLicense,
                    }
                }
            });
            if (error) throw error;
            
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 setError('This email is already in use. Please log in.');
                 return;
            }

            onSignupSuccess(); 
        } catch (error: any) {
            console.error("Supabase Agent Signup Error", error);
            setError(error.message || "Failed to sign up.");
        }
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
            
            <Checkbox id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}>I agree to the <a href="#" target="_blank" className="font-semibold text-brand-primary hover:underline">Agent Terms & Conditions</a>.</Checkbox>
            <button type="submit" className="w-full btn-primary">Submit for Verification</button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-brand-primary hover:underline">Log In</button></p>
        </form>
    );
};

const InvestorSignupView: React.FC<{ onSignupSuccess: () => void, setError: (e: string) => void, onSwitchToLogin: () => void }> = ({ onSignupSuccess, setError, onSwitchToLogin }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '', investmentType: 'Individual', companyName: '', agreeToTerms: false });
    const [idDoc, setIdDoc] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNext = () => {
        if (step === 1 && !isPasswordStrong(formData.password).all) { setError("Password doesn't meet requirements."); return; }
        setError('');
        setStep(step + 1);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!idDoc) { setError("Please upload your Proof of Identity."); return; }
        if (!formData.agreeToTerms) { setError("You must agree to the Investor Terms & Conditions."); return; }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'investor',
                        phone: formData.phone,
                        investment_type: formData.investmentType,
                        company_name: formData.companyName,
                    }
                }
            });
            if (error) throw error;
            
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 setError('This email is already in use. Please log in.');
                 setStep(1);
                 return;
            }

            onSignupSuccess(); 
        } catch (error: any) {
            console.error("Supabase Investor Signup Error", error);
            setError(error.message || "Failed to sign up.");
            setStep(1);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                        <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} />
                        <PasswordStrengthMeter criteria={isPasswordStrong(formData.password)} />
                        <div className="flex justify-end"><button type="button" onClick={handleNext} className="btn-primary w-auto">Next</button></div>
                    </div>
                );
            case 2:
                return (
                     <div className="space-y-4">
                        <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                        <div><label className="block text-sm font-medium dark:text-slate-300">Investment Type</label><select name="investmentType" value={formData.investmentType} onChange={handleInputChange} className="w-full input-base mt-1"><option>Individual</option><option>Corporate</option></select></div>
                        {formData.investmentType === 'Corporate' && <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} />}
                        <div className="flex justify-between"><button type="button" onClick={() => setStep(1)} className="btn-secondary w-auto">Back</button><button type="button" onClick={() => setStep(3)} className="btn-primary w-auto">Next</button></div>
                    </div>
                );
            case 3:
                return (
                     <div className="space-y-4">
                        <FileInput label="Proof of Identity (ID/Passport)" file={idDoc} onFileChange={setIdDoc} acceptedTypes=".pdf,.jpg,.png" required />
                        <Checkbox id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}>I agree to the <a href="#" target="_blank" className="font-semibold text-brand-primary hover:underline">Investor Terms & Conditions</a>.</Checkbox>
                        <div className="flex justify-between"><button type="button" onClick={() => setStep(2)} className="btn-secondary w-auto">Back</button><button type="submit" className="btn-primary w-auto" disabled={!formData.agreeToTerms}>Submit Application</button></div>
                    </div>
                );
        }
    }

    return (
        <form onSubmit={handleSignup} className="max-h-[60vh] overflow-y-auto pr-2">
            <ProgressBar currentStep={step} totalSteps={3} />
            <div key={step} className="animate-fade-in mt-6">
                {renderStep()}
            </div>
            <p className="text-center text-sm mt-6 text-slate-500 dark:text-slate-400">Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-brand-primary hover:underline">Log In</button></p>
        </form>
    );
};

const PendingVerificationView: React.FC<{ onSwitchToLogin: () => void, userType: 'agent' | 'investor' }> = ({ onSwitchToLogin, userType }) => (
    <div className="text-center space-y-4 animate-fade-in">
        <CheckBadgeIcon className="w-16 h-16 text-green-500 mx-auto" />
        <p className="text-slate-600 dark:text-slate-300">Thank you for registering as an {userType}! Your application is now under review. We will notify you via email once your account has been approved. This typically takes 1-2 business days.</p>
        <button onClick={onSwitchToLogin} className="w-full btn-primary">Back to Login</button>
    </div>
);

const ForgotPasswordView: React.FC<{ onResetSent: () => void, onBackToLogin: () => void, setError: (e: string) => void }> = ({ onResetSent, onBackToLogin, setError }) => {
    const [email, setEmail] = useState('');
    
    const handleReset = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        setError('');
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin + '?reset=true',
            });
            if (error) throw error;
            onResetSent(); 
        } catch (error: any) {
            console.error("Supabase Password Reset Error", error);
            setError(error.message || "Failed to send reset link.");
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter your email and we'll send a link to reset your password.</p>
            <form onSubmit={handleReset} className="space-y-4">
                <InputField label="Email Address" id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <button type="submit" className="w-full btn-primary">Send Reset Link</button>
            </form>
            <p className="text-center"><button onClick={onBackToLogin} className="text-sm font-semibold text-brand-primary hover:underline">&larr; Back to Login</button></p>
        </div>
    );
};

const ResetConfirmationView: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => (
    <div className="space-y-4 text-center animate-fade-in">
        <p className="text-slate-600 dark:text-slate-300">If an account with that email exists, a password reset link has been sent. Please check your inbox.</p>
        <button onClick={onSwitchToLogin} className="font-semibold text-brand-primary hover:underline">&larr; Back to Login</button>
    </div>
);

// Main AuthModal component
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialView, onSwitchToPricing }) => {
    const [view, setView] = useState<AuthView>(initialView || 'login');
    const [error, setError] = useState('');
    
    const handleLoginSuccess = () => {
        onLogin();
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
        signup: 'Join AfriEstate',
        userSignup: 'Create Your Account',
        agentSignup: 'Agent & Agency Registration',
        investorSignup: 'Investor Registration',
        pendingVerificationAgent: 'Application Received',
        pendingVerificationInvestor: 'Application Received',
        forgotPassword: 'Reset Your Password',
        resetConfirmation: 'Check Your Email'
    };
    
    const currentTitle = titles[view] || 'Welcome';

    const handleSignupRole = (role: 'user' | 'agent' | 'investor') => {
        setError('');
        if (role === 'user') switchView('userSignup');
        if (role === 'agent') switchView('agentSignup');
        if (role === 'investor') switchView('investorSignup');
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
        <div 
            className="glass-panel rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 opacity-0 animate-fade-in-scale" 
            onClick={e => e.stopPropagation()}
        >
            <header className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-brand-dark dark:text-white">
                    {currentTitle}
                </h2>
                <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>
            
            <div className="p-6 max-h-[75vh] overflow-y-auto bg-white">
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 text-sm" role="alert">{error}</div>}

                {view === 'login' && <LoginView onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => switchView('signup')} onSwitchToForgotPassword={() => switchView('forgotPassword')} setError={setError} />}
                {view === 'signup' && <SignupView onSwitchToLogin={() => switchView('login')} onSignupRole={handleSignupRole} />}
                {view === 'userSignup' && <UserSignupView onSignupSuccess={handleLoginSuccess} onSwitchToLogin={() => switchView('login')} setError={setError} />}
                {view === 'agentSignup' && <AgentSignupView onSignupSuccess={() => switchView('pendingVerificationAgent')} onSwitchToLogin={() => switchView('login')} setError={setError} />}
                {view === 'investorSignup' && <InvestorSignupView onSignupSuccess={() => switchView('pendingVerificationInvestor')} onSwitchToLogin={() => switchView('login')} setError={setError} />}
                {view === 'pendingVerificationAgent' && <PendingVerificationView onSwitchToLogin={() => switchView('login')} userType="agent" />}
                {view === 'pendingVerificationInvestor' && <PendingVerificationView onSwitchToLogin={() => switchView('login')} userType="investor" />}
                {view === 'forgotPassword' && <ForgotPasswordView onResetSent={() => switchView('resetConfirmation')} onBackToLogin={() => switchView('login')} setError={setError} />}
                {view === 'resetConfirmation' && <ResetConfirmationView onSwitchToLogin={() => switchView('login')} />}
            </div>
        </div>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            .animate-fade-in-scale { animation: fadeInScale 0.3s ease-out forwards; }
            
            .input-base {
                @apply w-full px-4 py-2.5 glass-panel border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-800 dark:text-slate-200 transition-colors placeholder:text-slate-400 disabled:bg-slate-100 dark:disabled:bg-slate-800;
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