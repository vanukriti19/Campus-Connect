/**
 * Bookmark Service: Handles student bookmarks via Supabase PostgreSQL or LocalStorage fallback
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { StorageService } from './storage.js';

export const BookmarkService = {
  async getBookmarks() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('bookmarks')
            .select('event_id')
            .eq('user_id', user.id);

          if (error) throw error;
          return data.map((b) => b.event_id);
        }
      } catch (err) {
        console.error('Failed to get Supabase bookmarks:', err);
      }
    }
    return StorageService.getBookmarks() || [];
  },

  async isBookmarked(eventOrId) {
    if (!eventOrId) return false;
    const eventId = typeof eventOrId === 'object' && eventOrId !== null ? eventOrId.id : eventOrId;
    if (!eventId) return false;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('event_id', eventId)
            .maybeSingle();

          if (error) throw error;
          return !!data;
        }
      } catch (err) {
        console.error('Failed check isBookmarked on Supabase:', err);
      }
    }

    const list = StorageService.getBookmarks() || [];
    return list.includes(eventId);
  },

  async toggleBookmark(eventOrId) {
    if (!eventOrId) {
      const list = await this.getBookmarks();
      return { isBookmarked: false, bookmarks: list };
    }
    const eventId = typeof eventOrId === 'object' && eventOrId !== null ? eventOrId.id : eventOrId;
    if (!eventId) {
      const list = await this.getBookmarks();
      return { isBookmarked: false, bookmarks: list };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if already bookmarked
          const { data: existing } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('event_id', eventId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('bookmarks')
              .delete()
              .eq('id', existing.id);

            const updated = await this.getBookmarks();
            return { isBookmarked: false, bookmarks: updated };
          } else {
            await supabase
              .from('bookmarks')
              .insert([{ user_id: user.id, event_id: eventId }]);

            const updated = await this.getBookmarks();
            return { isBookmarked: true, bookmarks: updated };
          }
        }
      } catch (err) {
        console.error('Failed toggleBookmark on Supabase:', err);
      }
    }

    // LocalStorage fallback
    const list = StorageService.getBookmarks() || [];
    let updated;
    const exists = list.includes(eventId);

    if (exists) {
      updated = list.filter((id) => id !== eventId);
    } else {
      updated = [eventId, ...list.filter((id) => id !== eventId)];
    }

    StorageService.saveBookmarks(updated);
    return {
      isBookmarked: !exists,
      bookmarks: updated,
    };
  },

  async clearBookmarks() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('bookmarks').delete().eq('user_id', user.id);
          return [];
        }
      } catch (err) {
        console.error('Failed clearBookmarks on Supabase:', err);
      }
    }
    StorageService.saveBookmarks([]);
    return [];
  }
};
