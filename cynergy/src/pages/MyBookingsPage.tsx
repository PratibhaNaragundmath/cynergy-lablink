import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  CalendarClock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  Sparkles, 
  ArrowRight,
  Info,
  Layers,
  Trash2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { BookingRequest, BookingStatus } from '../types';

export const MyBookingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>(() => storageService.getBookings());
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const handleUpdate = () => setBookings(storageService.getBookings());
    window.addEventListener('lablink_storage_update', handleUpdate);
    return () => window.removeEventListener('lablink_storage_update', handleUpdate);
  }, []);

  // Filter bookings for current student
  const studentBookings = bookings.filter((b) => b.studentId === currentUser?.uid);

  const filteredBookings = studentBookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const handleCancel = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking request?')) {
      storageService.cancelBooking(bookingId, currentUser?.uid || 'student');
      setBookings(storageService.getBookings());
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" />
            <span>Approved</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-bold">
            <Clock className="h-3 w-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'alternative_suggested':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold">
            <Sparkles className="h-3 w-3" />
            <span>Alternative Slot Suggested</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-xs font-bold">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-bold">
            <span>Cancelled</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-bold">
            <span>Completed</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Laboratory Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status, review faculty feedback, and inspect allocation scores for all submitted equipment requests.
          </p>
        </div>

        <Link
          to="/bookings/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>New Project Request</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-semibold">
        {['all', 'pending', 'approved', 'alternative_suggested', 'rejected', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-all shrink-0 ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.replace('_', ' ')} (
            {tab === 'all'
              ? studentBookings.length
              : studentBookings.filter((b) => b.status === tab).length}
            )
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <CalendarClock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No requests in this category</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse the laboratory marketplace and request specialised hardware.
          </p>
          <Link
            to="/resources"
            className="mt-4 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            <span>Explore Equipment</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isHighlighted = b.id === highlightId;

            return (
              <div
                key={b.id}
                className={`rounded-2xl bg-white p-5 sm:p-6 border transition-all ${
                  isHighlighted
                    ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                      ID: {b.id} • {b.academicLevel.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">{b.projectTitle}</h3>
                    <p className="text-xs font-medium text-slate-600 flex items-center gap-1 mt-0.5">
                      <Layers className="h-3.5 w-3.5 text-brand-500" />
                      <span>{b.resourceName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(b.status)}
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                      Score: {b.allocationScore}/100
                    </span>
                  </div>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Requested Session:</span>
                    <p className="font-semibold text-slate-800 mt-0.5 font-mono">
                      {b.requestedDate} ({b.startTime} - {b.endTime})
                    </p>
                    <span className="text-[11px] text-slate-500">Duration: {b.durationHours} hrs</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Project Hard Deadline:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {b.deadline}
                    </p>
                    <span className="text-[11px] text-slate-500">Requirements: {b.requirements}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Faculty Approver:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {b.facultyName || 'Pending Faculty Assignment'}
                    </p>
                    {b.rejectionReason && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">
                        Reason: {b.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Allocation Engine Explanation */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Intelligent Fair Allocation Assessment</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {b.allocationExplanation}
                  </p>
                </div>

                {/* Alternative Slots Section if suggested */}
                {b.alternativeSlots && b.alternativeSlots.length > 0 && b.status === 'alternative_suggested' && (
                  <div className="mt-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-indigo-900">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <span>Faculty Suggested Alternative Time Slots:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {b.alternativeSlots.map((slot) => (
                        <div key={slot.id} className="p-2.5 rounded-lg bg-white border border-indigo-100">
                          <p className="font-bold text-slate-900">{slot.date} ({slot.startTime} - {slot.endTime})</p>
                          <p className="text-[11px] text-slate-500">{slot.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Submitted {new Date(b.createdAt).toLocaleDateString()}
                  </span>

                  {(b.status === 'pending' || b.status === 'alternative_suggested') && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Cancel Request</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
