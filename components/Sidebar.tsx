
import React from 'react';
import { AppView } from '../types';
import { SIDEBAR_ITEMS } from '../constants';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const sections = ['Builders', 'Creative', 'Personal'];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 h-full flex flex-col overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-cube text-xl"></i>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">AI Studio</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Manifest Engine</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-8">
        {sections.map((section) => (
          <div key={section}>
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">
              {section}
            </h3>
            <div className="space-y-1">
              {SIDEBAR_ITEMS.filter(item => item.section === section).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    currentView === item.id
                      ? 'bg-blue-600/10 text-blue-400 font-medium border border-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className={`transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
           <p className="text-[10px] text-slate-500 uppercase mb-2">Ad Space</p>
           <div className="bg-slate-800 w-full h-20 rounded border border-dashed border-slate-700 flex items-center justify-center">
             <span className="text-[8px] text-slate-600">Google AdSense Area</span>
           </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors">
          <i className="fa-solid fa-circle-info"></i>
          <span>Help & Support</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
