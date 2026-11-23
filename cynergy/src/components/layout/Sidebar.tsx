import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Layers, 
  CalendarClock, 
  CheckSquare, 
  GitFork, 
  BarChart3, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  FileText,
  Clock,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

export const Sidebar: React.FC = () => {
  const { role, currentUser } = useAuth();
  const bookings = storageService.getBookings();

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const conflictCount = bookings.filter((b) => b.conflictDetected && b.status === 'pending').length;
  const myBookingsCount = bookings.filter((b) => b.studentId === currentUser?.uid).length;

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 shrink-0 hidden md:block border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Core Discovery */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Marketplace</p>
          <nav className="space-y-1">
            <NavLink to="/resources" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <Compass className="h-4 w-4" />
                <span>Resource Discovery</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Student Section */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student Portal</p>
          <nav className="space-y-1">
            <NavLink to="/my-bookings" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <CalendarClock className="h-4 w-4" />
                <span>My Requests</span>
              </div>
              {myBookingsCount > 0 && (
                <span className="rounded-md bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                  {myBookingsCount}
                </span>
              )}
            </NavLink>
          </nav>
        </div>

        {/* Faculty Section */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faculty Management</p>
          <nav className="space-y-1">
            <NavLink to="/faculty/approvals" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <CheckSquare className="h-4 w-4" />
                <span>Approval Dashboard</span>
              </div>
              {pendingCount > 0 && (
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  {pendingCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/faculty/conflicts" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <GitFork className="h-4 w-4" />
                <span>Conflict Resolution</span>
              </div>
              {conflictCount > 0 && (
                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                  {conflictCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/faculty/resources" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4" />
                <span>Manage Resources</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Administration & Analytics */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Campus Governance</p>
          <nav className="space-y-1">
            <NavLink to="/analytics" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4" />
                <span>Utilisation Analytics</span>
              </div>
            </NavLink>
            <NavLink to="/admin" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Super Admin</span>
              </div>
            </NavLink>
            <NavLink to="/admin/departments" className={navItemClass}>
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4" />
                <span>Departments</span>
              </div>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Flagship Demonstration Banner Card */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-950 to-slate-900 p-3.5 text-white shadow-lg shadow-brand-950/20 border border-brand-800/50">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-white tracking-wide">Demo Walkthrough</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
          See how LabLink detects GPU Workstation conflict, computes fairness scores, and lets faculty resolve slots.
        </p>
        <NavLink
          to="/faculty/conflicts"
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-500 py-1.5 text-xs font-semibold text-white hover:bg-brand-400 transition-colors shadow-sm"
        >
          Inspect Conflict Case
        </NavLink>
      </div>
    </aside>
  );
};
