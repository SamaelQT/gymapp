import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'

/* ── tiny helpers ─────────────────────────── */
function InputField({
  label, type = 'text', placeholder, value, onChange, autoComplete, required,
  right,
}: {
  label: string; type?: string; placeholder: string; value: string
  onChange: (v: string) => void; autoComplete?: string; required?: boolean
  right?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'var(--c-muted)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          className="input-ring w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#e8e8f8',
            outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,109,240,0.6)'; e.currentTarget.style.background = 'rgba(124,109,240,0.06)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        />
        {right && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</span>}
      </div>
    </div>
  )
}

/* ── left panel feature list ──────────────── */
const FEATURES = [
  { icon: '🤖', title: 'Live AI Pose Detection', desc: 'Camera phân tích tư thế tập luyện real-time' },
  { icon: '📊', title: 'Theo dõi tiến độ', desc: 'Biểu đồ cân nặng, calo, reps theo thời gian' },
  { icon: '🥗', title: 'Dinh dưỡng AI', desc: 'Thực đơn cá nhân hóa từ Google Gemini' },
]

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden h-full"
      style={{
        background: 'linear-gradient(145deg, #0d0b1e 0%, #110d2a 50%, #0a0814 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>

      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,109,240,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(124,109,240,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,109,240,0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-sm"
            style={{ background: 'linear-gradient(135deg, #7c6df0, #a89af8)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" className="w-5 h-5">
              <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3"/>
            </svg>
          </div>
          <div>
            <div className="text-xl font-black tracking-tight">
              <span style={{ color: '#e8e8f8' }}>Fit</span>
              <span className="grad-text">Forge</span>
            </div>
            <div className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: 'var(--c-accent)' }}>AI Powered</div>
          </div>
        </div>
      </motion.div>

      {/* Hero text */}
      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-4xl font-black tracking-tight leading-[1.15] mb-4"
          style={{ color: '#e8e8f8' }}
        >
          Tập thông minh<br />
          <span className="grad-text">không phải tập nhiều</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm leading-relaxed mb-10"
          style={{ color: 'var(--c-muted)' }}
        >
          AI phân tích từng động tác, đếm rep, chấm điểm tư thế — tất cả qua camera của bạn.
        </motion.p>

        {/* Feature list */}
        <div className="space-y-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: 'rgba(124,109,240,0.14)', border: '1px solid rgba(124,109,240,0.2)' }}>
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#e8e8f8' }}>{f.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-[11px] relative z-10"
        style={{ color: 'var(--c-faint)' }}
      >
        🔒 Dữ liệu lưu cục bộ · Không cần server
      </motion.p>
    </div>
  )
}

/* ── main ─────────────────────────────────── */
export default function Auth() {
  const { login, register } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = (nextMode: 'login' | 'register') => {
    setMode(nextMode); setError(''); setPassword('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!name.trim()) throw new Error('Vui lòng nhập họ tên')
        await register(name.trim(), email, password)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    try {
      await register('Demo User', 'demo@fitforge.app', 'demo123').catch(() => {})
      await login('demo@fitforge.app', 'demo123')
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex" style={{ background: 'var(--c-bg)' }}>
      {/* ── Left branding panel ── */}
      <div className="lg:w-[52%] xl:w-[55%]">
        <LeftPanel />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
        style={{ background: 'var(--c-bg)' }}>

        {/* Subtle glow top-right */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(124,109,240,0.08) 0%, transparent 60%)' }} />

        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c6df0, #a89af8)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-4 h-4">
                <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3"/>
              </svg>
            </div>
            <span className="text-lg font-black">
              <span style={{ color: '#e8e8f8' }}>Fit</span>
              <span className="grad-text">Forge</span>
            </span>
          </div>

          {/* Form header — animates on mode switch */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + '-head'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: '#e8e8f8' }}>
                {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--c-muted)' }}>
                {mode === 'login'
                  ? 'Đăng nhập để tiếp tục hành trình của bạn'
                  : 'Miễn phí · Không cần thẻ tín dụng'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form fields — animates on mode switch */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <InputField
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    required
                  />
                )}

                <InputField
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  required
                />

                <InputField
                  label="Mật khẩu"
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Tối thiểu 6 ký tự' : '••••••••'}
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  right={
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{ color: showPass ? 'var(--c-accent2)' : 'var(--c-faint)', lineHeight: 0 }}>
                      {showPass
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  }
                />

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-medium px-3.5 py-2.5 rounded-lg flex items-center gap-2"
                      style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)', color: '#fca5a5' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white btn-primary disabled:opacity-50 mt-1"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {mode === 'login' ? 'Đang đăng nhập...' : 'Đang tạo...'}
                      </span>
                    : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'
                  }
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}/>
            <span className="text-[11px]" style={{ color: 'var(--c-faint)' }}>hoặc</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}/>
          </div>

          {/* Demo */}
          <motion.button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'var(--c-muted)',
            }}
            whileHover={{ borderColor: 'rgba(124,109,240,0.35)', color: '#a89af8', background: 'rgba(124,109,240,0.06)' }}
            whileTap={{ scale: 0.98 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Dùng tài khoản Demo
          </motion.button>

          {/* Switch mode — small text link */}
          <p className="text-center mt-6 text-sm" style={{ color: 'var(--c-muted)' }}>
            {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            {' '}
            <button
              type="button"
              onClick={() => reset(mode === 'login' ? 'register' : 'login')}
              className="font-semibold underline underline-offset-2 transition-colors duration-150"
              style={{ color: 'var(--c-accent2)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e8e8f8')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-accent2)')}
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
