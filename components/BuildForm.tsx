
import React, { useState, useEffect } from 'react';
import { AppView, ProjectData } from '../types';
import { CATEGORIES } from '../constants';

interface BuildFormProps {
  selectedFeature: AppView;
  onGenerate: (data: ProjectData) => void;
}

const BuildForm: React.FC<BuildFormProps> = ({ selectedFeature, onGenerate }) => {
  const [formData, setFormData] = useState<ProjectData>({
    title: '',
    feature: selectedFeature,
    category: '',
    description: '',
    saveAsTemplate: false,
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, feature: selectedFeature }));
  }, [selectedFeature]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div className="bg-[#1e293b]/50 border border-slate-800 rounded-[32px] p-8 h-fit sticky top-6 backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
          <i className="fa-solid fa-terminal"></i>
        </div>
        <div>
          <h2 className="text-lg font-bold">Project Blueprint</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">وضاحت اور بنائیں</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Project Name | پراجیکٹ کا نام</label>
          <input
            type="text"
            placeholder="e.g. My Next Big Thing"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Category | کیٹیگری</label>
          <div className="relative">
            <select
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 pointer-events-none"></i>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Detailed Description | تفصیلی پیغام</label>
          <textarea
            placeholder="Type your message to AI... Describe layout, features, colors, etc."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors h-48 resize-none leading-relaxed"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <p className="mt-2 text-[10px] text-slate-600 flex items-center gap-1">
            <i className="fa-solid fa-lightbulb text-yellow-500/50"></i>
            Be specific for better results. Use Urdu or English.
          </p>
        </div>

        <div className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            id="saveTemplate"
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
            checked={formData.saveAsTemplate}
            onChange={(e) => setFormData({ ...formData, saveAsTemplate: e.target.checked })}
          />
          <label htmlFor="saveTemplate" className="text-[11px] text-slate-500 group-hover:text-slate-200 transition-colors">
            Save as Template for future use
          </label>
        </div>

        <div className="space-y-3 pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Manifest Now
          </button>
          
          <div className="grid grid-cols-2 gap-3">
             <button
                type="button"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs"
              >
                <i className="fa-solid fa-history"></i>
                Revision
              </button>
              <button
                type="button"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs"
              >
                <i className="fa-solid fa-microchip"></i>
                Advanced
              </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BuildForm;
