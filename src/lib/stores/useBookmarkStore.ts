import { create } from 'zustand'
import { Bookmark, Spot } from '@/types'

interface BookmarkStore {
  bookmarks: Bookmark[]
  isLoading: boolean
  error: string | null
  
  fetchBookmarks: (userId: string) => Promise<void>
  addBookmark: (userId: string, spot: Spot, notes?: string, tags?: string[]) => Promise<void>
  removeBookmark: (userId: string, spotId: string) => Promise<void>
  updateBookmark: (bookmarkId: string, updates: Partial<Bookmark>) => Promise<void>
  isBookmarked: (spotId: string) => boolean
  getBookmarksByTag: (tag: string) => Bookmark[]
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,

  fetchBookmarks: async (userId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/bookmarks?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch bookmarks')
      
      const bookmarks = await response.json()
      set({ bookmarks, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  },

  addBookmark: async (userId: string, spot: Spot, notes?: string, tags?: string[]) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          spotId: spot.id,
          notes,
          tags: tags || []
        })
      })
      
      if (!response.ok) throw new Error('Failed to add bookmark')
      
      const bookmark = await response.json()
      set(state => ({
        bookmarks: [...state.bookmarks, bookmark]
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  removeBookmark: async (userId: string, spotId: string) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, spotId })
      })
      
      if (!response.ok) throw new Error('Failed to remove bookmark')
      
      set(state => ({
        bookmarks: state.bookmarks.filter(b => b.spotId !== spotId)
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  updateBookmark: async (bookmarkId: string, updates: Partial<Bookmark>) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update bookmark')
      
      const updatedBookmark = await response.json()
      set(state => ({
        bookmarks: state.bookmarks.map(b => 
          b.id === bookmarkId ? updatedBookmark : b
        )
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  isBookmarked: (spotId: string) => {
    return get().bookmarks.some(b => b.spotId === spotId)
  },

  getBookmarksByTag: (tag: string) => {
    return get().bookmarks.filter(b => b.tags?.includes(tag))
  }
}))