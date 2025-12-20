
import React from 'react';

interface CategoryCardProps {
  title: string;
  description: string;
  Icon: React.ElementType;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, Icon }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center border-2 border-transparent hover:border-brand-primary group">
      <div className="flex justify-center mb-5">
        <div className="bg-slate-100 dark:bg-slate-700 group-hover:bg-brand-light dark:group-hover:bg-slate-900/50 p-4 rounded-full transition-colors duration-300">
          <Icon className="w-10 h-10 text-brand-gold transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
    </div>
  );
};

export default CategoryCard;