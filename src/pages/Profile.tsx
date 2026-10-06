import { useState } from 'react'
import { Header } from '../components/layout/Header'
import { useUserStore } from '../store/useUserStore'
import type { Profile as ProfileType, Goal, ActivityLevel, Gender } from '../types'
import { calculateTDEE } from '../lib/nutrition'
import { motion } from 'framer-motion'

const LOCATION_LABELS: Record<string, string> = { gym: '🏋️ Phòng gym', home: '🏠 Tại nhà', outdoor: '🌳 Ngoài trời', mixed: '🔄 Kết hợp' }
const EXPERIENCE_LABELS: Record<string, string> = { beginner: '🌱 Mới bắt đầu', intermediate: '🌿 Trung bình', advanced: '🌳 Nâng cao' }
const EQUIPMENT_LABELS: Record<string, string> = { barbell: 'Tạ đòn', dumbbell: 'Tạ đơn', machine: 'Máy tập', band: 'Dây kháng lực', kettlebell: 'Kettlebell', bodyweight: 'Không dụng cụ' }

const GOAL_LABELS: Record<Goal, string> = { lose_fat: '🔥 Giảm mỡ', gain_muscle: '💪 Tăng cơ', maintain: '⚖️ Duy trì' }
const GOAL_COLORS: Record<Goal, string> = { lose_fat: '#fb923c', gain_muscle: '#34d399', maintain: '#38bdf8' }
const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary:   'Ít vận động',
  light:       'Nhẹ (1-3 buổi/tuần)',
  moderate:    'Vừa (3-5 buổi/tuần)',
  active:      'Nhiều (6-7 buổi/tuần)',
  very_active: 'Rất nhiều (2 lần/ngày)',
}

const defaultProfile: ProfileType = { name: '', age: 25, weight: 70, height: 170, gender: 'male', goal: 'maintain', activity_level: 'moderate' }

const cardBase: React.CSSProperties = { background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 22 }
const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 11, padding: '10px 14px', fontSize: 13, color: '#d0d0f0', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#2e2e58', marginBottom: 7 }

export default function Profile() {
  const { profile, setProfile, resetOnboarding } = useUserStore()
  const [editing, setEditing] = useState(!profile)
  const [form, setForm] = useState<ProfileType>(profile || defaultProfile)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!form.name.trim()) return
    setProfile(form); setEditing(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tdee = profile ? calculateTDEE(profile) : null

  return (
    <div>
      <Header title="Hồ Sơ" subtitle="Thông tin cá nhân và cài đặt" />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 16 }}>
        {/* Avatar card */}
        <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
              boxShadow: '0 0 30px rgba(124,109,240,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 900, color: 'white',
            }}>
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{
              position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
              background: '#34d399', border: '2px solid #06060f',
              boxShadow: '0 0 8px rgba(52,211,153,0.7)',
            }}/>
          </div>

          {profile ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#d0d0f0', letterSpacing: '-0.02em', marginBottom: 4 }}>{profile.name}</div>
              <div style={{ fontSize: 12, color: '#3a3a6a', marginBottom: 18 }}>{profile.age} tuổi · {profile.gender === 'male' ? 'Nam' : 'Nữ'}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', marginBottom: 16 }}>
                {[
                  { label: 'Cân nặng', val: `${profile.weight} kg` },
                  { label: 'Chiều cao', val: `${profile.height} cm` },
                  { label: 'TDEE',     val: `${tdee} kcal` },
                  { label: 'Mục tiêu', val: GOAL_LABELS[profile.goal].split(' ')[1] },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#2e2e58', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#d0d0f0' }}>{val}</div>
                  </div>
                ))}
              </div>

              <span style={{
                padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: `${GOAL_COLORS[profile.goal]}18`, border: `1px solid ${GOAL_COLORS[profile.goal]}40`,
                color: GOAL_COLORS[profile.goal],
              }}>
                {GOAL_LABELS[profile.goal]}
              </span>
            </>
          ) : (
            <div>
              <div style={{ color: '#3a3a6a', fontSize: 13, marginBottom: 6 }}>Chưa có thông tin hồ sơ</div>
              <div style={{ color: '#2e2e58', fontSize: 11 }}>Điền form bên cạnh để bắt đầu</div>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div style={cardBase}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0' }}>Thông tin cá nhân</div>
            {profile && !editing && (
              <button onClick={() => { setEditing(true); setForm(profile) }} style={{ padding: '7px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)', color: '#5858a0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                ✏️ Chỉnh sửa
              </button>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name (full width) */}
              <div>
                <label style={labelStyle}>Họ và tên *</label>
                <input type="text" style={inputStyle} placeholder="Nguyễn Văn A" value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = 'rgba(124,109,240,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}/>
              </div>

              {/* Age + Gender */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Tuổi</label>
                  <input type="number" style={inputStyle} value={form.age}
                    onChange={(e) => setForm(p => ({ ...p, age: Number(e.target.value) }))}
                    onFocus={e => (e.target.style.borderColor = 'rgba(124,109,240,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}/>
                </div>
                <div>
                  <label style={labelStyle}>Giới tính</label>
                  <select style={inputStyle} value={form.gender}
                    onChange={(e) => setForm(p => ({ ...p, gender: e.target.value as Gender }))}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Weight + Height */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Cân nặng (kg)</label>
                  <input type="number" style={inputStyle} value={form.weight}
                    onChange={(e) => setForm(p => ({ ...p, weight: Number(e.target.value) }))}
                    onFocus={e => (e.target.style.borderColor = 'rgba(124,109,240,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}/>
                </div>
                <div>
                  <label style={labelStyle}>Chiều cao (cm)</label>
                  <input type="number" style={inputStyle} value={form.height}
                    onChange={(e) => setForm(p => ({ ...p, height: Number(e.target.value) }))}
                    onFocus={e => (e.target.style.borderColor = 'rgba(124,109,240,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}/>
                </div>
              </div>

              {/* Goal */}
              <div>
                <label style={labelStyle}>Mục tiêu</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {(['lose_fat', 'gain_muscle', 'maintain'] as Goal[]).map((g) => {
                    const active = form.goal === g
                    const color = GOAL_COLORS[g]
                    return (
                      <button key={g} onClick={() => setForm(p => ({ ...p, goal: g }))} style={{
                        padding: '10px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                        background: active ? `${color}16` : 'rgba(255,255,255,0.025)',
                        border: `1px solid ${active ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                        color: active ? color : '#3a3a6a', transition: 'all 0.15s',
                      } as React.CSSProperties}>
                        {GOAL_LABELS[g]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Activity level */}
              <div>
                <label style={labelStyle}>Mức độ hoạt động</label>
                <select style={inputStyle} value={form.activity_level}
                  onChange={(e) => setForm(p => ({ ...p, activity_level: e.target.value as ActivityLevel }))}>
                  {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={handleSave} disabled={!form.name.trim()} style={{
                  flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
                  boxShadow: '0 4px 18px rgba(124,109,240,0.4)',
                  color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !form.name.trim() ? 0.5 : 1,
                }}>
                  💾 Lưu hồ sơ
                </button>
                {profile && (
                  <button onClick={() => setEditing(false)} style={{ padding: '11px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#5858a0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Hủy
                  </button>
                )}
              </div>

              {saved && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#34d399' }}>
                  ✅ Hồ sơ đã được lưu!
                </motion.div>
              )}
            </div>
          ) : (
            profile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Họ và tên',    value: profile.name },
                  { label: 'Tuổi',         value: `${profile.age} tuổi` },
                  { label: 'Giới tính',    value: profile.gender === 'male' ? 'Nam' : 'Nữ' },
                  { label: 'Cân nặng',     value: `${profile.weight} kg` },
                  { label: 'Chiều cao',    value: `${profile.height} cm` },
                  { label: 'Mục tiêu',     value: GOAL_LABELS[profile.goal] },
                  { label: 'Hoạt động',    value: ACTIVITY_LABELS[profile.activity_level] },
                  { label: 'TDEE',         value: `${tdee} kcal/ngày` },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <span style={{ fontSize: 12, color: '#3a3a6a' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#d0d0f0' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* App info */}
      <div style={cardBase}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0', marginBottom: 16 }}>Về FitForge</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { emoji: '🤖', title: 'Live AI Pose',      desc: 'Phân tích tư thế real-time', color: '#a89af8' },
            { emoji: '💪', title: 'Thư viện bài tập',  desc: '6 bài tập + 9 chương trình', color: '#34d399' },
            { emoji: '🥗', title: 'Dinh dưỡng AI',      desc: 'Gợi ý từ Gemini API',       color: '#fb923c' },
            { emoji: '📈', title: 'Theo dõi tiến độ',  desc: 'Charts & thành tích',        color: '#38bdf8' },
          ].map((f) => (
            <div key={f.title} style={{
              padding: '16px 14px', borderRadius: 16, textAlign: 'center',
              background: `${f.color}0d`, border: `1px solid ${f.color}28`,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#d0d0f0', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: '#2e2e58' }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#1e1e3a' }}>
          <span>FitForge v1.0 · React + Vite + MediaPipe</span>
          <button
            onClick={() => { if (confirm('Làm lại bài khảo sát? Thông tin hồ sơ sẽ bị reset.')) resetOnboarding() }}
            style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', color: '#3a3a6a', fontSize: 11, cursor: 'pointer' }}
          >
            🔄 Làm lại khảo sát
          </button>
        </div>
      </div>

      {/* Onboarding details card */}
      {profile && (profile.workout_location || profile.experience || (profile.equipment && profile.equipment.length > 0)) && (
        <div style={{ ...cardBase, marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0', marginBottom: 16 }}>Thông tin từ khảo sát</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {profile.workout_location && (
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: '#2e2e58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nơi tập</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#d0d0f0' }}>{LOCATION_LABELS[profile.workout_location] || profile.workout_location}</div>
              </div>
            )}
            {profile.experience && (
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: '#2e2e58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Trình độ</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#d0d0f0' }}>{EXPERIENCE_LABELS[profile.experience] || profile.experience}</div>
              </div>
            )}
            {profile.frequency && (
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: '#2e2e58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tần suất tập</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#d0d0f0' }}>{profile.frequency} buổi/tuần</div>
              </div>
            )}
            {profile.session_duration && (
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: '#2e2e58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Thời gian/buổi</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#d0d0f0' }}>{profile.session_duration} phút</div>
              </div>
            )}
          </div>
          {profile.equipment && profile.equipment.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: '#2e2e58', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dụng cụ</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.equipment.map(e => (
                  <span key={e} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(124,109,240,0.1)', border: '1px solid rgba(124,109,240,0.25)', color: '#a89af8' }}>
                    {EQUIPMENT_LABELS[e] || e}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.purpose && profile.purpose.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: '#2e2e58', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mục đích</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.purpose.map(p => (
                  <span key={p} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
