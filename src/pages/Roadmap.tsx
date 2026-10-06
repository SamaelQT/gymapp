import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { useUserStore } from '../store/useUserStore'
import { calculateTDEE, calculateMacros } from '../lib/nutrition'
import {
  generateWeeklySchedule, generateProgressionPlan,
  generateMealTimeline, generateFoodGuide, generateRecoveryPlan,
  getSplitName, getWeeklyStats, MUSCLE_META,
  type TrainingDay, type RoadmapExercise,
} from '../lib/roadmap'

/* ─── Shared card style ─── */
const card: React.CSSProperties = {
  background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 22,
}
type Tab = 'schedule' | 'nutrition' | 'recovery'

/* ════════════════════════════════════════════════════
   EXERCISE DETAIL MODAL
════════════════════════════════════════════════════ */
function ExerciseModal({ ex, onClose, onLiveAI }: {
  ex: RoadmapExercise; onClose: () => void; onLiveAI?: () => void
}) {
  const [showEmbed, setShowEmbed] = useState(false)
  const diffColor  = ex.difficulty === 'easy' ? '#34d399' : ex.difficulty === 'medium' ? '#fbbf24' : '#f87171'
  const catColor   = ex.category === 'compound' ? '#a89af8' : ex.category === 'isolation' ? '#38bdf8' : '#fb923c'
  const muscleMeta = MUSCLE_META[ex.primaryMuscle] ?? { color: '#7c6df0', label: 'Bài tập', emoji: '💪', desc: '' }
  const ytSearch   = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' how to proper form tutorial')}`
  const ytVn       = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' kỹ thuật hướng dẫn gym tiếng việt')}`

  // All muscles involved: primary + secondary
  const allMuscleMeta = [
    ...(ex.primaryMuscle ? [{ key: ex.primaryMuscle, role: 'primary' as const }] : []),
    ...(ex.secondaryMuscles ?? []).map(k => ({ key: k, role: 'secondary' as const })),
  ]

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0a0a16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 28, maxWidth: 600, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${muscleMeta.color}18`, border: `1px solid ${muscleMeta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              {ex.emoji}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#d0d0f0', letterSpacing: '-0.02em', marginBottom: 6 }}>{ex.name}</h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${catColor}18`, border: `1px solid ${catColor}35`, color: catColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {ex.category === 'compound' ? 'Đa khớp' : ex.category === 'isolation' ? 'Đơn khớp' : ex.category === 'core' ? 'Core' : 'Cardio'}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${diffColor}18`, border: `1px solid ${diffColor}35`, color: diffColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {ex.difficulty === 'easy' ? 'Cơ bản' : ex.difficulty === 'medium' ? 'Trung bình' : 'Nâng cao'}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${muscleMeta.color}15`, border: `1px solid ${muscleMeta.color}35`, color: muscleMeta.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {muscleMeta.emoji} {muscleMeta.label}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#5858a0', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>

        {/* ══════════════════════════════════════════════
            VIDEO SECTION
        ══════════════════════════════════════════════ */}
        <div style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: `1px solid ${muscleMeta.color}28` }}>
          {/* Thumbnail / Embed toggle */}
          {showEmbed && ex.youtubeId ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ex.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${ex.name} tutorial`}
              />
            </div>
          ) : (
            /* Hero preview card */
            <div style={{ position: 'relative', height: 130, background: `linear-gradient(135deg, ${muscleMeta.color}18 0%, rgba(6,6,14,0.98) 70%)`, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              {/* Watermark emoji */}
              <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', fontSize: 110, opacity: 0.08, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
                {ex.emoji}
              </div>
              {/* Left content */}
              <div style={{ padding: '0 20px', zIndex: 1 }}>
                <div style={{ fontSize: 10, color: muscleMeta.color, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {muscleMeta.emoji} {muscleMeta.label} · <span style={{ fontStyle: 'italic', color: '#4a4a7a', textTransform: 'none', letterSpacing: 0 }}>{muscleMeta.desc}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#d0d0f0', marginBottom: 12 }}>📹 Video hướng dẫn kỹ thuật</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {ex.youtubeId ? (
                    <button
                      onClick={() => setShowEmbed(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: '#dc2626', color: 'white', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 0 18px rgba(220,38,38,0.4)' }}
                    >
                      <span style={{ fontSize: 14 }}>▶</span> Xem video
                    </button>
                  ) : null}
                  <a href={ytSearch} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                    🔍 YouTube EN
                  </a>
                  <a href={ytVn} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#9090c0', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                    🇻🇳 Tiếng Việt
                  </a>
                </div>
              </div>
            </div>
          )}
          {/* Bottom bar */}
          <div style={{ background: 'rgba(6,6,14,0.98)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: '#3a3a6a' }}>
              {ex.youtubeId ? '▶ Video hướng dẫn kỹ thuật có sẵn' : '🔍 Tìm kiếm video trên YouTube'}
            </span>
            {showEmbed && (
              <button onClick={() => setShowEmbed(false)} style={{ fontSize: 10, color: '#5858a0', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
                ✕ Đóng video
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Sets', val: String(ex.sets),  color: '#a89af8' },
            { label: 'Reps', val: ex.reps,           color: '#34d399' },
            { label: 'Nghỉ', val: ex.rest,           color: '#fb923c' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 10px', borderRadius: 14, background: `${s.color}0d`, border: `1px solid ${s.color}25`, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#3a3a6a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            MUSCLE ANATOMY MAP
        ══════════════════════════════════════════════ */}
        <div style={{ marginBottom: 20, padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2e2e58', marginBottom: 12 }}>
            🧬 Cơ bắp được kích hoạt
          </div>
          {/* Primary muscle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: `${muscleMeta.color}12`, border: `1px solid ${muscleMeta.color}30`, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${muscleMeta.color}20`, border: `1px solid ${muscleMeta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {muscleMeta.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: muscleMeta.color, marginBottom: 2 }}>{muscleMeta.label}</div>
              <div style={{ fontSize: 10, color: '#4a4a7a', fontStyle: 'italic' }}>{muscleMeta.desc}</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: muscleMeta.color, color: '#06060e', letterSpacing: '0.06em' }}>CHÍNH</span>
          </div>
          {/* Secondary muscles */}
          {allMuscleMeta.filter(m => m.role === 'secondary').map(({ key }) => {
            const sm = MUSCLE_META[key]
            if (!sm) return null
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${sm.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {sm.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#8080b0', marginBottom: 1 }}>{sm.label}</div>
                  <div style={{ fontSize: 9, color: '#3a3a5a', fontStyle: 'italic' }}>{sm.desc}</div>
                </div>
                <span style={{ fontSize: 9, color: '#4a4a7a', fontWeight: 600 }}>Phụ</span>
              </div>
            )
          })}
          {/* Fallback: muscleGroups chips if no secondaryMuscles */}
          {(!ex.secondaryMuscles || ex.secondaryMuscles.length === 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
              {ex.muscleGroups.map(m => (
                <span key={m} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: 'rgba(124,109,240,0.1)', border: '1px solid rgba(124,109,240,0.2)', color: '#8080b0' }}>{m}</span>
              ))}
            </div>
          )}
        </div>

        {/* ── PT Tips ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🎯</span>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#34d399' }}>Hướng dẫn kỹ thuật từ PT</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ex.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#34d399', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 12, color: '#c0c0e0', lineHeight: 1.6 }}>{tip}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Common mistakes ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171' }}>Lỗi thường gặp — cần tránh</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ex.mistakes.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <span style={{ fontSize: 12, color: '#f87171', flexShrink: 0 }}>✕</span>
                <div style={{ fontSize: 12, color: '#c0c0e0', lineHeight: 1.6 }}>{m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#5858a0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Đóng
          </button>
          {onLiveAI && (
            <button onClick={onLiveAI} style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c6df0, #a89af8)', boxShadow: '0 4px 18px rgba(124,109,240,0.4)', color: 'white', fontSize: 13, fontWeight: 700 }}>
              🤖 Tập với AI Pose Detection →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   DAY WORKOUT PANEL  — grouped by muscle
════════════════════════════════════════════════════ */
function DayPanel({ day, onSelectExercise }: {
  day: TrainingDay; onSelectExercise: (ex: RoadmapExercise) => void
}) {
  // Group exercises by primaryMuscle, keep insertion order
  const groups: Map<string, RoadmapExercise[]> = new Map()
  day.keyExercises.forEach(e => {
    const key = e.primaryMuscle ?? 'core'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  })

  let globalIdx = 0

  const ExerciseRow = ({ ex, idx, accentColor }: {
    ex: RoadmapExercise; idx: number; accentColor: string
  }) => (
    <button
      onClick={() => onSelectExercise(ex)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
        border: `1px solid rgba(255,255,255,0.04)`,
        borderLeft: `3px solid ${accentColor}50`,
        background: 'rgba(255,255,255,0.02)', textAlign: 'left',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${accentColor}12`
        e.currentTarget.style.borderColor = `${accentColor}50`
        e.currentTarget.style.borderLeftColor = accentColor
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderLeftColor = `${accentColor}50`
      }}
    >
      {/* Number */}
      <div style={{ width: 22, height: 22, borderRadius: 6, background: `${accentColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: accentColor, flexShrink: 0 }}>
        {idx + 1}
      </div>
      {/* Emoji */}
      <span style={{ fontSize: 18, flexShrink: 0 }}>{ex.emoji}</span>
      {/* Name + secondary muscles */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#d0d0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
        <div style={{ fontSize: 10, color: '#3a3a6a', marginTop: 1 }}>
          {ex.muscleGroups.slice(0, 3).join(' · ')}
        </div>
      </div>
      {/* Difficulty dot */}
      <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: ex.difficulty === 'easy' ? '#34d399' : ex.difficulty === 'medium' ? '#fbbf24' : '#f87171' }} />
      {/* Sets × Reps */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: accentColor }}>{ex.sets} × {ex.reps}</div>
        <div style={{ fontSize: 10, color: '#2e2e58', marginTop: 1 }}>nghỉ {ex.rest}</div>
      </div>
      <div style={{ fontSize: 11, color: '#3a3a6a', flexShrink: 0, marginLeft: 2 }}>›</div>
    </button>
  )

  return (
    <div style={{ marginTop: 16, padding: '18px 20px', borderRadius: 18, background: 'rgba(124,109,240,0.05)', border: '1px solid rgba(124,109,240,0.16)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#d0d0f0', marginBottom: 4 }}>{day.emoji} {day.focus}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {day.muscles.map(m => (
              <span key={m} style={{ fontSize: 10, color: '#5858a0', padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>{m}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
          {[
            { label: 'Sets', val: String(day.totalSets), color: '#a89af8' },
            { label: 'Nghỉ', val: day.restBetweenSets, color: '#fb923c' },
            { label: 'Thời gian', val: `${day.duration}p`, color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ color: '#2e2e58', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PT tip */}
      <div style={{ marginBottom: 14, padding: '7px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.02)', fontSize: 11, color: '#3a3a6a', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>💡</span> Click bài tập để xem hướng dẫn kỹ thuật + lỗi thường gặp
      </div>

      {/* Muscle groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from(groups.entries()).map(([muscleKey, exercises]) => {
          const meta = MUSCLE_META[muscleKey] ?? { label: muscleKey, emoji: '💪', color: '#a89af8', desc: '' }
          return (
            <div key={muscleKey}>
              {/* Muscle section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${meta.color}20`, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {meta.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: meta.color }}>{meta.label}</div>
                  <div style={{ fontSize: 9, color: '#2e2e58', fontStyle: 'italic' }}>{meta.desc}</div>
                </div>
                <div style={{ flex: 1, height: 1, background: `${meta.color}25`, marginLeft: 4 }} />
                <div style={{ fontSize: 10, color: meta.color, fontWeight: 700 }}>{exercises.length} bài</div>
              </div>

              {/* Exercise rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {exercises.map(e => {
                  const idx = globalIdx++
                  return <ExerciseRow key={e.name} ex={e} idx={idx} accentColor={meta.color} />
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 14, display: 'flex', gap: 12, fontSize: 10, color: '#2e2e58', flexWrap: 'wrap' }}>
        {[['#34d399', 'Cơ bản'], ['#fbbf24', 'Trung bình'], ['#f87171', 'Nâng cao']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════ */
export default function Roadmap() {
  const { profile } = useUserStore()
  const navigate    = useNavigate()
  const [tab, setTab]           = useState<Tab>('schedule')
  const [openDay, setOpenDay]   = useState<number | null>(null)
  const [selectedEx, setSelectedEx] = useState<RoadmapExercise | null>(null)

  if (!profile) return (
    <div>
      <Header title="Lộ Trình" subtitle="Kế hoạch cá nhân hóa của bạn" />
      <div style={{ ...card, textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#d0d0f0', marginBottom: 8 }}>Chưa có hồ sơ</div>
        <div style={{ fontSize: 13, color: '#3a3a6a', marginBottom: 24 }}>Hoàn thành bài khảo sát để nhận lộ trình cá nhân hóa</div>
        <button onClick={() => navigate('/profile')} style={{ padding: '11px 28px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c6df0, #a89af8)', color: 'white', fontSize: 14, fontWeight: 700 }}>
          Điền hồ sơ ngay →
        </button>
      </div>
    </div>
  )

  const schedule  = generateWeeklySchedule(profile)
  const phases    = generateProgressionPlan(profile)
  const meals     = generateMealTimeline(profile)
  const foods     = generateFoodGuide(profile)
  const recovery  = generateRecoveryPlan(profile)
  const stats     = getWeeklyStats(profile)
  const tdee      = calculateTDEE(profile)
  const { calories: target, macro } = calculateMacros(tdee, profile.goal)
  const splitName = getSplitName(profile)

  const GOAL_COLOR: Record<string, string> = { lose_fat: '#fb923c', gain_muscle: '#34d399', maintain: '#38bdf8' }
  const gc = GOAL_COLOR[profile.goal]

  const today   = new Date().getDay()
  const todayIdx = today === 0 ? 6 : today - 1

  const tabBtn = (key: Tab, label: string, color: string): React.CSSProperties => ({
    padding: '9px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
    background: tab === key ? `linear-gradient(135deg, ${color}, ${color}bb)` : 'rgba(255,255,255,0.03)',
    border: tab === key ? 'none' : '1px solid rgba(255,255,255,0.08)',
    boxShadow: tab === key ? `0 4px 14px ${color}40` : 'none',
    color: tab === key ? 'white' : '#5858a0',
    transition: 'all 0.18s',
  })

  return (
    <div>
      <Header title="Lộ Trình Cá Nhân" subtitle={`Huấn luyện viên AI của bạn — ${splitName}`} />

      {/* ── Summary bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Kiểu tập',   val: splitName,               color: '#a89af8', emoji: '🗓' },
          { label: 'Buổi/tuần', val: `${stats.workoutDays} buổi`, color: gc,    emoji: '💪' },
          { label: 'Calo/ngày', val: `${target} kcal`,          color: '#fb923c', emoji: '🔥' },
          { label: 'Protein',   val: `${macro.protein}g`,       color: '#34d399', emoji: '🥩' },
        ].map(s => (
          <div key={s.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.emoji}</div>
            <div>
              <div style={{ fontSize: 10, color: '#2e2e58', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: s.color, marginTop: 2 }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PT Message ── */}
      <div style={{ marginBottom: 18, padding: '14px 18px', borderRadius: 16, background: 'rgba(124,109,240,0.07)', border: '1px solid rgba(124,109,240,0.2)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>🤖</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#d0d0f0', marginBottom: 3 }}>Tin nhắn từ PT của bạn</div>
          <div style={{ fontSize: 12, color: '#5858a0', lineHeight: 1.6 }}>
            {profile.goal === 'gain_muscle'
              ? `Chào ${profile.name}! Tôi đã thiết kế lịch ${splitName} tối ưu cho mục tiêu tăng cơ của bạn. Progressive overload là chìa khóa — mỗi tuần tăng thêm 2.5kg hoặc 1-2 reps. Nhớ ghi chép tạ mỗi buổi!`
              : profile.goal === 'lose_fat'
              ? `Chào ${profile.name}! Lịch ${splitName} này được tối ưu để giữ cơ trong khi đốt mỡ. Giữ protein cao (${Math.round(profile.weight * 2)}g/ngày) và không cắt calo quá 500 kcal dưới TDEE.`
              : `Chào ${profile.name}! Lịch ${splitName} này cân bằng giữa sức mạnh và sức khỏe tổng thể. Lắng nghe cơ thể — nghỉ khi cần và tập với ý thức từng chuyển động.`
            }
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('schedule')}  style={tabBtn('schedule',  '🏋️ Lịch tập',   '#7c6df0')}>🏋️ Lịch tập</button>
        <button onClick={() => setTab('nutrition')} style={tabBtn('nutrition', '🥗 Dinh dưỡng', '#fb923c')}>🥗 Dinh dưỡng</button>
        <button onClick={() => setTab('recovery')}  style={tabBtn('recovery',  '😴 Phục hồi',   '#34d399')}>😴 Phục hồi</button>
      </div>

      {/* ══════ TAB: SCHEDULE ══════ */}
      {tab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Weekly calendar */}
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0', marginBottom: 16 }}>📅 Lịch tập tuần này — Click ngày tập để xem chi tiết</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {schedule.map((day, i) => {
                const isToday   = i === todayIdx
                const isOpen    = openDay === i
                const isWorkout = day.type === 'workout'
                const isAR      = day.type === 'active_rest'
                const dotColor  = isWorkout ? '#7c6df0' : isAR ? '#34d399' : '#2e2e58'
                return (
                  <button
                    key={i}
                    onClick={() => isWorkout ? setOpenDay(isOpen ? null : i) : undefined}
                    style={{
                      padding: '12px 6px', borderRadius: 14,
                      cursor: isWorkout ? 'pointer' : 'default',
                      border: `1.5px solid ${isOpen ? '#a89af8' : isToday ? '#7c6df0' : isWorkout ? `${dotColor}40` : 'rgba(255,255,255,0.06)'}`,
                      background: isOpen
                        ? 'rgba(124,109,240,0.2)'
                        : isToday ? 'rgba(124,109,240,0.14)'
                        : isWorkout ? `${dotColor}0d` : 'rgba(255,255,255,0.02)',
                      textAlign: 'center', outline: 'none',
                      boxShadow: isToday ? '0 0 14px rgba(124,109,240,0.25)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? '#a89af8' : '#3a3a6a', marginBottom: 5 }}>{day.short}</div>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{day.emoji}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: isWorkout ? dotColor : '#2e2e58', lineHeight: 1.3 }}>{day.focus.split(' ')[0]}</div>
                    {isToday && <div style={{ marginTop: 5, fontSize: 8, fontWeight: 700, color: '#a89af8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hôm nay</div>}
                    {isWorkout && <div style={{ marginTop: 3, fontSize: 9, color: '#2e2e58' }}>{day.totalSets}sets · {day.duration}p</div>}
                  </button>
                )
              })}
            </div>

            {/* Expanded day */}
            {openDay !== null && schedule[openDay].type === 'workout' && (
              <DayPanel
                day={schedule[openDay]}
                onSelectExercise={setSelectedEx}
              />
            )}
          </div>

          {/* 12-week progression */}
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0', marginBottom: 20 }}>🚀 Lộ trình 12 tuần</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {phases.map(ph => (
                <div key={ph.phase} style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 16, padding: '16px 18px', borderRadius: 16, background: `${ph.color}08`, border: `1px solid ${ph.color}25` }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ph.color, marginBottom: 3 }}>Giai đoạn {ph.phase}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#d0d0f0', marginBottom: 3 }}>{ph.title}</div>
                    <div style={{ fontSize: 11, color: '#2e2e58', fontWeight: 600, marginBottom: 10 }}>{ph.weeks}</div>
                    <div style={{ fontSize: 10, color: '#3a3a6a', marginBottom: 2 }}>Volume: <span style={{ color: ph.color, fontWeight: 700 }}>{ph.volume}</span></div>
                    <div style={{ fontSize: 10, color: '#3a3a6a' }}>Cường độ: <span style={{ color: ph.color, fontWeight: 700 }}>{ph.intensity}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#a89af8', fontWeight: 600, marginBottom: 8 }}>🎯 {ph.goal}</div>
                    {ph.tips.map((tip, i) => (
                      <div key={i} style={{ fontSize: 11, color: '#5858a0', display: 'flex', gap: 6, marginBottom: 4 }}>
                        <span style={{ color: ph.color, flexShrink: 0 }}>•</span><span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Split info */}
          <div style={{ ...card, background: 'rgba(124,109,240,0.05)', border: '1px solid rgba(124,109,240,0.18)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#a89af8', marginBottom: 6 }}>💡 Tại sao PT chọn {splitName}?</div>
            <div style={{ fontSize: 12, color: '#5858a0', lineHeight: 1.7 }}>
              {splitName === 'Full Body' && 'Phù hợp nhất cho người mới — mỗi nhóm cơ được kích thích 3×/tuần, tối ưu muscle protein synthesis. Ưu tiên compound movements để phát triển nền tảng.'}
              {splitName === 'Upper / Lower' && 'Mỗi nhóm cơ được tập 2×/tuần — đủ stimulus mà không quá tải. Ngày A tập nặng (strength), ngày B tập nhẹ hơn (hypertrophy). Lý tưởng cho trung cấp.'}
              {splitName === 'Push / Pull / Legs' && 'Split được nghiên cứu nhiều nhất cho hypertrophy. Nhóm cơ liên quan tập cùng nhau giảm chồng chéo mệt mỏi. Mỗi cơ được 2× kích thích/tuần với PPL 6 ngày.'}
              {splitName === 'Body Part' && 'Volume cao nhất trên mỗi nhóm cơ — lý tưởng cho nâng cao đã quen với tập 5 ngày+. Mỗi nhóm cơ được tập sâu từ nhiều góc độ.'}
            </div>
          </div>
        </div>
      )}

      {/* ══════ TAB: NUTRITION ══════ */}
      {tab === 'nutrition' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Calo mục tiêu', val: `${target}`, unit: 'kcal', color: '#fb923c' },
              { label: 'Protein',       val: `${macro.protein}`, unit: 'g/ngày', color: '#a89af8' },
              { label: 'Carbohydrate',  val: `${macro.carbs}`,   unit: 'g/ngày', color: '#34d399' },
              { label: 'Chất béo',      val: `${macro.fat}`,     unit: 'g/ngày', color: '#fbbf24' },
            ].map(m => (
              <div key={m.label} style={card}>
                <div style={{ fontSize: 10, color: '#2e2e58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: m.color, letterSpacing: '-0.03em' }}>{m.val}</div>
                <div style={{ fontSize: 11, color: '#3a3a6a', marginTop: 2 }}>{m.unit}</div>
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0', marginBottom: 20 }}>⏰ Timeline bữa ăn trong ngày</div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 63, top: 16, bottom: 16, width: 1, background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {meals.map((meal, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 18, position: 'relative' }}>
                    <div style={{ width: 48, textAlign: 'right', flexShrink: 0, paddingTop: 3 }}>
                      <div style={{ fontSize: 10, color: '#2e2e58', fontWeight: 600, lineHeight: 1.4 }}>{meal.time.split('–')[0].trim()}</div>
                    </div>
                    <div style={{ flexShrink: 0, marginTop: 5, position: 'relative', zIndex: 1 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: meal.color, boxShadow: `0 0 8px ${meal.color}60` }} />
                    </div>
                    <div style={{ flex: 1, padding: '10px 14px', borderRadius: 14, background: `${meal.color}0a`, border: `1px solid ${meal.color}20` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#d0d0f0' }}>{meal.name}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: meal.color }}>{meal.calories} kcal</div>
                      </div>
                      <div style={{ fontSize: 11, color: '#3a3a6a', marginBottom: 8 }}>{meal.description}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {meal.examples.map((ex, j) => (
                          <span key={j} style={{ fontSize: 11, color: '#5858a0', padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>{ex}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {foods.map(cat => (
              <div key={cat.category} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                  <div style={{ fontSize: 12, fontWeight: 800, color: cat.color }}>{cat.category}</div>
                </div>
                {cat.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, padding: '8px 0', borderBottom: i < cat.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#c0c0e0' }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: '#2e2e58', marginTop: 1 }}>{item.note}</div>
                    </div>
                    <div style={{ fontSize: 10, color: cat.color, fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>{item.amount}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.18)' }}>
            <span style={{ fontSize: 36 }}>💧</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8', marginBottom: 4 }}>
                Mục tiêu: {Math.round(profile.weight * 0.035 * 10) / 10}–{Math.round(profile.weight * 0.04 * 10) / 10} lít nước/ngày
              </div>
              <div style={{ fontSize: 12, color: '#3a3a6a' }}>500ml ngay khi thức dậy · 500ml thêm trong/sau buổi tập · Nước lọc tốt hơn nước ngọt</div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ TAB: RECOVERY ══════ */}
      {tab === 'recovery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {recovery.map((block, i) => (
            <div key={i} style={{ ...card, border: `1px solid ${block.color}1a` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${block.color}18`, border: `1px solid ${block.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{block.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#d0d0f0' }}>{block.title}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {block.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, padding: '9px 14px', borderRadius: 11, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: block.color, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: '#c0c0e0', lineHeight: 1.6 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ ...card, background: 'rgba(163,138,248,0.05)', border: '1px solid rgba(163,138,248,0.18)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#a89af8', marginBottom: 16 }}>📊 Nhịp tuần của bạn</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {schedule.map((day, i) => {
                const isToday = i === todayIdx
                const tc = day.type === 'workout' ? '#7c6df0' : day.type === 'active_rest' ? '#34d399' : '#2e2e58'
                return (
                  <div key={i} style={{ padding: '10px 6px', borderRadius: 12, textAlign: 'center', background: isToday ? 'rgba(124,109,240,0.18)' : `${tc}0a`, border: `1px solid ${isToday ? '#7c6df0' : tc + '30'}` }}>
                    <div style={{ fontSize: 9, color: '#2e2e58', fontWeight: 700, marginBottom: 5 }}>{day.short}</div>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{day.emoji}</div>
                    <div style={{ fontSize: 9, color: tc, fontWeight: 600 }}>{day.type === 'workout' ? 'Tập' : day.type === 'active_rest' ? 'Active' : 'Nghỉ'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════ EXERCISE MODAL ══════ */}
      {selectedEx && (
        <ExerciseModal
          ex={selectedEx}
          onClose={() => setSelectedEx(null)}
          onLiveAI={selectedEx.liveAIId
            ? () => { navigate(`/live?exercise=${selectedEx.liveAIId}`); setSelectedEx(null) }
            : undefined
          }
        />
      )}
    </div>
  )
}
