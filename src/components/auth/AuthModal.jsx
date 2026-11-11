import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState('student'); // 'student' | 'admin'

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn({ email, password });
        addToast('Welcome back to CampusConnect!', 'success');
        onClose();
      } else {
        if (!fullName.trim()) throw new Error('Full name is required.');
        if (!email.trim()) throw new Error('Email is required.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        await signUp({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          rollNo: rollNo.trim() || undefined,
          department,
          role,
        });

        addToast('Account created successfully! Check your email or sign in.', 'success');
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1a1117] border border-[#382332] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#faf3ee]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 text-[#a89490] hover:text-[#faf3ee] hover:bg-[#261823] rounded-xl transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#261823] text-[#e89a92] text-[10px] font-mono uppercase tracking-widest mb-3 border border-[#382332]">
            <Sparkles className="w-3 h-3" />
            <span>Campus Gateway</span>
          </div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-[#faf3ee]">
            {mode === 'signin' ? 'Sign In' : 'Join CampusConnect'}
          </h2>
          <p className="text-xs text-[#bdaaa2] font-light mt-1">
            {mode === 'signin'
              ? 'Access your reserved admission passes and bookmarked events.'
              : 'Create a student or administrator profile to participate.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#120c10] rounded-xl border border-[#382332] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-mono uppercase tracking-wider font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#e89a92] text-[#120c10] shadow-sm'
                : 'text-[#a89490] hover:text-[#faf3ee]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-mono uppercase tracking-wider font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#e89a92] text-[#120c10] shadow-sm'
                : 'text-[#a89490] hover:text-[#faf3ee]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-[#df7e74] leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a89490] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89490]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full bg-[#120c10] border border-[#382332] focus:border-[#e89a92] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#faf3ee] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a89490] mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition ${
                      role === 'student'
                        ? 'bg-[#291b26] border-[#e89a92] text-[#e89a92] font-bold'
                        : 'border-[#382332] text-[#a89490] hover:text-[#faf3ee]'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition ${
                      role === 'admin'
                        ? 'bg-[#291b26] border-[#e89a92] text-[#e89a92] font-bold'
                        : 'border-[#382332] text-[#a89490] hover:text-[#faf3ee]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </button>
                </div>
              </div>

              {/* Department & Roll Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#a89490] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full bg-[#120c10] border border-[#382332] focus:border-[#e89a92] rounded-xl py-2 px-3 text-xs text-[#faf3ee] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#a89490] mb-1">
                    Roll / ID No
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="CS-2026-042"
                    className="w-full bg-[#120c10] border border-[#382332] focus:border-[#e89a92] rounded-xl py-2 px-3 text-xs text-[#faf3ee] focus:outline-none transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a89490] mb-1.5">
              Campus Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89490]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full bg-[#120c10] border border-[#382332] focus:border-[#e89a92] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#faf3ee] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a89490] mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89490]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#120c10] border border-[#382332] focus:border-[#e89a92] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#faf3ee] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 mt-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] hover:bg-[#f2aba3] text-[#120c10] transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to CampusConnect' : 'Create Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
