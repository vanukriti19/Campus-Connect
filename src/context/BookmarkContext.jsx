import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BookmarkService } from '../services/bookmarkService';
import { StorageService, STORAGE_KEYS } from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useToast } from './ToastContext';

const BookmarkContext = createContext(null);

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => StorageService.getBookmarks() || []);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const reloadBookmarks = useCallback(async () => {
    try {
      const data = await BookmarkService.getBookmarks();
      if (Array.isArray(data)) {
        setBookmarks(data);
      }
    } catch (err) {
      console.error('reloadBookmarks error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    reloadBookmarks();
  }, [reloadBookmarks]);

  // Local storage listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.key || e.key === STORAGE_KEYS.BOOKMARKS) {
        reloadBookmarks();
      }
    };

    const handleCustomSync = () => {
      reloadBookmarks();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('campusconnect:bookmarks-updated', handleCustomSync);
    window.addEventListener('campusconnect:data-reset', handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('campusconnect:bookmarks-updated', handleCustomSync);
      window.removeEventListener('campusconnect:data-reset', handleCustomSync);
    };
  }, [reloadBookmarks]);

  // Realtime subscription (Supabase)
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel('public:bookmarks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => {
          reloadBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reloadBookmarks]);

  const isBookmarked = useCallback(
    (eventOrId) => {
      if (!eventOrId) return false;
      const id = typeof eventOrId === 'object' && eventOrId !== null ? eventOrId.id : eventOrId;
      return bookmarks.includes(id);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (eventOrId) => {
      if (!eventOrId) return false;
      const eventId = typeof eventOrId === 'object' && eventOrId !== null ? eventOrId.id : eventOrId;
      const eventTitle = typeof eventOrId === 'object' && eventOrId !== null && eventOrId.title ? eventOrId.title : null;

      try {
        const { isBookmarked: nowBookmarked, bookmarks: updated } = await BookmarkService.toggleBookmark(eventId);
        setBookmarks(updated);

        window.dispatchEvent(new CustomEvent('campusconnect:bookmarks-updated'));

        if (nowBookmarked) {
          const label = eventTitle ? `"${eventTitle.length > 25 ? eventTitle.substring(0, 25) + '...' : eventTitle}"` : 'Event';
          addToast(`Bookmarked ${label}`, 'success');
        } else {
          const label = eventTitle ? `"${eventTitle.length > 25 ? eventTitle.substring(0, 25) + '...' : eventTitle}"` : 'Event';
          addToast(`Removed ${label} from saved`, 'info');
        }
        return nowBookmarked;
      } catch (err) {
        addToast(err.message || 'Failed to update bookmark', 'error');
        return false;
      }
    },
    [addToast]
  );

  const clearAllBookmarks = useCallback(async () => {
    try {
      await BookmarkService.clearBookmarks();
      setBookmarks([]);
      window.dispatchEvent(new CustomEvent('campusconnect:bookmarks-updated'));
      addToast('Cleared all saved events', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to clear bookmarks', 'error');
    }
  }, [addToast]);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        isBookmarked,
        toggleBookmark,
        clearAllBookmarks,
        reloadBookmarks,
        bookmarkCount: bookmarks.length,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
