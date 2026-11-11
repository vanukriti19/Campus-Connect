import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bookmark, 
  ArrowUpRight, 
  Edit3, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDate, formatTime, getEventStatus, calculateSpotsLeft, isRegistrationAllowed } from '../../utils/formatters';
import { useBookmarks } from '../../context/BookmarkContext';
import { useAuth } from '../../context/AuthContext';

export default function CinematicParallaxSlideshow({ 
  events = [], 
  onRegisterClick, 
  onEditClick, 
  onDeleteClick 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 0, py: 0 });
  const containerRef = useRef(null);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isAdmin } = useAuth();

  const total = events.length;
  const currentEvent = events[currentIndex] || events[0];

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Mouse Parallax Calculation
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      rx: -(y * 6), // rotateX tilt degrees
      ry: x * 8,   // rotateY tilt degrees
      px: -(x * 24), // parallax image translation px
      py: -(y * 24),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, px: 0, py: 0 });
  };

  if (!events || events.length === 0) return null;

  const saved = currentEvent ? isBookmarked(currentEvent.id) : false;
  const status = currentEvent ? getEventStatus(currentEvent) : { label: 'Active' };
  const spotsLeft = currentEvent ? calculateSpotsLeft(currentEvent) : 0;
  const canRegister = currentEvent ? isRegistrationAllowed(currentEvent) : false;
  const capacityPercent = currentEvent
    ? Math.min(100, Math.round(((currentEvent.registeredCount || 0) / currentEvent.maxCapacity) * 100))
    : 0;

  // Previous and Next event objects for the 3-panel cinematic view
  const prevEvent = events[(currentIndex - 1 + total) % total];
  const nextEvent = events[(currentIndex + 1) % total];

  return (
    <div className="relative w-full select-none">
      
      {/* Cinematic Frame Container with Codepen styling */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full rounded-[28px] overflow-hidden bg-[#0d070b] border border-[#382332] shadow-2xl transition-all duration-300"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(232, 154, 146, 0.08)'
        }}
      >
        {/* Top Meta Bar */}
        <div className="px-6 py-4 border-b border-[#382332]/80 flex items-center justify-between text-xs font-mono text-[#a89490] bg-[#140b10]/90 backdrop-blur-md z-20 relative">
          <div className="flex items-center gap-3">
            <span className="text-[#e89a92] font-bold tracking-widest uppercase">
              ☆ {(currentIndex + 1).toString().padStart(2, '0')} / {total.toString().padStart(2, '0')}
            </span>
            <span className="text-[#382332]">•</span>
            <span className="uppercase tracking-widest text-[#faf3ee]/80">
              {currentEvent.category}
            </span>
            <span className="text-[#382332]">•</span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#e89a92]/15 text-[#e89a92] border border-[#e89a92]/30">
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bookmark button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark(currentEvent);
              }}
              title={saved ? 'Remove bookmark' : 'Bookmark this event'}
              aria-label={saved ? 'Remove bookmark' : 'Bookmark this event'}
              className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 flex items-center gap-1.5 text-xs font-mono ${
                saved
                  ? 'bg-[#e89a92] text-[#120c10] border-[#e89a92] shadow-sm shadow-[#e89a92]/30'
                  : 'border-[#382332] text-[#a89490] hover:text-[#e89a92] hover:border-[#e89a92] hover:bg-[#20151e]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex items-center gap-1 border-l border-[#382332] pl-3">
                <button
                  type="button"
                  onClick={() => onEditClick && onEditClick(currentEvent)}
                  title="Edit event"
                  className="p-1.5 text-[#a89490] hover:text-[#e89a92] hover:bg-[#20151e] rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteClick && onDeleteClick(currentEvent)}
                  title="Delete event"
                  className="p-1.5 text-[#a89490] hover:text-[#df7e74] hover:bg-[#20151e] rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cinematic Main Stage (3-Column Slide Structure) */}
        <div className="relative min-h-[500px] md:min-h-[560px] flex items-center justify-between overflow-hidden">
          
          {/* LEFT FLANK PREVIEW (Previous Slide) */}
          <div 
            onClick={prevSlide}
            className="hidden lg:flex flex-col justify-center w-1/6 h-full absolute left-0 top-0 bottom-0 z-10 cursor-pointer p-4 group"
            title={`Previous: ${prevEvent.title}`}
          >
            <div className="relative w-full h-[70%] rounded-2xl overflow-hidden border border-[#382332]/60 group-hover:border-[#e89a92]/60 opacity-35 group-hover:opacity-75 transition-all duration-300">
              <img
                src={prevEvent.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                alt={prevEvent.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105"
              />
              <div className="absolute inset-0 bg-[#0d070b]/60 group-hover:bg-transparent transition-all" />
              <div className="absolute top-3 left-3 text-[10px] font-mono text-[#e89a92] bg-[#0d070b]/80 px-2 py-0.5 rounded">
                PREV ▹
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-xs font-bold text-[#faf3ee] line-clamp-2">
                {prevEvent.title}
              </div>
            </div>
          </div>

          {/* RIGHT FLANK PREVIEW (Next Slide) */}
          <div 
            onClick={nextSlide}
            className="hidden lg:flex flex-col justify-center w-1/6 h-full absolute right-0 top-0 bottom-0 z-10 cursor-pointer p-4 group"
            title={`Next: ${nextEvent.title}`}
          >
            <div className="relative w-full h-[70%] rounded-2xl overflow-hidden border border-[#382332]/60 group-hover:border-[#e89a92]/60 opacity-35 group-hover:opacity-75 transition-all duration-300">
              <img
                src={nextEvent.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                alt={nextEvent.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105"
              />
              <div className="absolute inset-0 bg-[#0d070b]/60 group-hover:bg-transparent transition-all" />
              <div className="absolute top-3 right-3 text-[10px] font-mono text-[#e89a92] bg-[#0d070b]/80 px-2 py-0.5 rounded">
                NEXT ▹
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-xs font-bold text-[#faf3ee] line-clamp-2 text-right">
                {nextEvent.title}
              </div>
            </div>
          </div>

          {/* ROTATING VERTICAL SIDE TEXT (Codepen .slide__side style) */}
          <div 
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none select-none text-[11px] font-mono tracking-[0.25em] uppercase text-[#e89a92]/60"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)'
            }}
          >
            <span>✦ {currentEvent.category} ✦ HOST: {currentEvent.organizerName} ✦</span>
          </div>

          {/* MAIN ACTIVE HERO SLIDE WITH PARALLAX */}
          <div 
            className="w-full lg:w-4/6 mx-auto h-full px-4 sm:px-12 py-8 flex flex-col justify-between relative z-10"
            style={{
              transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: 'transform 0.15s ease-out'
            }}
          >
            {/* Cinematic Image Canvas with Parallax translation */}
            <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] rounded-2xl overflow-hidden border border-[#382332] shadow-2xl bg-[#140b10] group">
              <img
                src={currentEvent.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                alt={currentEvent.title}
                className="w-full h-full object-cover scale-110 transition-transform duration-700 ease-out"
                style={{
                  transform: `scale(1.1) translate3d(${tilt.px}px, ${tilt.py}px, 0)`,
                  transition: 'transform 0.12s ease-out'
                }}
              />
              {/* Soft cinematic vignette layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d070b] via-[#0d070b]/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d070b]/60 via-transparent to-[#0d070b]/60" />

              {/* Top floating date badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d070b]/80 backdrop-blur-md border border-[#382332] text-xs font-mono text-[#faf3ee]">
                <Calendar className="w-3.5 h-3.5 text-[#e89a92]" />
                <span>{formatDate(currentEvent.startTime)}</span>
                <span>•</span>
                <Clock className="w-3.5 h-3.5 text-[#a89490]" />
                <span>{formatTime(currentEvent.startTime)}</span>
              </div>

              {/* Spots alert pill */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold backdrop-blur-md border ${
                  spotsLeft <= 5 && spotsLeft > 0
                    ? 'bg-[#df7e74]/20 text-[#ffb0a7] border-[#df7e74]/40 animate-pulse'
                    : 'bg-[#0d070b]/80 text-[#e89a92] border-[#382332]'
                }`}>
                  {spotsLeft === 0 ? 'SOLD OUT' : `${spotsLeft} SPOTS LEFT`}
                </span>
              </div>

              {/* Title & Location Overlay inside image */}
              <div className="absolute bottom-5 left-5 right-5 space-y-2">
                <div className="text-[11px] font-mono tracking-widest uppercase text-[#e89a92] flex items-center gap-1.5">
                  <span>☆</span>
                  <span>{currentEvent.category} SHOWCASE</span>
                </div>
                <Link to={`/events/${currentEvent.id}`}>
                  <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-[#faf3ee] hover:text-[#e89a92] transition-colors drop-shadow-md line-clamp-2">
                    {currentEvent.title}
                  </h3>
                </Link>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#d4c2ba] pt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#e89a92] shrink-0" />
                    <span className="truncate">{currentEvent.venue}</span>
                  </div>
                  <span>▹</span>
                  <div className="font-mono text-[11px] text-[#a89490]">
                    HOST: <strong className="text-[#faf3ee]">{currentEvent.organizerName}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Strip (Progress Bar & Action Buttons) */}
            <div className="mt-6 pt-5 border-t border-[#382332]/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Capacity Progress Indicator */}
              <div className="w-full sm:w-1/2 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-[#a89490]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#e89a92]" />
                    <span>{currentEvent.registeredCount || 0} Registered</span>
                  </span>
                  <span className="text-[#faf3ee] font-bold">
                    {capacityPercent}% filled
                  </span>
                </div>
                <div className="w-full bg-[#1c1219] rounded-full h-1.5 overflow-hidden border border-[#382332]/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityPercent >= 90 ? 'bg-[#df7e74]' : 'bg-[#e89a92]'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to={`/events/${currentEvent.id}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#faf3ee] bg-[#22161f] hover:bg-[#2d1c29] border border-[#382332] transition hover:scale-105"
                >
                  Details
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#e89a92]" />
                </Link>

                {canRegister ? (
                  <button
                    type="button"
                    onClick={() => onRegisterClick && onRegisterClick(currentEvent)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#120c10] bg-[#e89a92] hover:bg-[#ffb0a7] shadow-lg shadow-rose-950/40 transition hover:scale-105"
                  >
                    Register Now
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider text-[#7e6c69] bg-[#140b10] border border-[#382332] cursor-not-allowed"
                  >
                    {spotsLeft === 0 ? 'Sold Out' : 'Registration Closed'}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* CODEPEN-STYLED GEOMETRIC POLYGON NAVIGATION BUTTONS */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-2xl bg-[#140b10]/90 border border-[#382332] hover:border-[#e89a92] text-[#faf3ee] hover:text-[#e89a92] flex items-center justify-center transition-all hover:scale-110 shadow-lg backdrop-blur-md active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-2xl bg-[#140b10]/90 border border-[#382332] hover:border-[#e89a92] text-[#faf3ee] hover:text-[#e89a92] flex items-center justify-center transition-all hover:scale-110 shadow-lg backdrop-blur-md active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* BOTTOM PAGINATION & SLIDE TRACKER STRIP */}
        <div className="px-6 py-3.5 border-t border-[#382332]/80 bg-[#140b10]/80 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {events.map((evt, idx) => (
              <button
                key={evt.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  idx === currentIndex
                    ? 'bg-[#e89a92] text-[#120c10] font-bold shadow-sm shadow-[#e89a92]/20 scale-105'
                    : 'bg-[#1e131b] text-[#a89490] hover:text-[#faf3ee] hover:bg-[#281924] border border-[#382332]'
                }`}
              >
                {(idx + 1).toString().padStart(2, '0')}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#a89490] hidden sm:block">
            USE ← / → KEYS OR DRAG TO EXPLORE
          </div>
        </div>

      </div>
    </div>
  );
}
