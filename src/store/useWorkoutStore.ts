import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkoutSession, NutritionLog } from '../types'

interface WorkoutState {
  sessions: WorkoutSession[]
  nutritionLogs: NutritionLog[]
  addSession: (session: WorkoutSession) => void
  addNutritionLog: (log: NutritionLog) => void
  getTodayNutritionLog: () => NutritionLog | undefined
  updateNutritionLog: (date: string, updates: Partial<NutritionLog>) => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      sessions: [],
      nutritionLogs: [],
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 200),
        })),
      addNutritionLog: (log) =>
        set((state) => ({
          nutritionLogs: [log, ...state.nutritionLogs].slice(0, 365),
        })),
      getTodayNutritionLog: () => {
        const today = new Date().toISOString().split('T')[0]
        return get().nutritionLogs.find((l) => l.date === today)
      },
      updateNutritionLog: (date, updates) =>
        set((state) => ({
          nutritionLogs: state.nutritionLogs.map((l) =>
            l.date === date ? { ...l, ...updates } : l
          ),
        })),
    }),
    { name: 'gymai-workout' }
  )
)
