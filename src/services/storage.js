/**
 * LocalStorage Data Access Layer with schema seeding and validation
 */

import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_BOOKMARKS } from './mockData.js';

export const STORAGE_KEYS = {
  EVENTS: 'campusconnect_events_v2',
  REGISTRATIONS: 'campusconnect_registrations_v2',
  BOOKMARKS: 'campusconnect_bookmarks_v2',
  ACTIVE_ROLE: 'campusconnect_active_role_v1',
};

export const StorageService = {
  // --- EVENTS ---
  getEvents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        this.saveEvents(INITIAL_EVENTS);
        return INITIAL_EVENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading events from localStorage:', e);
      return INITIAL_EVENTS;
    }
  },

  saveEvents(events) {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Failed saving events to localStorage:', e);
    }
  },

  // --- REGISTRATIONS ---
  getRegistrations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      if (!data) {
        this.saveRegistrations(INITIAL_REGISTRATIONS);
        return INITIAL_REGISTRATIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading registrations from localStorage:', e);
      return INITIAL_REGISTRATIONS;
    }
  },

  saveRegistrations(registrations) {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    } catch (e) {
      console.error('Failed saving registrations to localStorage:', e);
    }
  },

  // --- BOOKMARKS ---
  getBookmarks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (!data) {
        this.saveBookmarks(INITIAL_BOOKMARKS);
        return INITIAL_BOOKMARKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading bookmarks from localStorage:', e);
      return INITIAL_BOOKMARKS;
    }
  },

  saveBookmarks(bookmarks) {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed saving bookmarks to localStorage:', e);
    }
  },

  // --- ROLE ---
  getActiveRole() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) || 'student';
    } catch {
      return 'student';
    }
  },

  saveActiveRole(role) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    } catch (e) {
      console.error('Failed saving role:', e);
    }
  },

  // --- RESET UTILITY ---
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.REGISTRATIONS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    this.saveEvents(INITIAL_EVENTS);
    this.saveRegistrations(INITIAL_REGISTRATIONS);
    this.saveBookmarks(INITIAL_BOOKMARKS);
    return {
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      bookmarks: INITIAL_BOOKMARKS,
    };
  }
};
