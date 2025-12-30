
import React from 'react';
import { MAIN_FEATURES } from '../constants';
import { AppView } from '../types';

interface FeatureGridProps {
  onSelect: (view: AppView) => void;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ onSelect }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <i className="fa-solid fa-shapes text-blue-500"></i>
        <h2 className="text-lg font-semibold">Main Features</h2>
        <span className="text-xs text-slate-500 ml-2">مین فیچرز</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {MAIN_FEATURES.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onSelect(feature.id)}
            className="group flex flex-col items-center justify-center p-4 bg-[#1e293b]/50 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="w-12 h-12 mb-3 bg-slate-800 group-hover:bg-blue-600/20 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
              <span className="text-xl">{feature.icon}</span>
            </div>
            <span className="text-xs font-medium text-slate-300 group-hover:text-white text-center">
              {feature.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeatureGrid;
