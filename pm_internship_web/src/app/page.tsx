'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, ShieldAlert } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-200">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-extrabold text-blue-600 tracking-tight"
        >
          InternGrid
        </motion.div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 text-sm font-medium transition"
          >
            <ShieldAlert size={16} />
            Admin
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Find internships smarter
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Connect directly with verified organizations. Let AI match your skills and score candidate relevance in real-time.
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl px-4">
          {/* Student Card */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push('/login?role=student')}
            className="cursor-pointer bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition duration-300 flex flex-col items-center text-center group"
          >
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
              <GraduationCap size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">I am a Student</h2>
            <p className="text-slate-500 text-sm">
              Discover customized internship opportunities, get matched by AI, and track applications.
            </p>
          </motion.div>

          {/* Recruiter Card */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => router.push('/login?role=company')}
            className="cursor-pointer bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition duration-300 flex flex-col items-center text-center group"
          >
            <div className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl mb-6 group-hover:bg-cyan-600 group-hover:text-white transition duration-300">
              <Building2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">I represent an Organization</h2>
            <p className="text-slate-500 text-sm">
              Post roles, shortlist applicants using our semantic engine, and rank top talent instantly.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} InternGrid. All rights reserved.
      </footer>
    </div>
  );
}
