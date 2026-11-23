import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Cpu, 
  Bell, 
  Sparkles, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleAi: () => void;
  isAiOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleAi, isAiOpen }) => {
  const { currentUser, role, switchRole, logout, demoUsers, loginAs } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = storageService.getNotifications(currentUser?.uid);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleResetDemoData = () => {
    if (confirm('Reset database to initial seed data with all demo bookings and resources?')) {
      storageService.resetToSeedData();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">Lab<span className="text-brand-600">Link</span></span>
                <span className="hidden sm:inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
                  Campus AI Allocator
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">Intelligent Cross-Department Laboratory Resource Sharing</p>
            </div>
          </Link>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetDemoData}
            title="Reset data to initial demonstration state"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Quick Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 px-2">ROLE:</span>
            {(['student', 'faculty', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  role === r
                    ? 'bg-white text-brand-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* AI Assistant Button */}
          <button
            onClick={onToggleAi}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isAiOpen
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                : 'bg-gradient-to-r from-brand-50 to-indigo-50 text-brand-700 border-brand-200 hover:border-brand-300 hover:shadow-sm'
            }`}
          >
            <Sparkles className="h-4 w-4 animate-pulse text-amber-500" />
            <span className="hidden sm:inline">LabLink AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-semibold text-sm text-slate-800">Notifications</h4>
                  <span className="text-xs text-slate-500">{notifications.length} alerts</span>
                </div>
                <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => storageService.markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                          n.read ? 'bg-slate-50/50 border-transparent text-slate-600' : 'bg-brand-50/40 border-brand-100 text-slate-800 font-medium'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'approval' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : n.type === 'conflict' ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Bell className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{n.title}</p>
                            <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-brand-500/20"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">{currentUser?.name}</p>
                <p className="text-[10px] font-medium text-slate-500 capitalize mt-0.5">{currentUser?.role} • {currentUser?.department.split(' ')[0]}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="pb-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                  <span className="mt-1 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 capitalize border border-brand-200">
                    Role: {currentUser?.role}
                  </span>
                </div>

                {/* Switch Demo Personas */}
                <div className="py-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">Switch Persona</p>
                  <div className="space-y-1">
                    {demoUsers.map((u) => (
                      <button
                        key={u.uid}
                        onClick={() => {
                          loginAs(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          currentUser?.uid === u.uid ? 'bg-brand-50 font-semibold text-brand-800' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-left">
                          <p className="leading-tight">{u.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{u.role} ({u.department.split(' ')[0]})</p>
                        </div>
                        {currentUser?.uid === u.uid && <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    to="/login"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
