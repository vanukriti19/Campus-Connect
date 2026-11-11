import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  QrCode, 
  Trash2, 
  ArrowUpRight
} from 'lucide-react';
import { useRegistrations } from '../context/RegistrationContext';
import { useEvents } from '../context/EventContext';
import { formatDate, formatTime } from '../utils/formatters';
import ConfirmationModal from '../components/common/ConfirmationModal';

export default function MyRegistrationsPage() {
  const { registrations, cancelRegistration } = useRegistrations();
  const { getEventById } = useEvents();

  const [cancelModalState, setCancelModalState] = useState({
    isOpen: false,
    registrationId: null,
    eventTitle: '',
  });

  const handleOpenCancel = (reg, eventTitle) => {
    setCancelModalState({
      isOpen: true,
      registrationId: reg.id,
      eventTitle: eventTitle || 'this event',
    });
  };

  const handleConfirmCancel = () => {
    if (cancelModalState.registrationId) {
      cancelRegistration(cancelModalState.registrationId);
    }
    setCancelModalState({ isOpen: false, registrationId: null, eventTitle: '' });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#382332]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e131b] text-[#e89a92] text-xs font-mono uppercase tracking-widest mb-3 border border-[#382332]">
            <Ticket className="w-3.5 h-3.5" />
            <span>Digital Admission Credentials</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#faf3ee]">
            My Registered Passes
          </h1>
          <p className="text-sm text-[#bdaaa2] font-light mt-1">
            Access your admission credentials, present pass codes at the entrance, or release bookings.
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] text-[#120c10] hover:bg-[#f2aba3] transition shadow-md shadow-rose-950"
        >
          Discover More Events
        </Link>
      </div>

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="bg-[#1a1117] rounded-3xl border border-dashed border-[#382332] p-12 text-center max-w-md mx-auto my-12 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#241822] text-[#e89a92] border border-[#382332] flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#faf3ee] mb-2">
            No Active Passes
          </h3>
          <p className="text-sm text-[#bdaaa2] mb-6 leading-relaxed font-light">
            You haven't registered for any campus events yet. Explore upcoming hackathons, fests, and workshops to book your spot!
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] text-[#120c10] hover:bg-[#f2aba3] transition"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {registrations.map((reg) => {
            const event = getEventById(reg.eventId);

            return (
              <div
                key={reg.id}
                className="bg-[#1a1117] rounded-3xl border border-[#382332] overflow-hidden shadow-2xl hover:border-[#e89a92] transition-all flex flex-col justify-between"
              >
                {/* Ticket Top: Event Details */}
                <div className="p-7">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="inline-block px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg bg-[#241822] text-[#e89a92] border border-[#382332] mb-2">
                        {event ? event.category : 'Campus Event'}
                      </span>
                      <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#faf3ee] line-clamp-2 leading-tight">
                        {event ? event.title : reg.eventTitle || 'Event'}
                      </h3>
                    </div>
                    <div className="px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest bg-[#2e1d2c] text-[#e89a92] border border-[#e89a92]/40 shrink-0">
                      Confirmed
                    </div>
                  </div>

                  {event && (
                    <div className="space-y-2 text-xs font-mono text-[#bdaaa2] my-4 bg-[#241822] p-4 rounded-2xl border border-[#382332]">
                      <div className="flex items-center gap-2 text-[#faf3ee]">
                        <Calendar className="w-4 h-4 text-[#e89a92] shrink-0" />
                        <span>{formatDate(event.startTime)} • {formatTime(event.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#a89490] shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  )}

                  {/* Student Attendee Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-[#382332]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#a89490] block">Attendee</span>
                      <strong className="text-[#faf3ee] font-sans">{reg.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#a89490] block">Email Reference</span>
                      <span className="text-[#bdaaa2] font-mono text-[11px] truncate block">{reg.studentEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Perforated Stub Divider */}
                <div className="relative flex items-center px-4">
                  <div className="w-4 h-8 bg-[#120c10] rounded-r-full -ml-4 border-r border-[#382332]" />
                  <div className="flex-1 border-b-2 border-dashed border-[#382332] mx-2" />
                  <div className="w-4 h-8 bg-[#120c10] rounded-l-full -mr-4 border-l border-[#382332]" />
                </div>

                {/* Ticket Bottom: QR Stub & Actions */}
                <div className="p-6 bg-[#241822] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1a1117] rounded-xl border border-[#382332] flex items-center justify-center text-[#e89a92] shadow-sm">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#a89490] block">
                        Ticket Code
                      </span>
                      <span className="font-mono text-xs font-bold text-[#e89a92]">
                        {reg.ticketCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {event && (
                      <Link
                        to={`/events/${event.id}`}
                        className="p-2.5 text-[#a89490] hover:text-[#faf3ee] hover:bg-[#1a1117] rounded-xl border border-transparent hover:border-[#382332] transition"
                        title="View event briefing"
                      >
                        <ArrowUpRight className="w-4 h-4 text-[#e89a92]" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenCancel(reg, event?.title)}
                      className="p-2.5 text-[#a89490] hover:text-[#df7e74] hover:bg-rose-950/30 rounded-xl transition"
                      title="Cancel pass"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalState.isOpen}
        title="Cancel Registration"
        message={`Are you sure you want to release your admission pass for "${cancelModalState.eventTitle}"? Your seat will be returned to the campus pool.`}
        confirmText="Release Pass"
        cancelText="Keep Pass"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalState({ isOpen: false, registrationId: null, eventTitle: '' })}
      />
    </div>
  );
}
