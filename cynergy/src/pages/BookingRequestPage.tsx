import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Info,
  ShieldCheck,
  Send
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { evaluateBookingRequest } from '../features/allocation/allocationEngine';

export const BookingRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedResourceId = searchParams.get('resourceId') || '';

  const { currentUser } = useAuth();
  const resources = storageService.getResources();
  const allBookings = storageService.getBookings();

  const [resourceId, setResourceId] = useState(preselectedResourceId || (resources[0]?.id || ''));
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [requiredSpecifications, setRequiredSpecifications] = useState('');
  const [priorityJustification, setPriorityJustification] = useState('');
  const [academicLevel, setAcademicLevel] = useState<'undergraduate' | 'postgraduate' | 'phd_research' | 'hackathon'>('undergraduate');
  
  // Default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const deadlineStr = inThreeDays.toISOString().split('T')[0];

  const [requestedDate, setRequestedDate] = useState(tomorrowStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [deadline, setDeadline] = useState(deadlineStr);
  const [error, setError] = useState('');

  const selectedResource = useMemo(() => {
    return resources.find((r) => r.id === resourceId) || resources[0];
  }, [resources, resourceId]);

  // Live Intelligent Allocation Engine scoring simulation
  const liveEvaluation = useMemo(() => {
    if (!selectedResource || !requestedDate || !startTime || !endTime || !deadline) return null;

    return evaluateBookingRequest(
      {
        studentId: currentUser?.uid || 'guest-student',
        resourceId: selectedResource.id,
        projectTitle: projectTitle || 'Project Preview',
        projectDescription: projectDescription || 'Preview Description',
        requirements: requirements || selectedResource.capabilities.join(', '),
        deadline,
        requestedDate,
        startTime,
        endTime,
        academicLevel,
        priorityJustification: priorityJustification || 'Standard capstone requirement',
      },
      selectedResource,
      allBookings
    );
  }, [
    selectedResource,
    requestedDate,
    startTime,
    endTime,
    deadline,
    academicLevel,
    requirements,
    projectDescription,
    priorityJustification,
    currentUser,
    allBookings
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const today = new Date().toISOString().split('T')[0];
    if (requestedDate < today) {
      setError('Invalid date: Cannot book laboratory slots in the past.');
      return;
    }

    if (deadline < today) {
      setError('Invalid deadline: Project deadline cannot be in the past.');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be later than start time.');
      return;
    }

    if (!projectTitle.trim() || !projectDescription.trim() || !requirements.trim()) {
      setError('Please provide all required project details and specifications.');
      return;
    }

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const durationHours = Math.round(((eH * 60 + eM) - (sH * 60 + sM)) / 60);

    try {
      const created = storageService.createBookingRequest({
        studentId: currentUser?.uid || 'user-student-1',
        studentName: currentUser?.name || 'Aarav Sharma',
        studentEmail: currentUser?.email || 'student@campus.edu',
        studentDepartment: currentUser?.department || 'Artificial Intelligence & Data Science',
        resourceId: selectedResource.id,
        resourceName: selectedResource.name,
        departmentId: selectedResource.departmentId,
        projectTitle,
        projectDescription,
        requirements,
        requiredSpecifications,
        priorityJustification,
        academicLevel,
        deadline,
        requestedDate,
        startTime,
        endTime,
        durationHours: Math.max(1, durationHours),
      });

      navigate(`/my-bookings?highlight=${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Error submitting booking request.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Intelligent Allocation Enabled
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Submit Project-Based Laboratory Access Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Our multi-factor scoring algorithm evaluates deadline urgency, suitability, and fairness before routing to faculty.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-xs text-rose-700 border border-rose-200 flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Equipment Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Target Laboratory Equipment *
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.departmentName.split(' ')[0]}] {r.name} — ({r.location})
                </option>
              ))}
            </select>
          </div>

          {/* Project Title & Academic Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Autonomous Drone Obstacle Avoidance via ViT"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Academic Level *
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="undergraduate">Undergraduate Capstone</option>
                <option value="postgraduate">Postgraduate (MTech/MS)</option>
                <option value="phd_research">PhD Research</option>
                <option value="hackathon">Time-bound Hackathon</option>
              </select>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Project Description & Research Objectives *
            </label>
            <textarea
              required
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Explain the technical scope, methodology, and why this specific high-end equipment is required..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Technical Requirements & Hardware Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Required Frameworks & Software *
              </label>
              <input
                type="text"
                required
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g. PyTorch 2.4, CUDA 12.4, TensorRT, ROS2"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Priority Justification *
              </label>
              <input
                type="text"
                required
                value={priorityJustification}
                onChange={(e) => setPriorityJustification(e.target.value)}
                placeholder="e.g. Final capstone presentation deadline in 48 hours"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Time Slot & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Project Hard Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Requested Booking Date *
              </label>
              <input
                type="date"
                required
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Live Intelligent Allocation Preview Box */}
          {liveEvaluation && (
            <div className={`rounded-2xl p-4 border transition-all ${
              liveEvaluation.hasConflict 
                ? 'bg-rose-50/70 border-rose-200' 
                : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                  <span className="font-bold text-xs text-slate-900">
                    Live Allocation Engine Analysis
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">Calculated Score:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${
                    liveEvaluation.allocationScore >= 80 ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}>
                    {liveEvaluation.allocationScore} / 100
                  </span>
                </div>
              </div>

              {/* Score Breakdown Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3 text-[10px]">
                <div className="p-2 rounded-xl bg-white/80 border border-slate-200">
                  <p className="text-slate-400 font-semibold">Deadline (30%)</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{liveEvaluation.scoreBreakdown.deadlineScore} pts</p>
                </div>
                <div className="p-2 rounded-xl bg-white/80 border border-slate-200">
                  <p className="text-slate-400 font-semibold">Suitability (25%)</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{liveEvaluation.scoreBreakdown.suitabilityScore} pts</p>
                </div>
                <div className="p-2 rounded-xl bg-white/80 border border-slate-200">
                  <p className="text-slate-400 font-semibold">Priority (20%)</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{liveEvaluation.scoreBreakdown.academicPriorityScore} pts</p>
                </div>
                <div className="p-2 rounded-xl bg-white/80 border border-slate-200">
                  <p className="text-slate-400 font-semibold">Waiting (15%)</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{liveEvaluation.scoreBreakdown.waitingTimeScore} pts</p>
                </div>
                <div className="p-2 rounded-xl bg-white/80 border border-slate-200">
                  <p className="text-slate-400 font-semibold">Fairness (10%)</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{liveEvaluation.scoreBreakdown.fairnessScore} pts</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {liveEvaluation.allocationExplanation}
              </p>

              {/* Conflict & Recommended Alternatives */}
              {liveEvaluation.hasConflict && liveEvaluation.alternativeSlots.length > 0 && (
                <div className="mt-3 pt-3 border-t border-rose-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Time Overlap Detected — Recommended Non-Conflicting Slots:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {liveEvaluation.alternativeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setRequestedDate(slot.date);
                          setStartTime(slot.startTime);
                          setEndTime(slot.endTime);
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-brand-50 border border-rose-200 hover:border-brand-400 text-left transition-all text-xs"
                      >
                        <p className="font-bold text-slate-900">{slot.date} • {slot.startTime} - {slot.endTime}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{slot.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Submit Request for Faculty Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
