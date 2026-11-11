/**
 * Registration Service: Handles student registrations, atomic capacity checks, and Supabase RPC
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { StorageService } from './storage.js';
import { EventService } from './eventService.js';
import { generateTicketCode } from '../utils/formatters.js';
import { EMAIL_REGEX } from '../utils/validation.js';

export const mapRegistrationFromDb = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    studentRollNo: row.student_roll_no,
    department: row.department,
    ticketCode: row.ticket_code,
    status: row.status,
    registeredAt: row.registered_at,
  };
};

export const RegistrationService = {
  async getAllRegistrations() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*, events(title)')
          .order('registered_at', { ascending: false });

        if (error) {
          console.error('Supabase getAllRegistrations error:', error);
          return StorageService.getRegistrations();
        }
        return data.map((r) => ({
          ...mapRegistrationFromDb(r),
          eventTitle: r.events?.title || 'Campus Event',
        }));
      } catch (err) {
        console.error('Failed to get registrations from Supabase:', err);
        return StorageService.getRegistrations();
      }
    }
    return StorageService.getRegistrations();
  },

  async getRegistrationsByEventId(eventId) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', eventId);
        if (error) throw error;
        return data.map(mapRegistrationFromDb);
      } catch (err) {
        console.error('Failed to get registrations by eventId:', err);
      }
    }
    const all = StorageService.getRegistrations();
    return all.filter((r) => r.eventId === eventId);
  },

  async isRegistered(eventId, email) {
    if (!eventId || !email) return false;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', eventId)
          .eq('student_email', email.trim().toLowerCase())
          .maybeSingle();

        if (error) throw error;
        return !!data;
      } catch {
        // Fall back to local check if query fails
      }
    }
    const all = StorageService.getRegistrations();
    return all.some(
      (r) => r.eventId === eventId && r.studentEmail.toLowerCase() === email.trim().toLowerCase()
    );
  },

  async registerStudent({ eventId, studentName, studentEmail, studentRollNo, department }) {
    if (!eventId) {
      throw new Error('Please select an event.');
    }
    if (!studentName || !studentName.trim()) {
      throw new Error('Student name is required.');
    }
    if (!studentEmail || !studentEmail.trim()) {
      throw new Error('Student email is required.');
    }
    const cleanEmail = studentEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      throw new Error('Please provide a valid email address (e.g. name@campus.edu).');
    }

    if (isSupabaseConfigured() && supabase) {
      // Use atomic RPC stored procedure in PostgreSQL
      const { data, error } = await supabase.rpc('register_for_event', {
        p_event_id: eventId,
        p_student_name: studentName.trim(),
        p_student_roll_no: studentRollNo?.trim() || 'STU-' + Math.floor(1000 + Math.random() * 9000),
        p_department: department?.trim() || 'General',
      });

      if (error) {
        throw new Error(error.message);
      }
      return mapRegistrationFromDb(data);
    }

    // Fallback to local storage
    const event = await EventService.getEventById(eventId);
    if (!event) {
      throw new Error('Selected event does not exist.');
    }

    if (event.registeredCount >= event.maxCapacity) {
      throw new Error('This event is fully booked. Maximum capacity reached.');
    }

    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    if (now > deadline) {
      throw new Error('Registration deadline for this event has passed.');
    }

    const allRegs = StorageService.getRegistrations();
    const isDuplicate = allRegs.some(
      (r) => r.eventId === eventId && r.studentEmail.toLowerCase() === cleanEmail
    );

    if (isDuplicate) {
      throw new Error('You have already registered for this event with this email.');
    }

    const rollNumber = studentRollNo?.trim() || 'STU-' + Math.floor(1000 + Math.random() * 9000);
    const ticketCode = generateTicketCode(eventId, rollNumber);

    const newRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      eventTitle: event.title,
      studentName: studentName.trim(),
      studentEmail: cleanEmail,
      studentRollNo: rollNumber,
      department: department?.trim() || 'General',
      ticketCode,
      status: 'confirmed',
      registeredAt: new Date().toISOString(),
    };

    StorageService.saveRegistrations([newRegistration, ...allRegs]);
    await EventService.incrementRegisteredCount(eventId);
    return newRegistration;
  },

  async cancelRegistration(registrationId) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId);

      if (error) throw new Error(error.message);
      return true;
    }

    const allRegs = StorageService.getRegistrations();
    const target = allRegs.find((r) => r.id === registrationId);
    if (!target) return false;

    const filtered = allRegs.filter((r) => r.id !== registrationId);
    StorageService.saveRegistrations(filtered);
    await EventService.decrementRegisteredCount(target.eventId);
    return true;
  }
};
