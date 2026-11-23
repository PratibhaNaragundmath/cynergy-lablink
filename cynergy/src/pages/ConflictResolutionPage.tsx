import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { BookingRequest, AlternativeSlot } from '../types';

export const ConflictResolutionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>(() => storageService.getBookings());
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => setBookings(storageService.getBookings());
    window.addEventListener('lablink_storage_update', handleUpdate);
    return () => window.removeEventListener('lablink_storage_update', handleUpdate);
  }, []);

  // Filter conflicting pending requests
  const conflictingBookings = bookings.filter((b) => b.conflictDetected && b.status === 'pending');

  const handleApproveWithSlot = (
    bookingId: string,
    slot?: { date: string; startTime: string; endTime: string }
  ) => {
    const res = storageService.approveBooking(
      bookingId,
      currentUser?.uid || 'user-faculty-1',
      currentUser?.name || 'Dr. Ananya Iyer',
      slot
    );

    if (res.success) {
      setResolutionNotice(res.message);
      setBookings(storageService.getBookings());
    } else {
      setResolutionNotice(`Error: ${res.message}`);
    }

    setTimeout(() => setResolutionNotice(null), 6000);
  };

  const handleSuggestAlternative = (bookingId: string, slot: AlternativeSlot) => {
    const res = storageService.suggestAlternativeSlot(
      bookingId,
      slot,
      currentUser?.uid || 'user-faculty-1',
      currentUser?.name || 'Dr. Ananya Iyer'
    );

    if (res.success) {
      setResolutionNotice(res.message);
      setBookings(storageService.getBookings());
    }

    setTimeout(() => setResolutionNotice(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <GitFork className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Intelligent Conflict Resolution Panel
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          When multiple researchers compete for the same hardware window, the Fair Allocation Engine calculates urgency, suitability, and alternative slots for faculty authorization.
        </p>
      </div>

      {resolutionNotice && (
        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
          <span>{resolutionNotice}</span>
        </div>
      )}

      {/* Featured Conflict Demonstration Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 p-6 text-white shadow-xl border border-brand-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Interactive Case Study
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">
              NVIDIA A100 GPU Workstation Contention (Nov 25, 2026)
            </h2>
          </div>
          <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 text-xs font-bold">
            Direct Overlap Detected
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mt-4">
          Two students requested overlapping sessions on the NVIDIA A100 GPU workstation. Below is the side-by-side fairness comparison calculated by LabLink's scoring algorithm.
        </p>
      </div>

      {conflictingBookings.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">Zero active booking conflicts!</h3>
          <p className="text-xs text-slate-500 mt-1">
            All current laboratory reservations are aligned without schedule overlaps.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {conflictingBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Applicant: {b.studentName}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">{b.projectTitle}</h3>
                    <p className="text-[11px] text-slate-500">{b.studentDepartment}</p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold text-white ${
                      b.allocationScore >= 80 ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      Score: {b.allocationScore}/100
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {b.allocationScore >= 80 ? 'Top Recommendation' : 'Secondary Priority'}
                    </p>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-medium">Deadline Urgency</p>
                    <p className="font-bold text-slate-900">{b.scoreBreakdown.deadlineScore} / 30 pts</p>
                    <p className="text-[9px] text-rose-600 font-medium">Due: {b.deadline}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-medium">Hardware Fit</p>
                    <p className="font-bold text-slate-900">{b.scoreBreakdown.suitabilityScore} / 25 pts</p>
                    <p className="text-[9px] text-slate-500 truncate">{b.requirements}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-medium">Fairness History</p>
                    <p className="font-bold text-slate-900">{b.scoreBreakdown.fairnessScore} / 10 pts</p>
                    <p className="text-[9px] text-emerald-600 font-medium">0 bookings this wk</p>
                  </div>
                </div>

                {/* Requested Window */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <span className="font-medium text-amber-900">Requested Time Window:</span>
                  <p className="font-bold text-amber-950 font-mono mt-0.5">
                    {b.requestedDate} from {b.startTime} to {b.endTime} ({b.durationHours} hours)
                  </p>
                </div>

                {/* Allocation Explanation */}
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{b.allocationExplanation}"
                </p>

                {/* Alternative Slots options */}
                {b.alternativeSlots && b.alternativeSlots.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                      <span>Suggested Non-Conflicting Slots:</span>
                    </p>
                    <div className="space-y-1.5">
                      {b.alternativeSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50/50 border border-slate-200 text-xs transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{slot.date} • {slot.startTime} - {slot.endTime}</p>
                            <p className="text-[10px] text-slate-500">{slot.reason}</p>
                          </div>
                          <button
                            onClick={() => handleSuggestAlternative(b.id, slot)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] border border-indigo-200 transition-colors"
                          >
                            Suggest Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleApproveWithSlot(b.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve Primary Slot</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
