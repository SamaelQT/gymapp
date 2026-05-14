import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { WORKOUT_PLANS, EXERCISES } from '../data/exercises'
import type { Exercise, Goal } from '../types'

const GOAL_LABELS: Record<Goal, string> = { lose_fat: 'Giảm Mỡ', gain_muscle: 'Tăng Cơ', maintain: 'Duy Trì' }
const GOAL_COLORS: Record<Goal, string> = { lose_fat: '#fb923c', gain_muscle: '#34d399', maintain: '#38bdf8' }
const LEVEL_COLORS: Record<string, string> = { 'Cơ bản': '#34d399', 'Trung bình': '#fbbf24', 'Nâng cao': '#f87171' }

const cardBase: React.CSSProperties = {
  background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 20, padding: 20, transition: 'border-color 0.2s',
}

/* ── Modal ── */
function ExerciseModal({ exercise, onClose, onStart }: { exercise: Exercise; onClose: () => void; onStart: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
      <div style={{ background: '#0a0a16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>{exercise.emoji}</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#d0d0f0', letterSpacing: '-0.02em', marginBottom: 6 }}>{exercise.nameVi}</h2>
        <p style={{ fontSize: 13, color: '#3a3a6a', marginBottom: 20, lineHeight: 1.6 }}>{exercise.description}</p>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2e2e58', marginBottom: 8 }}>Nhóm cơ tác động</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {exercise.muscleGroups.map((m) => (
              <span key={m} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(124,109,240,0.12)', border: '1px solid rgba(124,109,240,0.25)', color: '#a89af8' }}>{m}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 14 }}>
          {[{ label: 'Sets', value: exercise.suggestedSets }, { label: 'Reps', value: exercise.suggestedReps }].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #a89af8, #7c6df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{value}</div>
              <div style={{ fontSize: 11, color: '#2e2e58', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#5858a0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Đóng
          </button>
          <button onClick={onStart} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7c6df0, #a89af8)', boxShadow: '0 4px 18px rgba(124,109,240,0.4)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            🤖 Tập ngay
          </button>
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

  const filteredPlans = selectedGoal === 'all' ? WORKOUT_PLANS : WORKOUT_PLANS.filter((p) => p.goal === selectedGoal)

  return (
    <div>
      <Header title="Bài Tập" subtitle="Thư viện chương trình và bài tập" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'plans', label: '📋 Chương trình tập' },
          { key: 'exercises', label: '💪 Thư viện bài tập' },
        ].map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'plans' | 'exercises')}
              style={{
                padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: active ? 'linear-gradient(135deg, #7c6df0, #a89af8)' : 'rgba(255,255,255,0.03)',
                border: active ? 'none' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: active ? '0 4px 14px rgba(124,109,240,0.35)' : 'none',
                color: active ? 'white' : '#5858a0',
                transition: 'all 0.15s',
              } as React.CSSProperties}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'plans' && (
        <>
          {/* Goal filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {(['all', 'lose_fat', 'gain_muscle', 'maintain'] as const).map((g) => {
              const active = selectedGoal === g
              const color = g === 'all' ? '#a89af8' : GOAL_COLORS[g]
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  style={{
                    padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: active ? `${color}20` : 'transparent',
                    border: `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
                    color: active ? color : '#3a3a6a',
                    transition: 'all 0.15s',
                  }}
                >
                  {g === 'all' ? 'Tất cả' : GOAL_LABELS[g]}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filteredPlans.map((plan) => (
              <div key={plan.id} style={{ ...cardBase, display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,109,240,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                {/* Level badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                    background: `${LEVEL_COLORS[plan.level] || '#a89af8'}15`,
                    border: `1px solid ${LEVEL_COLORS[plan.level] || '#a89af8'}35`,
                    color: LEVEL_COLORS[plan.level] || '#a89af8',
                  }}>
                    {plan.level}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOAL_COLORS[plan.goal as Goal] }}>
                    {GOAL_LABELS[plan.goal as Goal]}
                  </span>
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#d0d0f0', letterSpacing: '-0.01em', marginBottom: 12 }}>{plan.name}</h3>

                <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 12 }}>
                  <span style={{ color: '#3a3a6a' }}>⏱ <span style={{ color: '#d0d0f0', fontWeight: 600 }}>{plan.duration}p</span></span>
                  <span style={{ color: '#3a3a6a' }}>🔥 <span style={{ color: '#fb923c', fontWeight: 600 }}>~{plan.estimatedCalories}</span></span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
                  {plan.exercises.map((ex, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ fontSize: 14 }}>{ex.exercise.emoji}</span>
                      <span style={{ color: '#c0c0e0', flex: 1 }}>{ex.exercise.nameVi}</span>
                      <span style={{ color: '#2e2e58', fontWeight: 600 }}>{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/live?exercise=${plan.exercises[0].exercise.id}`)}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
                    boxShadow: '0 4px 14px rgba(124,109,240,0.35)',
                    color: 'white', fontSize: 13, fontWeight: 700,
                  }}
                >
                  🤖 Bắt đầu
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'exercises' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {EXERCISES.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              style={{ ...cardBase, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,109,240,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: 'rgba(124,109,240,0.1)', border: '1px solid rgba(124,109,240,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                }}>
                  {ex.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#d0d0f0', marginBottom: 5 }}>{ex.nameVi}</h3>
                  <p style={{ fontSize: 11, color: '#3a3a6a', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{ex.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {ex.muscleGroups.map((m) => (
                      <span key={m} style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: 'rgba(124,109,240,0.1)', border: '1px solid rgba(124,109,240,0.2)', color: '#a89af8' }}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
                <span style={{ color: '#3a3a6a' }}>{ex.suggestedSets} sets × {ex.suggestedReps} reps</span>
                <span style={{ color: '#a89af8', fontWeight: 600 }}>Chi tiết →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onStart={() => { navigate(`/live?exercise=${selectedExercise.id}`); setSelectedExercise(null) }}
        />
      )}
    </div>
  )
}
