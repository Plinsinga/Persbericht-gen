import React, { useState } from 'react';
import { QuestionConfig, PressReleaseData } from '../types';
import { getSuggestions } from '../services/geminiService';
import { SparklesIcon, ChevronRightIcon, ChevronLeftIcon, DocumentArrowUpIcon, PhotoIcon } from '@heroicons/react/24/solid';

interface StepWizardProps {
  question: QuestionConfig;
  data: PressReleaseData;
  onUpdate: (field: keyof PressReleaseData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isLastStep: boolean;
}

export const StepWizard: React.FC<StepWizardProps> = ({
  question,
  data,
  onUpdate,
  onNext,
  onBack,
  isLastStep
}) => {
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    setSuggestionLoading(true);
    setSuggestions(null);
    try {
      const result = await getSuggestions(question.title, data[question.field] as string, data);
      setSuggestions(result);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            // Result is formatted as: data:image/jpeg;base64,/9j/4AA...
            // We need to parse this for the API
            const base64Data = result.split(',')[1];
            const mimeType = result.split(':')[0].split(';')[0].split(':')[1];
            
            const newImage = { mimeType, data: base64Data };
            const currentImages = data.uploadedImages || [];
            onUpdate('uploadedImages', [...currentImages, newImage]);
        };
        reader.readAsDataURL(file);
    } else {
        // Assume Text
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            onUpdate('fileContent', content);
        };
        reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-lg text-lg">
                {question.step} / 5
            </span>
            {question.title}
        </h2>
        <p className="text-slate-400 text-lg">{question.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Input Area */}
        <div className="lg:col-span-2 space-y-4">
          <textarea
            className="w-full h-64 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-none text-lg leading-relaxed"
            placeholder={question.placeholder}
            value={data[question.field] as string}
            onChange={(e) => onUpdate(question.field, e.target.value)}
          />
          
          {/* File Upload (Available on all steps but usually most relevant early) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-400 hover:text-white cursor-pointer transition-colors bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <DocumentArrowUpIcon className="w-5 h-5" />
                    <span>Upload bestand</span>
                    <input type="file" accept=".txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp" onChange={handleFileUpload} className="hidden" />
                </label>
                <div className="flex flex-col text-xs text-slate-500">
                    <span>Ondersteund: .txt, .md, .png, .jpg</span>
                    <span>Upload bijv. een playlist afbeelding</span>
                </div>
            </div>

            {/* Uploaded Status Indicators */}
            {(data.fileContent || data.uploadedImages.length > 0) && (
                <div className="flex gap-2 mt-2">
                    {data.fileContent && (
                         <span className="text-xs bg-slate-800 text-green-400 px-2 py-1 rounded flex items-center gap-1">
                            <DocumentArrowUpIcon className="w-3 h-3" />
                            Tekst info
                         </span>
                    )}
                    {data.uploadedImages.map((_, idx) => (
                        <span key={idx} className="text-xs bg-slate-800 text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                            <PhotoIcon className="w-3 h-3" />
                            Img {idx + 1}
                        </span>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Sidebar / Assistant */}
        <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 h-full flex flex-col">
                <div className="mb-4">
                    <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-brand-secondary" />
                        AI Assistent
                    </h3>
                    <p className="text-xs text-slate-400">Hulp nodig? Vraag de AI om suggesties op basis van je input.</p>
                </div>

                <div className="flex-grow overflow-y-auto mb-4 min-h-[100px]">
                    {suggestionLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-secondary"></div>
                        </div>
                    ) : suggestions ? (
                        <div className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                            {suggestions}
                        </div>
                    ) : (
                        <div className="text-center text-slate-600 text-sm mt-10 italic">
                            Klik op de knop voor suggesties...
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGetSuggestions}
                    disabled={suggestionLoading}
                    className="w-full py-2 px-4 bg-brand-secondary hover:bg-brand-secondary/80 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <SparklesIcon className="w-4 h-4" />
                    Suggesties vragen
                </button>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
        <button
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                question.step === 1 
                ? 'text-slate-600 cursor-not-allowed' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            disabled={question.step === 1}
        >
            <ChevronLeftIcon className="w-5 h-5" />
            Vorige
        </button>

        <button
            onClick={onNext}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 transition-all transform hover:scale-105"
        >
            {isLastStep ? 'Overzicht bekijken' : 'Volgende'}
            <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};