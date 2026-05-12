import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header } from '../components/layout/Header'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useUserStore } from '../store/useUserStore'
import { useAuthStore } from '../store/useAuthStore'

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// delay passed via motion.div custom + transition prop directly

function StatCard({ label, value, unit, icon, variant, delay }: {
  label: string; value: string | number; unit: string; icon: string
  variant: 'purple' | 'orange' | 'green' | 'blue'; delay: number
}) {
  const variants = {
    purple: { text: '#a89af8', bg: 'stat-purple', dot: '#7c6df0' },
    orange: { text: '#fb923c', bg: 'stat-orange', dot: '#fb923c' },
    green:  { text: '#34d399', bg: 'stat-green',  dot: '#34d399' },
    blue:   { text: '#38bdf8', bg: 'stat-blue',   dot: '#38bdf8' },
  }
  const v = variants[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`${v.bg} rounded-2xl p-5 relative overflow-hidden`}
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      {/* Corner glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-30 blur-2xl pointer-events-none"
        style={{ background: v.dot }} />

      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--c-muted)' }}>
          {label}
        </span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-black leading-none" style={{ color: v.text }}>{value}</span>
        <span className="text-xs font-medium mb-0.5" style={{ color: 'var(--c-faint)' }}>{unit}</span>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${v.dot}, transparent)` }} />
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { sessions } = useWorkoutStore()
  const { profile } = useUserStore()
  const { user } = useAuthStore()
  const displayName = profile?.name || user?.name || 'bạn'

  const now = new Date()
  const thisMonth = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalCalories = thisMonth.reduce((sum, s) => sum + s.calories, 0)
  const totalReps = thisMonth.reduce((sum, s) => sum + s.totalReps, 0)
  const avgDuration = thisMonth.length > 0
    ? Math.round(thisMonth.reduce((sum, s) => sum + s.duration, 0) / thisMonth.length) : 0

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return { day: DAYS_VI[d.getDay()], active: sessions.some(s => s.date === dateStr), isToday: i === 6 }
  })

  const activeDays = weekDays.filter(d => d.active).length
  const recentSessions = sessions.slice(0, 5)

  return (
    <div>
      <Header
        title={`Xin chào, ${displayName} 👋`}
        subtitle={now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        action={{ label: '+ Tập ngay', onClick: () => navigate('/live') }}
      />

      {/* Stats — 4 col */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Buổi tập tháng" value={thisMonth.length}                       unit="buổi" icon="🏋️" variant="purple" delay={0} />
        <StatCard label="Calo đốt"        value={totalCalories.toLocaleString('vi-VN')} unit="kcal"  icon="🔥" variant="orange" delay={1} />
        <StatCard label="Tổng reps"       value={totalReps.toLocaleString('vi-VN')}     unit="reps"  icon="💪" variant="green"  delay={2} />
        <StatCard label="Thời gian TB"    value={avgDuration}                           unit="phút"  icon="⏱️" variant="blue"   delay={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Weekly tracker */}
        <motion.div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{ background: 'rgba(14,14,28,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#e8e8f8' }}>Tuần này</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-faint)' }}>{activeDays}/5 ngày mục tiêu</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black" style={{ color: 'var(--c-accent2)' }}>
                {Math.round((activeDays / 5) * 100)}%
              </div>
              <p className="text-[10px]" style={{ color: 'var(--c-faint)' }}>hoàn thành</p>
            </div>
          </div>

          <div className="flex gap-2 justify-between mb-5">
            {weekDays.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold relative overflow-hidden"
                  style={
                    day.active
                      ? { background: 'linear-gradient(135deg, #7c6df0, #a89af8)', boxShadow: '0 4px 12px rgba(124,109,240,0.35)' }
                      : day.isToday
                      ? { background: 'rgba(124,109,240,0.08)', border: '1.5px dashed rgba(124,109,240,0.4)', color: 'var(--c-accent2)' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                >
                  {day.active
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                    : day.isToday
                    ? <span className="text-[10px] font-black" style={{ color: 'var(--c-accent2)' }}>●</span>
                    : null
                  }
                </motion.div>
                <span className="text-[10px] font-semibold"
                  style={{ color: day.isToday ? 'var(--c-accent)' : 'var(--c-faint)' }}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (activeDays / 5) * 100)}%` }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>

        {/* Quick start */}
        <motion.div
          className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
          style={{ background: 'rgba(14,14,28,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        >
          {/* BG glow */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: '#7c6df0', transform: 'translate(40%,-40%)' }} />

          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-1.5 mb-2">
              <motion.span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#34d399' }}>AI Ready</span>
            </div>
            <h2 className="text-base font-bold mb-1" style={{ color: '#e8e8f8' }}>Live AI Pose</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--c-muted)' }}>Phân tích tư thế real-time qua camera</p>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {[{ e: '🏋️', n: 'Squat' }, { e: '💪', n: 'Push-up' }, { e: '🧱', n: 'Plank' }].map(ex => (
                <div key={ex.n} className="rounded-xl p-2 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-lg mb-0.5">{ex.e}</div>
                  <p className="text-[9px] font-medium" style={{ color: 'var(--c-faint)' }}>{ex.n}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            onClick={() => navigate('/live')}
            className="w-full py-3 rounded-xl text-sm font-bold text-white btn-primary relative z-10"
            whileTap={{ scale: 0.97 }}
          >
            Mở Live AI →
          </motion.button>
        </motion.div>
      </div>

      {/* Recent sessions */}
      <motion.div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(14,14,28,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: '#e8e8f8' }}>Lịch sử gần đây</h2>
          <button onClick={() => navigate('/progress')}
            className="text-xs font-semibold transition-colors duration-200 hover:text-[#a89af8]"
            style={{ color: 'var(--c-accent)' }}>
            Xem tất cả →
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              className="text-5xl mb-3 inline-block"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >🚀</motion.div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-muted)' }}>Chưa có buổi tập nào</p>
            <p className="text-xs mb-5" style={{ color: 'var(--c-faint)' }}>Hãy bắt đầu hành trình của bạn!</p>
            <motion.button
              onClick={() => navigate('/live')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white btn-primary"
              whileTap={{ scale: 0.97 }}
            >
              Bắt đầu ngay
            </motion.button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentSessions.map((session, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + idx * 0.05 }}
                whileHover={{ borderColor: 'rgba(124,109,240,0.25)', background: 'rgba(124,109,240,0.05)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(124,109,240,0.12)', border: '1px solid rgba(124,109,240,0.2)' }}>
                  {session.exercises[0]?.exercise.emoji || '💪'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#e8e8f8' }}>
                    {session.exercises.map(e => e.exercise.nameVi).join(' · ')}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-faint)' }}>
                    {new Date(session.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-5 flex-shrink-0">
                  {[
                    { label: 'Thời gian', val: `${session.duration}p`, color: '#e8e8f8' },
                    { label: 'Calo',      val: `${session.calories}`,  color: '#fb923c' },
                    { label: 'Reps',      val: `${session.totalReps}`, color: '#34d399' },
                  ].map(stat => (
                    <div key={stat.label} className="text-right">
                      <p className="text-[10px]" style={{ color: 'var(--c-faint)' }}>{stat.label}</p>
                      <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.val}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
