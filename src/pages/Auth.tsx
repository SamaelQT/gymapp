import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/* ─── Icons ─────────────────────────────────── */
const EyeOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

/* ─── Skeleton joints / connections ─────────── */
// ViewBox 0 0 160 310, athletic upright pose
const J: Record<string, [number, number]> = {
  head: [80, 22],
  neck: [80, 42],
  lSh:  [45, 60],  rSh:  [115, 60],
  lEl:  [28, 108], rEl:  [132, 108],
  lWr:  [20, 148], rWr:  [140, 148],
  lHp:  [60, 158], rHp:  [100, 158],
  lKn:  [58, 222], rKn:  [102, 222],
  lAn:  [56, 292], rAn:  [104, 292],
}
const BONES: [string, string][] = [
  ['neck','lSh'], ['neck','rSh'], ['lSh','rSh'],
  ['lSh','lEl'],  ['lEl','lWr'],
  ['rSh','rEl'],  ['rEl','rWr'],
  ['lSh','lHp'],  ['rSh','rHp'],
  ['lHp','rHp'],
  ['lHp','lKn'],  ['lKn','lAn'],
  ['rHp','rKn'],  ['rKn','rAn'],
]
const JCOLORS: Record<string, string> = {
  neck:'#a78bfa',
  lSh:'#c4b5fd', rSh:'#c4b5fd',
  lEl:'#818cf8',  rEl:'#818cf8',
  lWr:'#38bdf8',  rWr:'#38bdf8',
  lHp:'#c4b5fd',  rHp:'#c4b5fd',
  lKn:'#60a5fa',  rKn:'#60a5fa',
  lAn:'#38bdf8',  rAn:'#38bdf8',
}
const JSIZE: Record<string, number> = {
  neck:3, lSh:5.5, rSh:5.5, lHp:5.5, rHp:5.5,
  lEl:4.2, rEl:4.2, lKn:4.2, rKn:4.2,
  lWr:3.2, rWr:3.2, lAn:3.2, rAn:3.2,
}

// Spine checkpoints
const SPINE = [42, 58, 76, 94, 112, 130, 148, 158].map(y => [80, y] as [number, number])

function AISkeleton() {
  return (
    <div style={{ position: 'relative', width: 200, height: 340 }}>
      {/* Ambient body glow */}
      <div style={{
        position: 'absolute', left: '10%', right: '10%', top: '5%', bottom: '5%',
        background: 'radial-gradient(ellipse 60% 88% at 50% 48%, rgba(99,102,241,0.32) 0%, rgba(56,189,248,0.12) 55%, transparent 80%)',
        filter: 'blur(10px)', pointerEvents: 'none',
      }} />

      {/* Scan line */}
      <motion.div style={{
        position: 'absolute', left: 12, right: 12, height: 56,
        background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.12) 30%, rgba(56,189,248,0.22) 50%, rgba(99,102,241,0.12) 70%, transparent 100%)',
        pointerEvents: 'none',
      }}
        animate={{ top: ['-15%', '115%'] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
      />

      <svg viewBox="0 0 160 310" fill="none" style={{ position: 'absolute', left: 8, top: 8, width: 164, height: 310 }}>
        <defs>
          <filter id="sk-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="sk-glow-sm" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="sk-glow-lg" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="bone-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#c4b5fd" stopOpacity="0.98"/>
            <stop offset="45%"  stopColor="#818cf8" stopOpacity="0.92"/>
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.88"/>
          </linearGradient>
          <linearGradient id="rib-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#818cf8" stopOpacity="0"/>
            <stop offset="30%"  stopColor="#818cf8" stopOpacity="0.5"/>
            <stop offset="70%"  stopColor="#818cf8" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* ── Body silhouette (faint) ── */}
        {/* Torso shape */}
        <path d="M46,60 C40,75 36,95 36,115 C36,135 40,148 50,155 L60,158 L100,158 L110,155 C120,148 124,135 124,115 C124,95 120,75 114,60 L80,55 Z"
          fill="rgba(99,102,241,0.06)" stroke="rgba(129,140,248,0.12)" strokeWidth="0.6"/>
        {/* Left upper arm outline */}
        <path d="M45,60 C38,72 32,88 28,108 C26,118 22,134 20,148 L25,149 C27,135 30,120 32,110 C36,90 42,74 48,62 Z"
          fill="rgba(99,102,241,0.05)" stroke="rgba(129,140,248,0.08)" strokeWidth="0.5"/>
        {/* Right upper arm outline */}
        <path d="M115,60 C122,72 128,88 132,108 C134,118 138,134 140,148 L135,149 C133,135 130,120 128,110 C124,90 118,74 112,62 Z"
          fill="rgba(99,102,241,0.05)" stroke="rgba(129,140,248,0.08)" strokeWidth="0.5"/>
        {/* Left leg outline */}
        <path d="M60,158 C58,172 56,195 56,222 C56,248 55,268 54,292 L60,292 C61,268 62,248 62,222 C62,195 63,172 63,158 Z"
          fill="rgba(99,102,241,0.05)" stroke="rgba(129,140,248,0.08)" strokeWidth="0.5"/>
        {/* Right leg outline */}
        <path d="M100,158 C102,172 104,195 104,222 C104,248 105,268 106,292 L100,292 C99,268 98,248 98,222 C98,195 97,172 97,158 Z"
          fill="rgba(99,102,241,0.05)" stroke="rgba(129,140,248,0.08)" strokeWidth="0.5"/>

        {/* ── Ribcage ── */}
        <ellipse cx="80" cy="105" rx="30" ry="40"
          fill="none" stroke="rgba(129,140,248,0.22)" strokeWidth="0.8" strokeDasharray="2.5 3"/>
        {/* Sternum */}
        <line x1="80" y1="63" x2="80" y2="140" stroke="rgba(167,139,250,0.25)" strokeWidth="0.8"/>
        {/* Ribs */}
        <path d="M50,88 C60,92 70,95 80,95 C90,95 100,92 110,88" stroke="url(#rib-g)" strokeWidth="0.9" fill="none"/>
        <path d="M50,100 C60,105 70,108 80,108 C90,108 100,105 110,100" stroke="url(#rib-g)" strokeWidth="0.9" fill="none"/>
        <path d="M51,112 C61,118 71,121 80,121 C89,121 99,118 109,112" stroke="url(#rib-g)" strokeWidth="0.9" fill="none"/>
        <path d="M53,124 C62,130 71,133 80,133 C89,133 98,130 107,124" stroke="url(#rib-g)" strokeWidth="0.7" fill="none" opacity="0.7"/>

        {/* ── Pelvis ── */}
        <path d="M55,158 C60,172 68,178 80,178 C92,178 100,172 105,158" fill="rgba(129,140,248,0.05)" stroke="rgba(129,140,248,0.28)" strokeWidth="0.9" fill="none"/>
        <line x1="80" y1="158" x2="80" y2="175" stroke="rgba(129,140,248,0.2)" strokeWidth="0.7"/>

        {/* ── Spine dots ── */}
        {SPINE.map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={i === 0 ? 2.2 : 1.5}
            fill="#818cf8" opacity={Math.max(0.15, 0.65 - i * 0.06)}
            filter={i < 3 ? 'url(#sk-glow-sm)' : undefined}/>
        ))}

        {/* ── Bones ── */}
        {BONES.map(([a, b]) => (
          <line key={`${a}-${b}`}
            x1={J[a][0]} y1={J[a][1]} x2={J[b][0]} y2={J[b][1]}
            stroke="url(#bone-g)" strokeWidth="2.2" strokeLinecap="round"
            filter="url(#sk-glow-sm)"/>
        ))}
        {/* Neck to head */}
        <line x1={80} y1={42} x2={80} y2={40} stroke="url(#bone-g)" strokeWidth="2" strokeLinecap="round"/>

        {/* ── Head ── */}
        {/* Outer glow halo */}
        <circle cx={80} cy={22} r={24} fill="rgba(196,181,253,0.06)" filter="url(#sk-glow-lg)"/>
        {/* Skull */}
        <circle cx={80} cy={22} r={19} stroke="#c4b5fd" strokeWidth="1.6"
          fill="rgba(196,181,253,0.09)" filter="url(#sk-glow)"/>
        {/* Inner skull detail */}
        <circle cx={80} cy={22} r={14} stroke="rgba(196,181,253,0.2)" strokeWidth="0.5"
          fill="rgba(196,181,253,0.04)" strokeDasharray="2 4"/>
        {/* Crosshair reticle */}
        <line x1={80} y1={7}  x2={80} y2={12} stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1={80} y1={32} x2={80} y2={37} stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1={65} y1={22} x2={70} y2={22} stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1={90} y1={22} x2={95} y2={22} stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        {/* Center dot */}
        <circle cx={80} cy={22} r={4} fill="#c4b5fd" filter="url(#sk-glow)"/>
        <circle cx={80} cy={22} r={1.8} fill="white" opacity="0.9"/>

        {/* ── Joints ── */}
        {Object.entries(J).filter(([k]) => k !== 'head' && k !== 'neck').map(([k, [cx, cy]]) => {
          const r  = JSIZE[k] ?? 3.5
          const c  = JCOLORS[k] ?? '#38bdf8'
          return (
            <g key={k} filter="url(#sk-glow-sm)">
              {/* Outer pulse ring */}
              <circle cx={cx} cy={cy} r={r + 7} fill={c} opacity={0.08}/>
              {/* Mid ring */}
              <circle cx={cx} cy={cy} r={r + 3.5} fill="none" stroke={c} strokeWidth="0.7" opacity="0.3"/>
              {/* Joint body */}
              <circle cx={cx} cy={cy} r={r} fill={c}/>
              {/* Inner highlight */}
              <circle cx={cx} cy={cy} r={r * 0.38} fill="rgba(255,255,255,0.85)"/>
            </g>
          )
        })}

        {/* ── Data scan overlay ── */}
        {/* Corner brackets top-left */}
        <path d="M22,8 L22,18 M22,8 L32,8" stroke="rgba(56,189,248,0.4)" strokeWidth="1" strokeLinecap="round"/>
        {/* Corner brackets top-right */}
        <path d="M138,8 L138,18 M138,8 L128,8" stroke="rgba(56,189,248,0.4)" strokeWidth="1" strokeLinecap="round"/>
        {/* Corner brackets bottom-left */}
        <path d="M22,302 L22,292 M22,302 L32,302" stroke="rgba(56,189,248,0.4)" strokeWidth="1" strokeLinecap="round"/>
        {/* Corner brackets bottom-right */}
        <path d="M138,302 L138,292 M138,302 L128,302" stroke="rgba(56,189,248,0.4)" strokeWidth="1" strokeLinecap="round"/>
      </svg>

      {/* REPS badge */}
      <motion.div
        style={{ position: 'absolute', top: '6%', right: 0 }}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div style={{
          background: 'rgba(9,7,26,0.96)', border: '1px solid rgba(167,139,250,0.45)',
          backdropFilter: 'blur(16px)', boxShadow: '0 6px 24px rgba(124,109,240,0.35)',
          borderRadius: 14, padding: '8px 14px', textAlign: 'center', minWidth: 62,
        }}>
          <div style={{ color: '#c4b5fd', fontSize: 20, fontWeight: 900, lineHeight: 1 }}>12</div>
          <div style={{ color: '#5545a0', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', marginTop: 4 }}>REPS</div>
        </div>
      </motion.div>

      {/* FORM badge */}
      <motion.div
        style={{ position: 'absolute', bottom: '16%', right: 0 }}
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <div style={{
          background: 'rgba(9,7,26,0.96)', border: '1px solid rgba(56,189,248,0.4)',
          backdropFilter: 'blur(16px)', boxShadow: '0 6px 24px rgba(56,189,248,0.22)',
          borderRadius: 14, padding: '8px 12px', minWidth: 90,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="30" height="30" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r="11" fill="none" stroke="rgba(56,189,248,0.15)" strokeWidth="2.5"/>
            <circle cx="15" cy="15" r="11" fill="none" stroke="#38bdf8" strokeWidth="2.5"
              strokeDasharray={`${0.92 * 69.1} 69.1`} strokeLinecap="round"
              transform="rotate(-90 15 15)"/>
          </svg>
          <div>
            <div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>92%</div>
            <div style={{ color: '#5060a0', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', marginTop: 3 }}>FORM</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Auth Page ──────────────────────────────── */
export default function Auth() {
  const { login, register } = useAuthStore()
  const [mode, setMode]     = useState<'login' | 'register'>('login')
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const reset = (m: 'login' | 'register') => { setMode(m); setError(''); setPassword('') }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!name.trim()) throw new Error('Vui lòng nhập họ tên')
        await register(name.trim(), email, password)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally { setLoading(false) }
  }

  const handleDemo = async () => {
    setLoading(true)
    try {
      await register('Demo User', 'demo@fitforge.app', 'demo123').catch(() => {})
      await login('demo@fitforge.app', 'demo123')
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#06060f', position: 'relative', overflow: 'hidden' }}>

      {/* BG glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,109,240,0.14) 0%, transparent 60%)', filter: 'blur(80px)' }}/>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)', filter: 'blur(80px)' }}/>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(124,109,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,109,240,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
            boxShadow: '0 0 20px rgba(124,109,240,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
              <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
              <span style={{ color: '#e8e8f8' }}>Fit</span>
              <span style={{ background: 'linear-gradient(135deg, #a89af8, #7c6df0, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Forge</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', color: '#7c6df0', textTransform: 'uppercase' }}>AI Powered</div>
          </div>
        </div>

        {/* Privacy pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 99,
          background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2} strokeLinecap="round" style={{ width: 13, height: 13 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#34d399' }}>Dữ liệu lưu cục bộ • Không cần server</span>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 32px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, width: '100%', maxWidth: 1080 }}>

          {/* ── LEFT ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, minWidth: 0 }}
          >
            {/* AI badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 99, marginBottom: 22,
              background: 'rgba(124,109,240,0.1)', border: '1px solid rgba(124,109,240,0.3)',
            }}>
              <svg viewBox="0 0 24 24" fill="#a89af8" style={{ width: 11, height: 11 }}>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a89af8' }}>Được hỗ trợ bởi AI</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 16, color: '#e8e8f8', fontSize: 'clamp(1.9rem, 2.8vw, 3.2rem)' }}>
              Tập thông minh<br/>
              <span style={{ background: 'linear-gradient(135deg, #a89af8 0%, #7c6df0 40%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                không phải<br/>tập nhiều
              </span>
            </h1>

            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6060a0', marginBottom: 28, maxWidth: 360 }}>
              AI phân tích từng động tác, đếm rep, chấm điểm tư thế — tất cả qua camera của bạn.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth={1.8} strokeLinecap="round" style={{width:15,height:15}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>, bg:'rgba(124,109,240,0.13)', val:'10K+', label:'Buổi tập' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth={1.8} strokeLinecap="round" style={{width:15,height:15}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>, bg:'rgba(56,189,248,0.12)', val:'98%', label:'Độ chính xác' },
                { icon: <svg viewBox="0 0 24 24" fill="#34d399" style={{width:14,height:14}}><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13Z"/></svg>, bg:'rgba(52,211,153,0.12)', val:'3 AI', label:'Tính năng' },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, background: 'linear-gradient(135deg, #a89af8, #7c6df0, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: '#46467a', marginTop: 1 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { emoji: '🤖', bg: 'rgba(124,109,240,0.16)', title: 'Live AI Pose Detection', desc: 'Camera phân tích tư thế tập luyện real-time' },
                { emoji: '📊', bg: 'rgba(56,189,248,0.13)',  title: 'Theo dõi tiến độ',       desc: 'Biểu đồ cân nặng, calo, reps theo thời gian' },
                { emoji: '🔥', bg: 'rgba(52,211,153,0.13)',  title: 'Dinh dưỡng AI',          desc: 'Thực đơn cá nhân hóa từ Google Gemini' },
              ].map(f => (
                <div key={f.title} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 17 }}>{f.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#c4c4e4' }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: '#44447a', marginTop: 2 }}>{f.desc}</div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#35356a" strokeWidth={2} strokeLinecap="round" style={{ width: 15, height: 15, flexShrink: 0 }}>
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── AI FIGURE ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200 }}
          >
            <AISkeleton />
          </motion.div>

          {/* ── FORM CARD ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ flexShrink: 0, width: 360 }}
          >
            {/* Gradient border */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(124,109,240,0.55) 0%, rgba(168,154,248,0.22) 40%, rgba(59,130,246,0.15) 75%, rgba(255,255,255,0.04) 100%)',
              borderRadius: 22, padding: 1,
              boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 50px rgba(124,109,240,0.08)',
            }}>
              <div style={{ borderRadius: 21, overflow: 'hidden', background: 'rgba(8,7,20,0.98)' }}>
                {/* Top accent */}
                <div style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, rgba(124,109,240,0.9) 25%, rgba(59,130,246,0.8) 70%, transparent 100%)' }}/>
                <div style={{ padding: 28 }}>

                  {/* Heading */}
                  <AnimatePresence mode="wait">
                    <motion.div key={mode}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }} style={{ marginBottom: 24 }}>
                      <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: '#e8e8f8', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {mode === 'login' ? 'Chào mừng trở lại!' : 'Bắt đầu ngay!'}
                        <span style={{ fontSize: 20 }}>{mode === 'login' ? '👋' : '🚀'}</span>
                      </h2>
                      <p style={{ fontSize: 13, color: '#5858a0' }}>
                        {mode === 'login' ? 'Đăng nhập để tiếp tục hành trình của bạn' : 'Miễn phí · Không cần thẻ tín dụng'}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                      <motion.div key={mode + '-fields'}
                        initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.18 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {mode === 'register' && (
                          <div>
                            <Label htmlFor="name" className="auth-label">Họ và tên</Label>
                            <div style={{ position: 'relative', marginTop: 6 }}>
                              <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#44447a', pointerEvents: 'none', zIndex: 1 }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" style={{ width: 15, height: 15 }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                              </div>
                              <Input id="name" placeholder="Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required className="auth-input auth-input-icon"/>
                            </div>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="email" className="auth-label">Email</Label>
                          <div style={{ position: 'relative', marginTop: 6 }}>
                            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#44447a', pointerEvents: 'none', zIndex: 1 }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" style={{ width: 15, height: 15 }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            </div>
                            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required className="auth-input auth-input-icon"/>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="password" className="auth-label">Mật khẩu</Label>
                          <div style={{ position: 'relative', marginTop: 6 }}>
                            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#44447a', pointerEvents: 'none', zIndex: 1 }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" style={{ width: 15, height: 15 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <Input id="password" type={showPass ? 'text' : 'password'}
                              placeholder={mode === 'register' ? 'Tối thiểu 6 ký tự' : '••••••••'}
                              value={password} onChange={e => setPassword(e.target.value)}
                              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                              required className="auth-input auth-input-icon" style={{ paddingRight: 40 }}/>
                            <button type="button" onClick={() => setShowPass(p => !p)} style={{
                              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                              color: showPass ? '#a89af8' : '#44447a', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            }}>
                              {showPass ? <EyeOff /> : <EyeOn />}
                            </button>
                          </div>
                        </div>

                        {/* Remember me */}
                        {mode === 'login' && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <button type="button" onClick={() => setRemember(r => !r)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                              <div style={{
                                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                background: remember ? '#7c6df0' : 'transparent',
                                border: remember ? '1px solid #7c6df0' : '1px solid rgba(255,255,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}>
                                {remember && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" style={{ width: 10, height: 10 }}><polyline points="20 6 9 17 4 12"/></svg>}
                              </div>
                              <span style={{ fontSize: 12, color: '#6868a0', userSelect: 'none' }}>Ghi nhớ đăng nhập</span>
                            </button>
                            <button type="button" style={{ fontSize: 12, color: '#a89af8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                              Quên mật khẩu?
                            </button>
                          </div>
                        )}

                        {/* Error */}
                        <AnimatePresence>
                          {error && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                              {error}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Submit button */}
                        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                          style={{
                            width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                            background: 'linear-gradient(90deg, #7c6df0 0%, #4f46e5 45%, #3b82f6 100%)',
                            boxShadow: '0 4px 20px rgba(79,70,229,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
                            color: 'white', fontSize: 14, fontWeight: 700, opacity: loading ? 0.6 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}>
                          {loading ? (
                            <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/> {mode === 'login' ? 'Đang đăng nhập...' : 'Đang tạo...'}</>
                          ) : (
                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" style={{ width: 15, height: 15 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</>
                          )}
                        </motion.button>
                      </motion.div>
                    </AnimatePresence>
                  </form>

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }}/>
                    <span style={{ fontSize: 11, color: '#333360' }}>hoặc</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }}/>
                  </div>

                  {/* Demo */}
                  <motion.button type="button" onClick={handleDemo} disabled={loading} whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%', height: 42, borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#5858a0', fontSize: 13, fontWeight: 500, opacity: loading ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(124,109,240,0.18)', border: '1px solid rgba(124,109,240,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="#a89af8" style={{ width: 9, height: 9, marginLeft: 1 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    Dùng tài khoản Demo
                  </motion.button>

                  {/* Switch mode */}
                  <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#484880' }}>
                    {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                    <button type="button" onClick={() => reset(mode === 'login' ? 'register' : 'login')}
                      style={{ color: '#a89af8', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                      {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 48,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2} strokeLinecap="round" style={{ width: 13, height: 13 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontSize: 12, color: '#2d7a60' }}>Bảo mật & riêng tư • Dữ liệu chỉ lưu trên thiết bị của bạn</span>
        </div>
        <span style={{ fontSize: 12, color: '#2a2a5a' }}>© 2024 FitForge. AI Powered Fitness Assistant.</span>
      </footer>
    </div>
  )
}
