import React from 'react';
import EventSearch from '../components/events/EventSearch';
import EventFilters from '../components/events/EventFilters';
import EventGrid from '../components/events/EventGrid';
import { useEvents } from '../context/EventContext';

export default function EventsExplorePage({ onRegisterClick, onEditClick, onDeleteClick }) {
  const { filteredEvents, totalEventsCount } = useEvents();

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e131b] text-[#e89a92] text-xs font-mono uppercase tracking-widest mb-4 border border-[#382332]">
          <span>✦</span>
          <span>Collegiate Archive & Catalog</span>
        </div>
        <h1 className="font-display text-5xl sm:text-7xl font-bold uppercase tracking-tight text-[#faf3ee] leading-none mb-4">
          Discover Events
        </h1>
        <p className="text-sm sm:text-base text-[#bdaaa2] font-light max-w-xl mx-auto leading-relaxed">
          Search by event title or filter by campus discipline to reserve admission passes.
        </p>
      </div>

      {/* Search Input */}
      <EventSearch />

      {/* Filter and Sorting Controls */}
      <EventFilters />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#a89490] pb-3 border-b border-[#382332]">
        <span>
          DISPLAYING <strong className="text-[#faf3ee]">{filteredEvents.length}</strong> OF {totalEventsCount} ARCHIVED EVENTS
        </span>
      </div>

      {/* Grid */}
      <EventGrid
        events={filteredEvents}
        onRegisterClick={onRegisterClick}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
      />
    </div>
  );
}
