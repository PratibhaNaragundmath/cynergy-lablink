import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Layers,
  Wrench
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { LabResource, ResourceCategory } from '../types';

export const ResourceDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<LabResource[]>(() => storageService.getResources());
  const departments = storageService.getDepartments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const categories: ResourceCategory[] = [
    'Workstation / GPU',
    'Embedded & IoT',
    'Prototyping & Fabrication',
    'Testing & Measurement',
    'Robotics & Automation',
    'High-Performance Computing',
  ];

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesDept = res.departmentName.toLowerCase().includes(q);
        const matchesSpecs = Object.values(res.specifications).some((s) => s.toLowerCase().includes(q));
        const matchesCaps = res.capabilities.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesDept && !matchesSpecs && !matchesCaps) {
          return false;
        }
      }

      // Department filter
      if (selectedDept !== 'all' && res.departmentId !== selectedDept) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && res.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && res.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [resources, searchQuery, selectedDept, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laboratory Resource Discovery</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and request access to high-end engineering equipment across all 6 campus departments.
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

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, specs, software (e.g. 'A100', 'CUDA', 'FPGA', '3D Printer')..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Department Select */}
          <div className="w-full sm:w-56">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Select */}
          <div className="w-full sm:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="all">Any Status</option>
              <option value="available">Available Now</option>
              <option value="in-use">In-Use</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing <strong>{filteredResources.length}</strong> equipment units</span>
          {(searchQuery || selectedDept !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-brand-600 hover:underline font-medium text-xs"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Equipment Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <Cpu className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No matching laboratory resources</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const hasMaintenance = res.maintenanceWindows && res.maintenanceWindows.length > 0;

            return (
              <div
                key={res.id}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-brand-300"
              >
                <div>
                  {/* Image & Status Badge */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={res.imageUrl}
                      alt={res.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm">
                        {res.departmentName.split(' ')[0]}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {res.status === 'available' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Available</span>
                        </span>
                      ) : res.status === 'in-use' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          <Clock className="h-3 w-3" />
                          <span>In-Use</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          <Wrench className="h-3 w-3" />
                          <span>Maintenance</span>
                        </span>
                      )}
                    </div>

                    {hasMaintenance && (
                      <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-amber-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] text-amber-100 font-medium flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 text-amber-300 shrink-0" />
                        <span className="truncate">Maintenance scheduled</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                        {res.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1 mt-0.5">
                        {res.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    {/* Specifications Pill Preview */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Key Specifications:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(res.specifications).slice(0, 3).map(([key, val]) => (
                          <span
                            key={key}
                            className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-mono"
                          >
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Location & Operating Hours */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 truncate max-w-[55%]">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{res.location.split('—')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{res.operatingHours.start} - {res.operatingHours.end}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    to={`/resources/${res.id}`}
                    className="flex-1 text-center py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors border border-slate-200"
                  >
                    View Details
                  </Link>

                  <Link
                    to={`/bookings/new?resourceId=${res.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
                  >
                    <span>Request Slot</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
