


import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { TrendingUpIcon } from './icons/NavIcons';
import { CpuChipIcon } from './icons/ActionIcons';
import { useTranslations } from '../contexts/LanguageContext';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        market_summary: { type: Type.STRING },
        key_trends: { type: Type.ARRAY, items: { type: Type.STRING } },
        investment_outlook: { type: Type.STRING }
    },
    required: ["market_summary", "key_trends", "investment_outlook"]
};

const MarketInsights: React.FC = () => {
  const [city, setCity] = useState('');
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeepAnalysis, setIsDeepAnalysis] = useState(false);
  const { t } = useTranslations();

  const handleGenerateReport = async () => {
      if (!city.trim()) return;
      setLoading(true);
      setError(null);
      setReport(null);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const prompt = `Generate a concise real estate market insights report for ${city}. Focus on current residential trends. Provide a market summary, 3-4 key bullet-point trends, and a brief investment outlook.`;

          const model = isDeepAnalysis ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
          const config: any = {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
          };
          
          if (isDeepAnalysis) {
              config.thinkingConfig = { thinkingBudget: 32768 };
          }

          const response = await ai.models.generateContent({
              model,
              contents: prompt,
              config
          });

          const jsonText = response.text.trim();
          setReport(JSON.parse(jsonText));

      } catch (err) {
          console.error("Error generating market report:", err);
          setError(t.marketInsights.error);
      } finally {
          setLoading(false);
      }
  };

  return (
    <section id="market-insights" className="py-12 lg:py-16 bg-white dark:bg-brand-dark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white">{t.marketInsights.title}</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">{t.marketInsights.subtitle}</p>
        </div>
        
        <div className="max-w-xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t.marketInsights.placeholder}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                />
                <button onClick={handleGenerateReport} disabled={loading} className="w-full sm:w-auto bg-brand-primary text-white px-5 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:bg-slate-400 flex items-center justify-center space-x-2 h-[50px] sm:w-48 flex-shrink-0">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                        <CpuChipIcon className="w-5 h-5"/>
                        <span>{t.marketInsights.generate}</span>
                        </>
                    )}
                </button>
            </div>
             <div className="mt-4 flex justify-center">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isDeepAnalysis} onChange={(e) => setIsDeepAnalysis(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/>
                    Enable Deep Analysis (Slower, more detailed)
                </label>
            </div>
        </div>
        
        {loading && (
             <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-1/3 mb-6"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-5/6"></div>
                </div>
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-1/4 my-6"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
                </div>
             </div>
        )}
        
        {error && <p className="text-center text-red-500">{error}</p>}

        {report && (
            <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-6 md:p-8 transform transition-all duration-500 opacity-0 animate-fade-in-up">
                <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">{t.marketInsights.reportTitle.replace('{{city}}', city)}</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{report.market_summary}</p>
                
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">{t.marketInsights.keyTrends}</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                    {report.key_trends.map((trend: string, i: number) => <li key={i}>{trend}</li>)}
                </ul>

                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">{t.marketInsights.investmentOutlook}</h4>
                <p className="text-slate-600 dark:text-slate-300">{report.investment_outlook}</p>
            </div>
        )}

      </div>
       <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }
        `}</style>
    </section>
  );
};

export default MarketInsights;