import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AiAssistantModal } from '../ai/AiAssistantModal';
import { Sparkles, ArrowRight } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onToggleAi={() => setIsAiOpen(!isAiOpen)} isAiOpen={isAiOpen} />

      {/* Flagship Demonstration Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white px-4 py-2 border-b border-brand-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-brand-200">Hackathon Live Demo Case:</span>
            <span className="text-slate-200">
              Two students requesting NVIDIA A100 GPU for overlapping slots. AI Fair Allocation Engine ranks urgency & fairness.
            </span>
          </div>
          <Link
            to="/faculty/conflicts"
            className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-400 text-white px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            <span>Resolve Conflict Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <AiAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};
