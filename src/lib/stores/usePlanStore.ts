import { create } from 'zustand'
import { Plan, PlanSpot } from '@/types'

interface PlanStore {
  plans: Plan[]
  currentPlan: Plan | null
  isLoading: boolean
  error: string | null
  
  setPlans: (plans: Plan[]) => void
  setCurrentPlan: (plan: Plan | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  fetchPlans: () => Promise<void>
  createPlan: (planData: Omit<Plan, 'id'>) => Promise<void>
  updatePlan: (planId: string, updates: Partial<Plan>) => Promise<void>
  deletePlan: (planId: string) => Promise<void>
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plans: [],
  currentPlan: null,
  isLoading: false,
  error: null,

  setPlans: (plans) => set({ plans }),
  setCurrentPlan: (currentPlan) => set({ currentPlan }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchPlans: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/plans')
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans')
      }
      
      const plans = await response.json()
      set({ plans, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  },

  createPlan: async (planData) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create plan')
      }
      
      const newPlan = await response.json()
      const { plans } = get()
      set({ 
        plans: [newPlan, ...plans],
        currentPlan: newPlan,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  },

  updatePlan: async (planId, updates) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update plan')
      }
      
      const updatedPlan = await response.json()
      const { plans } = get()
      set({ 
        plans: plans.map(plan => plan.id === planId ? updatedPlan : plan),
        currentPlan: updatedPlan,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  },

  deletePlan: async (planId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete plan')
      }
      
      const { plans, currentPlan } = get()
      set({ 
        plans: plans.filter(plan => plan.id !== planId),
        currentPlan: currentPlan?.id === planId ? null : currentPlan,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  }
}))