import React from 'react';
import EventCard from './EventCard';
import { CalendarX, Search, RotateCcw } from 'lucide-react';
import { useEvents } from '../../context/EventContext';

export default function EventGrid({ 
  events, 
  onRegisterClick, 
  onEditClick, 
  onDeleteClick 
}) {
  const { 
    searchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    setSearchQuery, 
    setStatusFilter 
  } = useEvents();

  if (!events || events.length === 0) {
    const hasSearch = !!searchQuery.trim();
    const hasCategory = selectedCategory && selectedCategory.toLowerCase() !== 'all';

    let message = 'There are currently no events matching your criteria.';
    if (hasSearch && hasCategory) {
      message = `No events found with title matching "${searchQuery}" in the ${selectedCategory} category.`;
    } else if (hasSearch) {
      message = `No events found with title matching "${searchQuery}". Please check your spelling or try different keywords.`;
    } else if (hasCategory) {
      message = `No events found in the "${selectedCategory}" category.`;
    }

    return (
      <div className="bg-[#1a1117] rounded-3xl border border-dashed border-[#382332] p-8 sm:p-14 text-center max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#241822] text-[#e89a92] border border-[#382332] flex items-center justify-center mx-auto mb-5 shadow-inner">
          {hasSearch ? <Search className="w-8 h-8" /> : <CalendarX className="w-8 h-8" />}
        </div>
        <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#faf3ee] mb-2">
          No Matching Events
        </h3>
        <p className="text-sm text-[#bdaaa2] mb-8 leading-relaxed font-light">
          {message}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold bg-[#261823] text-[#faf3ee] hover:bg-[#32202f] border border-[#382332] transition"
            >
              Clear Search
            </button>
          )}

          {hasCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold bg-[#261823] text-[#faf3ee] hover:bg-[#32202f] border border-[#382332] transition"
            >
              All Categories
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] text-[#120c10] hover:bg-[#f2aba3] transition shadow-md shadow-rose-950"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, idx) => (
        <EventCard
          key={event.id}
          event={event}
          indexNumber={idx + 1}
          onRegisterClick={onRegisterClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
}
