'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Eye, 
  Plus, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Wallet,
  Briefcase,
  HelpCircle,
  Users
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function PostInternship() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('');
  const [mode, setMode] = useState('Remote');
  const [stipend, setStipend] = useState('');
  const [ctc, setCtc] = useState('');
  const [startDate, setStartDate] = useState('Immediately');
  const [experience, setExperience] = useState('Fresher');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [selectionProcess, setSelectionProcess] = useState('');

  // Eligibility Criteria
  const [eligibleCourse, setEligibleCourse] = useState('');
  const [eligibleYear, setEligibleYear] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [openings, setOpenings] = useState('1');
  const [deadline, setDeadline] = useState('');

  // Skills chips
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    // Check Auth
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'company') {
      router.push('/login?role=company');
    }
  }, []);

  const addSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const getPayload = (status: 'Published' | 'Draft') => {
    return {
      title,
      domain,
      location,
      mode,
      stipend: stipend ? parseFloat(stipend) : 0,
      ctc: ctc || null,
      start_date: startDate,
      experience,
      duration,
      preferred_skills: skillsList.join(', '),
      description,
      eligible_course: eligibleCourse || null,
      eligible_year: eligibleYear ? parseInt(eligibleYear) : null,
      min_cgpa: minCgpa ? parseFloat(minCgpa) : null,
      positions: openings ? parseInt(openings) : 1,
      selection_process: selectionProcess || null,
      last_date: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days default
      status
    };
  };

  const handlePost = async (e: React.FormEvent, status: 'Published' | 'Draft' = 'Published') => {
    e.preventDefault();
    if (skillsList.length === 0) {
      alert('Please add at least one required skill.');
      return;
    }
    setIsSaving(true);

    try {
      await fetchApi('/companies/internships', {
        method: 'POST',
        body: JSON.stringify(getPayload(status)),
      });
      router.push('/company/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to post internship.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => router.push('/company/dashboard')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <Sparkles size={28} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block">RECRUITER TOOLS</span>
            <h2 className="text-xl font-bold text-slate-800">Post New Internship</h2>
          </div>
        </div>

        <form onSubmit={(e) => handlePost(e, 'Published')} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">INTERNSHIP TITLE</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">DOMAIN</label>
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Software Development"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">LOCATION</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">WORK MODE</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              >
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">DURATION</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 6 Months"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">MONTHLY STIPEND (INR)</label>
              <input
                type="number"
                required
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">CTC (ANNUAL PROSPECT)</label>
              <input
                type="text"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                placeholder="e.g. 6 LPA"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">START DATE</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="e.g. Immediately"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">EXPERIENCE LEVEL</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. Fresher / 1+ Year"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Academic Eligibility Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 tracking-wider">ELIGIBILITY REQUIREMENTS</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">COURSE / BRANCH</label>
                <input
                  type="text"
                  value={eligibleCourse}
                  onChange={(e) => setEligibleCourse(e.target.value)}
                  placeholder="e.g. B.Tech CS"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">GRAD YEAR</label>
                <input
                  type="number"
                  value={eligibleYear}
                  onChange={(e) => setEligibleYear(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">MIN CGPA</label>
                <input
                  type="text"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  placeholder="8.5"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">NUMBER OF OPENINGS</label>
                <input
                  type="number"
                  value={openings}
                  onChange={(e) => setOpenings(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">APPLICATION DEADLINE</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Skill-chip Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">REQUIRED SKILLS (CHIP BUILDER)</label>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 border border-slate-200 bg-slate-50 rounded-xl mb-2">
              {skillsList.length === 0 ? (
                <span className="text-slate-400 text-xs">No skills added. Type below and press Enter.</span>
              ) : (
                skillsList.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-cyan-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-200"><X size={12} /></button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type a skill and press Enter"
                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
              />
              <button 
                type="button" 
                onClick={addSkill}
                className="px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">JOB DESCRIPTION</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the role, responsibilities, and requirements..."
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">SELECTION PROCESS DESCRIPTION</label>
            <textarea
              value={selectionProcess}
              onChange={(e) => setSelectionProcess(e.target.value)}
              placeholder="Describe the interview rounds or assessment tasks..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 justify-between">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-5 py-3 border border-slate-250 hover:bg-slate-50 font-bold rounded-xl text-xs transition flex items-center gap-1"
            >
              <Eye size={16} /> Preview Role
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => handlePost(e, 'Draft')}
                disabled={isSaving}
                className="px-5 py-3 border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold rounded-xl text-xs transition"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center justify-center"
              >
                {isSaving ? (
                  <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                ) : (
                  'Publish Internship'
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Preview Modal Overlay */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-55 bg-black/40 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setIsPreviewOpen(false)}></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-150">
                <h4 className="font-black text-slate-800 text-lg">Internship Listing Preview</h4>
                <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-650"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1 text-xs sm:text-sm">
                <div>
                  <h3 className="text-xl font-black text-slate-800">{title || 'Internship Title'}</h3>
                  <p className="text-cyan-600 font-semibold text-base mt-0.5">Verified Startup Partner</p>
                </div>

                <div className="flex gap-2 text-slate-500">
                  <MapPin size={16} />
                  <span>{location || 'Remote'}</span>
                </div>

                {/* 4 Column Layout */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">START DATE</span>
                    <span className="font-semibold text-slate-700">{startDate || 'Immediately'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">STIPEND</span>
                    <span className="font-semibold text-slate-700">₹{stipend || 'Unpaid'}/month</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">EXPERIENCE</span>
                    <span className="font-semibold text-slate-700">{experience || 'Fresher'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">DURATION</span>
                    <span className="font-semibold text-slate-700">{duration || 'Variable'}</span>
                  </div>
                </div>

                {/* Eligibility requirements */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">ELIGIBILITY</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div><span className="text-[10px] text-slate-400 block">COURSE</span><span className="font-bold">{eligibleCourse || 'All Courses'}</span></div>
                    <div><span className="text-[10px] text-slate-400 block">GRAD YEAR</span><span className="font-bold">{eligibleYear || 'All Years'}</span></div>
                    <div><span className="text-[10px] text-slate-400 block">MIN CGPA</span><span className="font-bold">{minCgpa || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">REQUIRED SKILLS</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-650 text-xs font-semibold rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">JOB DESCRIPTION</h4>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
