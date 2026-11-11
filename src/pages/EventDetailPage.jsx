import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bookmark, 
  Share2, 
  CheckCircle2, 
  Mail, 
  Tag, 
  ShieldCheck, 
  Edit3, 
  Trash2,
  Ticket
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useRegistrations } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, formatTime, getEventStatus, calculateSpotsLeft, isRegistrationAllowed } from '../utils/formatters';

export default function EventDetailPage({ onRegisterClick, onEditClick, onDeleteClick, onViewAttendeesClick }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById } = useEvents();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isRegisteredForEvent } = useRegistrations();
  const { currentStudent, isAdmin } = useAuth();
  const { addToast } = useToast();

  const event = getEventById(id);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!event) return;

    const calculateCountdown = () => {
      const difference = +new Date(event.startTime) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-[#faf3ee] mb-2">
          Event Not Found
        </h2>
        <p className="text-sm text-[#bdaaa2] mb-8 font-light">
          The requested campus event may have been removed or does not exist.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e89a92] text-[#120c10] text-xs font-mono uppercase tracking-wider font-bold hover:bg-[#f2aba3] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Archive
        </Link>
      </div>
    );
  }

  const saved = isBookmarked(event.id);
  const registered = isRegisteredForEvent(event.id, currentStudent.email);
  const status = getEventStatus(event);
  const spotsLeft = calculateSpotsLeft(event);
  const canRegister = isRegistrationAllowed(event);
  const capacityPercent = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / event.maxCapacity) * 100)
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} on CampusConnect!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Event link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* Editorial Navigation Top */}
      <div className="flex items-center justify-between border-b border-[#382332] pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#a89490] hover:text-[#faf3ee] transition"
        >
          <ArrowLeft className="w-4 h-4 text-[#e89a92]" />
          Back to Catalog
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1117] border border-[#382332] text-[#faf3ee] hover:border-[#e89a92] text-xs font-mono uppercase tracking-wider transition"
          >
            <Share2 className="w-3.5 h-3.5 text-[#e89a92]" />
            Share
          </button>

          <button
            type="button"
            onClick={() => toggleBookmark(event)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider transition ${
              saved
                ? 'bg-[#e89a92] text-[#120c10] border-[#e89a92] font-bold'
                : 'bg-[#1a1117] text-[#faf3ee] border-[#382332] hover:border-[#e89a92]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : 'text-[#e89a92]'}`} />
            {saved ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#382332] bg-[#1a1117] min-h-[380px] flex flex-col justify-end p-8 sm:p-12 shadow-2xl">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120c10] via-[#120c10]/70 to-transparent" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 text-xs font-mono uppercase tracking-widest font-bold rounded-lg bg-[#e89a92] text-[#120c10]">
              {event.category}
            </span>
            <span className="px-3.5 py-1 text-xs font-mono uppercase tracking-wider rounded-lg bg-[#120c10]/80 text-[#faf3ee] border border-[#382332]">
              {status.label}
            </span>
            {event.isVirtual && (
              <span className="px-3.5 py-1 text-xs font-mono uppercase tracking-wider rounded-lg bg-[#2e1d2c] text-[#e89a92] border border-[#e89a92]/40">
                Online Session
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#faf3ee] leading-tight">
            {event.title}
          </h1>

          <p className="text-xs font-mono tracking-widest uppercase text-[#a89490]">
            ORGANIZED BY <strong className="text-[#faf3ee]">{event.organizerName}</strong>
          </p>
        </div>
      </div>

      {/* Main Grid: Details Left, Registration Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Countdown Clock (if upcoming) */}
          {new Date(event.startTime) > new Date() && (
            <div className="bg-[#1a1117] border border-[#382332] p-6 rounded-2xl shadow-xl space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#e89a92] block">
                ✦ EVENT COUNTDOWN:
              </span>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-[#241822] border border-[#382332] rounded-xl p-3">
                  <div className="font-display text-3xl sm:text-4xl font-bold text-[#faf3ee]">{timeLeft.days}</div>
                  <div className="text-[10px] font-mono text-[#a89490] uppercase tracking-wider">Days</div>
                </div>
                <div className="bg-[#241822] border border-[#382332] rounded-xl p-3">
                  <div className="font-display text-3xl sm:text-4xl font-bold text-[#faf3ee]">{timeLeft.hours}</div>
                  <div className="text-[10px] font-mono text-[#a89490] uppercase tracking-wider">Hours</div>
                </div>
                <div className="bg-[#241822] border border-[#382332] rounded-xl p-3">
                  <div className="font-display text-3xl sm:text-4xl font-bold text-[#faf3ee]">{timeLeft.minutes}</div>
                  <div className="text-[10px] font-mono text-[#a89490] uppercase tracking-wider">Mins</div>
                </div>
                <div className="bg-[#241822] border border-[#382332] rounded-xl p-3">
                  <div className="font-display text-3xl sm:text-4xl font-bold text-[#e89a92]">{timeLeft.seconds}</div>
                  <div className="text-[10px] font-mono text-[#a89490] uppercase tracking-wider">Secs</div>
                </div>
              </div>
            </div>
          )}

          {/* About Event */}
          <div className="bg-[#1a1117] rounded-2xl border border-[#382332] p-8 shadow-xl space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#faf3ee]">
              Overview & Agenda
            </h2>
            <p className="text-sm sm:text-base text-[#bdaaa2] leading-relaxed whitespace-pre-line font-light">
              {event.description}
            </p>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-6 border-t border-[#382332] flex flex-wrap items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#e89a92] mr-1" />
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-lg bg-[#241822] text-[#faf3ee] border border-[#382332]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Organizer Card */}
          <div className="bg-[#1a1117] rounded-2xl border border-[#382332] p-6 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#a89490] block mb-1">
                HOST ORGANIZER
              </span>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#faf3ee]">{event.organizerName}</h3>
              <p className="text-xs text-[#bdaaa2] font-light mt-0.5">Verified Campus Society & Council</p>
            </div>
            {event.organizerEmail && (
              <a
                href={`mailto:${event.organizerEmail}?subject=Query regarding ${encodeURIComponent(event.title)}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#291b26] hover:bg-[#342231] text-[#faf3ee] border border-[#382332] hover:border-[#e89a92] transition"
              >
                <Mail className="w-3.5 h-3.5 text-[#e89a92]" />
                Inquire
              </a>
            )}
          </div>

          {/* Admin Management Toolbar */}
          {isAdmin && (
            <div className="bg-[#241822] border border-[#e89a92]/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#e89a92] uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Admin Operations Console
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onViewAttendeesClick && onViewAttendeesClick(event)}
                  className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] text-[#120c10] rounded-xl hover:bg-[#f2aba3] transition flex items-center gap-2 shadow-md shadow-rose-950"
                >
                  <Users className="w-3.5 h-3.5" />
                  Roster ({event.registeredCount || 0})
                </button>
                <button
                  type="button"
                  onClick={() => onEditClick && onEditClick(event)}
                  className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold bg-[#1a1117] border border-[#382332] text-[#faf3ee] rounded-xl hover:border-[#e89a92] transition flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Metadata
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteClick && onDeleteClick(event)}
                  className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold bg-[#1a1117] border border-rose-900/60 text-[#df7e74] rounded-xl hover:bg-rose-950/40 transition flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Event
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Logistics & Registration Card) */}
        <div className="space-y-6">
          <div className="bg-[#1a1117] rounded-3xl border border-[#382332] p-8 shadow-2xl space-y-6 sticky top-28">
            
            {/* Date & Location Breakdown */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#241822] border border-[#382332] text-[#e89a92] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#a89490]">Schedule</h4>
                  <p className="text-sm font-bold text-[#faf3ee] mt-0.5">{formatDate(event.startTime)}</p>
                  <p className="text-xs font-mono text-[#bdaaa2]">
                    {formatTime(event.startTime)} – {formatTime(event.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#241822] border border-[#382332] text-[#e89a92] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#a89490]">Location</h4>
                  <p className="text-sm font-bold text-[#faf3ee] mt-0.5">{event.venue}</p>
                  <p className="text-xs text-[#bdaaa2]">
                    {event.isVirtual ? 'Digital Link sent upon confirmation' : 'On-Campus Facility'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#241822] border border-[#382332] text-[#e89a92] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#a89490]">Cutoff</h4>
                  <p className="text-xs font-mono text-[#faf3ee] mt-0.5">
                    {formatDate(event.registrationDeadline)} • {formatTime(event.registrationDeadline)}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="p-4 bg-[#241822] rounded-2xl border border-[#382332] space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs text-[#a89490]">
                <span>CAPACITY:</span>
                <span className="font-bold text-[#faf3ee]">
                  {event.registeredCount || 0} / {event.maxCapacity} ({capacityPercent}%)
                </span>
              </div>
              <div className="w-full bg-[#120c10] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    capacityPercent >= 90 ? 'bg-[#df7e74]' : 'bg-[#e89a92]'
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-[#e89a92] text-right font-bold">
                {spotsLeft === 0 ? 'NO SEATS REMAINING' : `${spotsLeft} SEATS REMAINING`}
              </p>
            </div>

            {/* Registration Action Area */}
            <div>
              {registered ? (
                <div className="p-5 rounded-2xl bg-[#241822] border border-[#e89a92]/60 text-center space-y-3">
                  <div className="w-9 h-9 rounded-full bg-[#e89a92] text-[#120c10] flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold uppercase tracking-tight text-[#faf3ee]">Seat Reserved</h4>
                    <p className="text-xs text-[#bdaaa2] mt-0.5 font-light">
                      Your admission pass has been issued.
                    </p>
                  </div>
                  <Link
                    to="/my-registrations"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] text-[#120c10] hover:bg-[#f2aba3] transition"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    View My Pass
                  </Link>
                </div>
              ) : canRegister ? (
                <button
                  type="button"
                  onClick={() => onRegisterClick(event)}
                  className="w-full py-4 px-4 rounded-2xl text-xs font-mono uppercase tracking-widest font-bold text-[#120c10] bg-[#e89a92] hover:bg-[#f2aba3] transition shadow-xl shadow-rose-950 hover:scale-[1.02]"
                >
                  Register Now (Free)
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 px-4 rounded-2xl text-xs font-mono uppercase tracking-widest font-bold text-[#7e6c69] bg-[#1a1117] cursor-not-allowed border border-[#382332]"
                >
                  {status.label}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
