'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let endpoint = '/auth/company/login';
    if (role === 'student') {
      endpoint = '/auth/student/login';
    } else if (role === 'admin') {
      endpoint = '/auth/admin/login';
    }

    try {
      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_role', role);
        
        if (role === 'student') {
          router.push('/student/dashboard');
        } else if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/company/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-2">
            Login as a {role === 'student' ? 'Student' : role === 'admin' ? 'Administrator' : 'Recruiter'}
          </p>
        </div>

        {/* Tab Selection */}
        {role !== 'admin' && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setRole('student');
                setError('');
              }}
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg transition ${
                role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => {
                setRole('company');
                setError('');
              }}
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg transition ${
                role === 'company' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recruiter
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <button type="button" className="text-xs text-blue-600 hover:underline font-semibold">
                Forgot Password?
              </button>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm font-medium text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {role !== 'admin' && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <button 
              onClick={() => router.push(`/register?role=${role}`)}
              className="text-blue-600 font-bold hover:underline"
            >
              Register here
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
