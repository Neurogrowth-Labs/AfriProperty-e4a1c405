

import React from 'react';
import { BanknotesIcon, ShieldCheckIcon, TruckIcon, HomeIcon } from './icons/ActionIcons';
import { useTranslations } from '../contexts/LanguageContext';

const FinancialServices: React.FC = () => {
    const { t } = useTranslations();

    const services = [
        {
            title: t.financialServices.homeLoans,
            description: t.financialServices.homeLoansDesc,
            Icon: BanknotesIcon
        },
        {
            title: t.financialServices.rentalServices,
            description: t.financialServices.rentalServicesDesc,
            Icon: HomeIcon
        },
        {
            title: t.financialServices.insurance,
            description: t.financialServices.insuranceDesc,
            Icon: ShieldCheckIcon
        },
        {
            title: t.financialServices.movingServices,
            description: t.financialServices.movingServicesDesc,
            Icon: TruckIcon
        }
    ];

    return (
        <section id="financial-services" className="py-12 lg:py-16 bg-slate-50 dark:bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white">{t.financialServices.title}</h2>
                    <p className="text-center text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">{t.financialServices.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left border-2 border-transparent hover:border-brand-primary group">
                            <div className="mb-5">
                                <div className="bg-brand-light dark:bg-slate-700 group-hover:bg-blue-200/50 dark:group-hover:bg-slate-900/50 inline-block p-4 rounded-full transition-colors duration-300">
                                    <service.Icon className="w-8 h-8 text-brand-primary" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2">{service.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FinancialServices;