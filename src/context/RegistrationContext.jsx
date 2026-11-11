import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RegistrationService } from '../services/registrationService';
import { StorageService, STORAGE_KEYS } from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const [registrations, setRegistrations] = useState(() => StorageService.getRegistrations());
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const refreshRegistrations = useCallback(async () => {
    try {
      const data = await RegistrationService.getAllRegistrations();
      if (Array.isArray(data)) {
        setRegistrations(data);
      }
    } catch (err) {
      console.error('refreshRegistrations error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshRegistrations();
  }, [refreshRegistrations]);

  // Local storage listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.key || e.key === STORAGE_KEYS.REGISTRATIONS) {
        refreshRegistrations();
      }
    };
    const handleReset = () => {
      refreshRegistrations();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('campusconnect:data-reset', handleReset);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('campusconnect:data-reset', handleReset);
    };
  }, [refreshRegistrations]);

  // Realtime subscription (Supabase)
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel('public:registrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          refreshRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshRegistrations]);

  const register = useCallback(
    async (registrationPayload) => {
      try {
        const newRecord = await RegistrationService.registerStudent(registrationPayload);
        await refreshRegistrations();

        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.65 },
          });
        } catch {
          // ignore if canvas not supported
        }

        addToast('Registration confirmed! Pass generated.', 'success');
        return { success: true, registration: newRecord };
      } catch (err) {
        addToast(err.message || 'Registration failed', 'error');
        return { success: false, error: err.message };
      }
    },
    [addToast, refreshRegistrations]
  );

  const cancelRegistration = useCallback(
    async (registrationId) => {
      try {
        const ok = await RegistrationService.cancelRegistration(registrationId);
        if (ok) {
          await refreshRegistrations();
          addToast('Registration was cancelled.', 'info');
        }
        return ok;
      } catch (err) {
        addToast(err.message || 'Failed to cancel registration', 'error');
        return false;
      }
    },
    [addToast, refreshRegistrations]
  );

  const isRegisteredForEvent = useCallback(
    (eventId, email) => {
      if (!email) return false;
      return registrations.some(
        (r) => r.eventId === eventId && r.studentEmail?.toLowerCase() === email.toLowerCase()
      );
    },
    [registrations]
  );

  const getRegistrationsByEvent = useCallback(
    (eventId) => {
      return registrations.filter((r) => r.eventId === eventId);
    },
    [registrations]
  );

  return (
    <RegistrationContext.Provider
      value={{
        registrations,
        loading,
        register,
        cancelRegistration,
        isRegisteredForEvent,
        getRegistrationsByEvent,
        refreshRegistrations,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistrations() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistrations must be used within a RegistrationProvider');
  }
  return context;
}
