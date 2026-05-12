import { useState } from 'react'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useUserStore } from '../store/useUserStore'
import type { Profile as ProfileType, Goal, ActivityLevel, Gender } from '../types'
import { calculateTDEE } from '../lib/nutrition'

const GOAL_LABELS: Record<Goal, string> = {
  lose_fat: '🔥 Giảm mỡ',
  gain_muscle: '💪 Tăng cơ',
  maintain: '⚖️ Duy trì',
}

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Ít vận động',
  light: 'Nhẹ (1-3 buổi/tuần)',
  moderate: 'Vừa (3-5 buổi/tuần)',
  active: 'Nhiều (6-7 buổi/tuần)',
  very_active: 'Rất nhiều (2 lần/ngày)',
}

const defaultProfile: ProfileType = {
  name: '',
  age: 25,
  weight: 70,
  height: 170,
  gender: 'male',
  goal: 'maintain',
  activity_level: 'moderate',
}

export default function Profile() {
  const { profile, setProfile } = useUserStore()
  const [editing, setEditing] = useState(!profile)
  const [form, setForm] = useState<ProfileType>(profile || defaultProfile)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!form.name.trim()) return
    setProfile(form)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tdee = profile ? calculateTDEE(profile) : null

  const inputCls = 'w-full bg-[#0a0a0f] border border-[#22223a] rounded-lg px-3 py-2 text-sm text-[#f0f0ff] outline-none focus:border-[#7c6ff7] transition-colors'
  const labelCls = 'block text-xs text-[#8888aa] mb-1'

  return (
    <div>
      <Header title="Hồ Sơ" subtitle="Thông tin cá nhân và cài đặt" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Avatar & summary */}
        <Card className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#7c6ff7] flex items-center justify-center text-3xl font-black text-white mb-4">
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {profile ? (
            <>
              <h2 className="text-xl font-bold text-[#f0f0ff]">{profile.name}</h2>
              <p className="text-sm text-[#8888aa] mb-4">{profile.age} tuổi · {profile.gender === 'male' ? 'Nam' : 'Nữ'}</p>
              <div className="grid grid-cols-2 gap-3 w-full mb-4">
                {[
                  { label: 'Cân nặng', value: `${profile.weight} kg` },
                  { label: 'Chiều cao', value: `${profile.height} cm` },
                  { label: 'TDEE', value: `${tdee} kcal` },
                  { label: 'Mục tiêu', value: GOAL_LABELS[profile.goal].split(' ')[1] },
                ].map((item) => (
                  <div key={item.label} className="bg-[#1a1a28] rounded-lg p-3">
                    <p className="text-xs text-[#555570]">{item.label}</p>
                    <p className="text-sm font-bold text-[#f0f0ff]">{item.value}</p>
                  </div>
                ))}
              </div>
              <Badge variant="accent">{GOAL_LABELS[profile.goal]}</Badge>
            </>
          ) : (
            <div>
              <p className="text-[#8888aa] text-sm mb-4">Chưa có thông tin hồ sơ</p>
              <p className="text-xs text-[#555570]">Điền form bên cạnh để bắt đầu</p>
            </div>
          )}
        </Card>

        {/* Edit form */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-[#f0f0ff]">Thông tin cá nhân</h2>
            {profile && !editing && (
              <Button size="sm" variant="secondary" onClick={() => { setEditing(true); setForm(profile) }}>
                ✏️ Chỉnh sửa
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Họ và tên *</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Nguyễn Văn A"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Tuổi</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.age}
                    onChange={(e) => setForm((p) => ({ ...p, age: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Giới tính</label>
                  <select
                    className={inputCls}
                    value={form.gender}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as Gender }))}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Cân nặng (kg)</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.weight}
                    onChange={(e) => setForm((p) => ({ ...p, weight: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Chiều cao (cm)</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.height}
                    onChange={(e) => setForm((p) => ({ ...p, height: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Mục tiêu</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['lose_fat', 'gain_muscle', 'maintain'] as Goal[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm((p) => ({ ...p, goal: g }))}
                      className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                        form.goal === g
                          ? 'border-[#7c6ff7] bg-[#7c6ff7]/20 text-[#9d92ff]'
                          : 'border-[#22223a] bg-[#1a1a28] text-[#8888aa] hover:border-[#7c6ff7]/50'
                      }`}
                    >
                      {GOAL_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Mức độ hoạt động</label>
                <select
                  className={inputCls}
                  value={form.activity_level}
                  onChange={(e) => setForm((p) => ({ ...p, activity_level: e.target.value as ActivityLevel }))}
                >
                  {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={!form.name.trim()} className="flex-1">
                  💾 Lưu hồ sơ
                </Button>
                {profile && (
                  <Button variant="secondary" onClick={() => setEditing(false)}>Hủy</Button>
                )}
              </div>

              {saved && (
                <div className="text-center text-green-400 text-sm font-medium">
                  ✅ Hồ sơ đã được lưu!
                </div>
              )}
            </div>
          ) : (
            profile && (
              <div className="space-y-4">
                {[
                  { label: 'Họ và tên', value: profile.name },
                  { label: 'Tuổi', value: `${profile.age} tuổi` },
                  { label: 'Giới tính', value: profile.gender === 'male' ? 'Nam' : 'Nữ' },
                  { label: 'Cân nặng', value: `${profile.weight} kg` },
                  { label: 'Chiều cao', value: `${profile.height} cm` },
                  { label: 'Mục tiêu', value: GOAL_LABELS[profile.goal] },
                  { label: 'Hoạt động', value: ACTIVITY_LABELS[profile.activity_level] },
                  { label: 'TDEE', value: `${tdee} kcal/ngày` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-[#22223a]">
                    <span className="text-sm text-[#8888aa]">{item.label}</span>
                    <span className="text-sm font-medium text-[#f0f0ff]">{item.value}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </Card>
      </div>

      {/* App info */}
      <Card className="mt-5">
        <h2 className="text-sm font-semibold text-[#f0f0ff] mb-3">Về FitForge</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🤖', title: 'Live AI Pose', desc: 'Phân tích tư thế real-time' },
            { icon: '💪', title: 'Thư viện bài tập', desc: '6 bài tập + 9 chương trình' },
            { icon: '🥗', title: 'Dinh dưỡng AI', desc: 'Gợi ý từ Gemini API' },
            { icon: '📈', title: 'Theo dõi tiến độ', desc: 'Charts & thành tích' },
          ].map((f) => (
            <div key={f.title} className="text-center p-4 bg-[#1a1a28] rounded-xl border border-[#22223a]">
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="text-sm font-medium text-[#f0f0ff]">{f.title}</p>
              <p className="text-xs text-[#555570] mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[#22223a] flex items-center justify-between text-xs text-[#555570]">
          <span>FitForge v1.0 · React + Vite + MediaPipe</span>
          <span>Built with ❤️</span>
        </div>
      </Card>
    </div>
  )
}
