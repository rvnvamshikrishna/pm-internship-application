'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Brain, 
  Plus, 
  LogOut, 
  ChevronRight, 
  MapPin, 
  Eye, 
  X, 
  Award, 
  School,
  GraduationCap,
  AlertTriangle,
  User,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { fetchApi, logout } from '@/lib/api';

export default function CompanyDashboard() {
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [internships, setInternships] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    active_internships: 0,
    total_applications: 0,
    shortlisted_candidates: 0,
    average_match_quality: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Candidates ranking overlay state
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isCandidatesLoading, setIsCandidatesLoading] = useState(false);

  // Candidate Filters
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [filterSkill, setFilterSkill] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');

  // Selected Candidate Profile Details
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    // Check Auth
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'company') {
      router.push('/login?role=company');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch company profile
      const company = await fetchApi('/companies/me');
      setCompanyInfo(company);

      // Fetch stats
      const statsData = await fetchApi('/companies/dashboard');
      setStats(statsData);

      // Fetch my internships
      const myInternships = await fetchApi('/companies/internships');
      setInternships(myInternships);

      // Fetch all applications to find recent ones
      const recentAppsList: any[] = [];
      for (const job of myInternships) {
        try {
          const apps = await fetchApi(`/companies/internships/${job.id}/ranked-candidates`);
          apps.forEach((app: any) => {
            recentAppsList.push({
              ...app,
              internship_title: job.title,
              internship_id: job.id
            });
          });
        } catch (e) {
          // ignore error for empty lists
        }
      }
      // Sort by application ID descending (representing recent applications)
      recentAppsList.sort((a, b) => b.application_id - a.application_id);
      setRecentApplications(recentAppsList.slice(0, 5));
    } catch (err) {
      console.error('Error fetching company data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const viewCandidates = async (internship: any) => {
    setSelectedInternship(internship);
    setIsCandidatesLoading(true);
    setMinMatchScore(0);
    setFilterSkill('');
    setFilterLocation('');
    try {
      const candidatesList = await fetchApi(`/companies/internships/${internship.id}/ranked-candidates`);
      setCandidates(candidatesList);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setIsCandidatesLoading(false);
    }
  };

  const updateCandidateStatus = async (applicationId: number, status: string) => {
    try {
      await fetchApi(`/companies/applications/${applicationId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      // Refresh candidates list
      if (selectedInternship) {
        const candidatesList = await fetchApi(`/companies/internships/${selectedInternship.id}/ranked-candidates`);
        setCandidates(candidatesList);
      }
      // Refresh general dashboard stats
      const statsData = await fetchApi('/companies/dashboard');
      setStats(statsData);

      // Refresh recent applications list
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update candidate status.');
    }
  };

  const handleOpenCandidateProfile = async (candidateId: number) => {
    try {
      // Find candidate details
      const studentProfile = await fetchApi(`/companies/students/${candidateId}`);
      setSelectedCandidate(studentProfile);
    } catch (e) {
      alert('Failed to retrieve candidate profile details.');
    }
  };

  const handleCloseInternship = async (id: number) => {
    if (!confirm('Are you sure you want to close this internship?')) return;
    try {
      await fetchApi(`/companies/internships/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      alert('Failed to close internship.');
    }
  };

  // Filter candidates list
  const filteredCandidates = candidates.filter((c) => {
    const matchesMinScore = c.match_score >= minMatchScore;
    const matchesSkill = !filterSkill || (c.top_skills || '').toLowerCase().includes(filterSkill.toLowerCase());
    const matchesLocation = !filterLocation || (c.location || '').toLowerCase().includes(filterLocation.toLowerCase());
    return matchesMinScore && matchesSkill && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Recruiter Navbar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 size={24} className="text-cyan-600" />
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">InternGrid</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/company/profile')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 border border-slate-200 rounded-xl transition"
          >
            Organization Profile
          </button>
          <button 
            onClick={() => router.push('/company/post-internship')}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Plus size={14} /> Post Internship
          </button>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-slate-100"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:py-8 space-y-6">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="border-4 border-cyan-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Verification Status Warning */}
            {companyInfo && companyInfo.verification_status !== 'Verified' && (
              <div className="bg-amber-50 border border-amber-250 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Verification Pending!</p>
                    <p className="text-xs text-amber-700">Your organization verification is currently pending. Fill out your profile details to expedite verification.</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/company/profile')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shrink-0"
                >
                  Edit Profile
                </button>
              </div>
            )}

            {/* Recruiter Hero Banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-cyan-500/10 blur-2xl rounded-full"></div>
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 block mb-1">RECRUITER WORKSPACE</span>
              <h1 className="text-2xl md:text-3xl font-black mb-2">
                Welcome back, {companyInfo?.company_name || 'Recruiter'}
              </h1>
              <p className="text-slate-350 text-xs md:text-sm max-w-xl">
                Discover and hire the right interns for your startup. Let AI do the heavy lifting of shortlisting candidates.
              </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400">ACTIVE JOBS</p>
                  <p className="text-2xl font-extrabold text-slate-850">{stats.active_internships}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400">TOTAL APPS</p>
                  <p className="text-2xl font-extrabold text-slate-850">{stats.total_applications}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400">SHORTLISTED</p>
                  <p className="text-2xl font-extrabold text-slate-850">{stats.shortlisted_candidates}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Brain size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400">AVG MATCH QUALITY</p>
                  <p className="text-2xl font-extrabold text-slate-850">{stats.average_match_quality}%</p>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-400">QUICK LINKS</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => {
                    const el = document.getElementById('posted-internships');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                >
                  Manage Internships
                </button>
                <button 
                  onClick={() => router.push('/company/profile')}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                >
                  Edit Organization Profile
                </button>
                <button 
                  onClick={() => router.push('/company/post-internship')}
                  className="px-4 py-2.5 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-bold transition"
                >
                  + Post New Role
                </button>
              </div>
            </div>

            {/* Simple CSS Chart: Applications by Internship */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-450 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-cyan-600" />
                Applications Chart by Posted Role
              </h3>
              <div className="space-y-3">
                {internships.length === 0 ? (
                  <p className="text-xs text-slate-400">Post internships to generate analytics charts.</p>
                ) : (
                  internships.map((job) => {
                    const count = job.application_count || 0;
                    const maxApps = Math.max(...internships.map(j => j.application_count || 1), 5);
                    const pct = Math.min((count / maxApps) * 100, 100);
                    return (
                      <div key={job.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-650">
                          <span>{job.title}</span>
                          <span>{count} Apps</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-150 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Jobs List */}
            <section id="posted-internships" className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Your Posted Internships</h2>
              
              {internships.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 flex flex-col items-center">
                  <Briefcase size={48} className="text-slate-300" />
                  <p className="text-slate-550 font-semibold text-lg">No internships posted yet.</p>
                  <button 
                    onClick={() => router.push('/company/post-internship')}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md transition"
                  >
                    Post an Internship
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {internships.map((internship) => (
                    <div 
                      key={internship.id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-6 hover:border-cyan-300 hover:shadow-md transition duration-300"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-lg font-bold text-slate-800">{internship.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            internship.status === 'Closed' ? 'bg-red-50 text-red-650' : 'bg-green-50 text-green-650'
                          }`}>
                            {internship.status || 'Active'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><MapPin size={14} />{internship.location || 'Remote'}</span>
                          <span>•</span>
                          <span>{internship.duration || 'Flexible'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => viewCandidates(internship)}
                          className="px-4 py-2 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200 hover:border-cyan-200"
                        >
                          <Users size={14} /> View Candidates
                        </button>
                        <button 
                          onClick={() => handleCloseInternship(internship.id)}
                          className="text-xs text-red-500 hover:underline font-bold"
                        >
                          Close Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Applications List */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-850">Recent Applications</h2>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {recentApplications.length === 0 ? (
                  <p className="p-6 text-slate-500 text-center text-sm">No applications received yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentApplications.map((app) => (
                      <div key={app.application_id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{app.student_name}</p>
                          <p className="text-xs text-slate-450">Applied to <span className="font-semibold text-slate-600">{app.internship_title}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-0.5">
                            <Brain size={10} />
                            {app.match_score.toFixed(0)}% Match
                          </span>
                          <button 
                            onClick={() => viewCandidates({ id: app.internship_id, title: app.internship_title })}
                            className="text-xs text-cyan-650 hover:underline font-bold"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </main>

      {/* Candidates List Drawer/Overlay */}
      <AnimatePresence>
        {selectedInternship && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
            <div className="absolute inset-0" onClick={() => setSelectedInternship(null)}></div>
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-50"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">CANDIDATES RANKING</span>
                  <h3 className="text-lg font-bold text-slate-800">{selectedInternship.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedInternship(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filters Panel inside drawer */}
              <div className="px-6 py-3 border-b border-slate-150 bg-slate-50 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">MIN MATCH SCORE: {minMatchScore}%</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">SKILL FILTER</label>
                  <input 
                    type="text" 
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    placeholder="e.g. Python"
                    className="w-full px-2 py-1 bg-white border border-slate-250 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
                  />
                </div>
              </div>

              {/* Candidates List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isCandidatesLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="border-4 border-cyan-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <p className="text-slate-500 text-center py-12">No candidates match the specified filters.</p>
                ) : (
                  filteredCandidates.map((match) => (
                    <div 
                      key={match.application_id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-cyan-200 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-base">{match.student_name || 'Candidate'}</h4>
                            <button 
                              onClick={() => handleOpenCandidateProfile(match.student_id)}
                              className="text-cyan-600 hover:text-cyan-800 transition flex items-center text-[10px] font-bold uppercase gap-0.5 border border-cyan-200 px-1.5 py-0.5 rounded"
                            >
                              Profile Details <ExternalLink size={10} />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <School size={14} /> {match.college || 'Unknown University'}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <GraduationCap size={14} /> {match.course || 'Degree'}
                          </p>
                        </div>

                        {/* Match Score Chip */}
                        <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-sm">
                          <Brain size={14} />
                          {match.match_score.toFixed(0)}% Match
                        </span>
                      </div>

                      {/* Explainability reasons string */}
                      {match.match_reasons && match.match_reasons.length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-650">
                          <p className="font-bold text-green-700 mb-1">
                            {match.match_score.toFixed(0)}% Match
                          </p>
                          <p>
                            {match.match_reasons.join(', ')} skills match this role. Preferred location and academic eligibility also match.
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <span className={`text-xs font-bold uppercase ${
                          match.status === 'selected' ? 'text-green-600' : match.status === 'shortlisted' ? 'text-orange-500' : 'text-slate-400'
                        }`}>
                          Status: {match.status}
                        </span>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateCandidateStatus(match.application_id, 'shortlisted')}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg transition border border-orange-200"
                          >
                            Shortlist
                          </button>
                          <button 
                            onClick={() => updateCandidateStatus(match.application_id, 'selected')}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-lg transition border border-green-200"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Candidate Detailed Profile Dialog */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-55 bg-black/50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setSelectedCandidate(null)}></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-150 mb-4">
                <h4 className="text-lg font-black text-slate-850">Candidate Profile Details</h4>
                <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-650"><X size={20} /></button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-cyan-100 text-cyan-600 text-xl font-bold flex items-center justify-center">
                    {selectedCandidate.full_name ? selectedCandidate.full_name[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-base">{selectedCandidate.full_name}</h5>
                    <p className="text-xs text-slate-500">{selectedCandidate.email}</p>
                    <p className="text-xs text-slate-500 font-semibold">{selectedCandidate.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">COLLEGE</span>
                    <span className="font-bold text-slate-650">{selectedCandidate.college || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">DEGREE / COURSE</span>
                    <span className="font-bold text-slate-650">{selectedCandidate.degree} ({selectedCandidate.branch})</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">CGPA / %</span>
                    <span className="font-bold text-slate-650">{selectedCandidate.cgpa || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">PREF LOCATION</span>
                    <span className="font-bold text-slate-650">{selectedCandidate.preferred_work_location || 'Remote'}</span>
                  </div>
                </div>

                {/* Bio / short goal */}
                {selectedCandidate.career_goal && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">CAREER GOAL / BIO</span>
                    <p className="text-slate-650 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">{selectedCandidate.career_goal}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">SKILLS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills.map((s: any) => (
                        <span key={s.skill_name} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                          {s.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume download placeholder */}
                <div className="flex items-center justify-between bg-cyan-50 border border-cyan-150 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FileText className="text-cyan-600" size={20} />
                    <span className="text-xs font-bold text-cyan-800">Resume File Attachment</span>
                  </div>
                  <span className="text-[10px] text-cyan-650 font-bold bg-white px-2 py-1 rounded border border-cyan-200">
                    PDF Attached
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
