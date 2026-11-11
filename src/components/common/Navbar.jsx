import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Bookmark, 
  Ticket, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw,
  PlusCircle,
  ArrowUpRight,
  LogOut,
  LogIn,
  User,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBookmarks } from '../../context/BookmarkContext';
import { useRegistrations } from '../../context/RegistrationContext';
import { useEvents } from '../../context/EventContext';

export default function Navbar({ onOpenCreateModal, onOpenAuthModal }) {
  const location = useLocation();
  const { role, isAdmin, toggleRole, user, profile, isSupabaseMode, signOut } = useAuth();
  const { bookmarkCount } = useBookmarks();
  const { registrations } = useRegistrations();
  const { resetAllData } = useEvents();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#120c10]/95 backdrop-blur-md border-b border-[#382332] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with Editorial Metadata */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e89a92] to-[#b3574e] flex items-center justify-center text-[#120c10] shadow-md shadow-rose-900/40 group-hover:scale-105 transition-transform duration-300">
              <span className="font-display font-black text-xl tracking-tighter">CC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#faf3ee] group-hover:text-[#e89a92] transition-colors uppercase">
                Campus<span className="text-[#e89a92]">Connect</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#a89490] uppercase">
                Official Event Archive ↗
              </span>
            </div>
          </Link>

          {/* Navigation Links with Editorial Numbers */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/events"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                isActive('/events')
                  ? 'bg-[#291b26] text-[#e89a92] border border-[#4e3346]'
                  : 'text-[#e8ded8] hover:text-[#faf3ee] hover:bg-[#1f141d]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#e89a92]" />
              Explore Events
            </Link>

            <Link
              to="/saved"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 relative ${
                isActive('/saved')
                  ? 'bg-[#291b26] text-[#e89a92] border border-[#4e3346]'
                  : 'text-[#e8ded8] hover:text-[#faf3ee] hover:bg-[#1f141d]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#e89a92]" />
              Saved Events
              {bookmarkCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#e89a92] text-[#120c10] rounded-full">
                  {bookmarkCount.toString().padStart(2, '0')}
                </span>
              )}
            </Link>

            <Link
              to="/my-registrations"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 relative ${
                isActive('/my-registrations')
                  ? 'bg-[#291b26] text-[#e89a92] border border-[#4e3346]'
                  : 'text-[#e8ded8] hover:text-[#faf3ee] hover:bg-[#1f141d]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-[#e89a92]" />
              My Passes
              {registrations.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#4e3346] text-[#e89a92] rounded-full border border-[#e89a92]/40">
                  {registrations.length.toString().padStart(2, '0')}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-[#e89a92] text-[#120c10] font-bold shadow-sm'
                    : 'text-[#e89a92] border border-[#4e3346] hover:bg-[#291b26]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Studio
              </Link>
            )}
          </nav>

          {/* Action Center & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Create Event (if Admin) */}
            {isAdmin && (
              <button
                onClick={onOpenCreateModal}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e89a92] text-[#120c10] text-xs font-bold uppercase tracking-wider hover:bg-[#f2aba3] transition shadow-md shadow-rose-950"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Post Event
              </button>
            )}

            {/* Supabase Authenticated User or Fallback Role Switcher */}
            {isSupabaseMode && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e131b] border border-[#382332] text-xs">
                  <div className="w-6 h-6 rounded-full bg-[#e89a92] text-[#120c10] font-bold font-mono flex items-center justify-center text-[10px]">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-mono text-xs text-[#faf3ee] hidden sm:inline">
                    {profile?.full_name || user.email}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#291b26] text-[#e89a92] border border-[#e89a92]/30">
                    {role}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  title="Sign out"
                  className="p-2 text-[#a89490] hover:text-[#df7e74] hover:bg-[#261823] rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isSupabaseMode ? (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e89a92] text-[#120c10] text-xs font-bold font-mono uppercase tracking-wider hover:bg-[#f2aba3] transition shadow-md shadow-rose-950"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* Fallback Role Switcher Button */}
                <button
                  onClick={toggleRole}
                  title={`Currently in ${role.toUpperCase()} mode. Click to toggle.`}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all duration-300 ${
                    isAdmin
                      ? 'bg-[#2a1725] text-[#e89a92] border-[#e89a92]/60 hover:border-[#e89a92]'
                      : 'bg-[#1e131b] text-[#faf3ee] border-[#382332] hover:border-[#4e3346]'
                  }`}
                >
                  {isAdmin ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#e89a92]" />
                      <span>Admin</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-[#e89a92]" />
                      <span>Student</span>
                    </>
                  )}
                  <span className="text-[10px] text-[#a89490] font-mono pl-1 border-l border-[#382332]">
                    Switch
                  </span>
                </button>

                {/* Quick Auth Modal Trigger for testing Supabase credentials */}
                <button
                  onClick={onOpenAuthModal}
                  title="Test or Connect Supabase Account"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#a89490] hover:text-[#faf3ee] hover:bg-[#1f141d] border border-transparent hover:border-[#382332] transition"
                >
                  <User className="w-3.5 h-3.5 text-[#e89a92]" />
                  <span>Auth</span>
                </button>
              </div>
            )}

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset events and mock data to initial defaults?')) {
                  resetAllData();
                }
              }}
              title="Reset mock events to defaults"
              className="p-2.5 text-[#a89490] hover:text-[#faf3ee] hover:bg-[#1f141d] rounded-xl border border-transparent hover:border-[#382332] transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-[#291a26] text-xs font-semibold uppercase tracking-wider scrollbar-none">
          <Link
            to="/events"
            className={`px-3 py-1.5 rounded-lg shrink-0 ${
              isActive('/events') ? 'bg-[#291b26] text-[#e89a92]' : 'text-[#a89490]'
            }`}
          >
            Explore
          </Link>
          <Link
            to="/saved"
            className={`px-3 py-1.5 rounded-lg shrink-0 ${
              isActive('/saved') ? 'bg-[#291b26] text-[#e89a92]' : 'text-[#a89490]'
            }`}
          >
            Saved ({bookmarkCount})
          </Link>
          <Link
            to="/my-registrations"
            className={`px-3 py-1.5 rounded-lg shrink-0 ${
              isActive('/my-registrations') ? 'bg-[#291b26] text-[#e89a92]' : 'text-[#a89490]'
            }`}
          >
            My Passes ({registrations.length})
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg shrink-0 ${
                isActive('/admin') ? 'bg-[#e89a92] text-[#120c10]' : 'text-[#e89a92]'
              }`}
            >
              Admin Studio
            </Link>
          )}
          <button
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 rounded-lg shrink-0 text-[#e89a92] bg-[#291b26]"
          >
            {user ? 'Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </header>
  );
}
