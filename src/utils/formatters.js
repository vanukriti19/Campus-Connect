/**
 * Date and data formatting utilities for CampusConnect
 */

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function getEventStatus(event) {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const deadline = new Date(event.registrationDeadline);

  if (event.status === 'cancelled') {
    return { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200' };
  }
  if (now > endTime) {
    return { label: 'Completed', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
  if (now >= startTime && now <= endTime) {
    return { label: 'Ongoing Now', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  }
  if (event.registeredCount >= event.maxCapacity) {
    return { label: 'Sold Out', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
  if (now > deadline) {
    return { label: 'Registration Closed', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  }
  return { label: 'Registration Open', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
}

export function isRegistrationAllowed(event) {
  if (!event) return false;
  const now = new Date();
  const deadline = new Date(event.registrationDeadline);
  const endTime = new Date(event.endTime);

  if (event.status === 'cancelled') return false;
  if (now > deadline || now > endTime) return false;
  if (event.registeredCount >= event.maxCapacity) return false;

  return true;
}

export function calculateSpotsLeft(event) {
  if (!event) return 0;
  return Math.max(0, event.maxCapacity - (event.registeredCount || 0));
}

export function generateTicketCode(eventId, studentId) {
  const prefix = 'CC';
  const eventPart = (eventId || '').slice(0, 4).toUpperCase();
  const studentPart = (studentId || '').slice(-4).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${eventPart}-${studentPart || rand}`;
}
