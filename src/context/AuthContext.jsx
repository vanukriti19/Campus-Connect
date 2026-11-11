import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { StorageService } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [supabaseMode] = useState(() => isSupabaseConfigured());
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local fallback role
  const [localRole, setLocalRole] = useState(() => StorageService.getActiveRole());
  const [currentStudent, setCurrentStudent] = useState({
    name: 'Alex Rivers',
    email: 'alex.rivers@campus.edu',
    rollNo: 'CS-2023-042',
    department: 'Computer Science',
  });

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('fetchProfile error:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabaseMode || !supabase) {
      setLoading(false);
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      if (initialSession?.user) {
        const userProfile = await fetchProfile(initialSession.user.id);
        setProfile(userProfile);
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      if (newSession?.user) {
        const userProfile = await fetchProfile(newSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabaseMode, fetchProfile]);

  // Auth Operations
  const signUp = async ({ email, password, fullName, rollNo, department, role = 'student' }) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          roll_no: rollNo,
          department,
          role,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async ({ email, password }) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  // Active Role Resolution: Supabase profile role > Local fallback
  const role = supabaseMode && profile?.role ? profile.role : localRole;
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  const toggleRole = () => {
    const nextRole = localRole === 'student' ? 'admin' : 'student';
    setLocalRole(nextRole);
    StorageService.saveActiveRole(nextRole);
  };

  const setSpecificRole = (newRole) => {
    setLocalRole(newRole);
    StorageService.saveActiveRole(newRole);
  };

  const updateStudentProfile = (updated) => {
    setCurrentStudent((prev) => ({ ...prev, ...updated }));
  };

  const activeStudentInfo = supabaseMode && profile
    ? {
        name: profile.full_name,
        email: profile.email,
        rollNo: profile.roll_no || 'STU-001',
        department: profile.department || 'General',
      }
    : currentStudent;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        role,
        isAdmin,
        isStudent,
        isSupabaseMode: supabaseMode,
        signUp,
        signIn,
        signOut,
        toggleRole,
        setRole: setSpecificRole,
        currentStudent: activeStudentInfo,
        updateStudentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
