import React from 'react';
import { StayIcon, TransportIcon, WellnessIcon } from './icons/CategoryIcons';

const OfferingCard: React.FC<{
    title: string;
    description: string;
    image: string;
    icon: React.ElementType;
    onClick: () => void;
}> = ({ title, description, image, icon: Icon, onClick }) => (
    <div className="relative rounded-xl overflow-hidden group cursor-pointer shadow-lg" onClick={onClick}>
        <img src={image} alt={title} className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 text-white">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full w-fit mb-4">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold">{title}</h3>
            <p className="mt-2 max-w-xs">{description}</p>
        </div>
    </div>
);


const NewOfferings: React.FC = () => {
    const offerings = [
        {
            title: 'Book a Stay',
            description: 'From chic city lofts to beachfront villas, find your perfect short-term rental.',
            image: 'https://picsum.photos/seed/stay/800/1000',
            icon: StayIcon,
            onClick: () => {} // In a real app, this would set the search tab
        },
        {
            title: 'Rent a Car',
            description: 'Explore with freedom. Choose from our fleet of SUVs, sedans, and luxury vehicles.',
            image: 'https://picsum.photos/seed/transport/800/1000',
            icon: TransportIcon,
            onClick: () => {}
        },
        {
            title: 'Find Wellness',
            description: 'Recharge your mind and body with our curated yoga, spa, and nature retreats.',
            image: 'https://picsum.photos/seed/wellness/800/1000',
            icon: WellnessIcon,
            onClick: () => {}
        },
    ];

    return (
        <section className="py-16 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-6">
                 <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-brand-dark dark:text-white">Beyond the Home</h2>
                    <p className="text-center text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
                        Your entire journey, curated. Discover short-term stays, transport, and wellness retreats.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {offerings.map(offering => (
                        <OfferingCard key={offering.title} {...offering} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewOfferings;