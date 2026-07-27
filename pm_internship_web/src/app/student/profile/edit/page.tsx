'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  School, 
  Settings, 
  Wrench, 
  Share2, 
  ArrowLeft, 
  Plus, 
  X, 
  Sparkles,
  ArrowRight,
  Save,
  Camera
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function StudentProfileEdit() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [college, setCollege] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [isPursuing, setIsPursuing] = useState(true);
  const [prefLocation, setPrefLocation] = useState('');
  const [prefMode, setPrefMode] = useState('Remote');
  const [interests, setInterests] = useState('');
  const [duration, setDuration] = useState('');
  const [stipend, setStipend] = useState('');
  const [languages, setLanguages] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  
  // Profile Photo Upload States
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoPlaceholder, setPhotoPlaceholder] = useState<string | null>(null);

  // Skills States
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([
    'Python', 'Java', 'Marketing', 'Figma', 'SQL', 'Project Management'
  ]);
  const [customSkill, setCustomSkill] = useState('');

  useEffect(() => {
    // Check Auth
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'student') {
      router.push('/login?role=student');
      return;
    }
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const profile = await fetchApi('/students/me');
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setGender(profile.gender || 'Male');
      setDob(profile.date_of_birth || '');
      setAddress(profile.permanent_address || '');
      setCity(profile.city || '');
      setStateName(profile.state || '');
      setCollege(profile.college || '');
      setUniversity(profile.university || '');
      setDegree(profile.degree || '');
      setBranch(profile.branch || '');
      setGradYear(profile.graduation_year?.toString() || '');
      setCgpa(profile.cgpa?.toString() || '');
      setIsPursuing(profile.is_pursuing ?? true);
      setPrefLocation(profile.preferred_work_location || '');
      setPrefMode(profile.preferred_work_mode || 'Remote');
      setInterests(profile.areas_of_interest || '');
      setDuration(profile.preferred_internship_duration || '');
      setStipend(profile.minimum_expected_stipend?.toString() || '');
      setLanguages(profile.languages || '');
      setCareerGoal(profile.career_goal || '');
      setLinkedin(profile.linkedin || '');
      setGithub(profile.github || '');
      setProfilePhoto(profile.profile_photo || '');
      
      if (profile.profile_photo) {
        setPhotoPlaceholder(`http://127.0.0.1:8000/${profile.profile_photo}`);
      }

      if (profile.skills) {
        const skillsList = profile.skills.map((s: any) => s.skill_name);
        setSelectedSkills(skillsList);
        fetchSuggestedSkills(skillsList);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const fetchSuggestedSkills = async (skills: string[]) => {
    if (skills.length === 0) return;
    try {
      const skillsQuery = encodeURIComponent(skills.join(','));
      const data = await fetchApi(`/students/skills/recommendations?skills_list=${skillsQuery}`);
      if (data.recommendations) {
        setSuggestedSkills(
          data.recommendations.filter((s: string) => !skills.includes(s))
        );
      }
    } catch (e) {
      console.error('Error fetching skill recommendations:', e);
    }
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      const updated = [...selectedSkills, trimmed];
      setSelectedSkills(updated);
      setSuggestedSkills(suggestedSkills.filter(s => s !== trimmed));
      fetchSuggestedSkills(updated);
    }
  };

  const removeSkill = (skill: string) => {
    const updated = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(updated);
    if (!suggestedSkills.includes(skill)) {
      setSuggestedSkills([skill, ...suggestedSkills]);
    }
    if (updated.length > 0) {
      fetchSuggestedSkills(updated);
    }
  };

  const calculateCompleteness = () => {
    const fields = [
      fullName, phone, gender, dob, address, city, stateName, 
      college, university, degree, branch, gradYear, cgpa,
      prefLocation, prefMode, interests, duration, careerGoal
    ];
    const filledCount = fields.filter(Boolean).length;
    const skillsCount = selectedSkills.length > 0 ? 1 : 0;
    return Math.round(((filledCount + skillsCount) / (fields.length + 1)) * 100);
  };

  const buildPayload = () => {
    return {
      full_name: fullName,
      phone: phone,
      gender,
      date_of_birth: dob || null,
      permanent_address: address,
      city,
      state: stateName,
      college,
      university,
      degree,
      branch,
      graduation_year: gradYear ? parseInt(gradYear) : null,
      cgpa: cgpa ? parseFloat(cgpa) : null,
      is_pursuing: isPursuing,
      preferred_work_location: prefLocation,
      preferred_work_mode: prefMode,
      areas_of_interest: interests,
      preferred_internship_duration: duration,
      minimum_expected_stipend: stipend ? parseFloat(stipend) : null,
      languages,
      career_goal: careerGoal,
      linkedin,
      github,
      profile_photo: profilePhoto || null
    };
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await fetchApi('/students/me', {
        method: 'PUT',
        body: JSON.stringify(buildPayload()),
      });

      // Submit skills
      for (const skill of selectedSkills) {
        try {
          await fetchApi('/students/skills', {
            method: 'POST',
            body: JSON.stringify({ skill_name: skill }),
          });
        } catch (e) {
          // ignore duplicate skills
        }
      }
      setSaveMessage('Draft saved successfully!');
    } catch (err) {
      setSaveMessage('Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await fetchApi('/students/me', {
        method: 'PUT',
        body: JSON.stringify(buildPayload()),
      });

      // Submit skills
      for (const skill of selectedSkills) {
        try {
          await fetchApi('/students/skills', {
            method: 'POST',
            body: JSON.stringify({ skill_name: skill }),
          });
        } catch (e) {
          // ignore duplicate skills
        }
      }

      router.push('/student/dashboard');
    } catch (err) {
      alert('Failed to save profile. Please check all details.');
    } finally {
      setIsSaving(false);
    }
  };

  const stepsInfo = [
    { title: 'Basic Info', icon: User },
    { title: 'Academics', icon: School },
    { title: 'Preferences', icon: Settings },
    { title: 'Smart Skills', icon: Wrench },
    { title: 'Socials & Bio', icon: Share2 }
  ];

  const IconComponent = stepsInfo[step].icon;
  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans flex flex-col justify-between">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-8 relative overflow-hidden">
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => {
              if (step > 0) setStep(step - 1);
              else router.push('/student/dashboard');
            }}
            className="flex items-center gap-1.5 text-slate-550 hover:text-slate-800 text-sm font-semibold transition"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Completeness Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Profile {completeness}% Complete</span>
            <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${completeness}%` }}></div>
            </div>
          </div>
        </div>

        {/* Step Icon & Title Banner */}
        <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <IconComponent size={28} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block">STEP {step + 1} OF 5</span>
            <h2 className="text-xl font-bold text-slate-800">{stepsInfo[step].title}</h2>
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Photo Upload */}
                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer overflow-hidden group">
                    {photoPlaceholder ? (
                      <img src={photoPlaceholder} className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append('file', file);
                          
                          // Local preview instantly
                          setPhotoPlaceholder(URL.createObjectURL(file));
                          
                          try {
                            const res = await fetch('http://127.0.0.1:8000/students/me/photo', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                              },
                              body: formData
                            });
                            const data = await res.json();
                            if (data.file_path) {
                              setProfilePhoto(data.file_path);
                              setPhotoPlaceholder(`http://127.0.0.1:8000/${data.file_path}`);
                            }
                          } catch (err) {
                            console.error('Error uploading photo:', err);
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-650 block">PROFILE PHOTO (OPTIONAL)</span>
                    <span className="text-[11px] text-slate-400">Click to upload JPG / PNG</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">FULL NAME</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Krishna"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">MOBILE NUMBER</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">GENDER</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">DATE OF BIRTH</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">CITY</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">STATE</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">PERMANENT ADDRESS</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Street Name, Area"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">COLLEGE</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="College Name"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">UNIVERSITY</label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="University Name"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">DEGREE / COURSE</label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm text-slate-800"
                    >
                      <option value="">-- Select Degree --</option>
                      <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                      <option value="M.Tech">M.Tech (Master of Technology)</option>
                      <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                      <option value="M.Sc">M.Sc (Master of Science)</option>
                      <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                      <option value="MCA">MCA (Master of Computer Applications)</option>
                      <option value="BBA">BBA (Bachelor of Business Administration)</option>
                      <option value="MBA">MBA (Master of Business Administration)</option>
                      <option value="B.Com">B.Com (Bachelor of Commerce)</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">BRANCH / SPECIALIZATION</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm text-slate-800"
                    >
                      <option value="">-- Select Specialization --</option>
                      <option value="Computer Science">Computer Science Engineering (CSE)</option>
                      <option value="Information Technology">Information Technology (IT)</option>
                      <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning (AI/ML)</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                      <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources (HR)</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">GRADUATION YEAR</label>
                    <input
                      type="number"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">CGPA OR PERCENTAGE</label>
                    <input
                      type="text"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="9.2"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <input 
                    type="checkbox" 
                    id="pursuing"
                    checked={isPursuing}
                    onChange={(e) => setIsPursuing(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="pursuing" className="text-xs font-bold text-slate-655 cursor-pointer">
                    Currently pursuing this degree
                  </label>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">PREFERRED LOCATION</label>
                    <input
                      type="text"
                      value={prefLocation}
                      onChange={(e) => setPrefLocation(e.target.value)}
                      placeholder="Bangalore"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">WORK MODE</label>
                    <select
                      value={prefMode}
                      onChange={(e) => setPrefMode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    >
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-site</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">PREFERRED DURATION</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 6 Months"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">MIN STIPEND (OPTIONAL)</label>
                    <input
                      type="number"
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">AREAS OF INTEREST</label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="Data Science, Web Development"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">SELECTED SKILLS</label>
                  <div className="flex flex-wrap gap-2 min-h-[48px] p-3 border border-slate-200 bg-slate-50 rounded-xl">
                    {selectedSkills.length === 0 ? (
                      <span className="text-slate-400 text-sm">No skills added yet.</span>
                    ) : (
                      selectedSkills.map(s => (
                        <span key={s} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                          {s}
                          <button onClick={() => removeSkill(s)} className="hover:text-red-200">
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-500" />
                    SUGGESTED SKILLS
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.slice(0, 10).map(s => (
                      <button 
                        key={s}
                        type="button"
                        onClick={() => addSkill(s)}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-300 text-slate-600 text-xs font-bold rounded-lg transition"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">ADD CUSTOM SKILL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="e.g. Next.js"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (customSkill) {
                          addSkill(customSkill);
                          setCustomSkill('');
                        }
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">LANGUAGES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="English, Hindi"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">CAREER GOAL / SHORT BIO</label>
                  <textarea
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="Write a brief introduction about your goals..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">LINKEDIN URL</label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">GITHUB URL</label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <div>
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold rounded-xl text-sm transition flex items-center gap-1"
            >
              <Save size={16} /> Save Draft
            </button>
          </div>

          <div className="flex gap-2">
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1 text-sm"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center text-sm"
              >
                {isSaving ? (
                  <span className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
                ) : (
                  'Save & Continue'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Save messages overlay */}
        {saveMessage && (
          <p className={`text-xs font-bold text-center mt-4 ${saveMessage.includes('successfully') ? 'text-green-650' : 'text-red-500'}`}>
            {saveMessage}
          </p>
        )}
      </div>
    </div>
  );
}
