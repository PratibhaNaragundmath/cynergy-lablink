import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle,
  XCircle,
  Search
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { LabResource, ResourceStatus } from '../types';

export const FacultyResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LabResource[]>(() => storageService.getResources());
  const [maintenanceModalResId, setMaintenanceModalResId] = useState<string | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [maintenanceHours, setMaintenanceHours] = useState('4');
  const [search, setSearch] = useState('');

  const handleStatusChange = (resourceId: string, newStatus: ResourceStatus) => {
    storageService.updateResourceStatus(resourceId, newStatus);
    setResources(storageService.getResources());
  };

  const handleApplyMaintenance = () => {
    if (!maintenanceModalResId || !maintenanceReason.trim()) return;

    const start = new Date();
    const end = new Date(start.getTime() + parseInt(maintenanceHours) * 60 * 60 * 1000);

    storageService.addMaintenanceWindow(maintenanceModalResId, {
      start: start.toISOString(),
      end: end.toISOString(),
      reason: maintenanceReason,
    });

    storageService.updateResourceStatus(maintenanceModalResId, 'maintenance');
    setResources(storageService.getResources());
    setMaintenanceModalResId(null);
    setMaintenanceReason('');
  };

  const filtered = resources.filter((r) => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.departmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laboratory Resource Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage equipment availability, configure maintenance calibration blocks, and monitor instrument health.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Equipment Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Equipment & Department</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4 text-right">Faculty Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={res.imageUrl}
                        alt={res.name}
                        className="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{res.name}</p>
                        <p className="text-[11px] text-slate-500">{res.departmentName}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700">{res.category}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{res.location.split('—')[0]}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={res.status}
                      onChange={(e) => handleStatusChange(res.id, e.target.value as ResourceStatus)}
                      className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors ${
                        res.status === 'available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : res.status === 'in-use'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="available">Available</option>
                      <option value="in-use">In-Use</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setMaintenanceModalResId(res.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Block Maintenance</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Modal */}
      {maintenanceModalResId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Block Resource for Maintenance</h3>
            <p className="text-xs text-slate-600">
              Scheduled maintenance prevents new student reservations from overlapping with required calibration windows.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maintenance Duration
              </label>
              <select
                value={maintenanceHours}
                onChange={(e) => setMaintenanceHours(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
              >
                <option value="2">2 Hours (Quick Diagnostic)</option>
                <option value="4">4 Hours (Half Day Calibration)</option>
                <option value="8">8 Hours (Full Day Overhaul)</option>
                <option value="24">24 Hours (Deep Service)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maintenance Reason & Work Order
              </label>
              <textarea
                rows={2}
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                placeholder="e.g. Firmware re-flashing and Vivado license daemon synchronization."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMaintenanceModalResId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyMaintenance}
                disabled={!maintenanceReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
