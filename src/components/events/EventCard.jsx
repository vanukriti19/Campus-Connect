import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Bookmark, 
  ArrowUpRight, 
  Edit3, 
  Trash2, 
  Clock
} from 'lucide-react';
import { formatDate, formatTime, getEventStatus, calculateSpotsLeft, isRegistrationAllowed } from '../../utils/formatters';
import { useBookmarks } from '../../context/BookmarkContext';
import { useAuth } from '../../context/AuthContext';

export default function EventCard({ 
  event, 
  indexNumber,
  onRegisterClick,
  onEditClick,
  onDeleteClick 
}) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isAdmin } = useAuth();
  const saved = isBookmarked(event.id);
  const status = getEventStatus(event);
  const spotsLeft = calculateSpotsLeft(event);
  const canRegister = isRegistrationAllowed(event);
  const capacityPercent = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / event.maxCapacity) * 100)
  );

  return (
    <div className="group bg-[#1a1117] hover:bg-[#22161f] rounded-2xl border border-[#382332] hover:border-[#e89a92] shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Top Numbered Header Bar */}
      <div className="px-5 py-3 border-b border-[#382332] flex items-center justify-between text-xs font-mono text-[#a89490]">
        <div className="flex items-center gap-2">
          {indexNumber && (
            <span className="font-bold text-[#e89a92]">
              {indexNumber.toString().padStart(2, '0')}
            </span>
          )}
          <span className="uppercase tracking-widest text-[#e8ded8]">
            {event.category}
          </span>
        </div>
        
        {/* Bookmark Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(event);
          }}
          title={saved ? 'Remove bookmark' : 'Bookmark this event'}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark this event'}
          className={`p-1.5 rounded-lg border transition-all duration-200 active:scale-95 ${
            saved
              ? 'bg-[#e89a92] text-[#120c10] border-[#e89a92] shadow-sm shadow-[#e89a92]/20'
              : 'border-[#382332] text-[#a89490] hover:text-[#e89a92] hover:border-[#e89a92] hover:bg-[#261823]'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 transition-transform duration-200 ${saved ? 'fill-current scale-105' : ''}`} />
        </button>
      </div>

      {/* Banner & Image Frame */}
      <div className="relative h-48 w-full overflow-hidden bg-[#120c10]">
        <img
          src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1117] via-transparent to-transparent" />

        {/* Status Pill in corner */}
        <div className="absolute bottom-3 left-4">
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md bg-[#120c10]/90 backdrop-blur-md text-[#e89a92] border border-[#e89a92]/40">
            {status.label}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#a89490] mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#e89a92]" />
            <span>{formatDate(event.startTime)}</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5 text-[#a89490]" />
            <span>{formatTime(event.startTime)}</span>
          </div>

          {/* Title */}
          <Link to={`/events/${event.id}`}>
            <h3 className="font-display text-2xl font-bold tracking-tight text-[#faf3ee] group-hover:text-[#e89a92] transition-colors line-clamp-2 leading-tight uppercase mb-2">
              {event.title}
            </h3>
          </Link>

          {/* Venue & Organizer */}
          <div className="space-y-1 text-xs text-[#bdaaa2]">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#e89a92]" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="text-[11px] font-mono text-[#a89490]">
              HOST: {event.organizerName}
            </div>
          </div>
        </div>

        {/* Capacity Bar & Actions Footer */}
        <div className="pt-3 border-t border-[#382332]">
          <div className="flex items-center justify-between text-xs font-mono text-[#a89490] mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#e89a92]" />
              <span>{event.registeredCount || 0} filled</span>
            </span>
            <span className={`font-semibold ${spotsLeft <= 5 && spotsLeft > 0 ? 'text-[#e89a92]' : 'text-[#e8ded8]'}`}>
              {spotsLeft === 0 ? 'Sold out' : `${spotsLeft} spots open`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#120c10] rounded-full h-1.5 overflow-hidden mb-4 border border-[#382332]/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                capacityPercent >= 90 ? 'bg-[#df7e74]' : 'bg-[#e89a92]'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/events/${event.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#faf3ee] bg-[#291b26] hover:bg-[#342231] border border-[#382332] transition"
            >
              Details
              <ArrowUpRight className="w-3.5 h-3.5 text-[#e89a92]" />
            </Link>

            {canRegister ? (
              <button
                type="button"
                onClick={() => onRegisterClick && onRegisterClick(event)}
                className="flex-1 inline-flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#120c10] bg-[#e89a92] hover:bg-[#f2aba3] transition shadow-md shadow-rose-950"
              >
                Register
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Registration unavailable for this event"
                className="flex-1 inline-flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-mono uppercase tracking-wider text-[#7e6c69] bg-[#120c10] border border-[#382332] cursor-not-allowed"
              >
                {spotsLeft === 0 ? 'Sold Out' : 'Closed'}
              </button>
            )}

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex items-center gap-1 pl-1">
                <button
                  type="button"
                  onClick={() => onEditClick && onEditClick(event)}
                  title="Edit event"
                  className="p-2 text-[#a89490] hover:text-[#e89a92] hover:bg-[#291b26] rounded-xl transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteClick && onDeleteClick(event)}
                  title="Delete event"
                  className="p-2 text-[#a89490] hover:text-[#df7e74] hover:bg-[#291b26] rounded-xl transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
