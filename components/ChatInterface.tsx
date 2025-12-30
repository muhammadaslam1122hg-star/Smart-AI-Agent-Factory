
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.generateText(input);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not connect to the AI model." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <i className="fa-solid fa-comments text-white text-sm"></i>
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Chat Assistant</h3>
            <p className="text-[10px] text-emerald-400">Online & Active</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
            <i className="fa-solid fa-robot text-6xl"></i>
            <p className="text-sm">Hello! How can I help you today?</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700 animate-pulse flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-blue-500 outline-none transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-colors"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
