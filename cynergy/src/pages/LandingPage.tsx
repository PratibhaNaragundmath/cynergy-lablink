import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  GitFork, 
  CheckCircle2, 
  Clock, 
  Users, 
  Zap,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { loginAs, demoUsers } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = (role: 'student' | 'faculty' | 'admin') => {
    const user = demoUsers.find((u) => u.role === role) || demoUsers[0];
    loginAs(user);
    if (role === 'faculty') {
      navigate('/faculty/conflicts');
    } else if (role === 'admin') {
      navigate('/analytics');
    } else {
      navigate('/resources');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-md shadow-brand-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Lab<span className="text-brand-600">Link</span></span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Hackathon MVP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-all shadow-brand-500/20"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 border border-brand-200 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>AI-Powered Campus Laboratory Resource Sharing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Fair, Intelligent Access to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Specialised Campus Equipment</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Break down interdepartmental silos. Discover GPU clusters, FPGA boards, 3D printers, and RF spectrum analysers with mathematical fair allocation, conflict detection, and Gemini AI assistance.
            </p>

            {/* Quick Demo Login CTA Cards */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleQuickLogin('student')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5"
              >
                <span>Enter as Student (Aarav)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleQuickLogin('faculty')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 shadow-md transition-all hover:-translate-y-0.5"
              >
                <span>Faculty Approver (Dr. Ananya)</span>
                <GitFork className="h-4 w-4 text-brand-400" />
              </button>

              <button
                onClick={() => handleQuickLogin('admin')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 border border-slate-300 shadow-sm transition-all"
              >
                <span>Super Admin Console</span>
                <BarChart3 className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Interactive Flagship Live Preview Box */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200/80">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Featured Hackathon Scenario: Real-Time Conflict Resolution
                </span>
              </div>
              <span className="text-xs text-brand-600 font-medium bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                Formula: Urgency (30%) + Fit (25%) + Priority (20%) + Wait (15%) + Fairness (10%)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-900">Request A (Aarav Sharma)</span>
                  <span className="rounded-md bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5">
                    Score: 92/100
                  </span>
                </div>
                <p className="font-semibold text-xs text-slate-900">Autonomous Drone Vision (A100 GPU)</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Capstone deadline: <strong>Nov 26 (48 hrs)</strong> • Time: 10:00 - 14:00 • Zero prior bookings this week.
                </p>
                <div className="mt-2 text-[10px] text-emerald-800 font-medium">
                  ✓ Recommended for primary slot allocation.
                </div>
              </div>

              <div className="rounded-2xl bg-rose-50/60 p-4 border border-rose-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-900">Request B (Priya Patel)</span>
                  <span className="rounded-md bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5">
                    Score: 66/100
                  </span>
                </div>
                <p className="font-semibold text-xs text-slate-900">Exploratory BERT Fine-Tuning (A100 GPU)</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Assignment deadline: <strong>Dec 12 (18 days)</strong> • Time: 11:00 - 15:00 (Overlaps Request A).
                </p>
                <div className="mt-2 text-[10px] text-brand-700 font-medium">
                  ⚡ Alternative recommended: Nov 25 (15:00 - 19:00).
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Authoritative verification prevents double-booking across all 12 campus lab workstations.</span>
              <Link to="/faculty/conflicts" className="text-brand-600 font-semibold hover:underline flex items-center gap-1">
                View Faculty Decision Panel <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Engineered for Academic Excellence</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Transforming how universities manage high-value research instrumentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Cross-Department Marketplace</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects equipment across CSE, ECE, Mech, EEE, Civil, and AI&DS into a single searchable directory with real-time operational status.
              </p>
            </div>

            <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Intelligent Fair Allocation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A multi-factor mathematical scoring model balancing deadlines, technical suitability, academic priority, and anti-monopolization fairness.
              </p>
            </div>

            <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Gemini AI Lab Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assists researchers in matching project requirements to hardware specifications, explaining allocation decisions without hallucinating slots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-400 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-brand-400" />
            <span className="font-bold text-white">LabLink Campus Resource Platform</span>
          </div>
          <p>© 2026 University Research Council & Academic Technology Division. Built for Hackathon Demonstration.</p>
        </div>
      </footer>
    </div>
  );
};
