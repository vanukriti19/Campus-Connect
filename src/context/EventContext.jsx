import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { EventService } from '../services/eventService';
import { StorageService, STORAGE_KEYS } from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useToast } from './ToastContext';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState(() => StorageService.getEvents());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'upcoming', 'past', 'available'
  const [sortBy, setSortBy] = useState('date-asc'); // 'date-asc', 'date-desc', 'popular', 'title'
  const { addToast } = useToast();

  const reloadEvents = useCallback(async () => {
    try {
      const data = await EventService.getAllEvents();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Error in reloadEvents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    reloadEvents();
  }, [reloadEvents]);

  // Multi-tab storage listener (for localStorage mode)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.key || e.key === STORAGE_KEYS.EVENTS) {
        reloadEvents();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [reloadEvents]);

  // Supabase Realtime channel subscription (for live events sync)
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel('public:events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          reloadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reloadEvents]);

  // CRUD Operations
  const createEvent = useCallback(async (eventData) => {
    try {
      const created = await EventService.createEvent(eventData);
      await reloadEvents();
      addToast(`Event "${created.title}" successfully created!`, 'success');
      return { success: true, event: created };
    } catch (err) {
      addToast(err.message || 'Failed to create event', 'error');
      return { success: false, error: err.message };
    }
  }, [addToast, reloadEvents]);

  const updateEvent = useCallback(async (id, updatedData) => {
    try {
      const updated = await EventService.updateEvent(id, updatedData);
      await reloadEvents();
      addToast('Event updated successfully.', 'success');
      return { success: true, event: updated };
    } catch (err) {
      addToast(err.message || 'Failed to update event', 'error');
      return { success: false, error: err.message };
    }
  }, [addToast, reloadEvents]);

  const deleteEvent = useCallback(async (id) => {
    try {
      const target = events.find((e) => e.id === id);
      await EventService.deleteEvent(id);
      await reloadEvents();
      addToast(`Deleted event: "${target ? target.title : 'Event'}"`, 'info');
      return { success: true };
    } catch (err) {
      addToast(err.message || 'Failed to delete event', 'error');
      return { success: false, error: err.message };
    }
  }, [events, addToast, reloadEvents]);

  const resetAllData = useCallback(() => {
    const { events: resetEvents } = StorageService.resetToDefaults();
    setEvents(resetEvents);
    window.dispatchEvent(new CustomEvent('campusconnect:data-reset'));
    addToast('Restored default demo events and reset database.', 'info');
  }, [addToast]);

  // Filtered & Sorted events calculation
  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      // 1. Search by event title
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = event.title?.toLowerCase().includes(query);
        if (!inTitle) {
          return false;
        }
      }

      // 2. Category Filter (Technical, Cultural, Sports, Workshop)
      if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
        if (event.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        const isPast = now > new Date(event.endTime) || event.status === 'completed';
        const isFull = event.registeredCount >= event.maxCapacity;

        if (statusFilter === 'upcoming' && isPast) return false;
        if (statusFilter === 'past' && !isPast) return false;
        if (statusFilter === 'available' && (isPast || isFull)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.startTime) - new Date(b.startTime);
      }
      if (sortBy === 'date-desc') {
        return new Date(b.startTime) - new Date(a.startTime);
      }
      if (sortBy === 'popular') {
        return (b.registeredCount || 0) - (a.registeredCount || 0);
      }
      if (sortBy === 'title') {
        return a.title?.localeCompare(b.title);
      }
      return 0;
    });
  }, [events, searchQuery, selectedCategory, statusFilter, sortBy]);

  const getEventById = useCallback(
    (id) => events.find((e) => e.id === id) || null,
    [events]
  );

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        filteredEvents,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        createEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        reloadEvents,
        resetAllData,
        totalEventsCount: events.length,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
