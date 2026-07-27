'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Compass, 
  Briefcase, 
  User, 
  LogOut, 
  MapPin, 
  Calendar, 
  Wallet, 
  Clock, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  Building2, 
  Phone, 
  GraduationCap, 
  Award,
  CheckCircle,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  MessageSquare,
  X,
  Printer,
  Plus,
  Trash2
} from 'lucide-react';
import { fetchApi, logout } from '@/lib/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'applications' | 'profile' | 'resume-builder' | 'feedback'>('home');
  const [studentName, setStudentName] = useState('Student');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [sortBy, setSortBy] = useState('match'); // match, newest, stipend

  // For Detail overlay
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);

  // Apply Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [applySuccessId, setApplySuccessId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Feedback Form State
  const [feedbackInternshipId, setFeedbackInternshipId] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackText, setFeedbackText] = useState('');
  const [isRelevant, setIsRelevant] = useState('Yes');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Resume Builder States
  const [careerObjective, setCareerObjective] = useState('');
  const [technicalSkillsText, setTechnicalSkillsText] = useState('Python, Java, JavaScript, SQL, HTML5, CSS3, React, Tailwind CSS, Node.js, Express.js, MySQL, PostgreSQL, MongoDB, Git, GitHub, VS Code, Postman, NumPy, Pandas, Scikit-learn, TensorFlow');

  const [resumeProjects, setResumeProjects] = useState<{name: string, bullets: string[]}[]>([
    { 
      name: 'AI-Powered Job Recommendation Platform', 
      bullets: [
        'Built an AI-powered web application using React, Tailwind CSS, and FastAPI.',
        'Implemented secure token-based user authentication and PostgreSQL database integration.',
        'Improved recommendation accuracy by 25% by optimizing TF-IDF search index matching.'
      ]
    }
  ]);

  const [resumeWork, setResumeWork] = useState<{company: string, role: string, duration: string, achievements: string[]}[]>([
    { 
      company: 'Tech Solutions Inc', 
      role: 'Software Engineering Intern', 
      duration: 'June 2025 - August 2025',
      achievements: [
        'Developed interactive dashboard panels utilizing Tailwind CSS and Framer Motion.',
        'Integrated RESTful APIs to display real-time applicant data validation metrics.'
      ]
    }
  ]);

  const [certifications, setCertifications] = useState<string[]>([
    'Google AI Essentials',
    'freeCodeCamp Full Stack Development',
    'IBM AI Fundamentals'
  ]);

  const [achievements, setAchievements] = useState<string[]>([
    'Smart India Hackathon Finalist',
    'Ranked in top 5% in national coding contests',
    'Academic Excellence Award holder'
  ]);

  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Event Coordinator at University Tech Fest',
    'Active Member of open-source coding club',
    'Student Volunteer in community service program'
  ]);

  const [softSkills, setSoftSkills] = useState<string[]>([
    'Problem Solving',
    'Communication',
    'Teamwork',
    'Leadership',
    'Time Management'
  ]);

  const [languages, setLanguages] = useState<string>('English, Telugu, Hindi');

  // Input states for builder lists
  const [newProjName, setNewProjName] = useState('');
  const [newProjBullet1, setNewProjBullet1] = useState('');
  const [newProjBullet2, setNewProjBullet2] = useState('');
  const [newProjBullet3, setNewProjBullet3] = useState('');

  const [newWorkCompany, setNewWorkCompany] = useState('');
  const [newWorkRole, setNewWorkRole] = useState('');
  const [newWorkDuration, setNewWorkDuration] = useState('');
  const [newWorkAch1, setNewWorkAch1] = useState('');
  const [newWorkAch2, setNewWorkAch2] = useState('');

  const [newCert, setNewCert] = useState('');
  const [newAch, setNewAch] = useState('');
  const [newResp, setNewResp] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'student') {
      router.push('/login?role=student');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const profile = await fetchApi('/students/me');
      setProfileData(profile);
      if (profile.full_name) {
        setStudentName(profile.full_name);
        localStorage.setItem('user_name', profile.full_name);
      }
      if (profile.career_goal) {
        setCareerObjective(profile.career_goal);
      } else {
        setCareerObjective('A motivated and detail-oriented student pursuing a career in technology and artificial intelligence. Eager to apply software development and machine learning skills in a fast-paced environment.');
      }
      if (profile.languages) {
        setLanguages(profile.languages);
      }

      // Prefill skills from profile
      if (profile.skills && profile.skills.length > 0) {
        const profileSkills = profile.skills.map((s: any) => s.skill_name).join(', ');
        setTechnicalSkillsText(profileSkills);
      }

      const recs = await fetchApi('/students/recommendations');
      setRecommendations(recs);

      const exploreList = await fetchApi('/internships');
      setAllInternships(exploreList);

      const apps = await fetchApi('/students/applications');
      setMyApplications(apps);
      setAppliedIds(apps.map((a: any) => a.internship_id));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://127.0.0.1:8000/students/me/resume/extract', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to extract skills');
      }

      const data = await res.json();
      setExtractedSkills(data.skills || []);
      alert(`AI Extraction Complete! Found skills: ${data.skills.join(', ')}. Recommendations updated!`);
      fetchData(); // Reload student profile, recommendations, and active skills
    } catch (err: any) {
      alert(err.message || 'Error parsing resume');
    } finally {
      setIsExtracting(false);
    }
  };

  const calculateCompleteness = () => {
    if (!profileData) return 0;
    const fields = [
      profileData.full_name, profileData.gender, profileData.date_of_birth, 
      profileData.permanent_address, profileData.city, profileData.state, 
      profileData.college, profileData.university, profileData.degree, 
      profileData.branch, profileData.graduation_year, profileData.cgpa,
      profileData.preferred_work_location, profileData.preferred_work_mode, 
      profileData.areas_of_interest, profileData.preferred_internship_duration, 
      profileData.career_goal
    ];
    const filledCount = fields.filter(Boolean).length;
    const skillsCount = (profileData.skills && profileData.skills.length > 0) ? 1 : 0;
    return Math.round(((filledCount + skillsCount) / (fields.length + 1)) * 100);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const triggerApplyFlow = () => {
    setTermsConfirmed(false);
    setApplySuccessId(null);
    setShowConfirmModal(true);
  };

  const handleFinalSubmitApply = async () => {
    if (!termsConfirmed) return;
    setIsApplying(true);
    try {
      const res = await fetchApi(`/students/apply/${selectedInternship.id}`, { method: 'POST' });
      const appId = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
      setApplySuccessId(appId);
      setAppliedIds([...appliedIds, selectedInternship.id]);
      
      const apps = await fetchApi('/students/applications');
      setMyApplications(apps);
    } catch (err: any) {
      alert(err.message || 'Failed to apply.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInternshipId) {
      alert('Please select an internship.');
      return;
    }
    setIsSaving(true);
    try {
      await fetchApi('/students/feedback', {
        method: 'POST',
        body: JSON.stringify({
          internship_id: parseInt(feedbackInternshipId),
          rating: parseInt(feedbackRating),
          feedback_text: feedbackText,
          is_relevant: isRelevant,
        }),
      });
      setFeedbackSuccess(true);
      setFeedbackText('');
      setFeedbackInternshipId('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter explore list
  const filteredInternships = allInternships.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatch = item.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const skillsMatch = item.preferred_skills?.toLowerCase().includes(searchQuery.toLowerCase());
    const domainMatch = item.domain?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = titleMatch || companyMatch || skillsMatch || domainMatch;
    const matchesMode = selectedMode === 'All' || item.mode?.toLowerCase() === selectedMode.toLowerCase();
    const matchesDuration = selectedDuration === 'All' || item.duration?.toLowerCase().includes(selectedDuration.toLowerCase());

    return matchesSearch && matchesMode && matchesDuration;
  }).sort((a, b) => {
    if (sortBy === 'stipend') {
      const aVal = parseFloat(a.stipend?.replace(/[^0-9.]/g, '') || '0');
      const bVal = parseFloat(b.stipend?.replace(/[^0-9.]/g, '') || '0');
      return bVal - aVal;
    }
    return b.id - a.id;
  });

  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm print:hidden">
        <span className="text-xl font-extrabold text-blue-600 tracking-tight">InternGrid</span>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-[70%] sm:max-w-none">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'home' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home size={16} /> <span>Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'explore' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass size={16} /> <span>Explore</span>
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'applications' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase size={16} /> <span>Applications</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={16} /> <span>Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab('resume-builder')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'resume-builder' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={16} /> <span>Resume Builder</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('feedback');
              setFeedbackSuccess(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'feedback' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={16} /> <span>Feedback</span>
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-slate-100"
        >
          <LogOut size={20} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:py-8 print:p-0 print:max-w-none">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center print:hidden">
            <div className="border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-8 shadow-md">
                  <h1 className="text-3xl font-extrabold mb-2">{getGreeting()}, {studentName}!</h1>
                  <p className="text-blue-100 text-base sm:text-lg">Let's help you land your dream career.</p>
                </div>

                {/* AI Resume Upload & Extraction */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">AI Resume Profiler</h3>
                      <p className="text-xs text-slate-500">Upload your PDF or TXT resume to automatically extract your technical skills and match roles.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      accept=".pdf,.txt"
                      onChange={handleResumeUpload}
                      className="hidden" 
                      id="resume-upload-input" 
                      disabled={isExtracting}
                    />
                    <label 
                      htmlFor="resume-upload-input" 
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-sm disabled:opacity-50"
                    >
                      {isExtracting ? 'Analyzing Resume...' : 'Choose Resume File'}
                    </label>
                    <span className="text-xs text-slate-400">Supports PDF or Plain Text</span>
                  </div>

                  {extractedSkills.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-xs space-y-1.5">
                      <p className="font-bold text-green-700">✓ Successfully Extracted Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {extractedSkills.map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-green-150 text-green-800 rounded font-semibold uppercase tracking-wider text-[9px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Completeness Warning Alert */}
                {completeness < 100 && (
                  <div className="bg-amber-50 border border-amber-255 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                      <div>
                        <p className="text-sm font-bold text-amber-800">Your profile is only {completeness}% complete!</p>
                        <p className="text-xs text-amber-700">Complete your profile onboarding to receive higher quality AI-matching recommendations.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/student/profile/edit')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shrink-0"
                    >
                      Complete Now
                    </button>
                  </div>
                )}

                {/* Recommendations */}
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={22} />
                    Recommended for You
                  </h2>
                  <div className="space-y-4">
                    {recommendations.length === 0 ? (
                      <p className="text-slate-500 text-center py-12 bg-white rounded-2xl border border-slate-200 text-sm">
                        No custom recommendations yet. Try filling out your skills in your profile!
                      </p>
                    ) : (
                      recommendations.slice(0, 3).map((rec) => {
                        const internship = rec.internship || rec;
                        const matchScore = rec.match_score || 0;
                        const reasons = rec.match_reasons || [];
                        return (
                          <div 
                            key={internship.id}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 mb-2">
                                    Actively hiring
                                  </span>
                                  <h3 className="text-lg font-bold text-slate-800">{internship.title}</h3>
                                  <p className="text-slate-550 text-xs font-semibold">{internship.company_name}</p>
                                </div>
                                {matchScore > 0 && (
                                  <div className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm shrink-0">
                                    <Brain size={14} />
                                    {matchScore.toFixed(0)}% Match
                                  </div>
                                )}
                              </div>

                              {reasons.length > 0 && (
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                  <p className="font-bold text-green-700 mb-1">Matches your {reasons.join(', ')} skills.</p>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                              <span className="text-xs text-slate-500 font-semibold">{internship.location} | {internship.duration}</span>
                              <button 
                                onClick={() => setSelectedInternship(internship)}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                              >
                                View details
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'explore' && (
              <motion.div 
                key="explore"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Search & Filter Bar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, company, skill, or domain..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                      <select 
                        value={selectedMode} 
                        onChange={(e) => setSelectedMode(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="All">All Modes</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>

                      <select 
                        value={selectedDuration} 
                        onChange={(e) => setSelectedDuration(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="All">All Durations</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                      </select>

                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="newest">Newest</option>
                        <option value="stipend">Highest Stipend</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedMode('All');
                        setSelectedDuration('All');
                        setSortBy('newest');
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                  {filteredInternships.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
                      <Compass size={40} className="text-slate-300 mx-auto" />
                      <p className="text-slate-500 font-bold">No internships found. Try changing filters.</p>
                    </div>
                  ) : (
                    filteredInternships.map((internship) => (
                      <div 
                        key={internship.id}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{internship.title}</h3>
                            <p className="text-slate-555 text-xs font-semibold">{internship.company_name}</p>
                          </div>
                          <div className="flex gap-4 text-xs font-semibold text-slate-500">
                            <span>{internship.location}</span>
                            <span>•</span>
                            <span>{internship.mode}</span>
                            <span>•</span>
                            <span>{internship.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-end shrink-0">
                          <button 
                            onClick={() => setSelectedInternship(internship)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'applications' && (
              <motion.div 
                key="applications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-800">Your Applications</h2>
                <div className="space-y-4">
                  {myApplications.length === 0 ? (
                    <p className="text-slate-555 text-center py-12 bg-white rounded-2xl border border-slate-200 text-sm">
                      You haven't applied to any internships yet.
                    </p>
                  ) : (
                    myApplications.map((app) => (
                      <div 
                        key={app.application_id}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{app.internship?.title || 'Job Application'}</h3>
                          <p className="text-slate-550 text-xs font-semibold mb-2">{app.internship?.company_name}</p>
                          <p className="text-xs text-slate-400">Applied on: {new Date(app.applied_at).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm border ${
                            app.status === 'selected' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : app.status === 'shortlisted'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : app.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && profileData && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-bold text-slate-850">My Profile</h2>
                  <button 
                    onClick={() => router.push('/student/profile/edit')}
                    className="px-4 py-2 border border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Left */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center justify-center text-3xl font-black overflow-hidden">
                      {profileData.profile_photo ? (
                        <img src={`http://127.0.0.1:8000/${profileData.profile_photo}`} className="w-full h-full object-cover" />
                      ) : (
                        profileData.full_name ? profileData.full_name[0].toUpperCase() : 'S'
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{profileData.full_name}</h3>
                      <p className="text-slate-550 text-xs mt-1">{profileData.email}</p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6 text-sm">
                      <div className="flex gap-3">
                        <Phone className="text-slate-400 shrink-0" size={18} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">PHONE</p>
                          <p className="font-semibold text-slate-700">{profileData.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <GraduationCap className="text-slate-400 shrink-0" size={18} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">COLLEGE / UNIVERSITY</p>
                          <p className="font-semibold text-slate-700">{profileData.college || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Award className="text-slate-400 shrink-0" size={18} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">DEGREE & SPECIALIZATION</p>
                          <p className="font-semibold text-slate-700">
                            {profileData.degree} {profileData.branch ? `(${profileData.branch})` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle className="text-slate-400 shrink-0" size={18} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">CGPA / %</p>
                          <p className="font-semibold text-slate-700">{profileData.cgpa || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Resume Builder Tab with uncategorized technical skills */}
            {activeTab === 'resume-builder' && profileData && (
              <motion.div 
                key="resume-builder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 print:m-0"
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 print:hidden">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Resume Builder</h2>
                    <p className="text-xs text-slate-500">Tailor your details to output a professionally aligned single-page resume.</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <Printer size={15} /> Print / Save as PDF
                  </button>
                </div>

                <div className="grid md:grid-cols-5 gap-6 print:block">
                  {/* Left Column: Form Editor */}
                  <div className="md:col-span-2 space-y-5 print:hidden max-h-[85vh] overflow-y-auto pr-1">
                    
                    {/* Career Objective */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Career Objective</h4>
                      <textarea 
                        value={careerObjective}
                        onChange={(e) => setCareerObjective(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        placeholder="Professional summary tailored to the role..."
                      />
                    </div>

                    {/* Uncategorized Technical Skills */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Technical Skills</h4>
                      <textarea 
                        value={technicalSkillsText}
                        onChange={(e) => setTechnicalSkillsText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        placeholder="Enter skills separated by commas (e.g. Python, Java, SQL, React...)"
                      />
                    </div>

                    {/* Projects Builder */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Projects</h4>
                      <div className="space-y-2">
                        <input type="text" placeholder="Project Name" value={newProjName} onChange={(e) => setNewProjName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Bullet Point 1" value={newProjBullet1} onChange={(e) => setNewProjBullet1(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Bullet Point 2 (Optional)" value={newProjBullet2} onChange={(e) => setNewProjBullet2(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Bullet Point 3 (Optional)" value={newProjBullet3} onChange={(e) => setNewProjBullet3(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <button 
                          onClick={() => {
                            if (newProjName) {
                              const bullets = [newProjBullet1, newProjBullet2, newProjBullet3].filter(Boolean);
                              setResumeProjects([...resumeProjects, { name: newProjName, bullets }]);
                              setNewProjName(''); setNewProjBullet1(''); setNewProjBullet2(''); setNewProjBullet3('');
                            }
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-250 transition"
                        >
                          + Add Project
                        </button>
                      </div>
                    </div>

                    {/* Internship / Experience */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Internships & Experience</h4>
                      <div className="space-y-2">
                        <input type="text" placeholder="Company Name" value={newWorkCompany} onChange={(e) => setNewWorkCompany(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Role (e.g. Intern)" value={newWorkRole} onChange={(e) => setNewWorkRole(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Year / Duration" value={newWorkDuration} onChange={(e) => setNewWorkDuration(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Achievement Bullet 1" value={newWorkAch1} onChange={(e) => setNewWorkAch1(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Achievement Bullet 2 (Optional)" value={newWorkAch2} onChange={(e) => setNewWorkAch2(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <button 
                          onClick={() => {
                            if (newWorkCompany && newWorkRole) {
                              const achievementsList = [newWorkAch1, newWorkAch2].filter(Boolean);
                              setResumeWork([...resumeWork, { company: newWorkCompany, role: newWorkRole, duration: newWorkDuration, achievements: achievementsList }]);
                              setNewWorkCompany(''); setNewWorkRole(''); setNewWorkDuration(''); setNewWorkAch1(''); setNewWorkAch2('');
                            }
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-250 transition"
                        >
                          + Add Experience
                        </button>
                      </div>
                    </div>

                    {/* Certifications, Achievements, Responsibility, Soft Skills */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Additional Sections</h4>
                      
                      {/* Certifications */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-450 font-bold uppercase block">Certifications</label>
                        <div className="flex gap-1.5">
                          <input type="text" placeholder="Add Certification" value={newCert} onChange={(e) => setNewCert(e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                          <button onClick={() => { if (newCert) { setCertifications([...certifications, newCert]); setNewCert(''); } }} className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-255 rounded-lg text-xs font-bold">+</button>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-455 font-bold uppercase block">Achievements</label>
                        <div className="flex gap-1.5">
                          <input type="text" placeholder="Add Achievement" value={newAch} onChange={(e) => setNewAch(e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                          <button onClick={() => { if (newAch) { setAchievements([...achievements, newAch]); setNewAch(''); } }} className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-255 rounded-lg text-xs font-bold">+</button>
                        </div>
                      </div>

                      {/* Positions of Responsibility */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-455 font-bold uppercase block">Responsibility Roles</label>
                        <div className="flex gap-1.5">
                          <input type="text" placeholder="Add Responsibility Role" value={newResp} onChange={(e) => setNewResp(e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                          <button onClick={() => { if (newResp) { setResponsibilities([...responsibilities, newResp]); setNewResp(''); } }} className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-255 rounded-lg text-xs font-bold">+</button>
                        </div>
                      </div>

                      {/* Soft Skills */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-455 font-bold uppercase block">Soft Skills</label>
                        <div className="flex gap-1.5">
                          <input type="text" placeholder="Add Soft Skill" value={newSoftSkill} onChange={(e) => setNewSoftSkill(e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                          <button onClick={() => { if (newSoftSkill) { setSoftSkills([...softSkills, newSoftSkill]); setNewSoftSkill(''); } }} className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-255 rounded-lg text-xs font-bold">+</button>
                        </div>
                      </div>

                      {/* Languages */}
                      <div>
                        <label className="text-[10px] text-slate-455 font-bold uppercase block mb-1">Languages (Comma separated)</label>
                        <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Printable Sheet */}
                  <div className="md:col-span-3 print:block">
                    <div 
                      id="resume-sheet" 
                      className="bg-white border border-slate-250 rounded-xl shadow-lg p-10 aspect-[1/1.414] w-full text-slate-900 flex flex-col justify-between print:border-none print:shadow-none print:p-0"
                      style={{ fontFamily: 'Georgia, serif', fontSize: '12px', lineHeight: '1.4' }}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="text-center space-y-1">
                          <h3 className="text-2xl font-bold tracking-normal uppercase" style={{ fontFamily: 'Georgia, serif' }}>{profileData.full_name}</h3>
                          <div className="text-[10px] text-slate-700 flex flex-wrap justify-center gap-1.5 uppercase font-medium">
                            <span>📞 {profileData.phone || '9876543210'}</span>
                            <span>|</span>
                            <span>✉️ {profileData.email}</span>
                            <span>|</span>
                            <span>🔗 LinkedIn</span>
                            <span>|</span>
                            <span>💻 GitHub</span>
                            <span>|</span>
                            <span>🌐 Portfolio</span>
                          </div>
                        </div>

                        {/* Career Objective */}
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Career Objective</h4>
                          <p className="text-slate-800 italic leading-relaxed text-justify">{careerObjective}</p>
                        </div>

                        {/* Education */}
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Education</h4>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-bold">{profileData.degree} {profileData.branch ? `in ${profileData.branch}` : ''}</p>
                              <p className="italic text-slate-750">{profileData.college || 'Engineering University'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{profileData.graduation_year || '2026'}</p>
                              <p className="italic">CGPA: {profileData.cgpa || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Technical Skills - Uncategorized */}
                        {technicalSkillsText && (
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Technical Skills</h4>
                            <p className="text-xs text-slate-800 leading-relaxed">
                              {technicalSkillsText}
                            </p>
                          </div>
                        )}

                        {/* Projects */}
                        {resumeProjects.length > 0 && (
                          <div className="space-y-1.5">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Projects</h4>
                            <div className="space-y-2">
                              {resumeProjects.map((p, idx) => (
                                <div key={idx} className="relative group text-xs">
                                  <div className="flex justify-between font-bold">
                                    <span>{p.name}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setResumeProjects(resumeProjects.filter((_, i) => i !== idx))}
                                      className="text-red-500 hover:text-red-700 hidden group-hover:inline-block print:hidden ml-2"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                  <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-800 pl-1.5">
                                    {p.bullets.map((b, i) => (
                                      <li key={i}>{b}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Internship / Experience */}
                        {resumeWork.length > 0 && (
                          <div className="space-y-1.5">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Internship / Experience</h4>
                            <div className="space-y-2">
                              {resumeWork.map((w, idx) => (
                                <div key={idx} className="relative group text-xs">
                                  <div className="flex justify-between font-bold">
                                    <span>{w.company} | {w.role}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-slate-500 font-semibold">{w.duration}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => setResumeWork(resumeWork.filter((_, i) => i !== idx))}
                                        className="text-red-500 hover:text-red-700 hidden group-hover:inline-block print:hidden"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                  <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-800 pl-1.5">
                                    {w.achievements.map((a, i) => (
                                      <li key={i}>{a}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Grid for Certifications, Achievements, Responsibility, Skills */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          {/* Certifications */}
                          {certifications.length > 0 && (
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Certifications</h4>
                              <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5">
                                {certifications.map((c, i) => (
                                  <li key={i} className="relative group">
                                    {c}
                                    <button onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))} className="text-red-500 ml-1 hidden group-hover:inline print:hidden"><X size={10} className="inline" /></button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Achievements */}
                          {achievements.length > 0 && (
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Achievements</h4>
                              <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5">
                                {achievements.map((a, i) => (
                                  <li key={i} className="relative group">
                                    {a}
                                    <button onClick={() => setAchievements(achievements.filter((_, idx) => idx !== i))} className="text-red-500 ml-1 hidden group-hover:inline print:hidden"><X size={10} className="inline" /></button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Positions of Responsibility */}
                          {responsibilities.length > 0 && (
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Responsibility</h4>
                              <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5">
                                {responsibilities.map((r, i) => (
                                  <li key={i} className="relative group">
                                    {r}
                                    <button onClick={() => setResponsibilities(responsibilities.filter((_, idx) => idx !== i))} className="text-red-500 ml-1 hidden group-hover:inline print:hidden"><X size={10} className="inline" /></button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Soft Skills & Languages */}
                          <div className="space-y-3">
                            {softSkills.length > 0 && (
                              <div className="space-y-1">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Soft Skills</h4>
                                <p className="text-[11px] text-slate-800">{softSkills.join(', ')}</p>
                              </div>
                            )}

                            {languages && (
                              <div className="space-y-1">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-900 pb-0.5">Languages</h4>
                                <p className="text-[11px] text-slate-800">{languages}</p>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                <style>{`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #resume-sheet, #resume-sheet * {
                      visibility: visible !important;
                    }
                    #resume-sheet {
                      position: fixed !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: 100% !important;
                      border: none !important;
                      box-shadow: none !important;
                      padding: 2.2cm !important;
                      margin: 0 !important;
                    }
                  }
                `}</style>
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-4">Submit Experience Feedback</h2>

                {feedbackSuccess ? (
                  <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center space-y-3">
                    <CheckCircle className="text-green-600 mx-auto" size={40} />
                    <p className="text-green-800 font-bold">Feedback submitted successfully!</p>
                    <button 
                      onClick={() => setFeedbackSuccess(false)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition"
                    >
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">SELECT COMPLETED INTERNSHIP</label>
                      <select
                        value={feedbackInternshipId}
                        onChange={(e) => setFeedbackInternshipId(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                      >
                        <option value="">-- Choose Internship --</option>
                        {allInternships.map((internship) => (
                          <option key={internship.id || internship.internship_id} value={internship.id || internship.internship_id}>
                            {internship.title} ({internship.company_name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">RATING (1-5)</label>
                      <div className="flex gap-2">
                        {['1', '2', '3', '4', '5'].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFeedbackRating(r)}
                            className={`w-10 h-10 rounded-xl font-bold transition text-sm ${
                              feedbackRating === r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-650 border border-slate-250 hover:bg-slate-200'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">FEEDBACK TEXT</label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Describe your internship experience..."
                        rows={4}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">WERE RECOMMENDATIONS RELEVANT?</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setIsRelevant('Yes')}
                          className={`flex-1 py-2.5 rounded-xl font-bold transition text-xs border ${
                            isRelevant === 'Yes' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-250 hover:bg-slate-200 text-slate-655'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRelevant('No')}
                          className={`flex-1 py-2.5 rounded-xl font-bold transition text-xs border ${
                            isRelevant === 'No' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-250 hover:bg-slate-200 text-slate-655'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-sm"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Internship Details Dialog */}
      <AnimatePresence>
        {selectedInternship && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
            <div className="absolute inset-0" onClick={() => setSelectedInternship(null)}></div>
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                  Actively hiring
                </span>
                <button 
                  onClick={() => setSelectedInternship(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-lg p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  Close
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{selectedInternship.title}</h3>
                  <p className="text-blue-600 font-semibold text-lg flex items-center gap-1 mt-1">
                    <Building2 size={18} />
                    {selectedInternship.company_name || 'Verified Recruiter'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <MapPin size={18} className="text-slate-400 shrink-0" />
                  <span className="text-slate-655 font-medium">{selectedInternship.location || 'Remote'}</span>
                </div>

                {/* 4 Column layout */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">START DATE</span>
                    <span className="text-sm font-semibold text-slate-700">{selectedInternship.start_date || 'Immediately'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">STIPEND / CTC</span>
                    <span className="text-sm font-semibold text-slate-700">{selectedInternship.ctc || selectedInternship.stipend || 'Unpaid'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">EXPERIENCE</span>
                    <span className="text-sm font-semibold text-slate-700">{selectedInternship.experience || 'Fresher'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">DURATION</span>
                    <span className="text-sm font-semibold text-slate-700">{selectedInternship.duration || 'Variable'}</span>
                  </div>
                </div>

                {/* Skills */}
                {selectedInternship.preferred_skills && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-800">Skills required</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedInternship.preferred_skills.split(',').map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800">About the job</h4>
                  <p className="text-slate-655 text-sm leading-relaxed whitespace-pre-line">
                    {selectedInternship.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Bottom Apply Action */}
              <div className="p-4 border-t border-slate-200 bg-white">
                {appliedIds.includes(selectedInternship.id) ? (
                  <button 
                    disabled
                    className="w-full py-3 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle size={18} />
                    Applied
                  </button>
                ) : (
                  <button
                    onClick={triggerApplyFlow}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center text-sm"
                  >
                    Apply now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedInternship && (
          <div className="fixed inset-0 z-55 bg-black/50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => { if (!isApplying) setShowConfirmModal(false); }}></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 overflow-hidden"
            >
              {applySuccessId ? (
                /* Success View */
                <div className="text-center space-y-4 py-4">
                  <CheckCircle className="text-green-600 mx-auto" size={56} />
                  <div>
                    <h4 className="text-2xl font-black text-slate-800">Application Submitted!</h4>
                    <p className="text-slate-550 text-sm mt-1">Application Reference: <span className="font-bold text-slate-700">{applySuccessId}</span></p>
                  </div>
                  <p className="text-slate-600 text-sm">Your profile details and recommendations have been sent to the recruiter.</p>
                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => {
                        setShowConfirmModal(false);
                        setSelectedInternship(null);
                        setActiveTab('applications');
                      }}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm shadow-sm"
                    >
                      View Applications
                    </button>
                    <button 
                      onClick={() => {
                        setShowConfirmModal(false);
                        setSelectedInternship(null);
                      }}
                      className="py-3 px-6 border border-slate-350 hover:bg-slate-50 text-slate-655 font-bold rounded-xl transition text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Confirmation View */
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h4 className="text-lg font-black text-slate-850">Confirm Application</h4>
                    <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-650"><X size={20} /></button>
                  </div>

                  {/* Internship summary */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400">SELECTED ROLE</p>
                    <p className="font-bold text-slate-850 text-base">{selectedInternship.title}</p>
                    <p className="text-xs text-blue-600 font-semibold">{selectedInternship.company_name}</p>
                  </div>

                  {/* Student profile summary */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400">STUDENT PROFILE SUMMARY</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
                      <div className="flex justify-between"><span>NAME</span><span className="font-bold">{profileData?.full_name || 'N/A'}</span></div>
                      <div className="flex justify-between"><span>DEGREE</span><span className="font-bold">{profileData?.degree || 'N/A'} ({profileData?.branch || 'N/A'})</span></div>
                      <div className="flex justify-between"><span>COLLEGE</span><span className="font-bold">{profileData?.college || 'N/A'}</span></div>
                      <div className="flex justify-between"><span>CGPA</span><span className="font-bold">{profileData?.cgpa || 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* Resume Upload Placeholder */}
                  <div className="border-2 border-dashed border-slate-250 bg-slate-50 p-4 rounded-xl text-center space-y-1 cursor-pointer">
                    <FileText className="text-slate-400 mx-auto" size={24} />
                    <p className="text-xs font-bold text-slate-650">Select Resume File (Optional)</p>
                    <p className="text-[10px] text-slate-400">PDF, DOCX formats supported</p>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-start gap-2.5 py-1">
                    <input 
                      type="checkbox" 
                      id="confirmCheck"
                      checked={termsConfirmed}
                      onChange={(e) => setTermsConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="confirmCheck" className="text-xs text-slate-600 cursor-pointer select-none">
                      I confirm that all profile information matches my official documents.
                    </label>
                  </div>

                  {/* Action */}
                  <button
                    disabled={!termsConfirmed || isApplying}
                    onClick={handleFinalSubmitApply}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition text-sm shadow-md flex items-center justify-center"
                  >
                    {isApplying ? (
                      <span className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
