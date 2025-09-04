import { create } from 'zustand'

export type ChildAgeType = 'months' | 'years'

export interface ChildProfile {
  type: ChildAgeType
  value: number // months if type='months', years if 'years'
}

interface ProfileState {
  children: ChildProfile[]
  setChildren: (children: ChildProfile[]) => void
}

const STORAGE_KEY = 'family_profile_v1'

export const useProfileStore = create<ProfileState>((set) => ({
  children: [],
  setChildren: (children) => {
    set({ children })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ children }))
    } catch {}
  },
}))

// Hydrate from localStorage on the client
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Lazy import to avoid SSR mismatch
      setTimeout(() => {
        useProfileStore.setState({ children: parsed.children || [] })
      }, 0)
    }
  } catch {}
}

export function ageToBucket(age: ChildProfile): 'baby' | 'toddler' | 'child' {
  const years = age.type === 'months' ? age.value / 12 : age.value
  if (years < 3) return 'baby'
  if (years < 6) return 'toddler'
  return 'child'
}
