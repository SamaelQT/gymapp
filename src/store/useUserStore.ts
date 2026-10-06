import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, BodyMetrics, Goal } from '../types'

interface UserState {
  profile: Profile | null
  bodyMetrics: BodyMetrics[]
  onboardingCompleted: boolean
  setProfile: (profile: Profile) => void
  addBodyMetrics: (metrics: BodyMetrics) => void
  updateGoal: (goal: Goal) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      bodyMetrics: [],
      onboardingCompleted: false,
      setProfile: (profile) => set({ profile }),
      addBodyMetrics: (metrics) =>
        set((state) => ({
          bodyMetrics: [metrics, ...state.bodyMetrics].slice(0, 90),
        })),
      updateGoal: (goal) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, goal } : null,
        })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false, profile: null }),
    }),
    { name: 'gymai-user' }
  )
)
