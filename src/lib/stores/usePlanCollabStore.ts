import { create } from 'zustand'

interface CommentItem {
  id: string
  author: string
  text: string
  createdAt: string
}

interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

interface CollabState {
  comments: CommentItem[]
  checklist: ChecklistItem[]
  addComment: (author: string, text: string) => void
  deleteComment: (id: string) => void
  addChecklist: (text: string) => void
  toggleChecklist: (id: string) => void
  deleteChecklist: (id: string) => void
}

const STORAGE_KEY = 'plan_collab_local_v1'

function load() {
  if (typeof window === 'undefined') return { comments: [], checklist: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { comments: [], checklist: [] }
    return JSON.parse(raw)
  } catch { return { comments: [], checklist: [] } }
}

function persist(state: { comments: CommentItem[]; checklist: ChecklistItem[] }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

export const usePlanCollabStore = create<CollabState>((set, get) => ({
  comments: load().comments,
  checklist: load().checklist,
  addComment: (author, text) => set(state => {
    const next = { comments: [...state.comments, { id: crypto.randomUUID(), author, text, createdAt: new Date().toISOString() }], checklist: state.checklist }
    persist(next)
    return next
  }),
  deleteComment: (id) => set(state => {
    const next = { comments: state.comments.filter(c => c.id !== id), checklist: state.checklist }
    persist(next)
    return next
  }),
  addChecklist: (text) => set(state => {
    const next = { comments: state.comments, checklist: [...state.checklist, { id: crypto.randomUUID(), text, done: false }] }
    persist(next)
    return next
  }),
  toggleChecklist: (id) => set(state => {
    const next = { 
      comments: state.comments, 
      checklist: state.checklist.map(i => i.id === id ? { ...i, done: !i.done } : i)
    }
    persist(next)
    return next
  }),
  deleteChecklist: (id) => set(state => {
    const next = { comments: state.comments, checklist: state.checklist.filter(i => i.id !== id) }
    persist(next)
    return next
  })
}))

