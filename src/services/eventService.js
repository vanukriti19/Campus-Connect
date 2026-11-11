/**
 * Event Service: Supabase PostgREST async queries with localStorage fallback
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { StorageService } from './storage.js';

export const mapEventFromDb = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    organizerId: row.organizer_id,
    title: row.title,
    description: row.description,
    category: row.category,
    venue: row.venue,
    isVirtual: row.is_virtual,
    startTime: row.start_time,
    endTime: row.end_time,
    registrationDeadline: row.registration_deadline,
    maxCapacity: row.max_capacity,
    registeredCount: row.registered_count || 0,
    bannerUrl: row.banner_url,
    organizerName: row.organizer_name,
    organizerEmail: row.organizer_email,
    status: row.status,
    tags: row.tags || [],
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const mapEventToDb = (event) => ({
  title: event.title,
  description: event.description,
  category: event.category,
  venue: event.venue,
  is_virtual: !!event.isVirtual,
  start_time: event.startTime,
  end_time: event.endTime,
  registration_deadline: event.registrationDeadline,
  max_capacity: Number(event.maxCapacity),
  banner_url: event.bannerUrl,
  organizer_name: event.organizerName,
  organizer_email: event.organizerEmail,
  status: event.status || 'published',
  tags: event.tags || [],
  featured: !!event.featured,
});

export const EventService = {
  async getAllEvents() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Supabase getAllEvents error:', error);
          return StorageService.getEvents();
        }
        return data.map(mapEventFromDb);
      } catch (err) {
        console.error('Failed to fetch from Supabase:', err);
        return StorageService.getEvents();
      }
    }
    return StorageService.getEvents();
  },

  async getEventById(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Supabase getEventById error:', error);
          const localEvents = StorageService.getEvents();
          return localEvents.find((e) => e.id === id) || null;
        }
        return mapEventFromDb(data);
      } catch (err) {
        console.error('Failed getEventById from Supabase:', err);
      }
    }
    const events = StorageService.getEvents();
    return events.find((e) => e.id === id) || null;
  },

  async createEvent(eventData) {
    if (isSupabaseConfigured() && supabase) {
      const payload = mapEventToDb(eventData);
      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapEventFromDb(data);
    }

    const events = StorageService.getEvents();
    const newEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      registeredCount: 0,
      status: eventData.status || 'published',
      createdAt: new Date().toISOString(),
    };
    const updated = [newEvent, ...events];
    StorageService.saveEvents(updated);
    return newEvent;
  },

  async updateEvent(id, updatedFields) {
    if (isSupabaseConfigured() && supabase) {
      const dbPayload = {};
      if (updatedFields.title !== undefined) dbPayload.title = updatedFields.title;
      if (updatedFields.description !== undefined) dbPayload.description = updatedFields.description;
      if (updatedFields.category !== undefined) dbPayload.category = updatedFields.category;
      if (updatedFields.venue !== undefined) dbPayload.venue = updatedFields.venue;
      if (updatedFields.isVirtual !== undefined) dbPayload.is_virtual = updatedFields.isVirtual;
      if (updatedFields.startTime !== undefined) dbPayload.start_time = updatedFields.startTime;
      if (updatedFields.endTime !== undefined) dbPayload.end_time = updatedFields.endTime;
      if (updatedFields.registrationDeadline !== undefined) dbPayload.registration_deadline = updatedFields.registrationDeadline;
      if (updatedFields.maxCapacity !== undefined) dbPayload.max_capacity = Number(updatedFields.maxCapacity);
      if (updatedFields.bannerUrl !== undefined) dbPayload.banner_url = updatedFields.bannerUrl;
      if (updatedFields.organizerName !== undefined) dbPayload.organizer_name = updatedFields.organizerName;
      if (updatedFields.organizerEmail !== undefined) dbPayload.organizer_email = updatedFields.organizerEmail;
      if (updatedFields.status !== undefined) dbPayload.status = updatedFields.status;
      if (updatedFields.tags !== undefined) dbPayload.tags = updatedFields.tags;
      if (updatedFields.featured !== undefined) dbPayload.featured = updatedFields.featured;

      const { data, error } = await supabase
        .from('events')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapEventFromDb(data);
    }

    const events = StorageService.getEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    const updated = {
      ...events[index],
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    events[index] = updated;
    StorageService.saveEvents(events);
    return updated;
  },

  async deleteEvent(id) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return true;
    }

    const events = StorageService.getEvents();
    const filteredEvents = events.filter((e) => e.id !== id);
    StorageService.saveEvents(filteredEvents);

    const registrations = StorageService.getRegistrations();
    const filteredRegistrations = registrations.filter((r) => r.eventId !== id);
    StorageService.saveRegistrations(filteredRegistrations);

    const bookmarks = StorageService.getBookmarks();
    const filteredBookmarks = bookmarks.filter((bId) => bId !== id);
    StorageService.saveBookmarks(filteredBookmarks);

    return true;
  },

  async incrementRegisteredCount(id) {
    if (isSupabaseConfigured() && supabase) {
      return true;
    }
    const events = StorageService.getEvents();
    const event = events.find((e) => e.id === id);
    if (event) {
      event.registeredCount = (event.registeredCount || 0) + 1;
      StorageService.saveEvents(events);
      return event.registeredCount;
    }
    return 0;
  },

  async decrementRegisteredCount(id) {
    if (isSupabaseConfigured() && supabase) {
      return true;
    }
    const events = StorageService.getEvents();
    const event = events.find((e) => e.id === id);
    if (event && event.registeredCount > 0) {
      event.registeredCount = event.registeredCount - 1;
      StorageService.saveEvents(events);
      return event.registeredCount;
    }
    return 0;
  }
};
