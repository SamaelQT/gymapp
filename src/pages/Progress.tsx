import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Header } from '../components/layout/Header'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useUserStore } from '../store/useUserStore'
import type { BodyMetrics } from '../types'

const ACHIEVEMENTS = [
  { id: 'first_workout', title: 'Buổi đầu tiên', icon: '🎯' },
  { id: 'streak_3',     title: 'Streak 3 ngày', icon: '🔥' },
  { id: 'streak_7',     title: 'Streak 7 ngày', icon: '⚡' },
  { id: 'reps_100',     title: '100 Reps',       icon: '💯' },
  { id: 'reps_500',     title: '500 Reps',       icon: '🏆' },
  { id: 'sessions_10',  title: '10 Buổi tập',    icon: '🌟' },
]

function checkAchievements(sessions: any[], _bodyMetrics: BodyMetrics[]) {
  const totalReps = sessions.reduce((s, se) => s + se.totalReps, 0)
  return {
    first_workout: sessions.length >= 1,
    streak_3:      sessions.length >= 3,
    streak_7:      sessions.length >= 7,
    reps_100:      totalReps >= 100,
    reps_500:      totalReps >= 500,
    sessions_10:   sessions.length >= 10,
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0a0a16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#3a3a6a', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>
          {p.value}{p.name === 'weight' ? ' kg' : p.name === 'calories' ? ' kcal' : ''}
        </p>
      ))}
    </div>
  )
}

const cardBase: React.CSSProperties = {
  background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 22,
}
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0', letterSpacing: '-0.01em', marginBottom: 16 }}>{children}</div>
)

export default function Progress() {
  const { sessions } = useWorkoutStore()
  const { profile, bodyMetrics, addBodyMetrics } = useUserStore()
  const [showMetricsForm, setShowMetricsForm] = useState(false)
  const [metricsForm, setMetricsForm] = useState({ weight: profile?.weight?.toString() || '', body_fat: '', muscle_mass: '' })
  const [filter, setFilter] = useState<'week' | 'month'>('month')

  const unlockedAchievements = checkAchievements(sessions, bodyMetrics)
  const latestMetrics = bodyMetrics[0], prevMetrics = bodyMetrics[1]
  const now = new Date()

  const weightData = bodyMetrics.slice(0, 30).reverse().map((m) => ({
    date: new Date(m.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    weight: m.weight,
  }))

  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - (7 - i) * 7)
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7)
    return { week: `T${weekStart.getDate()}/${weekStart.getMonth() + 1}`, sessions: sessions.filter(s => { const d = new Date(s.date); return d >= weekStart && d < weekEnd }).length }
  })

  const caloriesData = sessions.slice(0, 14).reverse().map((s) => ({
    date: new Date(s.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    calories: s.calories,
  }))

  const handleAddMetrics = () => {
    if (!metricsForm.weight) return
    addBodyMetrics({ date: now.toISOString().split('T')[0], weight: parseFloat(metricsForm.weight), body_fat: metricsForm.body_fat ? parseFloat(metricsForm.body_fat) : undefined, muscle_mass: metricsForm.muscle_mass ? parseFloat(metricsForm.muscle_mass) : undefined })
    setShowMetricsForm(false); setMetricsForm({ weight: '', body_fat: '', muscle_mass: '' })
  }

  const filteredSessions = filter === 'week'
    ? sessions.filter(s => { const d = new Date(s.date); const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w })
    : sessions.filter(s => { const d = new Date(s.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })

  const statCards = [
    { label: 'Cân nặng', value: latestMetrics?.weight, prev: prevMetrics?.weight, unit: 'kg', color: '#a89af8', goodDown: true },
    { label: 'Body Fat', value: latestMetrics?.body_fat, prev: prevMetrics?.body_fat, unit: '%', color: '#fb923c', goodDown: true },
    { label: 'Cơ bắp', value: latestMetrics?.muscle_mass, prev: prevMetrics?.muscle_mass, unit: '%', color: '#34d399', goodDown: false },
    { label: 'Tổng buổi', value: sessions.length, prev: null, unit: 'buổi', color: '#38bdf8', goodDown: false },
  ]

  const inputStyle: React.CSSProperties = {
    flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#d0d0f0', outline: 'none',
  }

  return (
    <div>
      <Header title="Tiến Độ" subtitle="Theo dõi sự tiến bộ của bạn" />

      {/* Body metric summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {statCards.map((stat) => {
          const diff = stat.prev != null && stat.value != null ? stat.value - stat.prev : null
          const isGood = diff !== null && (stat.goodDown ? diff <= 0 : diff >= 0)
          return (
            <div key={stat.label} style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}18`, border: `1px solid ${stat.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth={1.8} style={{width:15,height:15}}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                {diff !== null && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: isGood ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: isGood ? '#34d399' : '#f87171', border: `1px solid ${isGood ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}` }}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, letterSpacing: '-0.03em' }}>
                {stat.value !== undefined ? stat.value : '—'}{stat.value !== undefined ? stat.unit : ''}
              </div>
              <div style={{ fontSize: 11, color: '#2e2e58', marginTop: 4 }}>{stat.label}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Weight chart */}
        <div style={cardBase}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0' }}>Cân nặng theo thời gian</div>
            <button onClick={() => setShowMetricsForm(!showMetricsForm)} style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#5858a0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              + Cập nhật
            </button>
          </div>
          {showMetricsForm && (
            <div style={{ marginBottom: 16, padding: 14, background: 'rgba(255,255,255,0.025)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{ key: 'weight', label: 'Cân nặng (kg)', placeholder: '70' }, { key: 'body_fat', label: 'Body fat %', placeholder: '15' }, { key: 'muscle_mass', label: 'Cơ bắp %', placeholder: '40' }].map((f) => (
                <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 11, color: '#3a3a6a', width: 100, flexShrink: 0 }}>{f.label}</label>
                  <input type="number" placeholder={f.placeholder} value={metricsForm[f.key as keyof typeof metricsForm]}
                    onChange={(e) => setMetricsForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle}/>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAddMetrics} disabled={!metricsForm.weight} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c6df0, #a89af8)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Lưu</button>
                <button onClick={() => setShowMetricsForm(false)} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#5858a0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              </div>
            </div>
          )}
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="date" tick={{ fill: '#2e2e58', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: '#2e2e58', fontSize: 10 }} domain={['auto','auto']} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Line type="monotone" dataKey="weight" stroke="#a89af8" strokeWidth={2.5} dot={{ fill: '#a89af8', r: 3, strokeWidth: 0 }}/>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e2e58', fontSize: 13 }}>Chưa có dữ liệu cân nặng</div>
          )}
        </div>

        {/* Weekly sessions */}
        <div style={cardBase}>
          <SectionTitle>Buổi tập theo tuần</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="week" tick={{ fill: '#2e2e58', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#2e2e58', fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip />}/>
              <Bar dataKey="sessions" fill="#7c6df0" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Calories chart */}
        <div style={cardBase}>
          <SectionTitle>Calo đốt gần đây</SectionTitle>
          {caloriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={caloriesData}>
                <defs>
                  <linearGradient id="calG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="date" tick={{ fill: '#2e2e58', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: '#2e2e58', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Area type="monotone" dataKey="calories" stroke="#fb923c" fill="url(#calG)" strokeWidth={2.5}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e2e58', fontSize: 13 }}>Chưa có dữ liệu calo</div>
          )}
        </div>

        {/* Achievements */}
        <div style={cardBase}>
          <SectionTitle>Thành tích</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = unlockedAchievements[ach.id as keyof typeof unlockedAchievements]
              return (
                <div key={ach.id} style={{
                  padding: '12px 8px', borderRadius: 14, textAlign: 'center',
                  background: unlocked ? 'rgba(124,109,240,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${unlocked ? 'rgba(124,109,240,0.35)' : 'rgba(255,255,255,0.05)'}`,
                  opacity: unlocked ? 1 : 0.4,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{ach.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? '#d0d0f0' : '#3a3a6a' }}>{ach.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Workout history */}
      <div style={cardBase}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0' }}>Lịch sử tập luyện</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['week', 'month'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: filter === f ? 'linear-gradient(135deg, #7c6df0, #a89af8)' : 'rgba(255,255,255,0.03)',
                border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.07)',
                color: filter === f ? 'white' : '#3a3a6a',
              } as React.CSSProperties}>
                {f === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <div style={{ color: '#3a3a6a', fontSize: 13 }}>Không có buổi tập trong {filter === 'week' ? 'tuần' : 'tháng'} này</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredSessions.map((session, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,109,240,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,109,240,0.12)', border: '1px solid rgba(124,109,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {session.exercises[0]?.exercise.emoji || '💪'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#d0d0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.exercises.map(e => e.exercise.nameVi).join(', ').slice(0, 40)}
                  </div>
                  <div style={{ fontSize: 11, color: '#2e2e58', marginTop: 2 }}>
                    {new Date(session.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
                  {[{ l: 'Thời gian', v: `${session.duration}p`, c: '#d0d0f0' }, { l: 'Calo', v: `${session.calories}`, c: '#fb923c' }, { l: 'Reps', v: `${session.totalReps}`, c: '#34d399' }].map(stat => (
                    <div key={stat.l} style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: '#2e2e58' }}>{stat.l}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: stat.c }}>{stat.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
