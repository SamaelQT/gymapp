import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, BodyMetrics, Goal } from '../types'

interface UserState {
  profile: Profile | null
  bodyMetrics: BodyMetrics[]
  setProfile: (profile: Profile) => void
  addBodyMetrics: (metrics: BodyMetrics) => void
  updateGoal: (goal: Goal) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      bodyMetrics: [],
      setProfile: (profile) => set({ profile }),
      addBodyMetrics: (metrics) =>
        set((state) => ({
          bodyMetrics: [metrics, ...state.bodyMetrics].slice(0, 90),
        })),
      updateGoal: (goal) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, goal } : null,
        })),
    }),
    { name: 'gymai-user' }
  )
)
