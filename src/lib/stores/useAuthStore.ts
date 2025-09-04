import { create } from 'zustand'

interface User { id: string; name: string }

interface AuthState {
  user: User | null
  signIn: (name?: string) => void
  signOut: () => void
}

const KEY = 'auth_mock_v1'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signIn: (name = 'ゲスト') => {
    const user = { id: 'user-' + (crypto?.randomUUID?.() || 'local'), name }
    set({ user })
    try { localStorage.setItem(KEY, JSON.stringify(user)) } catch {}
  },
  signOut: () => {
    set({ user: null })
    try { localStorage.removeItem(KEY) } catch {}
  }
}))

if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) useAuthStore.setState({ user: JSON.parse(raw) })
  } catch {}
}

