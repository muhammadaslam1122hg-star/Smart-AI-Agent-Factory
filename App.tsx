
import React, { useState, useEffect, useRef } from 'react';
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
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // GitHub Integration State
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [pushingToGitHub, setPushingToGitHub] = useState(false);

  // Database (Local Storage) State
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    // Load projects from "DB"
    const saved = localStorage.getItem('manifest_projects');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (generatedCode && (
      currentView === AppView.WEBSITE_BUILDER || 
      currentView === AppView.WEB_APP_BUILDER || 
      currentView === AppView.MOBILE_APP_BUILDER ||
      currentView === AppView.AI_AGENT_CREATOR
    )) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [generatedCode, currentView]);

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
      if (!type) {
        alert("Tool not integrated yet.");
        return;
      }

      const fullPrompt = `Category: ${data.category}. Title: ${data.title}. Instructions: ${data.description}`;
      const code = await geminiService.generateCode(fullPrompt, type);
      setGeneratedCode(code);
      
      // Auto-save to DB if user logged in
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
        localStorage.setItem('manifest_projects', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
      alert("Error generating content.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePushToGitHub = async () => {
    if (!githubToken || !repoName) return alert("Please enter Token and Repository name.");
    setPushingToGitHub(true);
    try {
      const url = await geminiService.uploadToGitHub(githubToken, repoName, generatedCode || '');
      alert(`Manifestation complete! Your project is live at: ${url}`);
      setIsGitHubModalOpen(false);
    } catch (error: any) {
      alert(`GitHub Manifestation Failed: ${error.message}`);
    } finally {
      setPushingToGitHub(false);
    }
  };

  const loginWithGoogle = () => {
    // Mock Firebase Auth
    const mockUser: User = {
      id: 'usr_' + Math.random(),
      name: 'Alpha Tester',
      email: 'tester@manifest.ai',
      photoURL: 'https://ui-avatars.com/api/?name=Manifest+AI'
    };
    setUser(mockUser);
    setIsAuthModalOpen(false);
  };

  const downloadProject = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderViewContent = () => {
    if (currentView === AppView.HOME) {
      return (
        <div className="space-y-10 animate-in fade-in duration-700">
           {/* Ad Slot */}
           <div className="bg-slate-900/40 border border-slate-800 h-24 rounded-3xl flex items-center justify-center text-slate-600 text-[10px] uppercase tracking-widest">
             Google AdSense Placeholder Slot
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
            <div className="space-y-10">
              <FeatureGrid onSelect={(v) => setCurrentView(v)} />
              <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800">
                 <h3 className="text-xl font-bold mb-4">Quick Start</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">Choose a category or a tool to start manifesting your digital ideas into reality. Our engine handles the heavy lifting.</p>
              </div>
            </div>
            <div>
              <BuildForm selectedFeature={currentView} onGenerate={handleGenerate} />
            </div>
          </div>
        </div>
      );
    }

    if (currentView === AppView.MY_PROJECTS) {
      return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-2xl font-bold mb-8">My Manifestations</h2>
          {projects.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-20 text-center opacity-40">
               <i className="fa-solid fa-folder-open text-6xl mb-4"></i>
               <p>No projects manifested yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => (
                <div key={p.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
                   <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400">
                         <i className="fa-solid fa-file-code"></i>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                   </div>
                   <h4 className="font-bold text-lg mb-2">{p.title}</h4>
                   <p className="text-xs text-slate-500 line-clamp-2 mb-4">{p.description}</p>
                   <div className="flex gap-2">
                     <button 
                        onClick={() => { setGeneratedCode(p.code!); setCurrentView(p.feature); }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-xs transition-colors"
                      >
                       Open
                     </button>
                     <button 
                        onClick={() => setProjects(projects.filter(proj => proj.id !== p.id))}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                      >
                       <i className="fa-solid fa-trash-can"></i>
                     </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Builder Views (Website, App, Mobile, Agent)
    const isBuilder = [AppView.WEBSITE_BUILDER, AppView.WEB_APP_BUILDER, AppView.MOBILE_APP_BUILDER, AppView.AI_AGENT_CREATOR].includes(currentView);
    if (isBuilder) {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-[400px,1fr] gap-8 h-[calc(100vh-140px)]">
          <div className="flex flex-col gap-6 overflow-y-auto pr-2">
             <BuildForm selectedFeature={currentView} onGenerate={handleGenerate} />
             
             {generatedCode && (
               <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <i className="fa-solid fa-rocket text-blue-500"></i>
                    Deploy & Export
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => setIsGitHubModalOpen(true)}
                      className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xl"
                    >
                      <i className="fa-brands fa-github text-lg"></i> Push to GitHub
                    </button>
                    <button 
                      onClick={downloadProject}
                      className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <i className="fa-solid fa-download"></i> Download Code
                    </button>
                  </div>
               </div>
             )}
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] flex flex-col overflow-hidden shadow-2xl">
             <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex bg-slate-900 p-1 rounded-xl gap-1">
                   <button 
                    onClick={() => setActiveTab('preview')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     LIVE PREVIEW
                   </button>
                   <button 
                    onClick={() => setActiveTab('code')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     CODE EXPLORER
                   </button>
                </div>
                {generatedCode && (
                  <button 
                    onClick={() => { navigator.clipboard.writeText(generatedCode); alert("Code in memory."); }}
                    className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400"
                  >
                    <i className="fa-solid fa-copy"></i>
                  </button>
                )}
             </div>

             <div className="flex-1 relative overflow-hidden bg-slate-950">
                {!generatedCode && !generating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 space-y-4">
                     <i className="fa-solid fa-code-branch text-8xl opacity-10"></i>
                     <p className="font-medium">Define your manifestation to begin generation</p>
                  </div>
                )}

                {generating && (
                  <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
                     <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <i className="fa-solid fa-brain text-blue-500 text-3xl animate-pulse"></i>
                        </div>
                     </div>
                     <h3 className="text-xl font-bold mb-2">Engaging Manifestation Engine</h3>
                     <p className="text-sm text-slate-500 max-w-xs">Building your {currentView.split('_').join(' ')} with precise neural instructions...</p>
                  </div>
                )}

                {generatedCode && activeTab === 'preview' && (
                  <iframe src={previewUrl!} className="w-full h-full bg-white animate-in zoom-in-95 duration-500" title="Live Preview" />
                )}

                {generatedCode && activeTab === 'code' && (
                  <pre className="w-full h-full p-8 text-xs font-mono text-emerald-400 overflow-auto bg-[#0a0f1d] selection:bg-blue-500/30">
                    {generatedCode}
                  </pre>
                )}
             </div>
          </div>
        </div>
      );
    }

    // Default specialized components
    if (currentView === AppView.IMAGE_GENERATION) return <ImageGenerator />;
    if (currentView === AppView.AI_CHAT) return <ChatInterface />;
    if (currentView === AppView.PHOTO_EDITING) return <AIToolComponent view={currentView} title="Advanced Photo Editor" description="AI-powered image manipulation" icon={<i className="fa-solid fa-wand-magic-sparkles text-xl"></i>} />;
    if (currentView === AppView.BG_REMOVER) return <AIToolComponent view={currentView} title="Background Remover" description="Instant clean transparency" icon={<i className="fa-solid fa-scissors text-xl"></i>} />;
    if (currentView === AppView.FACE_SWAP) return <AIToolComponent view={currentView} title="Neural Face Swap" description="Seamless face replacement" icon={<i className="fa-solid fa-people-arrows text-xl"></i>} />;
    if (currentView === AppView.VIDEO_GENERATION) return <AIToolComponent view={currentView} title="Text to Video" description="Cinematic video generation" icon={<i className="fa-solid fa-video text-xl"></i>} />;
    if (currentView === AppView.IMAGE_TO_VIDEO) return <AIToolComponent view={currentView} title="Image Animator" description="Breathe life into photos" icon={<i className="fa-solid fa-film text-xl"></i>} />;

    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.1),transparent)]">
        {/* Header */}
        <header className="sticky top-0 z-40 px-8 py-4 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Manifest AI</span>
              <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
              <span className="font-semibold text-blue-400">
                {currentView === AppView.HOME ? 'System Dashboard' : currentView.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <img src={user.photoURL} className="w-10 h-10 rounded-xl border border-slate-800 cursor-pointer" onClick={() => setUser(null)} alt="Profile" />
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          {renderViewContent()}
        </div>

        {/* Auth Modal */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl p-8 text-center space-y-8">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-blue-600/30">
                 <i className="fa-solid fa-fingerprint"></i>
               </div>
               <div>
                  <h3 className="text-2xl font-bold">Secure Access</h3>
                  <p className="text-slate-500 text-sm mt-2">Manifest your identity to save projects and sync across devices.</p>
               </div>
               <button 
                  onClick={loginWithGoogle}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                 <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
                 Continue with Google
               </button>
               <button onClick={() => setIsAuthModalOpen(false)} className="text-xs text-slate-600 hover:text-slate-400">Later, I'll stay anonymous</button>
            </div>
          </div>
        )}

        {/* GitHub Integration Modal */}
        {isGitHubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-10">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 text-3xl shadow-xl shadow-white/10">
                     <i className="fa-brands fa-github"></i>
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-white tracking-tight">GitHub Deploy</h3>
                     <p className="text-xs text-slate-500">Instant repository manifestation.</p>
                   </div>
                 </div>
                 
                 <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2">Personal Access Token</label>
                      <input 
                        type="password" 
                        placeholder="ghp_xxxxxxxxxxxx"
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all font-mono"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2">Repository Name</label>
                      <input 
                        type="text" 
                        placeholder="manifest-project-01"
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                      />
                    </div>
                    
                    <div className="bg-blue-600/5 border border-blue-600/20 p-5 rounded-2xl text-[11px] text-blue-400 leading-relaxed italic">
                      Manifest will create a NEW public repository and upload your single-file project as index.html.
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setIsGitHubModalOpen(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all"
                      >
                        Abort
                      </button>
                      <button 
                        onClick={handlePushToGitHub}
                        disabled={pushingToGitHub}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30"
                      >
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
