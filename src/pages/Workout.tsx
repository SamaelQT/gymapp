import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { WORKOUT_PLANS, EXERCISES } from '../data/exercises'
import type { Exercise, Goal } from '../types'

const GOAL_LABELS: Record<Goal, string> = {
  lose_fat: 'Giảm Mỡ',
  gain_muscle: 'Tăng Cơ',
  maintain: 'Duy Trì',
}

const GOAL_COLORS: Record<Goal, string> = {
  lose_fat: 'text-orange-400',
  gain_muscle: 'text-green-400',
  maintain: 'text-blue-400',
}

const LEVEL_COLORS = {
  'Cơ bản': 'success' as const,
  'Trung bình': 'warning' as const,
  'Nâng cao': 'danger' as const,
}

function ExerciseModal({ exercise, onClose, onStart }: {
  exercise: Exercise
  onClose: () => void
  onStart: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#12121a] border border-[#22223a] rounded-2xl p-6 max-w-md w-full">
        <div className="text-4xl mb-3">{exercise.emoji}</div>
        <h2 className="text-xl font-bold text-[#f0f0ff] mb-1">{exercise.nameVi}</h2>
        <p className="text-sm text-[#8888aa] mb-4">{exercise.description}</p>
        <div className="mb-4">
          <p className="text-xs text-[#555570] mb-2">NHÓM CƠ TÁC ĐỘNG</p>
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.map((m) => <Badge key={m} variant="accent">{m}</Badge>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-[#1a1a28] rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#7c6ff7]">{exercise.suggestedSets}</p>
            <p className="text-xs text-[#8888aa]">Sets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#7c6ff7]">{exercise.suggestedReps}</p>
            <p className="text-xs text-[#8888aa]">Reps</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Đóng</Button>
          <Button onClick={onStart} className="flex-1">🤖 Tập ngay</Button>
        </div>
      </div>
    </div>
  )
}

export default function Workout() {
  const navigate = useNavigate()
  const [selectedGoal, setSelectedGoal] = useState<Goal | 'all'>('all')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [activeTab, setActiveTab] = useState<'plans' | 'exercises'>('plans')

  const filteredPlans = selectedGoal === 'all'
    ? WORKOUT_PLANS
    : WORKOUT_PLANS.filter((p) => p.goal === selectedGoal)

  return (
    <div>
      <Header title="Bài Tập" subtitle="Thư viện chương trình và bài tập" />

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'plans'
              ? 'bg-[#7c6ff7] text-white'
              : 'bg-[#12121a] text-[#8888aa] border border-[#22223a] hover:text-[#f0f0ff]'
          }`}
        >
          📋 Chương trình tập
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'exercises'
              ? 'bg-[#7c6ff7] text-white'
              : 'bg-[#12121a] text-[#8888aa] border border-[#22223a] hover:text-[#f0f0ff]'
          }`}
        >
          💪 Thư viện bài tập
        </button>
      </div>

      {activeTab === 'plans' && (
        <>
          {/* Goal filter */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(['all', 'lose_fat', 'gain_muscle', 'maintain'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGoal(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedGoal === g
                    ? 'bg-[#7c6ff7] text-white border-[#7c6ff7]'
                    : 'text-[#8888aa] border-[#22223a] hover:border-[#7c6ff7]/50'
                }`}
              >
                {g === 'all' ? 'Tất cả' : GOAL_LABELS[g]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant={LEVEL_COLORS[plan.level]}>{plan.level}</Badge>
                    <h3 className="text-base font-bold text-[#f0f0ff] mt-2">{plan.name}</h3>
                    <p className={`text-xs font-medium mt-0.5 ${GOAL_COLORS[plan.goal]}`}>
                      {GOAL_LABELS[plan.goal]}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mb-4 text-xs">
                  <div>
                    <span className="text-[#555570]">Thời gian: </span>
                    <span className="text-[#f0f0ff] font-medium">⏱ {plan.duration}p</span>
                  </div>
                  <div>
                    <span className="text-[#555570]">Calo: </span>
                    <span className="text-orange-400 font-medium">🔥 ~{plan.estimatedCalories}</span>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4 flex-1">
                  {plan.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span>{ex.exercise.emoji}</span>
                      <span className="text-[#f0f0ff]">{ex.exercise.nameVi}</span>
                      <span className="text-[#555570] ml-auto">{ex.sets}x{ex.reps}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => navigate(`/live?exercise=${plan.exercises[0].exercise.id}`)}
                  className="w-full"
                >
                  🤖 Bắt đầu
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'exercises' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {EXERCISES.map((ex) => (
            <Card key={ex.id} onClick={() => setSelectedExercise(ex)} className="cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{ex.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#f0f0ff]">{ex.nameVi}</h3>
                  <p className="text-xs text-[#8888aa] mt-1 line-clamp-2">{ex.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ex.muscleGroups.map((m) => <Badge key={m} variant="accent">{m}</Badge>)}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#22223a] flex justify-between text-xs text-[#8888aa]">
                <span>{ex.suggestedSets} sets × {ex.suggestedReps} reps</span>
                <span className="text-[#7c6ff7]">Chi tiết →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onStart={() => {
            navigate(`/live?exercise=${selectedExercise.id}`)
            setSelectedExercise(null)
          }}
        />
      )}
    </div>
  )
}
