
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const img = await geminiService.generateImage(prompt, aspectRatio);
      setGeneratedImg(img);
    } catch (err) {
      console.error(err);
      alert("Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="bg-[#1e293b]/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-wand-sparkles text-blue-500"></i>
            Image Generation
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Prompt</label>
              <textarea
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm h-32 resize-none focus:border-blue-500 outline-none"
                placeholder="Describe the image you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Aspect Ratio</label>
              <div className="flex gap-2">
                {(["1:1", "16:9", "9:16"] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                      aspectRatio === ratio 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Generate Image'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 min-h-[400px] p-6 relative">
        {!generatedImg && !loading && (
          <div className="text-center space-y-4 opacity-40">
            <i className="fa-solid fa-image text-6xl"></i>
            <p className="text-sm">Your creation will appear here</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 rounded-2xl z-10">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-sparkles text-blue-400 animate-pulse"></i>
              </div>
            </div>
            <p className="mt-4 text-blue-400 font-medium animate-pulse">Painting your imagination...</p>
          </div>
        )}
        {generatedImg && (
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={generatedImg} 
              alt="Generated" 
              className="max-w-full max-h-full rounded-xl shadow-2xl object-contain border border-slate-700"
            />
          </div>
        )}
        {generatedImg && !loading && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImg;
                link.download = 'generated-image.png';
                link.click();
              }}
              className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-download"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
