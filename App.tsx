import React, { useState } from 'react';
import { Step, PressReleaseData, QUESTIONS } from './types';
import { StepWizard } from './components/StepWizard';
import { ResultView } from './components/ResultView';
import { MusicalNoteIcon } from '@heroicons/react/24/solid';

const INITIAL_DATA: PressReleaseData = {
  what: '',
  who: '',
  when: '',
  where: '',
  whyHow: '',
  fileContent: '',
  uploadedImages: []
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 is intro
  const [data, setData] = useState<PressReleaseData>(INITIAL_DATA);

  const handleUpdateData = (field: keyof PressReleaseData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setData(INITIAL_DATA);
    setCurrentStep(0);
  };

  // Render Introduction
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-accent/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl text-center relative z-10">
            <div className="inline-flex items-center justify-center p-4 bg-slate-800 rounded-2xl mb-6 shadow-xl border border-slate-700">
                <MusicalNoteIcon className="w-12 h-12 text-brand-primary" />
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
                Music<span className="text-brand-primary">PR</span> Pro
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                De slimme persbericht generator voor de muziekindustrie. 
                Beantwoord 5 vragen en onze AI schrijft een professioneel persbericht 
                voor je release of event.
            </p>
            <button 
                onClick={() => setCurrentStep(1)}
                className="px-10 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-lg font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-brand-primary/25"
            >
                Start Generator
            </button>
        </div>
      </div>
    );
  }

  // Render Questions (Steps 1-5)
  if (currentStep >= 1 && currentStep <= 5) {
    const questionIndex = currentStep - 1;
    const currentQuestion = QUESTIONS[questionIndex];

    return (
      <div className="min-h-screen bg-brand-dark text-white flex flex-col">
         {/* Header */}
        <header className="w-full p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <MusicalNoteIcon className="w-6 h-6 text-brand-primary" />
                    <span>MusicPR Pro</span>
                </div>
                <div className="text-sm text-slate-500">
                    Stap {currentStep} van 5
                </div>
            </div>
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
                <div 
                    className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
            </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
            <StepWizard 
                question={currentQuestion}
                data={data}
                onUpdate={handleUpdateData}
                onNext={handleNext}
                onBack={handleBack}
                isLastStep={currentStep === 5}
            />
        </main>
      </div>
    );
  }

  // Render Review/Pre-submit (Step 6)
  if (currentStep === 6) {
    return (
        <div className="min-h-screen bg-brand-dark text-white p-4 sm:p-8">
            <div className="max-w-3xl mx-auto mt-10">
                <h2 className="text-3xl font-bold mb-6">Controleer je antwoorden</h2>
                <div className="space-y-6 mb-8">
                    {QUESTIONS.map((q) => (
                        <div key={q.step} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <h3 className="text-brand-primary font-semibold">{q.title}</h3>
                                <button 
                                    onClick={() => setCurrentStep(q.step)}
                                    className="text-xs text-slate-400 hover:text-white underline"
                                >
                                    Bewerken
                                </button>
                            </div>
                            <p className="text-slate-300 whitespace-pre-wrap">{data[q.field] || "Geen antwoord ingevuld."}</p>
                        </div>
                    ))}
                    
                    {/* File summary */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <h3 className="text-brand-primary font-semibold mb-2">Uploads</h3>
                        <div className="text-slate-300 text-sm">
                            {data.fileContent ? "✅ Tekstbestand geüpload" : "❌ Geen tekstbestand"}
                            <br/>
                            {data.uploadedImages.length > 0 ? `✅ ${data.uploadedImages.length} afbeelding(en) geüpload` : "❌ Geen afbeeldingen"}
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <button onClick={handleBack} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800">
                        Terug
                    </button>
                    <button 
                        onClick={handleNext}
                        className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all"
                    >
                        Genereer Persbericht
                    </button>
                </div>
            </div>
        </div>
    )
  }

  // Render Result (Step 7)
  return (
    <div className="min-h-screen bg-brand-dark text-white">
         <header className="w-full p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <MusicalNoteIcon className="w-6 h-6 text-brand-primary" />
                    <span>MusicPR Pro</span>
                </div>
            </div>
        </header>
        <main className="p-4 sm:p-8">
            <ResultView data={data} onRestart={handleRestart} />
        </main>
    </div>
  );
};

export default App;