
import React, { useState, useRef } from 'react';
import { AppView } from '../types';
import { geminiService } from '../services/geminiService';

interface AIToolComponentProps {
  view: AppView;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AIToolComponent: React.FC<AIToolComponentProps> = ({ view, title, description, icon }) => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Explicitly type 'file' as File to resolve potential 'unknown' type inference issues.
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const executeTask = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);

    try {
      let output = null;
      switch (view) {
        case AppView.PHOTO_EDITING:
          if (images[0]) output = await geminiService.editImage(images[0], prompt);
          break;
        case AppView.BG_REMOVER:
          if (images[0]) output = await geminiService.editImage(images[0], "Remove the background completely and make it transparent.");
          break;
        case AppView.FACE_SWAP:
          if (images[0] && images[1]) output = await geminiService.swapFaces(images[0], images[1]);
          break;
        case AppView.IMAGE_TO_VIDEO:
          if (images[0]) output = await geminiService.generateVideo(prompt || "Animate this scene naturally.", images[0]);
          break;
        case AppView.VIDEO_GENERATION:
          output = await geminiService.generateVideo(prompt);
          break;
        default:
          output = await geminiService.generateImage(prompt);
      }
      setResult(output);
    } catch (error) {
      console.error(error);
      alert("AI Processing Failed. Please check your API key or connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-8 h-full items-start">
      <div className="space-y-6">
        <div className="bg-[#1e293b]/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Upload Source</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
              >
                <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-600 group-hover:text-blue-500"></i>
                <span className="text-xs text-slate-500 group-hover:text-slate-300">Click to upload media</span>
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  multiple 
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                />
              </div>
            </div>

            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-700">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 text-[8px] flex items-center justify-center rounded-bl-md"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Instructions</label>
              <textarea
                placeholder="Describe what you want the AI to do..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm h-32 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <button
              onClick={executeTask}
              disabled={loading || (view !== AppView.VIDEO_GENERATION && images.length === 0 && view !== AppView.IMAGE_GENERATION)}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3"
            >
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
              {loading ? 'Processing...' : 'Run Manifest AI'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl min-h-[500px] flex flex-col relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            LIVE PREVIEW
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          {loading ? (
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fa-solid fa-brain text-blue-400 text-3xl animate-pulse"></i>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Processing Media</h4>
                <p className="text-xs text-slate-500">Neural networks are refining your project...</p>
              </div>
            </div>
          ) : result ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              {view.includes('video') ? (
                <video src={result} controls className="max-w-full max-h-[500px] rounded-2xl shadow-2xl border border-slate-800" />
              ) : (
                <img src={result} className="max-w-full max-h-[500px] rounded-2xl shadow-2xl border border-slate-800 object-contain" />
              )}
              <div className="flex gap-3">
                <button 
                  onClick={() => window.open(result, '_blank')}
                  className="bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <i className="fa-solid fa-expand"></i> View Full
                </button>
                <a 
                  href={result} 
                  download={`manifest-${view}-${Date.now()}.png`}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <i className="fa-solid fa-download"></i> Download
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-30">
              <div className="text-6xl text-slate-600">
                {icon}
              </div>
              <p className="text-sm font-medium">Results will appear here once generated</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIToolComponent;
