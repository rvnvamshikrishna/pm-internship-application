'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  Briefcase, 
  FileCheck, 
  LogOut, 
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { fetchApi, logout } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'companies'>('stats');

  // Admin login states
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('AdminPass123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  // Accordion state
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null);
  const [verificationLoadingId, setVerificationLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const role = localStorage.getItem('user_role');
    if (role !== 'admin') {
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    try {
      const statsData = await fetchApi('/admin/analytics');
      setAnalytics(statsData);

      const companiesList = await fetchApi('/admin/companies');
      setCompanies(companiesList || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const data = await fetchApi('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_role', 'admin');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyCompany = async (companyId: number, status: 'Verified' | 'Rejected') => {
    setVerificationLoadingId(companyId);
    try {
      await fetchApi(`/admin/companies/${companyId}/verify?status=${status}`, {
        method: 'PUT'
      });
      // Update local state dynamically
      setCompanies(prev => prev.map(c => 
        c.company_id === companyId ? { ...c, verification_status: status } : c
      ));
      
      // Refresh stats in background
      const statsData = await fetchApi('/admin/analytics');
      setAnalytics(statsData);
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status.');
    } finally {
      setVerificationLoadingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    setAnalytics(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  // Admin Login View
  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-md p-8"
        >
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-150">
              <ShieldAlert size={36} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Gatekeeper</h1>
            <p className="text-slate-400 text-sm">Enter administrator secrets to log in</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-1">Credentials seeded automatically for demo.</p>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-semibold text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center"
            >
              {isLoggingIn ? (
                <span className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const pendingVerificationCount = companies.filter(c => c.verification_status !== 'Verified').length;

  // Live Admin Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert size={24} className="text-blue-600" />
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">Admin Gatekeeper Workspace</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-slate-100"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-4">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
            activeTab === 'stats' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview Statistics
        </button>
        <button 
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'companies' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verify Organizations
          {pendingVerificationCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-black">
              {pendingVerificationCount}
            </span>
          )}
        </button>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' ? (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">STUDENTS</p>
                    <p className="text-2xl font-extrabold text-slate-800">{analytics.total_students || 0}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building2 size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">COMPANIES</p>
                    <p className="text-2xl font-extrabold text-slate-800">{analytics.total_companies || 0}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Briefcase size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">INTERNSHIPS</p>
                    <p className="text-2xl font-extrabold text-slate-800">{analytics.total_internships || 0}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl"><FileCheck size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">APPLICATIONS</p>
                    <p className="text-2xl font-extrabold text-slate-800">{analytics.total_applications || 0}</p>
                  </div>
                </div>
              </div>

              {/* Skills Demand Section */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Top Demanded Skills (Platform Index)</h3>
                <div className="space-y-4">
                  {['Python & Data Science', 'React & Web Development', 'DevOps & Cloud', 'Cybersecurity Operations'].map((skill, index) => {
                    const percentages = [85, 75, 60, 45];
                    return (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold text-slate-650">
                          <span>{skill}</span>
                          <span>{percentages[index]}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentages[index]}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="companies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-4">Organization Account Verifications</h2>

              <div className="space-y-4">
                {companies.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500">
                    No registered organizations found.
                  </div>
                ) : (
                  companies.map((company) => {
                    const isExpanded = expandedCompanyId === company.company_id;
                    const isVerifying = verificationLoadingId === company.company_id;
                    return (
                      <div 
                        key={company.company_id}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition hover:border-slate-300"
                      >
                        {/* Header Row */}
                        <div 
                          onClick={() => setExpandedCompanyId(isExpanded ? null : company.company_id)}
                          className="px-6 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                              {company.company_name ? company.company_name[0].toUpperCase() : 'C'}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">{company.company_name}</h3>
                              <p className="text-xs text-slate-455 flex items-center gap-1">
                                <Mail size={12} /> {company.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              company.verification_status === 'Verified'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : company.verification_status === 'Rejected'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {company.verification_status}
                            </span>
                            {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                          </div>
                        </div>

                        {/* Expandable Panel */}
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="border-t border-slate-100 px-6 py-6 space-y-6 text-sm text-slate-700"
                          >
                            {/* Summary description */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ABOUT ORGANIZATION</span>
                              <p className="text-slate-655 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-150">
                                {company.description || 'No description provided.'}
                              </p>
                            </div>

                            {/* Details table grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Left details */}
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <Globe className="text-slate-400 shrink-0 mt-0.5" size={16} />
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block">WEBSITE</span>
                                    {company.website ? (
                                      <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                                        {company.website}
                                      </a>
                                    ) : 'Not provided'}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <MapPin className="text-slate-400 shrink-0 mt-0.5" size={16} />
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block">LOCATION</span>
                                    <span className="font-semibold text-slate-800">
                                      {company.city ? `${company.city}, ${company.state || ''} (${company.pincode || ''})` : 'Not provided'}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 block">INDUSTRY TYPE</span>
                                  <span className="font-semibold text-slate-800">{company.industry || 'Technology'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 block">ORGANIZATION TYPE & SIZE</span>
                                  <span className="font-semibold text-slate-800">
                                    {company.org_type || 'Company'} ({company.company_size || '11-50'} employees)
                                  </span>
                                </div>
                              </div>

                              {/* Right details / Verification documents */}
                              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 block">CIN NUMBER (CORPORATE IDENTITY)</span>
                                  <span className="font-mono font-semibold text-slate-850">{company.cin_number || 'L72200TG1990PLC011771'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 block">GSTIN / PAN IDENTIFICATION</span>
                                  <span className="font-mono font-semibold text-slate-850">{company.gstin_pan || '36AAACO8200M1ZP'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 block">CONTACT PERSON</span>
                                  <span className="font-semibold text-slate-800">
                                    {company.contact_name || 'HR Team'} {company.contact_designation ? `(${company.contact_designation})` : ''}
                                  </span>
                                  {company.contact_phone && <p className="text-xs text-slate-400 mt-0.5">📞 {company.contact_phone}</p>}
                                </div>
                              </div>
                            </div>

                            {/* Verification Actions */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                              <div className="text-xs text-slate-455">
                                Current Status: <strong className="text-slate-700">{company.verification_status}</strong>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleVerifyCompany(company.company_id, 'Rejected')}
                                  disabled={isVerifying || company.verification_status === 'Rejected'}
                                  className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-650 hover:text-red-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  <XCircle size={15} /> Reject Account
                                </button>
                                <button
                                  onClick={() => handleVerifyCompany(company.company_id, 'Verified')}
                                  disabled={isVerifying || company.verification_status === 'Verified'}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                                >
                                  <CheckCircle size={15} /> Verify Organization
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
