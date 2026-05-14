import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useUserStore } from '../store/useUserStore'
import { useAuthStore } from '../store/useAuthStore'

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/* ─── Icons ─────────────────────────────────────── */
const IcDumbbell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" style={{ width: 17, height: 17 }}>
    <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3" />
  </svg>
)
const IcFlame = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}>
    <path d="M12 2c0 0-5.5 5.8-5.5 11a5.5 5.5 0 0 0 11 0c0-2.6-1.3-4.8-2.7-6.3 0 2.1-1.4 3-2.3 3-1.2 0-2-1-1.8-2.5C10.9 5.6 12 2 12 2z" />
  </svg>
)
const IcMuscle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" style={{ width: 17, height: 17 }}>
    <path d="M6.5 6.5c1-1 2.5-1.5 4-1s3.5 2 3.5 2l2-2c1-1 2.5-.5 2.5 1.5v3c0 1-1 1.5-2 1.5H6c-1 0-2-.5-2-1.5V8c0-1.5 1.5-2.5 2.5-1.5z" />
    <path d="M6 12v5c0 1 .5 1.5 1.5 1.5h9c1 0 1.5-.5 1.5-1.5v-5" />
  </svg>
)
const IcClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" style={{ width: 17, height: 17 }}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IcPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const IcArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" style={{ width: 13, height: 13 }}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

/* ─── Mini sparkline chart ───────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 54, H = 26
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - (v / max) * (H - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const id = color.replace(/[^a-z0-9]/gi, '')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id={`sg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#sg${id})`} points={`0,${H} ${pts} ${W},${H}`} />
      <polyline fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round"
        strokeLinejoin="round" points={pts} opacity="0.75" />
      {/* Last dot */}
      <circle cx={(W).toFixed(1)} cy={data.length > 0 ? (H - (data[data.length - 1] / max) * (H - 4) - 2).toFixed(1) : H / 2} r="2.5" fill={color} />
    </svg>
  )
}

/* ─── Stat Card ──────────────────────────────────── */
function StatCard({
  label, value, unit, Icon, color, bg, delay
}: {
  label: string; value: string | number; unit: string
  Icon: () => JSX.Element; color: string; bg: string; delay: number
}) {
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) || 0 : value
  const sparkData = num > 0
    ? [Math.round(num * 0.4), Math.round(num * 0.6), Math.round(num * 0.5), Math.round(num * 0.8), Math.round(num * 0.7), Math.round(num * 0.9), num]
    : [1, 2, 1, 3, 2, 2, 3]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      style={{
        background: 'rgba(10,10,22,0.92)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '20px 20px 18px',
        position: 'relative', overflow: 'hidden', cursor: 'default',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${color}88 40%, ${color}88 60%, transparent 100%)`,
      }} />
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -35, right: -35, width: 100, height: 100,
        borderRadius: '50%', background: color, opacity: 0.13, filter: 'blur(32px)',
        pointerEvents: 'none',
      }} />

      {/* Icon + sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: bg, border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, flexShrink: 0,
        }}>
          <Icon />
        </div>
        <Sparkline data={sparkData} color={color} />
      </div>

      {/* Value */}
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1, color }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{unit}</div>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.13em', color: 'rgba(255,255,255,0.2)', marginTop: 10,
      }}>
        {label}
      </div>
    </motion.div>
  )
}

/* ─── Dashboard ──────────────────────────────────── */
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
  const pct = Math.round((activeDays / 5) * 100)

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ══ HEADER ══ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 5 }}>
            <div style={{ width: 3, height: 26, borderRadius: 99, background: 'linear-gradient(180deg, #c084fc, #7c6df0)', flexShrink: 0 }} />
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: '#d8d8f0' }}>Xin chào,</span>
              {' '}
              <span style={{ background: 'linear-gradient(135deg, #a89af8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {displayName}
              </span>
              <span style={{ WebkitTextFillColor: 'initial', color: '#d8d8f0' }}>👋</span>
            </h1>
          </div>
          <p style={{ fontSize: 12, color: '#30305a', paddingLeft: 15 }}>
            {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <motion.button
            onClick={() => navigate('/live')}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c6df0 0%, #a89af8 100%)',
              boxShadow: '0 4px 20px rgba(124,109,240,0.42)',
              color: 'white', fontSize: 13, fontWeight: 700,
            }}
          >
            <IcPlay />
            Tập ngay
          </motion.button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 13px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 9,
              background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900, color: 'white', flexShrink: 0,
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#5858a0' }}>{displayName}</span>
          </div>
        </div>
      </motion.div>

      {/* ══ STAT CARDS ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard label="Buổi tập tháng" value={thisMonth.length}                       unit="buổi" Icon={IcDumbbell} color="#a89af8" bg="rgba(124,109,240,0.14)" delay={0} />
        <StatCard label="Calo đốt"        value={totalCalories.toLocaleString('vi-VN')} unit="kcal" Icon={IcFlame}    color="#fb923c" bg="rgba(251,146,60,0.13)"   delay={0.06} />
        <StatCard label="Tổng reps"       value={totalReps.toLocaleString('vi-VN')}     unit="reps" Icon={IcMuscle}   color="#34d399" bg="rgba(52,211,153,0.13)"  delay={0.12} />
        <StatCard label="Thời gian TB"    value={avgDuration}                           unit="phút" Icon={IcClock}    color="#38bdf8" bg="rgba(56,189,248,0.13)"   delay={0.18} />
      </div>

      {/* ══ WEEKLY + LIVE AI ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16, marginBottom: 18 }}>

        {/* Weekly tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 22, padding: '22px 24px', position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Bg glow */}
          <div style={{ position: 'absolute', top: -60, left: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(124,109,240,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#d0d0f0', letterSpacing: '-0.01em' }}>Tuần này</div>
              <div style={{ fontSize: 11, color: '#30305a', marginTop: 3 }}>{activeDays}/5 ngày mục tiêu</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 30, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
                background: 'linear-gradient(135deg, #a89af8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {pct}%
              </div>
              <div style={{ fontSize: 10, color: '#30305a', marginTop: 2 }}>hoàn thành</div>
            </div>
          </div>

          {/* Day circles */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', marginBottom: 18 }}>
            {weekDays.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...(day.active ? {
                      background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
                      boxShadow: '0 4px 16px rgba(124,109,240,0.5)',
                    } : day.isToday ? {
                      background: 'rgba(124,109,240,0.1)',
                      border: '2px dashed rgba(124,109,240,0.5)',
                    } : {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }),
                  }}
                >
                  {day.active ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.8} strokeLinecap="round" style={{ width: 14, height: 14 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : day.isToday ? (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a89af8' }} />
                  ) : null}
                </motion.div>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: day.isToday ? '#a89af8' : day.active ? '#6060a0' : '#25254a',
                }}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, pct)}%` }}
              transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: '100%', borderRadius: 99,
                background: 'linear-gradient(90deg, #7c6df0, #a89af8, #c084fc)',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </motion.div>

        {/* Live AI Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 22, padding: '22px', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Bg glow */}
          <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,109,240,0.14)', filter: 'blur(50px)', pointerEvents: 'none' }} />

          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            {/* AI badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.8)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#34d399' }}>AI Ready</span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 800, color: '#d0d0f0', marginBottom: 5, letterSpacing: '-0.01em' }}>Live AI Pose</div>
            <div style={{ fontSize: 12, color: '#404075', marginBottom: 16, lineHeight: 1.5 }}>
              Phân tích tư thế real-time qua camera
            </div>

            {/* Exercise tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
              {[{ e: '🏋️', n: 'Squat' }, { e: '💪', n: 'Push-up' }, { e: '🧱', n: 'Plank' }].map(ex => (
                <div key={ex.n} style={{
                  borderRadius: 12, padding: '10px 6px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{ex.e}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#404075' }}>{ex.n}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            onClick={() => navigate('/live')}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c6df0 0%, #a89af8 100%)',
              boxShadow: '0 4px 18px rgba(124,109,240,0.4)',
              color: 'white', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              position: 'relative', zIndex: 1,
            }}
          >
            <IcPlay />
            Mở Live AI
            <IcArrow />
          </motion.button>
        </motion.div>
      </div>

      {/* ══ RECENT SESSIONS ══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 22, padding: '22px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#d0d0f0', letterSpacing: '-0.01em' }}>Lịch sử gần đây</div>
          <button
            onClick={() => navigate('/progress')}
            style={{
              fontSize: 12, fontWeight: 600, color: '#5858a0', background: 'none',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a89af8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5858a0')}
          >
            Xem tất cả <IcArrow />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 48, marginBottom: 12, display: 'inline-block' }}
            >
              🚀
            </motion.div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#5858a0', marginBottom: 5 }}>Chưa có buổi tập nào</div>
            <div style={{ fontSize: 12, color: '#2e2e58', marginBottom: 18 }}>Bắt đầu hành trình fitness của bạn ngay hôm nay!</div>
            <motion.button
              onClick={() => navigate('/live')}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
                boxShadow: '0 4px 18px rgba(124,109,240,0.4)',
                color: 'white', fontSize: 13, fontWeight: 700,
              }}
            >
              <IcPlay /> Bắt đầu ngay
            </motion.button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSessions.map((session, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
                  borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'default', transition: 'border-color 0.2s, background 0.2s',
                }}
                whileHover={{ borderColor: 'rgba(124,109,240,0.25)', backgroundColor: 'rgba(124,109,240,0.06)' } as never}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(124,109,240,0.12)', border: '1px solid rgba(124,109,240,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {session.exercises[0]?.exercise.emoji || '💪'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#d0d0f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.exercises.map(e => e.exercise.nameVi).join(' · ')}
                  </div>
                  <div style={{ fontSize: 11, color: '#2e2e58', marginTop: 2 }}>
                    {new Date(session.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                  {[
                    { label: 'Thời gian', val: `${session.duration}p`, color: '#d0d0f0' },
                    { label: 'Calo', val: `${session.calories}`, color: '#fb923c' },
                    { label: 'Reps', val: `${session.totalReps}`, color: '#34d399' },
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: '#2e2e58' }}>{stat.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: stat.color, marginTop: 1 }}>{stat.val}</div>
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
