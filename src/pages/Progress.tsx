import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useUserStore } from '../store/useUserStore'
import type { BodyMetrics } from '../types'

const ACHIEVEMENTS = [
  { id: 'first_workout', title: 'Buổi tập đầu tiên', description: 'Hoàn thành buổi tập đầu tiên', icon: '🎯' },
  { id: 'streak_3', title: 'Streak 3 ngày', description: 'Tập 3 ngày liên tiếp', icon: '🔥' },
  { id: 'streak_7', title: 'Streak 7 ngày', description: 'Tập 7 ngày liên tiếp', icon: '⚡' },
  { id: 'reps_100', title: '100 Reps', description: 'Đạt 100 tổng reps', icon: '💯' },
  { id: 'reps_500', title: '500 Reps', description: 'Đạt 500 tổng reps', icon: '🏆' },
  { id: 'sessions_10', title: '10 Buổi tập', description: 'Hoàn thành 10 buổi tập', icon: '🌟' },
]

function checkAchievements(sessions: any[], _bodyMetrics: BodyMetrics[]) {
  const totalReps = sessions.reduce((s, se) => s + se.totalReps, 0)
  return {
    first_workout: sessions.length >= 1,
    streak_3: sessions.length >= 3,
    streak_7: sessions.length >= 7,
    reps_100: totalReps >= 100,
    reps_500: totalReps >= 500,
    sessions_10: sessions.length >= 10,
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#12121a] border border-[#22223a] rounded-lg px-3 py-2 text-xs">
      <p className="text-[#8888aa] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.value} {p.name === 'weight' ? 'kg' : p.name === 'calories' ? 'kcal' : ''}
        </p>
      ))}
    </div>
  )
}

export default function Progress() {
  const { sessions } = useWorkoutStore()
  const { profile, bodyMetrics, addBodyMetrics } = useUserStore()
  const [showMetricsForm, setShowMetricsForm] = useState(false)
  const [metricsForm, setMetricsForm] = useState({
    weight: profile?.weight?.toString() || '',
    body_fat: '',
    muscle_mass: '',
  })
  const [filter, setFilter] = useState<'week' | 'month'>('month')

  const unlockedAchievements = checkAchievements(sessions, bodyMetrics)

  // Prepare weight chart data
  const weightData = bodyMetrics.slice(0, 30).reverse().map((m) => ({
    date: new Date(m.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    weight: m.weight,
    body_fat: m.body_fat,
  }))

  // Prepare weekly sessions data
  const now = new Date()
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (7 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const count = sessions.filter((s) => {
      const d = new Date(s.date)
      return d >= weekStart && d < weekEnd
    }).length
    return {
      week: `T${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
      sessions: count,
    }
  })

  // Prepare calories data
  const caloriesData = sessions.slice(0, 14).reverse().map((s) => ({
    date: new Date(s.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    calories: s.calories,
  }))

  const latestMetrics = bodyMetrics[0]
  const prevMetrics = bodyMetrics[1]

  const handleAddMetrics = () => {
    if (!metricsForm.weight) return
    addBodyMetrics({
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(metricsForm.weight),
      body_fat: metricsForm.body_fat ? parseFloat(metricsForm.body_fat) : undefined,
      muscle_mass: metricsForm.muscle_mass ? parseFloat(metricsForm.muscle_mass) : undefined,
    })
    setShowMetricsForm(false)
    setMetricsForm({ weight: '', body_fat: '', muscle_mass: '' })
  }

  const filteredSessions = filter === 'week'
    ? sessions.filter((s) => {
        const d = new Date(s.date)
        const week = new Date(now)
        week.setDate(now.getDate() - 7)
        return d >= week
      })
    : sessions.filter((s) => {
        const d = new Date(s.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })

  return (
    <div>
      <Header title="Tiến Độ" subtitle="Theo dõi sự tiến bộ của bạn" />

      {/* Body metrics summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Cân nặng', value: latestMetrics?.weight, prev: prevMetrics?.weight, unit: 'kg', icon: '⚖️' },
          { label: 'Body Fat', value: latestMetrics?.body_fat, prev: prevMetrics?.body_fat, unit: '%', icon: '🔬' },
          { label: 'Cơ bắp', value: latestMetrics?.muscle_mass, prev: prevMetrics?.muscle_mass, unit: '%', icon: '💪' },
          { label: 'Tổng buổi', value: sessions.length, prev: null, unit: 'buổi', icon: '🏋️' },
        ].map((stat) => {
          const diff = stat.prev && stat.value ? stat.value - stat.prev : null
          return (
            <Card key={stat.label}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                {diff !== null && (
                  <Badge variant={diff < 0 ? (stat.label === 'Cân nặng' ? 'success' : 'danger') : 'warning'}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                  </Badge>
                )}
              </div>
              <p className="text-xl font-bold text-[#f0f0ff]">
                {stat.value !== undefined ? stat.value : '—'}{stat.value !== undefined ? stat.unit : ''}
              </p>
              <p className="text-xs text-[#8888aa]">{stat.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Weight chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#f0f0ff]">Cân nặng theo thời gian</h2>
            <Button size="sm" variant="secondary" onClick={() => setShowMetricsForm(!showMetricsForm)}>
              + Cập nhật
            </Button>
          </div>
          {showMetricsForm && (
            <div className="mb-4 p-3 bg-[#1a1a28] rounded-lg space-y-2">
              {[
                { key: 'weight', label: 'Cân nặng (kg)', placeholder: '70' },
                { key: 'body_fat', label: 'Body fat %', placeholder: '15' },
                { key: 'muscle_mass', label: 'Cơ bắp %', placeholder: '40' },
              ].map((f) => (
                <div key={f.key} className="flex items-center gap-2">
                  <label className="text-xs text-[#8888aa] w-28 flex-shrink-0">{f.label}</label>
                  <input
                    type="number"
                    placeholder={f.placeholder}
                    value={metricsForm[f.key as keyof typeof metricsForm]}
                    onChange={(e) => setMetricsForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="flex-1 bg-[#0a0a0f] border border-[#22223a] rounded-lg px-3 py-1.5 text-sm text-[#f0f0ff] outline-none focus:border-[#7c6ff7]"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={handleAddMetrics} disabled={!metricsForm.weight}>Lưu</Button>
                <Button size="sm" variant="secondary" onClick={() => setShowMetricsForm(false)}>Hủy</Button>
              </div>
            </div>
          )}
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22223a" />
                <XAxis dataKey="date" tick={{ fill: '#555570', fontSize: 11 }} />
                <YAxis tick={{ fill: '#555570', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="weight" stroke="#7c6ff7" strokeWidth={2} dot={{ fill: '#7c6ff7', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-[#555570] text-sm">Chưa có dữ liệu cân nặng</p>
            </div>
          )}
        </Card>

        {/* Weekly sessions */}
        <Card>
          <h2 className="text-sm font-semibold text-[#f0f0ff] mb-4">Buổi tập theo tuần</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#22223a" />
              <XAxis dataKey="week" tick={{ fill: '#555570', fontSize: 11 }} />
              <YAxis tick={{ fill: '#555570', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sessions" fill="#7c6ff7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Calories chart */}
        <Card>
          <h2 className="text-sm font-semibold text-[#f0f0ff] mb-4">Calo đốt gần đây</h2>
          {caloriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={caloriesData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22223a" />
                <XAxis dataKey="date" tick={{ fill: '#555570', fontSize: 11 }} />
                <YAxis tick={{ fill: '#555570', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" stroke="#f59e0b" fill="url(#calGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-[#555570] text-sm">Chưa có dữ liệu calo</p>
            </div>
          )}
        </Card>

        {/* Achievements */}
        <Card>
          <h2 className="text-sm font-semibold text-[#f0f0ff] mb-4">Thành tích</h2>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = unlockedAchievements[ach.id as keyof typeof unlockedAchievements]
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    unlocked
                      ? 'border-[#7c6ff7]/50 bg-[#7c6ff7]/10'
                      : 'border-[#22223a] bg-[#1a1a28] opacity-40'
                  }`}
                >
                  <div className="text-2xl mb-1">{ach.icon}</div>
                  <p className="text-xs font-medium text-[#f0f0ff]">{ach.title}</p>
                  <p className="text-xs text-[#555570] mt-0.5">{ach.description}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Workout history */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#f0f0ff]">Lịch sử tập luyện</h2>
          <div className="flex gap-2">
            {(['week', 'month'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filter === f ? 'bg-[#7c6ff7] text-white' : 'bg-[#1a1a28] text-[#8888aa] border border-[#22223a]'
                }`}
              >
                {f === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-[#8888aa] text-sm">Không có buổi tập trong {filter === 'week' ? 'tuần' : 'tháng'} này</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#1a1a28] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#7c6ff7]/20 flex items-center justify-center">
                    {session.exercises[0]?.exercise.emoji || '💪'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f0f0ff]">
                      {session.exercises.map((e) => e.exercise.nameVi).join(', ').slice(0, 35)}
                    </p>
                    <p className="text-xs text-[#8888aa]">
                      {new Date(session.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[#555570]">Thời gian</p>
                    <p className="text-xs font-medium text-[#f0f0ff]">{session.duration}p</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#555570]">Calo</p>
                    <p className="text-xs font-medium text-orange-400">{session.calories}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#555570]">Reps</p>
                    <p className="text-xs font-medium text-green-400">{session.totalReps}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
