import React, { useEffect, useState } from 'react';
import { PressReleaseData } from '../types';
import { generatePressReleaseText, generatePressImage, refinePressReleaseText, generateEventWebsite } from '../services/geminiService';
import { ArrowPathIcon, PhotoIcon, ClipboardIcon, CheckIcon, PencilSquareIcon, PaperAirplaneIcon, GlobeAltIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

interface ResultViewProps {
  data: PressReleaseData;
  onRestart: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onRestart }) => {
  const [text, setText] = useState<string>("");
  const [loadingText, setLoadingText] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [copied, setCopied] = useState(false);

  // Website State
  const [websiteCode, setWebsiteCode] = useState<string | null>(null);
  const [loadingWebsite, setLoadingWebsite] = useState(false);

  // Refinement state
  const [refinementInput, setRefinementInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchText = async () => {
      const result = await generatePressReleaseText(data);
      if (isMounted) {
        setText(result);
        setLoadingText(false);
      }
    };
    fetchText();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleGenerateImage = async () => {
    setLoadingImage(true);
    // Pass full data for poster generation
    const result = await generatePressImage(data);
    setImageUrl(result);
    setLoadingImage(false);
  };

  const handleGenerateWebsite = async () => {
    setLoadingWebsite(true);
    const code = await generateEventWebsite(data);
    setWebsiteCode(code);
    setLoadingWebsite(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefine = async () => {
    if (!refinementInput.trim()) return;
    
    setIsRefining(true);
    const newText = await refinePressReleaseText(text, refinementInput);
    setText(newText);
    setRefinementInput("");
    setIsRefining(false);
  };

  if (loadingText) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-brand-primary rounded-full animate-spin"></div>
        </div>
        <p className="mt-8 text-xl text-slate-300 animate-pulse">Je persbericht wordt geschreven...</p>
        <p className="text-sm text-slate-500 mt-2">De AI combineert je antwoorden tot een professioneel verhaal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
            Je Persbericht is Klaar
        </h2>
        <button 
            onClick={onRestart}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
            <ArrowPathIcon className="w-5 h-5" />
            Opnieuw beginnen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Text Result - Spans 8 columns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white text-slate-900 rounded-xl p-8 shadow-2xl relative min-h-[500px]">
                <button 
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors z-10"
                    title="Kopieer tekst"
                >
                    {copied ? <CheckIcon className="w-6 h-6 text-green-500" /> : <ClipboardIcon className="w-6 h-6" />}
                </button>
                
                {isRefining ? (
                     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
                        <p className="text-brand-dark font-semibold">Tekst aanpassen...</p>
                     </div>
                ) : null}

                <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{text}</ReactMarkdown>
                </div>
            </div>

            {/* Refinement Section */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <PencilSquareIcon className="w-5 h-5 text-brand-secondary" />
                    Tekst aanpassen
                </h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={refinementInput}
                        onChange={(e) => setRefinementInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                        placeholder="Bijv: 'Maak het enthousiaster' of 'Voeg toe dat kaartverkoop start op 1 dec'"
                        className="flex-grow bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isRefining}
                    />
                    <button 
                        onClick={handleRefine}
                        disabled={!refinementInput.trim() || isRefining}
                        className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {isRefining ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div> : <PaperAirplaneIcon className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-xs text-slate-500">
                    Geef instructies aan de AI om de tekst te herschrijven of details toe te voegen.
                </p>
            </div>
        </div>

        {/* Assets Section - Spans 4 columns */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Poster Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <PhotoIcon className="w-6 h-6 text-brand-accent" />
                    Poster Generator
                </h3>
                
                {!imageUrl && !loadingImage && (
                    <div className="text-center py-4">
                        <p className="text-slate-400 mb-4 text-xs">
                            Genereer een concertposter met datum, artiest en QR-code.
                        </p>
                        <button
                            onClick={handleGenerateImage}
                            className="w-full py-2 bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20 text-sm"
                        >
                            Genereer Poster
                        </button>
                    </div>
                )}

                {loadingImage && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mb-2"></div>
                        <p className="text-slate-400 text-xs">Poster ontwerpen...</p>
                    </div>
                )}

                {imageUrl && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="rounded-lg overflow-hidden border border-slate-600 shadow-lg relative group">
                            <img src={imageUrl} alt="Generated press poster" className="w-full h-auto object-cover" />
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a 
                                    href={imageUrl} 
                                    download="poster.png"
                                    className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-transform"
                                >
                                    Download
                                </a>
                             </div>
                        </div>
                        <button
                            onClick={handleGenerateImage}
                            className="block w-full text-center py-1 text-slate-400 hover:text-white text-xs border border-slate-700 rounded hover:bg-slate-700 transition-colors"
                        >
                            Nieuwe variant
                        </button>
                    </div>
                )}
            </div>

            {/* Website Generator Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                 <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <GlobeAltIcon className="w-6 h-6 text-blue-400" />
                    Promo Website
                </h3>

                {!websiteCode && !loadingWebsite && (
                    <div className="text-center py-4">
                        <p className="text-slate-400 mb-4 text-xs">
                            Maak een 'single-page' promotie website code (HTML+Tailwind) voor je event.
                        </p>
                        <button
                            onClick={handleGenerateWebsite}
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 text-sm"
                        >
                            Genereer Website
                        </button>
                    </div>
                )}

                {loadingWebsite && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-2"></div>
                        <p className="text-slate-400 text-xs">Code schrijven...</p>
                    </div>
                )}

                {websiteCode && (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded overflow-hidden h-40 mb-3 border border-slate-600 relative group">
                             {/* Overlay to prevent interaction issues with small iframe */}
                             <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-black/10 transition-colors"></div>
                             <iframe 
                                srcDoc={websiteCode} 
                                className="w-full h-full transform scale-[0.5] origin-top-left w-[200%] h-[200%]" 
                                title="Website Preview" 
                                sandbox="allow-scripts"
                             />
                        </div>
                         <div className="flex gap-2">
                            <a 
                                href={`data:text/html;charset=utf-8,${encodeURIComponent(websiteCode)}`}
                                download="event-promo.html"
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition-colors"
                            >
                                <ArrowDownTrayIcon className="w-3 h-3" />
                                Download HTML
                            </a>
                             <button
                                onClick={handleGenerateWebsite}
                                className="px-3 py-2 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                title="Opnieuw genereren"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
                <h4 className="font-semibold text-white mb-2 text-sm">Distributie Tips</h4>
                <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                    <li>Deel de poster direct op Instagram Stories.</li>
                    <li>Gebruik de tekst in de body van je e-mail.</li>
                    <li>Upload de HTML file naar een gratis host (zoals Netlify Drop) voor een directe landingspagina.</li>
                </ul>
            </div>

        </div>
      </div>
    </div>
  );
};
