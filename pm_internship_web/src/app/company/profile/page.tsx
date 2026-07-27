'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ArrowLeft, 
  Save, 
  Edit3, 
  CheckCircle, 
  Clock, 
  Camera,
  Layers,
  Users,
  Link,
  Phone,
  Mail,
  User,
  ShieldCheck
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function CompanyProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Organization Fields
  const [companyName, setCompanyName] = useState('');
  const [orgType, setOrgType] = useState('Private Sector');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('1-10');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('Pending');
  const [logoPlaceholder, setLogoPlaceholder] = useState<string | null>(null);

  useEffect(() => {
    // Check Auth
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'company') {
      router.push('/login?role=company');
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchApi('/companies/me');
      setCompanyName(data.company_name || '');
      setOrgType(data.org_type || 'Private Sector');
      setIndustry(data.industry || '');
      setCompanySize(data.company_size || '1-10');
      setDescription(data.description || '');
      setWebsite(data.website || '');
      setContactName(data.contact_name || '');
      setContactDesignation(data.contact_designation || '');
      setContactPhone(data.contact_phone || '');
      setOfficialEmail(data.email || ''); // official email is the account email
      setCity(data.city || '');
      setStateName(data.state || '');
      setVerificationStatus(data.verification_status || 'Pending');
    } catch (err) {
      console.error('Error fetching company profile:', err);
    }
  };

  const calculateCompleteness = () => {
    const fields = [
      companyName, orgType, industry, companySize, description, 
      website, contactName, contactDesignation, contactPhone, 
      officialEmail, city, stateName
    ];
    const filledCount = fields.filter(Boolean).length;
    return Math.round((filledCount / fields.length) * 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const payload = {
        company_name: companyName,
        industry,
        location: `${city}, ${stateName}`,
        website,
        description,
        contact_name: contactName,
        contact_designation: contactDesignation,
        contact_phone: contactPhone,
        org_type: orgType,
        company_size: companySize,
        city,
        state: stateName,
      };

      await fetchApi('/companies/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setMessage(err.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-8 space-y-8">
        
        {/* Header navigation */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <button 
            onClick={() => router.push('/company/dashboard')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-xl transition"
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Banner with logo upload & completeness */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 bg-slate-200 border border-slate-350 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden cursor-pointer">
              {logoPlaceholder ? (
                <img src={logoPlaceholder} className="w-full h-full object-cover" />
              ) : (
                <Camera size={28} />
              )}
              {isEditing && (
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLogoPlaceholder(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">{companyName || 'Organization Name'}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                  verificationStatus === 'Verified' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                }`}>
                  {verificationStatus === 'Verified' ? <ShieldCheck size={12} /> : <Clock size={12} />}
                  {verificationStatus}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1 font-semibold">{industry || 'Industry Domain'}</p>
            </div>
          </div>

          {/* Completeness Bar */}
          <div className="w-full md:w-48 space-y-1.5 shrink-0">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>PROFILE COMPLETENESS</span>
              <span>{completeness}%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${completeness}%` }}></div>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-550 border-b border-slate-100 pb-1">ORGANIZATION DETAILS</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">ORGANIZATION NAME</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">INDUSTRY / DOMAIN</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Software, Finance"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">ORGANIZATION TYPE</label>
                <select 
                  disabled={!isEditing}
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                >
                  <option>Private Sector</option>
                  <option>Public Sector</option>
                  <option>NGO / Non-profit</option>
                  <option>Educational Institution</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">COMPANY SIZE</label>
                <select 
                  disabled={!isEditing}
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                >
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">OFFICIAL WEBSITE</label>
                <div className="relative">
                  <Link className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">CITY</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-555 mb-1.5">STATE</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-550 mb-1.5">ABOUT THE ORGANIZATION</label>
              <textarea 
                disabled={!isEditing}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your organization's mission, values, and work..."
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-550 border-b border-slate-100 pb-1">CONTACT REPRESENTATIVE</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">REPRESENTATIVE NAME</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Aditya Sen"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">DESIGNATION</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={contactDesignation}
                    onChange={(e) => setContactDesignation(e.target.value)}
                    placeholder="HR Director"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">OFFICIAL PHONE</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 9988776655"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1.5">OFFICIAL EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    disabled
                    value={officialEmail}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-550 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-6">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                ) : (
                  <>
                    <Save size={16} /> Save Profile
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {message && (
          <p className="text-center font-bold text-xs text-green-700">{message}</p>
        )}
      </div>
    </div>
  );
}
