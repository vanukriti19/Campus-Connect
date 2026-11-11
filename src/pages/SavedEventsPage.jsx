import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, ArrowRight, Trash2 } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/events/EventCard';

export default function SavedEventsPage({ onRegisterClick, onEditClick, onDeleteClick }) {
  const { bookmarks, clearAllBookmarks } = useBookmarks();
  const { events } = useEvents();

  const savedEvents = events.filter((e) => bookmarks.includes(e.id));

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#382332]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e131b] text-[#e89a92] text-xs font-mono uppercase tracking-widest mb-3 border border-[#382332]">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Curated Personal Wishlist • {savedEvents.length} Saved</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#faf3ee]">
            Saved Events
          </h1>
          <p className="text-sm text-[#bdaaa2] font-light mt-1">
            Events you have bookmarked to review or reserve credentials for later.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedEvents.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all saved events from your bookmarks?')) {
                  clearAllBookmarks();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider text-[#df7e74] bg-[#1a1117] hover:bg-rose-950/30 border border-[#382332] hover:border-rose-900/60 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}

          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] text-[#120c10] hover:bg-[#f2aba3] transition shadow-md shadow-rose-950"
          >
            <Compass className="w-4 h-4" />
            Explore More Events
          </Link>
        </div>
      </div>

      {/* Grid or Empty State */}
      {savedEvents.length === 0 ? (
        <div className="bg-[#1a1117] rounded-3xl border border-dashed border-[#382332] p-12 text-center max-w-md mx-auto my-12 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#241822] text-[#e89a92] border border-[#382332] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#faf3ee] mb-2">
            No Saved Events
          </h3>
          <p className="text-sm text-[#bdaaa2] mb-6 leading-relaxed font-light">
            You haven't bookmarked any events yet. Click the bookmark icon on any event card while exploring the catalog to save it here.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] text-[#120c10] hover:bg-[#f2aba3] transition"
          >
            Explore Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedEvents.map((event, idx) => (
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
      )}
    </div>
  );
}
