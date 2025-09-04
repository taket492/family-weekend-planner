import { create } from 'zustand'
import { SearchFilters } from '@/types'

export interface SavedSearch { id: string; name: string; filters: SearchFilters; createdAt: string }

interface SavedSearchState {
  items: SavedSearch[]
  save: (name: string, filters: SearchFilters) => void
  remove: (id: string) => void
}

const KEY = 'saved_searches_v1'

function load(): SavedSearch[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function persist(items: SavedSearch[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
}

export const useSavedSearchStore = create<SavedSearchState>((set, get) => ({
  items: load(),
  save: (name, filters) => {
    const id = crypto.randomUUID()
    const next = [{ id, name, filters, createdAt: new Date().toISOString() }, ...get().items]
    persist(next)
    set({ items: next })
  },
  remove: (id) => {
    const next = get().items.filter(i => i.id !== id)
    persist(next)
    set({ items: next })
  }
}))

