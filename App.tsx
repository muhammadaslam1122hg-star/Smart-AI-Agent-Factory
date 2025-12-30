
import React, { useState, useEffect } from 'react';
import { AppView, ProjectData, User } from './types';
import Sidebar from './components/Sidebar';
import FeatureGrid from './components/FeatureGrid';
import BuildForm from './components/BuildForm';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import AIToolComponent from './components/AIToolComponent';
import { CATEGORIES } from './constants';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  
  // Auth & Database
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);

  // GitHub State
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [pushingToGitHub, setPushingToGitHub] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('manifest_projects_v2');
    if (saved) setProjects(JSON.parse(saved));
    
    const savedUser = localStorage.getItem('manifest_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [generatedCode]);

  const handleGenerate = async (data: ProjectData) => {
    setGenerating(true);
    setGeneratedCode(null);
    try {
      const typeMap: Record<string, 'website' | 'webapp' | 'mobile' | 'agent'> = {
        [AppView.WEBSITE_BUILDER]: 'website',
        [AppView.WEB_APP_BUILDER]: 'webapp',
        [AppView.MOBILE_APP_BUILDER]: 'mobile',
        [AppView.AI_AGENT_CREATOR]: 'agent',
      };
      
      const type = typeMap[data.feature];
      if (!type) throw new Error("Invalid builder type selected.");

      const fullPrompt = `Project Type: ${data.feature}. Category: ${data.category}. Title: ${data.title}. Description: ${data.description}`;
      const code = await geminiService.generateCode(fullPrompt, type);
      setGeneratedCode(code);
      
      if (user) {
        const newProject: ProjectData = {
          ...data,
          id: Date.now().toString(),
          code,
          createdAt: Date.now(),
          ownerId: user.id
        };
        const updated = [newProject, ...projects];
        setProjects(updated);
        localStorage.setItem('manifest_projects_v2', JSON.stringify(updated));
      }
    } catch (err: any) {
      alert("Manifestation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGitHubPush = async () => {
    if (!githubToken || !repoName) return alert("GitHub Token and Repo Name are required.");
    setPushingToGitHub(true);
    try {
      const url = await geminiService.uploadToGitHub(githubToken, repoName, generatedCode || '');
      alert(`Success! Project manifested at: ${url}`);
      setIsGitHubModalOpen(false);
    } catch (error: any) {
      alert(`GitHub Manifestation Failed: ${error.message}`);
    } finally {
      setPushingToGitHub(false);
    }
  };

  const loginWithGoogle = () => {
    const mockUser: User = {
      id: 'usr_' + Date.now(),
      name: 'Smart Developer',
      email: 'dev@smart-ai.factory',
      photoURL: 'https://ui-avatars.com/api/?name=SD&background=2563eb&color=fff'
    };
    setUser(mockUser);
    localStorage.setItem('manifest_user', JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('manifest_user');
  };

  const downloadProject = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-agent-project-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (currentView === AppView.HOME) {
      return (
        <div className="space-y-12">
          {/* AdSense Top Placeholder */}
          <div className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl h-24 flex items-center justify-center text-[10px] text-slate-600 uppercase tracking-widest">
            Google AdSense Top Slot
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr,450px] gap-10">
            <div className="space-y-10">
              <div className="p-10 bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 rounded-[40px]">
                <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Smart AI Agent Factory</h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                  Manifest enterprise-grade websites, web apps, mobile prototypes, and autonomous AI agents in seconds using the world's most advanced neural engine.
                </p>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setCurrentView(AppView.WEBSITE_BUILDER)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20">Start Building</button>
                  <button onClick={() => setCurrentView(AppView.AI_AGENT_CREATOR)} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-2xl font-bold transition-all">Create AI Agent</button>
                </div>
              </div>
              <FeatureGrid onSelect={setCurrentView} />
            </div>
            <div className="hidden xl:block">
              <BuildForm selectedFeature={currentView} onGenerate={handleGenerate} />
            </div>
          </div>

          {/* AdSense Middle Placeholder */}
          <div className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl h-32 flex items-center justify-center text-[10px] text-slate-600 uppercase tracking-widest">
            Google AdSense Middle Slot
          </div>
        </div>
      );
    }

    if (currentView === AppView.MY_PROJECTS) {
      return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-white">My Manifestations</h2>
            <button onClick={() => setCurrentView(AppView.HOME)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold">New Project</button>
          </div>
          {projects.length === 0 ? (
            <div className="p-20 bg-slate-900/30 border border-slate-800 rounded-[40px] text-center">
              <i className="fa-solid fa-folder-open text-6xl text-slate-700 mb-6"></i>
              <p className="text-slate-500 font-medium text-lg">Your project vault is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(p => (
                <div key={p.id} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] hover:border-blue-500/50 transition-all group cursor-pointer" onClick={() => { setGeneratedCode(p.code!); setCurrentView(p.feature); }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 text-xl">
                      <i className={p.feature === AppView.WEBSITE_BUILDER ? "fa-solid fa-globe" : "fa-solid fa-code"}></i>
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{p.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">{p.description}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-bold transition-all">Launch</button>
                    <button onClick={(e) => { e.stopPropagation(); setProjects(projects.filter(pr => pr.id !== p.id)); localStorage.setItem('manifest_projects_v2', JSON.stringify(projects.filter(pr => pr.id !== p.id))); }} className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center transition-all"><i className="fa-solid fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const builders = [AppView.WEBSITE_BUILDER, AppView.WEB_APP_BUILDER, AppView.MOBILE_APP_BUILDER, AppView.AI_AGENT_CREATOR];
    if (builders.includes(currentView)) {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-[450px,1fr] gap-10 h-[calc(100vh-140px)] animate-in fade-in duration-500">
          <div className="overflow-y-auto space-y-6 pr-2">
             <BuildForm selectedFeature={currentView} onGenerate={handleGenerate} />
             
             {generatedCode && (
               <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] space-y-4">
                  <h4 className="font-bold text-white flex items-center gap-3">
                    <i className="fa-solid fa-rocket text-blue-500"></i>
                    Export & Deploy
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setIsGitHubModalOpen(true)} className="bg-[#24292e] hover:bg-black text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"><i className="fa-brands fa-github"></i> GitHub</button>
                    <button onClick={downloadProject} className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"><i className="fa-solid fa-download"></i> Download</button>
                  </div>
               </div>
             )}
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-[48px] flex flex-col overflow-hidden shadow-2xl relative">
             <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex bg-slate-900 p-1 rounded-2xl gap-1">
                   <button onClick={() => setActiveTab('preview')} className={`px-8 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>LIVE PREVIEW</button>
                   <button onClick={() => setActiveTab('code')} className={`px-8 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>SOURCE CODE</button>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { window.open(previewUrl!, '_blank') }} className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 transition-all"><i className="fa-solid fa-up-right-from-square"></i></button>
                </div>
             </div>

             <div className="flex-1 relative bg-[#0a0f1d]">
                {!generatedCode && !generating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 p-10 text-center">
                     <i className="fa-solid fa-code-merge text-9xl opacity-10 mb-8"></i>
                     <h3 className="text-2xl font-bold opacity-30">Manifest Engine Ready</h3>
                     <p className="max-w-xs text-sm opacity-20 mt-4">Provide detailed instructions in the form to begin synthesizing your code architecture.</p>
                  </div>
                )}

                {generating && (
                  <div className="absolute inset-0 z-50 bg-[#020617]/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-12">
                     <div className="relative mb-10">
                        <div className="w-32 h-32 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <i className="fa-solid fa-atom text-blue-400 text-4xl animate-pulse"></i>
                        </div>
                     </div>
                     <h3 className="text-3xl font-black text-white mb-3">Synthesizing Manifest</h3>
                     <p className="text-slate-500 max-w-sm leading-relaxed">Assembling high-quality code structures and styling frameworks using advanced neural processing.</p>
                  </div>
                )}

                {generatedCode && activeTab === 'preview' && (
                  <iframe src={previewUrl!} className="w-full h-full bg-white animate-in zoom-in-95 duration-700" title="Live Preview" />
                )}

                {generatedCode && activeTab === 'code' && (
                  <pre className="w-full h-full p-10 text-[11px] font-mono text-emerald-400 overflow-auto selection:bg-blue-500/30">
                    {generatedCode}
                  </pre>
                )}
             </div>
          </div>
        </div>
      );
    }

    // Creative/Motion Tools
    if (currentView === AppView.IMAGE_GENERATION) return <ImageGenerator />;
    if (currentView === AppView.AI_CHAT) return <ChatInterface />;
    return (
      <AIToolComponent 
        view={currentView} 
        title={currentView.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} 
        description="Advanced AI-powered media manipulation engine."
        icon={<i className="fa-solid fa-microchip text-xl"></i>}
      />
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-200">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent)]">
        <header className="sticky top-0 z-40 px-8 py-5 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Neural Link Active</span>
          </div>
          
          <div className="flex items-center gap-6">
            {!user ? (
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/30">Sign In</button>
            ) : (
              <div className="flex items-center gap-4 group cursor-pointer" onClick={logout}>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Certified Architect</p>
                </div>
                <img src={user.photoURL} className="w-11 h-11 rounded-2xl border-2 border-slate-800 group-hover:border-blue-500 transition-all shadow-lg" alt="Profile" />
              </div>
            )}
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto min-h-full">
          {renderContent()}
        </div>

        {/* Modals */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[48px] overflow-hidden shadow-3xl p-12 text-center space-y-10 border-blue-500/10">
               <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center text-white text-4xl mx-auto shadow-2xl shadow-blue-600/40">
                 <i className="fa-solid fa-shield-halved"></i>
               </div>
               <div>
                  <h3 className="text-3xl font-black text-white">Neural Passport</h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">Secure your manifestations and sync across the factory network. Instant access to enterprise features.</p>
               </div>
               <button onClick={loginWithGoogle} className="w-full bg-white hover:bg-slate-100 text-[#020617] font-black py-5 rounded-[24px] flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl">
                 <img src="https://www.google.com/favicon.ico" className="w-6 h-6" />
                 Continue with Google
               </button>
               <button onClick={() => setIsAuthModalOpen(false)} className="text-xs font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest">Later, I'll build as Guest</button>
            </div>
          </div>
        )}

        {isGitHubModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg p-6">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[48px] overflow-hidden shadow-3xl animate-in zoom-in-95 duration-300">
              <div className="p-12">
                 <div className="flex items-center gap-6 mb-10">
                   <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-[#020617] text-4xl shadow-2xl">
                     <i className="fa-brands fa-github"></i>
                   </div>
                   <div>
                     <h3 className="text-3xl font-black text-white tracking-tighter">Direct Deploy</h3>
                     <p className="text-sm text-slate-500">Manifest code to the GitHub network.</p>
                   </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">Personal Access Token</label>
                      <input type="password" placeholder="ghp_XXXXXXXXXXXXXXXX" className="w-full bg-[#020617] border border-slate-700 rounded-[20px] px-6 py-5 text-sm focus:border-blue-500 outline-none transition-all font-mono" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">Manifest Name (Repo)</label>
                      <input type="text" placeholder="smart-ai-agent-v1" className="w-full bg-[#020617] border border-slate-700 rounded-[20px] px-6 py-5 text-sm focus:border-blue-500 outline-none transition-all" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
                    </div>
                    
                    <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-[24px] text-xs text-blue-400 leading-relaxed italic">
                      Manifest Engine will initialize a new repository and commit your current project state instantly.
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button onClick={() => setIsGitHubModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-[20px] transition-all">Cancel</button>
                      <button onClick={handleGitHubPush} disabled={pushingToGitHub} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[20px] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30">
                        {pushingToGitHub ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-upload"></i>}
                        {pushingToGitHub ? 'Deploying...' : 'Deploy Now'}
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
