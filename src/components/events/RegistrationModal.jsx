import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Ticket, 
  QrCode, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { formatDate, calculateSpotsLeft } from '../../utils/formatters';
import { useRegistrations } from '../../context/RegistrationContext';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EMAIL_REGEX } from '../../utils/validation';

export default function RegistrationModal({ event, isOpen, onClose }) {
  const { events } = useEvents();
  const { currentStudent } = useAuth();
  const { register, isRegisteredForEvent } = useRegistrations();
  const navigate = useNavigate();

  // Selected event state: allows selecting or changing event in the form
  const [selectedEventId, setSelectedEventId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    department: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);

  // Synchronize initial event selection & default form values
  useEffect(() => {
    if (isOpen) {
      const defaultId = event?.id || (events.length > 0 ? events[0].id : '');
      setSelectedEventId(defaultId);
      setFormData({
        name: currentStudent.name || '',
        email: currentStudent.email || '',
        rollNo: currentStudent.rollNo || '',
        department: currentStudent.department || 'Computer Science',
      });
      setFieldErrors({});
      setGeneralError('');
      setSuccessTicket(null);
    }
  }, [isOpen, event, currentStudent, events]);

  if (!isOpen) return null;

  // Active target event based on user selection in the form
  const currentEvent = events.find((e) => e.id === selectedEventId) || event || events[0];
  const spotsLeft = currentEvent ? calculateSpotsLeft(currentEvent) : 0;
  const isDuplicate = currentEvent && formData.email
    ? isRegisteredForEvent(currentEvent.id, formData.email.trim())
    : false;

  const validateForm = () => {
    const errors = {};

    if (!selectedEventId) {
      errors.event = 'Please select an event to register for.';
    }

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@campus.edu).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    if (!currentEvent) {
      setGeneralError('Invalid event selection.');
      return;
    }

    if (spotsLeft <= 0) {
      setGeneralError('This event is fully booked. Maximum capacity reached.');
      return;
    }

    if (isDuplicate) {
      setGeneralError('You are already registered for this event with this email.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      eventId: currentEvent.id,
      studentName: formData.name.trim(),
      studentEmail: formData.email.trim(),
      studentRollNo: formData.rollNo.trim(),
      department: formData.department.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessTicket(result.registration);
    } else {
      setGeneralError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="relative p-6 bg-gradient-to-tr from-brand-900 via-indigo-900 to-brand-800 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-8">
            <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/20 text-indigo-100 backdrop-blur-md mb-2">
              {currentEvent ? currentEvent.category : 'Campus Event'}
            </span>
            <h2 className="text-xl font-bold leading-snug mb-1">
              Event Registration
            </h2>
            <p className="text-xs text-indigo-200">
              {currentEvent ? currentEvent.title : 'Reserve your student seat'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {successTicket ? (
            /* Success Confirmation Screen */
            <div className="text-center py-4 space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Registration Successful!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your seat has been reserved and your admission ticket has been saved to <strong>My Registrations</strong>.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="bg-slate-50 border border-dashed border-brand-300 rounded-2xl p-5 text-left relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                      Admission Pass
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                      {successTicket.eventTitle || currentEvent?.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Attendee: <strong className="text-slate-800">{successTicket.studentName}</strong>
                    </p>
                    <p className="text-xs text-slate-500">
                      Email: {successTicket.studentEmail}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                    <QrCode className="w-10 h-10 text-brand-700" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pass Reference:</span>
                  <span className="font-mono font-bold text-brand-700">{successTicket.ticketCode}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/my-registrations');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition flex items-center justify-center gap-1.5 shadow-sm shadow-brand-600/20"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  View in My Passes
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {generalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {isDuplicate && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    You have already registered for this event with <strong>{formData.email}</strong>.
                  </span>
                </div>
              )}

              {/* 1. Event Selection Input */}
              <div>
                <label htmlFor="event-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Selection <span className="text-rose-500">*</span>
                </label>
                <select
                  id="event-select"
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setGeneralError('');
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white cursor-pointer transition ${
                    fieldErrors.event ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id} className="bg-white text-slate-900">
                      [{evt.category}] {evt.title} ({calculateSpotsLeft(evt)} seats left)
                    </option>
                  ))}
                </select>
                {fieldErrors.event && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.event}</p>
                )}
              </div>

              {/* Event Quick Info Banner */}
              {currentEvent && (
                <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 flex items-center justify-between text-xs text-brand-900">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="truncate">{formatDate(currentEvent.startTime)} • {currentEvent.venue}</span>
                  </div>
                  <span className="font-bold shrink-0 ml-2">
                    {spotsLeft} seat{spotsLeft === 1 ? '' : 's'} left
                  </span>
                </div>
              )}

              {/* 2. Student Full Name */}
              <div>
                <label htmlFor="student-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                  }}
                  placeholder="e.g. Alex Rivers"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition ${
                    fieldErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* 3. Student College Email */}
              <div>
                <label htmlFor="student-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  placeholder="e.g. alex.rivers@campus.edu"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition ${
                    fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Optional Roll Number & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="student-roll" className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID / Roll No
                  </label>
                  <input
                    id="student-roll"
                    type="text"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. CS-2023-042"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label htmlFor="student-dept" className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    id="student-dept"
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || spotsLeft <= 0}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-md transition flex items-center justify-center gap-2 ${
                    spotsLeft <= 0
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/25'
                  }`}
                >
                  {isSubmitting ? (
                    'Processing Registration...'
                  ) : spotsLeft <= 0 ? (
                    'Event Fully Booked'
                  ) : (
                    <>
                      Confirm Free Registration
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                Registrations are saved to your browser and pass codes are issued instantly.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
