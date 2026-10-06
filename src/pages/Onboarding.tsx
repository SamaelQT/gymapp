import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../store/useUserStore'
import type { Goal, ActivityLevel, Gender, WorkoutLocation, Experience } from '../types'

/* ─── Types ─── */
interface OBData {
  name: string; age: number; gender: Gender; weight: number; height: number
  goal: Goal; purpose: string[]
  location: WorkoutLocation; equipment: string[]
  experience: Experience; frequency: string; session_duration: number
  activity_level: ActivityLevel
}

const init: OBData = {
  name: '', age: 25, gender: 'male', weight: 70, height: 170,
  goal: 'maintain', purpose: [],
  location: 'gym', equipment: [],
  experience: 'beginner', frequency: '3-4', session_duration: 60,
  activity_level: 'moderate',
}

/* ─── Option card ─── */
function OptCard({
  emoji, label, sub, active, onClick, color = '#7c6df0', wide = false,
}: {
  emoji: string; label: string; sub?: string; active: boolean
  onClick: () => void; color?: string; wide?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        gridColumn: wide ? 'span 2' : undefined,
        padding: '14px 10px', borderRadius: 16, cursor: 'pointer', border: 'none',
        background: active ? `${color}1a` : 'rgba(255,255,255,0.025)',
        border: `1.5px solid ${active ? color + '60' : 'rgba(255,255,255,0.08)'}`,
        textAlign: 'center', transition: 'all 0.18s', outline: 'none',
        boxShadow: active ? `0 0 16px ${color}22` : 'none',
      } as React.CSSProperties}
    >
      <div style={{ fontSize: 28, marginBottom: 6, lineHeight: 1 }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: active ? color : '#c0c0e0', marginBottom: sub ? 3 : 0 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#3a3a6a' }}>{sub}</div>}
    </button>
  )
}

/* ─── Chip toggle ─── */
function Chip({ label, active, onClick, color = '#7c6df0' }: {
  label: string; active: boolean; onClick: () => void; color?: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
        background: active ? `${color}20` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.1)'}`,
        color: active ? color : '#5858a0', transition: 'all 0.15s',
      } as React.CSSProperties}
    >
      {label}
    </button>
  )
}

/* ─── Input field ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#3a3a6a', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

const inputSt: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.09)',
  borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#d0d0f0', outline: 'none', boxSizing: 'border-box',
}

/* ─── Step label ─── */
const STEPS = ['Cá nhân', 'Mục tiêu', 'Nơi tập', 'Lịch tập', 'Hoàn tất']

/* ═══════════════════════════════════════════ */
export default function Onboarding() {
  const { setProfile, completeOnboarding } = useUserStore()
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState<OBData>(init)
  const [done, setDone] = useState(false)

  const set = <K extends keyof OBData>(k: K, v: OBData[K]) => setData(p => ({ ...p, [k]: v }))
  const toggle = (k: 'purpose' | 'equipment', v: string) =>
    setData(p => ({ ...p, [k]: (p[k] as string[]).includes(v) ? (p[k] as string[]).filter(x => x !== v) : [...(p[k] as string[]), v] }))

  const canNext = () => {
    if (step === 1) return data.name.trim().length > 0 && data.age > 0 && data.weight > 0 && data.height > 0
    return true
  }

  const next = () => { if (!canNext()) return; setDir(1); setStep(s => s + 1) }
  const back = () => { setDir(-1); setStep(s => s - 1) }

  const finish = () => {
    setProfile({
      name: data.name, age: data.age, gender: data.gender,
      weight: data.weight, height: data.height,
      goal: data.goal, activity_level: data.activity_level,
      purpose: data.purpose, workout_location: data.location,
      equipment: data.equipment, experience: data.experience,
      frequency: data.frequency, session_duration: data.session_duration,
    })
    completeOnboarding()
    setDone(true)
    setTimeout(() => { window.location.href = '/' }, 1800)
  }

  /* ─── Done screen ─── */
  if (done) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        style={{ fontSize: 64 }}>🎉</motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ fontSize: 22, fontWeight: 900, color: '#d0d0f0' }}>Hồ sơ đã được tạo!</motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{ fontSize: 14, color: '#3a3a6a' }}>Đang vào ứng dụng...</motion.div>
    </div>
  )

  const pct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px 48px' }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c6df0, #a89af8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💪</div>
        <span style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, #a89af8, #7c6df0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>FitForge</span>
      </div>

      {/* ── Progress track ── */}
      <div style={{ width: '100%', maxWidth: 600, marginBottom: 32 }}>
        {/* Step labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          {STEPS.map((s, i) => {
            const active = step === i + 1
            const done = step > i + 1
            return (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? '#34d399' : active ? 'linear-gradient(135deg, #7c6df0, #a89af8)' : 'rgba(255,255,255,0.06)',
                  border: active ? 'none' : done ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  color: done || active ? 'white' : '#2e2e58',
                  transition: 'all 0.3s',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: active ? '#a89af8' : done ? '#34d399' : '#2e2e58', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{s}</span>
              </div>
            )
          })}
        </div>
        {/* Bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #7c6df0, #a89af8)', borderRadius: 99 }} />
        </div>
      </div>

      {/* ── Step content ── */}
      <div style={{ width: '100%', maxWidth: 600 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ x: dir * 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir * -48, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {/* ═══ STEP 1: Personal info ═══ */}
            {step === 1 && (
              <StepCard title="Xin chào! Hãy cho chúng tôi biết về bạn" sub="Thông tin cơ bản để cá nhân hóa trải nghiệm của bạn" emoji="👋">
                <Field label="Họ và tên *">
                  <input
                    autoFocus style={inputSt} placeholder="Nguyễn Văn A" value={data.name}
                    onChange={e => set('name', e.target.value)}
                    onFocus={e => (e.target.style.borderColor = '#7c6df080')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Tuổi">
                    <input type="number" style={inputSt} value={data.age} min={10} max={99}
                      onChange={e => set('age', Number(e.target.value))}
                      onFocus={e => (e.target.style.borderColor = '#7c6df080')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')} />
                  </Field>
                  <Field label="Giới tính">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {([['male', '♂️', 'Nam'], ['female', '♀️', 'Nữ']] as const).map(([v, e, l]) => (
                        <button key={v} onClick={() => set('gender', v)} style={{
                          padding: '10px 8px', borderRadius: 12, cursor: 'pointer', border: 'none',
                          background: data.gender === v ? 'rgba(124,109,240,0.18)' : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${data.gender === v ? '#7c6df060' : 'rgba(255,255,255,0.09)'}`,
                          color: data.gender === v ? '#a89af8' : '#5858a0', fontSize: 13, fontWeight: 700,
                          transition: 'all 0.15s',
                        } as React.CSSProperties}>{e} {l}</button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Cân nặng (kg)">
                    <input type="number" style={inputSt} value={data.weight} min={30} max={300}
                      onChange={e => set('weight', Number(e.target.value))}
                      onFocus={e => (e.target.style.borderColor = '#7c6df080')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')} />
                  </Field>
                  <Field label="Chiều cao (cm)">
                    <input type="number" style={inputSt} value={data.height} min={100} max={250}
                      onChange={e => set('height', Number(e.target.value))}
                      onFocus={e => (e.target.style.borderColor = '#7c6df080')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')} />
                  </Field>
                </div>
              </StepCard>
            )}

            {/* ═══ STEP 2: Goal + Purpose ═══ */}
            {step === 2 && (
              <StepCard title="Mục tiêu của bạn là gì?" sub="Chúng tôi sẽ tùy chỉnh chương trình tập phù hợp nhất" emoji="🎯">
                <Field label="Mục tiêu chính">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    <OptCard emoji="🔥" label="Giảm mỡ" sub="Đốt cháy calo, săn chắc" active={data.goal === 'lose_fat'} onClick={() => set('goal', 'lose_fat')} color="#fb923c" />
                    <OptCard emoji="💪" label="Tăng cơ" sub="Xây dựng cơ bắp, khối lượng" active={data.goal === 'gain_muscle'} onClick={() => set('goal', 'gain_muscle')} color="#34d399" />
                    <OptCard emoji="⚖️" label="Duy trì" sub="Cân bằng & sức khỏe" active={data.goal === 'maintain'} onClick={() => set('goal', 'maintain')} color="#38bdf8" />
                  </div>
                </Field>

                <Field label="Mục đích cụ thể (chọn nhiều)">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      ['👀 Ngoại hình', 'appearance'],
                      ['💊 Sức khỏe', 'health'],
                      ['🏆 Thi đấu', 'competition'],
                      ['😌 Giảm stress', 'stress'],
                      ['⚡ Tăng sức bền', 'endurance'],
                      ['🦾 Sức mạnh', 'strength'],
                      ['🩺 Phục hồi chức năng', 'rehab'],
                      ['🧘 Linh hoạt', 'flexibility'],
                    ].map(([label, value]) => (
                      <Chip key={value} label={label} active={data.purpose.includes(value)} onClick={() => toggle('purpose', value)} />
                    ))}
                  </div>
                </Field>
              </StepCard>
            )}

            {/* ═══ STEP 3: Location + Equipment ═══ */}
            {step === 3 && (
              <StepCard title="Bạn tập ở đâu và có dụng cụ gì?" sub="Để gợi ý bài tập phù hợp với điều kiện của bạn" emoji="🏋️">
                <Field label="Nơi tập chính">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    <OptCard emoji="🏋️" label="Phòng gym" sub="Gym thương mại, câu lạc bộ" active={data.location === 'gym'} onClick={() => set('location', 'gym')} />
                    <OptCard emoji="🏠" label="Tại nhà" sub="Home gym, không gian riêng" active={data.location === 'home'} onClick={() => set('location', 'home')} />
                    <OptCard emoji="🌳" label="Ngoài trời" sub="Công viên, sân bãi" active={data.location === 'outdoor'} onClick={() => set('location', 'outdoor')} />
                    <OptCard emoji="🔄" label="Kết hợp" sub="Linh hoạt nhiều nơi" active={data.location === 'mixed'} onClick={() => set('location', 'mixed')} />
                  </div>
                </Field>

                <Field label="Dụng cụ hiện có (chọn nhiều)">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      ['🏋️', 'Tạ đòn', 'barbell'],
                      ['💪', 'Tạ đơn', 'dumbbell'],
                      ['🤸', 'Máy tập', 'machine'],
                      ['🎯', 'Dây kháng lực', 'band'],
                      ['⚙️', 'Kettlebell', 'kettlebell'],
                      ['🙆', 'Không dụng cụ', 'bodyweight'],
                    ].map(([emoji, label, value]) => (
                      <OptCard key={value as string} emoji={emoji as string} label={label as string} active={data.equipment.includes(value as string)} onClick={() => toggle('equipment', value as string)} />
                    ))}
                  </div>
                </Field>
              </StepCard>
            )}

            {/* ═══ STEP 4: Experience + Schedule ═══ */}
            {step === 4 && (
              <StepCard title="Kinh nghiệm và lịch tập của bạn" sub="Giúp chúng tôi điều chỉnh độ khó và khối lượng tập" emoji="📅">
                <Field label="Trình độ hiện tại">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    <OptCard emoji="🌱" label="Mới bắt đầu" sub="< 6 tháng" active={data.experience === 'beginner'} onClick={() => set('experience', 'beginner')} color="#34d399" />
                    <OptCard emoji="🌿" label="Trung bình" sub="6 tháng – 2 năm" active={data.experience === 'intermediate'} onClick={() => set('experience', 'intermediate')} color="#fbbf24" />
                    <OptCard emoji="🌳" label="Nâng cao" sub="> 2 năm" active={data.experience === 'advanced'} onClick={() => set('experience', 'advanced')} color="#f87171" />
                  </div>
                </Field>

                <Field label="Tần suất tập (buổi/tuần)">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['1-2', '1–2 buổi'], ['3-4', '3–4 buổi'], ['5-6', '5–6 buổi'], ['7', 'Mỗi ngày']].map(([v, l]) => (
                      <Chip key={v} label={l} active={data.frequency === v} onClick={() => set('frequency', v)} />
                    ))}
                  </div>
                </Field>

                <Field label="Thời gian mỗi buổi">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {([[30, '30 phút'], [45, '45 phút'], [60, '60 phút'], [90, '90+ phút']] as const).map(([v, l]) => (
                      <button key={v} onClick={() => set('session_duration', v)} style={{
                        padding: '10px 6px', borderRadius: 12, cursor: 'pointer', border: 'none',
                        background: data.session_duration === v ? 'rgba(124,109,240,0.18)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${data.session_duration === v ? '#7c6df060' : 'rgba(255,255,255,0.09)'}`,
                        color: data.session_duration === v ? '#a89af8' : '#5858a0', fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                      } as React.CSSProperties}>{l}</button>
                    ))}
                  </div>
                </Field>
              </StepCard>
            )}

            {/* ═══ STEP 5: Activity level + Summary ═══ */}
            {step === 5 && (
              <StepCard title="Mức độ vận động hàng ngày" sub="Không tính buổi tập gym — chỉ hoạt động thường ngày" emoji="⚡">
                <Field label="Lối sống của bạn">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {([
                      ['sedentary',   '🛋️', 'Ít vận động',       'Ngồi nhiều, làm việc văn phòng'],
                      ['light',       '🚶', 'Nhẹ nhàng',          'Đi bộ nhẹ 1–3 ngày/tuần'],
                      ['moderate',    '🏃', 'Vừa phải',           'Vận động nhẹ 3–5 ngày/tuần'],
                      ['active',      '💪', 'Tích cực',           'Tập nặng 6–7 ngày/tuần'],
                      ['very_active', '🔥', 'Rất tích cực',       'Lao động nặng hoặc tập 2 lần/ngày'],
                    ] as [ActivityLevel, string, string, string][]).map(([v, e, l, s]) => (
                      <button key={v} onClick={() => set('activity_level', v)} style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14, cursor: 'pointer', border: 'none', textAlign: 'left',
                        background: data.activity_level === v ? 'rgba(124,109,240,0.14)' : 'rgba(255,255,255,0.025)',
                        border: `1.5px solid ${data.activity_level === v ? '#7c6df060' : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.15s',
                      } as React.CSSProperties}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{e}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: data.activity_level === v ? '#a89af8' : '#d0d0f0' }}>{l}</div>
                          <div style={{ fontSize: 11, color: '#3a3a6a', marginTop: 2 }}>{s}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${data.activity_level === v ? '#7c6df0' : 'rgba(255,255,255,0.15)'}`, background: data.activity_level === v ? '#7c6df0' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {data.activity_level === v && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" style={{ width: 10, height: 10 }}><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                      </button>
                    ))}
                  </div>
                </Field>

                {/* ── Summary ── */}
                <div style={{ marginTop: 4, padding: '18px 20px', borderRadius: 16, background: 'rgba(124,109,240,0.07)', border: '1px solid rgba(124,109,240,0.2)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#a89af8', marginBottom: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tóm tắt hồ sơ của bạn</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      ['👤 Họ tên', data.name || '—'],
                      ['⚖️ Số đo', `${data.weight}kg · ${data.height}cm`],
                      ['🎯 Mục tiêu', data.goal === 'lose_fat' ? 'Giảm mỡ' : data.goal === 'gain_muscle' ? 'Tăng cơ' : 'Duy trì'],
                      ['🏋️ Nơi tập', data.location === 'gym' ? 'Phòng gym' : data.location === 'home' ? 'Tại nhà' : data.location === 'outdoor' ? 'Ngoài trời' : 'Kết hợp'],
                      ['📅 Tần suất', data.frequency ? `${data.frequency} buổi/tuần` : '—'],
                      ['⏱ Thời gian', `${data.session_duration} phút/buổi`],
                    ].map(([k, v]) => (
                      <div key={k as string} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontSize: 10, color: '#3a3a6a' }}>{k}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#c0c0e0' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </StepCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', gap: 10, marginTop: 24 }}>
        {step > 1 && (
          <button onClick={back} style={{
            flex: '0 0 auto', padding: '13px 22px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)', color: '#5858a0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>← Quay lại</button>
        )}
        {step < 5 ? (
          <button onClick={next} disabled={!canNext()} style={{
            flex: 1, padding: '13px 0', borderRadius: 14, border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed',
            background: canNext() ? 'linear-gradient(135deg, #7c6df0, #a89af8)' : 'rgba(255,255,255,0.06)',
            boxShadow: canNext() ? '0 4px 20px rgba(124,109,240,0.45)' : 'none',
            color: canNext() ? 'white' : '#3a3a6a', fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
          }}>
            Tiếp theo →
          </button>
        ) : (
          <button onClick={finish} style={{
            flex: 1, padding: '13px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
            boxShadow: '0 4px 20px rgba(124,109,240,0.5)',
            color: 'white', fontSize: 14, fontWeight: 700,
          }}>
            🚀 Bắt đầu hành trình!
          </button>
        )}
      </div>

      {/* ── Skip link ── */}
      <button onClick={() => { completeOnboarding(); window.location.href = '/' }} style={{ marginTop: 16, background: 'none', border: 'none', color: '#2e2e58', fontSize: 12, cursor: 'pointer' }}>
        Bỏ qua, điền sau
      </button>
    </div>
  )
}

/* ─── Step wrapper card ─── */
function StepCard({ title, sub, emoji, children }: {
  title: string; sub: string; emoji: string; children: React.ReactNode
}) {
  return (
    <div style={{ background: 'rgba(10,10,22,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{emoji}</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#d0d0f0', letterSpacing: '-0.02em', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#3a3a6a' }}>{sub}</div>
      </div>
      {children}
    </div>
  )
}
