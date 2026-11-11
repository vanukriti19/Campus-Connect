import React from 'react';
import { 
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../../services/mockData';
import { useEvents } from '../../context/EventContext';

export default function EventFilters() {
  const {
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
  } = useEvents();

  return (
    <div className="space-y-5 mb-10 pb-6 border-b border-[#382332]">
      {/* Category Pills Bar: Editorial Numbered Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap sm:overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#a89490] mr-2 hidden sm:inline-block">
          DISCIPLINES:
        </span>
        {INITIAL_CATEGORIES.map((cat, idx) => {
          const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
          const prefix = cat.slug === 'all' ? 'ALL' : `0${idx}`;

          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all duration-300 shadow-sm ${
                isSelected
                  ? 'bg-[#e89a92] text-[#120c10] shadow-lg shadow-rose-950 scale-[1.02]'
                  : 'bg-[#1a1117] text-[#e8ded8] hover:bg-[#261823] hover:text-[#faf3ee] border border-[#382332]'
              }`}
            >
              <span className={`text-[10px] ${isSelected ? 'text-[#120c10]/70' : 'text-[#a89490]'}`}>
                {prefix}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Row: Status + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#a89490] uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#e89a92]" />
            AVAILABILITY:
          </span>
          {['all', 'upcoming', 'available', 'past'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg uppercase tracking-wider font-semibold transition ${
                statusFilter === status
                  ? 'bg-[#faf3ee] text-[#120c10]'
                  : 'bg-[#1a1117] text-[#a89490] hover:text-[#faf3ee] border border-[#382332]'
              }`}
            >
              {status === 'available' ? 'Seats Open' : status}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#a89490] uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#e89a92]" />
            ORDER:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1a1117] border border-[#382332] text-[#faf3ee] rounded-xl px-3 py-1.5 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-[#e89a92] cursor-pointer"
          >
            <option value="date-asc">Chronological (Soonest)</option>
            <option value="date-desc">Chronological (Latest)</option>
            <option value="popular">Most Popular First</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
