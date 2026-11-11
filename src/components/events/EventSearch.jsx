import React from 'react';
import { Search, X } from 'lucide-react';
import { useEvents } from '../../context/EventContext';

export default function EventSearch() {
  const { searchQuery, setSearchQuery, filteredEvents, selectedCategory } = useEvents();

  return (
    <div className="relative w-full max-w-3xl mx-auto mb-8">
      <div className="relative flex items-center">
        <Search className="absolute left-5 w-5 h-5 text-[#e89a92] pointer-events-none" />
        <input
          type="text"
          id="event-search-input"
          aria-label="Search events by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campus events by title (e.g. HackNova, AI, Cricket, Battle of Bands)..."
          className="w-full pl-14 pr-12 py-4 bg-[#1a1117] border border-[#382332] focus:border-[#e89a92] rounded-2xl text-sm font-sans text-[#faf3ee] placeholder:text-[#a89490] shadow-2xl focus:outline-none focus:ring-1 focus:ring-[#e89a92] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 p-1.5 text-[#a89490] hover:text-[#e89a92] hover:bg-[#291b26] rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {(searchQuery || (selectedCategory && selectedCategory.toLowerCase() !== 'all')) && (
        <div className="flex items-center justify-between text-xs font-mono text-[#a89490] mt-3 px-3">
          <span>
            {searchQuery ? (
              <>
                SEARCH QUERY: <strong className="text-[#faf3ee]">"{searchQuery}"</strong>
                {selectedCategory && selectedCategory.toLowerCase() !== 'all' && (
                  <> • FILTER: <span className="font-bold text-[#e89a92]">{selectedCategory.toUpperCase()}</span></>
                )}
              </>
            ) : (
              <>DISCIPLINE: <span className="font-bold text-[#e89a92]">{selectedCategory.toUpperCase()}</span></>
            )}
          </span>
          <span className="font-bold text-[#e89a92]">
            {filteredEvents.length} MATCH{filteredEvents.length === 1 ? '' : 'ES'}
          </span>
        </div>
      )}
    </div>
  );
}
