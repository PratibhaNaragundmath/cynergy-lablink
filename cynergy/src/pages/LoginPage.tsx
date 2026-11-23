import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs, loginWithEmail, demoUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid university email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, role);
      if (role === 'faculty') {
        navigate('/faculty/approvals');
      } else if (role === 'admin') {
        navigate('/analytics');
      } else {
        navigate('/resources');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (user: any) => {
    loginAs(user);
    if (user.role === 'faculty') {
      navigate('/faculty/conflicts');
    } else if (user.role === 'admin') {
      navigate('/analytics');
    } else {
      navigate('/resources');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">Lab<span className="text-brand-600">Link</span></span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Campus Single Sign-On Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access laboratory equipment or switch demo personas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-3xl border border-slate-200">
          {/* Demo Persona Quick Selectors */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Personas
              </span>
              <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-semibold border border-brand-200">
                Hackathon Mode
              </span>
            </div>

            <div className="space-y-2">
              {demoUsers.map((u) => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => handleSelectDemoUser(u)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-brand-400"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-brand-700">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        <span className="capitalize font-semibold text-slate-700">{u.role}</span> • {u.department}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">Or enter credentials</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                University Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@campus.edu"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty / Lab Administrator</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
            >
              {loading ? 'Signing in...' : 'Sign In with University ID'}
            </button>
          </form>

          {/* Safe Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              Demo Mode Active: In absence of live Firebase Auth keys, authentication persists in local session storage without exposing secrets.
            </p>
            <div>
              <Link to="/overview" className="text-xs text-brand-600 font-semibold hover:underline">
                View Platform Architecture & Feature Overview →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
