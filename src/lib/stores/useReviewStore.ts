import { create } from 'zustand'

export interface Review {
  id: string
  spotId: string
  rating: number // 1..5
  tags: string[]
  text?: string
  hidden?: boolean
  createdAt: string
}

interface ReviewState {
  reviews: Record<string, Review[]> // keyed by spotId
  addReview: (r: Omit<Review, 'id' | 'createdAt' | 'hidden'>) => void
  hideReview: (spotId: string, id: string) => void
}

const KEY = 'reviews_local_v1'

function load(): Record<string, Review[]> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

function save(data: Record<string, Review[]>) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: load(),
  addReview: (r) => set(state => {
    const map = { ...state.reviews }
    const list = map[r.spotId] ? map[r.spotId].slice() : []
    list.push({ ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
    map[r.spotId] = list
    save(map)
    return { reviews: map }
  }),
  hideReview: (spotId, id) => set(state => {
    const map = { ...state.reviews }
    map[spotId] = (map[spotId] || []).map(rv => rv.id === id ? { ...rv, hidden: true } : rv)
    save(map)
    return { reviews: map }
  })
}))

