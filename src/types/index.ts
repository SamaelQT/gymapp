export type Goal = 'lose_fat' | 'gain_muscle' | 'maintain'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Gender = 'male' | 'female'
export type ExerciseType = 'squat' | 'pushup' | 'plank' | 'bicep_curl' | 'lunge' | 'shoulder_press'

export type WorkoutLocation = 'gym' | 'home' | 'outdoor' | 'mixed'
export type Experience = 'beginner' | 'intermediate' | 'advanced'

export interface Profile {
  id?: string
  name: string
  age: number
  weight: number
  height: number
  gender: Gender
  goal: Goal
  activity_level: ActivityLevel
  avatar_url?: string
  // Onboarding extended fields
  purpose?: string[]
  workout_location?: WorkoutLocation
  equipment?: string[]
  experience?: Experience
  frequency?: string
  session_duration?: number
}

export interface Exercise {
  id: string
  name: string
  nameVi: string
  type: ExerciseType
  muscleGroups: string[]
  emoji: string
  description: string
  suggestedSets: number
  suggestedReps: number
}

export interface WorkoutExercise {
  exercise: Exercise
  sets: number
  reps: number
  completedSets?: number
}

export interface WorkoutPlan {
  id: string
  name: string
  goal: Goal
  level: 'Cơ bản' | 'Trung bình' | 'Nâng cao'
  duration: number
  estimatedCalories: number
  exercises: WorkoutExercise[]
}

export interface WorkoutSession {
  id?: string
  user_id?: string
  date: string
  duration: number
  exercises: WorkoutExercise[]
  calories: number
  totalReps: number
}

export interface Macro {
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  name: string
  items: string[]
  calories: number
  macro: Macro
}

export interface DayPlan {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snack: Meal
  total_calories: number
}

export interface NutritionLog {
  id?: string
  user_id?: string
  date: string
  meals: { [key: string]: boolean }
  total_calories: number
  macros: Macro
}

export interface BodyMetrics {
  id?: string
  user_id?: string
  date: string
  weight: number
  body_fat?: number
  muscle_mass?: number
}

export interface PoseFeedback {
  message: string
  type: 'success' | 'warning' | 'error'
  timestamp: number
}

export interface RepState {
  count: number
  phase: 'idle' | 'down' | 'up'
  score: number
  feedback: PoseFeedback[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}
