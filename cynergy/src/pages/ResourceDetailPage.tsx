import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { LabResource } from '../types';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resource = storageService.getResourceById(id || '');
  const allBookings = storageService.getBookings();

  if (!resource) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-base font-bold text-slate-800">Resource not found</h2>
        <Link to="/resources" className="text-xs text-brand-600 font-semibold hover:underline mt-2 inline-block">
          Return to directory
        </Link>
      </div>
    );
  }

  // Related bookings for this resource
  const resourceBookings = allBookings.filter(
    (b) => b.resourceId === resource.id && (b.status === 'approved' || b.status === 'pending')
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Resources</span>
        </button>

        <Link
          to={`/bookings/new?resourceId=${resource.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
        >
          <span>Book Equipment Slot</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Image */}
          <div className="lg:col-span-5 relative h-64 lg:h-auto bg-slate-100">
            <img
              src={resource.imageUrl}
              alt={resource.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="rounded-lg bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
                {resource.departmentName}
              </span>
            </div>
          </div>

          {/* Details Overview */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {resource.category}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  resource.status === 'available'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : resource.status === 'in-use'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {resource.status === 'available' && <CheckCircle2 className="h-3.5 w-3.5" />}
                {resource.status === 'in-use' && <Clock className="h-3.5 w-3.5" />}
                {resource.status === 'maintenance' && <Wrench className="h-3.5 w-3.5" />}
                <span className="capitalize">{resource.status}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {resource.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {resource.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Laboratory Location</p>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-600" />
                  <span>{resource.location}</span>
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Operational Hours</p>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-brand-600" />
                  <span>{resource.operatingHours.start} - {resource.operatingHours.end} daily</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Specs */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Cpu className="h-5 w-5 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-900">Technical Specifications</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {Object.entries(resource.specifications).map(([key, value]) => (
              <div key={key} className="py-2.5 flex justify-between gap-4">
                <span className="font-medium text-slate-500">{key}</span>
                <span className="font-semibold text-slate-900 text-right font-mono">{value}</span>
              </div>
            ))}
          </div>

          {/* Capabilities Tags */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Supported Workflows & Frameworks:</p>
            <div className="flex flex-wrap gap-1.5">
              {resource.capabilities.map((c) => (
                <span key={c} className="rounded-lg bg-brand-50 text-brand-700 px-2.5 py-1 text-xs font-medium border border-brand-200">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Operating Rules & Faculty Contact */}
        <div className="space-y-6">
          {/* Usage Instructions */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Laboratory Usage Guidelines</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {resource.usageInstructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Faculty / Lab Admin Contact */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Faculty Lab Supervisor
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <User className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">{resource.facultyContact.name}</p>
                <p className="text-slate-500">{resource.facultyContact.email}</p>
                {resource.facultyContact.phone && (
                  <p className="text-slate-400 text-[11px]">{resource.facultyContact.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Windows & Schedule */}
      {resource.maintenanceWindows && resource.maintenanceWindows.length > 0 && (
        <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <h4 className="font-bold text-xs text-amber-900">Scheduled Maintenance Calibration</h4>
          </div>
          {resource.maintenanceWindows.map((mw) => (
            <p key={mw.id} className="text-xs text-amber-800">
              • <strong>{new Date(mw.start).toLocaleDateString()} {new Date(mw.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {new Date(mw.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>: {mw.reason}
            </p>
          ))}
        </div>
      )}

      {/* Recent / Upcoming Bookings on This Resource */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Active & Upcoming Reservations</h3>
          <span className="text-xs text-slate-500">{resourceBookings.length} scheduled</span>
        </div>

        {resourceBookings.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No active reservations on this equipment. It is open for immediate requests!
          </p>
        ) : (
          <div className="space-y-2.5">
            {resourceBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 gap-2 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{b.projectTitle}</p>
                  <p className="text-slate-500 text-[11px]">
                    Student: {b.studentName} ({b.studentDepartment.split(' ')[0]})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-700 font-semibold text-[11px] bg-white px-2 py-1 rounded border border-slate-200">
                    {b.requestedDate} • {b.startTime} - {b.endTime}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                      b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
