import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  User, 
  ArrowRight,
  Filter,
  Layers,
  Calendar
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { BookingRequest } from '../types';

export const FacultyApprovalsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>(() => storageService.getBookings());
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const handleUpdate = () => setBookings(storageService.getBookings());
    window.addEventListener('lablink_storage_update', handleUpdate);
    return () => window.removeEventListener('lablink_storage_update', handleUpdate);
  }, []);

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const resolvedRequests = bookings.filter((b) => b.status === 'approved' || b.status === 'rejected');

  const handleApprove = (bookingId: string) => {
    const res = storageService.approveBooking(
      bookingId,
      currentUser?.uid || 'faculty-1',
      currentUser?.name || 'Dr. Ananya Iyer'
    );

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
      setBookings(storageService.getBookings());
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }

    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleConfirmReject = () => {
    if (!rejectionModalId) return;

    const res = storageService.rejectBooking(
      rejectionModalId,
      rejectionReason,
      currentUser?.uid || 'faculty-1',
      currentUser?.name || 'Dr. Ananya Iyer'
    );

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
      setBookings(storageService.getBookings());
      setRejectionModalId(null);
      setRejectionReason('');
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }

    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Approval Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, evaluate fairness rankings, approve time slots, or reject with mandatory reasons. Double booking is strictly prevented.
        </p>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingRequests.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conflicting Requests</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {pendingRequests.filter((b) => b.conflictDetected).length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Bookings</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {bookings.filter((b) => b.status === 'approved').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Evaluated</p>
          <p className="text-2xl font-black text-brand-600 mt-1">{bookings.length}</p>
        </div>
      </div>

      {/* Pending Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Pending Student Requests ({pendingRequests.length})
          </h2>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">All requests reviewed!</h3>
            <p className="text-xs text-slate-500 mt-0.5">No pending student requests awaiting approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className={`rounded-2xl bg-white p-6 border transition-all ${
                  b.conflictDetected 
                    ? 'border-rose-300 ring-2 ring-rose-500/10 shadow-sm' 
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {b.id}
                      </span>
                      {b.conflictDetected && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Slot Overlap Detected</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1">{b.projectTitle}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Student: <strong>{b.studentName}</strong> • {b.studentDepartment}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-brand-50 text-brand-800 font-bold text-xs border border-brand-200">
                      Score: {b.allocationScore}/100
                    </span>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Target Equipment:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{b.resourceName}</p>
                    <span className="text-slate-500 text-[11px]">Duration: {b.durationHours} hrs</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Requested Time Window:</span>
                    <p className="font-semibold text-slate-900 mt-0.5 font-mono">
                      {b.requestedDate} ({b.startTime} - {b.endTime})
                    </p>
                    <span className="text-rose-600 font-bold text-[11px]">Hard Deadline: {b.deadline}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Project Scope:</span>
                    <p className="text-slate-700 text-[11px] line-clamp-2 mt-0.5">{b.projectDescription}</p>
                  </div>
                </div>

                {/* Allocation Engine Explanation */}
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Fair Allocation Assessment</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Deadline: {b.scoreBreakdown.deadlineScore}/30 • Fit: {b.scoreBreakdown.suitabilityScore}/25 • Fairness: {b.scoreBreakdown.fairnessScore}/10
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {b.allocationExplanation}
                  </p>
                </div>

                {/* Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => {
                      setRejectionModalId(b.id);
                      setRejectionReason('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(b.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve Booking</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Decline Laboratory Request</h3>
            <p className="text-xs text-slate-600">
              In accordance with university allocation policies, a clear reason is mandatory to inform the student.
            </p>

            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Requires safety orientation prerequisite; or equipment undergoing Vivado toolchain recalibration."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
