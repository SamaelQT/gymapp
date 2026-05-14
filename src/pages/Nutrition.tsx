import { useState } from 'react'
import { Header } from '../components/layout/Header'
import { useUserStore } from '../store/useUserStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { calculateTDEE, calculateMacros, MEAL_PLANS } from '../lib/nutrition'
import { getNutritionSuggestion, isGeminiConfigured } from '../lib/gemini'
import type { DayPlan, Macro } from '../types'

/* ─── Macro donut ring ─── */
function MacroRing({ macro, total }: { macro: Macro; total: number }) {
  const protein = (macro.protein * 4 / total) * 100
  const carbs   = (macro.carbs   * 4 / total) * 100
  const fat     = (macro.fat     * 9 / total) * 100
  const size = 110, sw = 11, r = (size - sw) / 2, circ = 2 * Math.PI * r
  let offset = 0
  const segs = [
    { pct: protein, color: '#a89af8', label: 'Protein', value: macro.protein },
    { pct: carbs,   color: '#34d399', label: 'Carbs',   value: macro.carbs   },
    { pct: fat,     color: '#fbbf24', label: 'Fat',     value: macro.fat     },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw}/>
          {segs.map((seg, i) => {
            const dash = (seg.pct / 100) * circ; const curr = offset; offset += seg.pct
            return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={seg.color}
              strokeWidth={sw} strokeDasharray={`${dash} ${circ-dash}`}
              strokeDashoffset={-curr/100*circ} strokeLinecap="round"/>
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#d0d0f0' }}>{total}</div>
          <div style={{ fontSize: 10, color: '#2e2e58' }}>kcal</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segs.map((seg) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: '#3a3a6a', width: 44 }}>{seg.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d0d0f0' }}>{seg.value}g</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Meal card ─── */
function MealCard({ title, meal, checked, onToggle }: { title: string; meal: DayPlan['breakfast']; checked: boolean; onToggle: () => void }) {
  return (
    <div style={{
      padding: 14, borderRadius: 14, cursor: 'pointer',
      background: checked ? 'rgba(124,109,240,0.1)' : 'rgba(255,255,255,0.025)',
      border: `1px solid ${checked ? 'rgba(124,109,240,0.35)' : 'rgba(255,255,255,0.06)'}`,
      transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: checked ? '#a89af8' : '#2e2e58' }}>{title}</span>
        <button onClick={onToggle} style={{
          width: 20, height: 20, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: checked ? '#7c6df0' : 'transparent',
          border: `2px solid ${checked ? '#7c6df0' : 'rgba(255,255,255,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all 0.15s',
        } as React.CSSProperties}>
          {checked && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" style={{width:10,height:10}}><polyline points="20 6 9 17 4 12"/></svg>}
        </button>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#c0c0e0', marginBottom: 6 }}>{meal.name}</p>
      <ul style={{ marginBottom: 8 }}>
        {meal.items.map((item, i) => (
          <li key={i} style={{ fontSize: 11, color: '#3a3a6a', marginBottom: 2 }}>• {item}</li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 10, fontSize: 11, flexWrap: 'wrap' }}>
        <span style={{ color: '#fb923c' }}>🔥 {meal.calories} kcal</span>
        <span style={{ color: '#a89af8' }}>P:{meal.macro.protein}g</span>
        <span style={{ color: '#34d399' }}>C:{meal.macro.carbs}g</span>
        <span style={{ color: '#fbbf24' }}>F:{meal.macro.fat}g</span>
      </div>
    </div>
  )
}

const cardBase: React.CSSProperties = {
  background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 22,
}
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 13, fontWeight: 800, color: '#d0d0f0', letterSpacing: '-0.01em' }}>{children}</div>
)

export default function Nutrition() {
  const { profile } = useUserStore()
  const { getTodayNutritionLog, addNutritionLog, updateNutritionLog } = useWorkoutStore()
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPlan, setAiPlan] = useState<DayPlan[] | null>(null)
  const [aiError, setAiError] = useState('')
  const [activeDay, setActiveDay] = useState(0)

  const today = new Date().toISOString().split('T')[0]
  const todayLog = getTodayNutritionLog()
  const tdee = profile ? calculateTDEE(profile) : 2000
  const { calories: targetCalories, macro: targetMacro } = profile
    ? calculateMacros(tdee, profile.goal)
    : { calories: 2000, macro: { protein: 150, carbs: 225, fat: 67 } }

  const mealPlanKey = profile?.goal || 'maintain'
  const defaultMeals = MEAL_PLANS[mealPlanKey as keyof typeof MEAL_PLANS].days[0]
  const checkedMeals = todayLog?.meals || {}
  const eatenCalories = Object.entries(checkedMeals).reduce((sum, [key, checked]) => {
    if (!checked) return sum
    const cal = defaultMeals[key as keyof typeof defaultMeals] as any
    return sum + (cal?.calories || 0)
  }, 0)

  const toggleMeal = (key: string) => {
    const updated = { ...checkedMeals, [key]: !checkedMeals[key] }
    if (todayLog) { updateNutritionLog(today, { meals: updated }) }
    else { addNutritionLog({ date: today, meals: updated, total_calories: eatenCalories, macros: targetMacro }) }
  }

  const loadAiSuggestion = async () => {
    if (!profile) return
    setAiLoading(true); setAiError('')
    try { setAiPlan(await getNutritionSuggestion(profile)) }
    catch (e: any) { setAiError(e.message || 'Lỗi không xác định') }
    finally { setAiLoading(false) }
  }

  const displayPlan = aiPlan ? aiPlan[activeDay] : null
  const calPct = Math.min(100, (eatenCalories / targetCalories) * 100)

  return (
    <div>
      <Header title="Dinh Dưỡng" subtitle="Kế hoạch ăn uống và theo dõi calo" />

      {!profile && (
        <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 14, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontSize: 13 }}>
          ⚠️ Vui lòng điền thông tin hồ sơ để tính toán dinh dưỡng chính xác
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
        {/* TDEE card */}
        <div style={cardBase}>
          <SectionTitle>Chỉ số dinh dưỡng</SectionTitle>
          <div style={{ marginTop: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'TDEE', val: `${tdee} kcal`, color: '#d0d0f0' },
              { label: 'Mục tiêu', val: `${targetCalories} kcal`, color: '#a89af8' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#3a3a6a' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }}/>
          <MacroRing macro={targetMacro} total={targetCalories} />
        </div>

        {/* Daily tracker */}
        <div style={cardBase}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <SectionTitle>Theo dõi hôm nay</SectionTitle>
            <span style={{ fontSize: 11, color: '#2e2e58' }}>{new Date().toLocaleDateString('vi-VN')}</span>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: '#3a3a6a' }}>Calo tiêu thụ</span>
              <span style={{ color: '#d0d0f0', fontWeight: 700 }}>{eatenCalories} / {targetCalories} kcal</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${calPct}%`, background: 'linear-gradient(90deg, #7c6df0, #a89af8)', borderRadius: 99, transition: 'width 0.4s ease' }}/>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((key) => {
              const labels = { breakfast: 'Sáng', lunch: 'Trưa', dinner: 'Tối', snack: 'Snack' }
              return (
                <MealCard key={key} title={labels[key]} meal={defaultMeals[key] as any}
                  checked={!!checkedMeals[key]} onToggle={() => toggleMeal(key)}/>
              )
            })}
          </div>
        </div>
      </div>

      {/* AI section */}
      <div style={cardBase}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 18 }}>🤖</div>
              <SectionTitle>Gợi ý AI (Gemini)</SectionTitle>
            </div>
            <p style={{ fontSize: 12, color: '#3a3a6a' }}>Thực đơn 7 ngày được cá nhân hóa theo mục tiêu của bạn</p>
          </div>
          <button
            onClick={loadAiSuggestion}
            disabled={aiLoading || !profile || !isGeminiConfigured}
            style={{
              padding: '9px 18px', borderRadius: 12, border: 'none', cursor: (aiLoading || !profile || !isGeminiConfigured) ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
              boxShadow: '0 4px 14px rgba(124,109,240,0.35)',
              color: 'white', fontSize: 12, fontWeight: 700, opacity: (aiLoading || !profile || !isGeminiConfigured) ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            {aiLoading ? '⏳ Đang tạo...' : '✨ Tạo thực đơn'}
          </button>
        </div>

        {!isGeminiConfigured && (
          <div style={{ fontSize: 12, color: '#3a3a6a', background: 'rgba(255,255,255,0.025)', padding: '12px 16px', borderRadius: 12 }}>
            💡 Cần cấu hình VITE_GEMINI_API_KEY trong file .env để sử dụng tính năng này
          </div>
        )}

        {aiError && (
          <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', padding: '12px 16px', borderRadius: 12 }}>
            ❌ {aiError}
          </div>
        )}

        {aiPlan && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {aiPlan.map((_, i) => (
                <button key={i} onClick={() => setActiveDay(i)} style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: activeDay === i ? 'linear-gradient(135deg, #7c6df0, #a89af8)' : 'rgba(255,255,255,0.03)',
                  border: activeDay === i ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  color: activeDay === i ? 'white' : '#3a3a6a',
                } as React.CSSProperties}>
                  Ngày {i + 1}
                </button>
              ))}
            </div>
            {displayPlan && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((key) => {
                    const labels = { breakfast: '☀️ Sáng', lunch: '🌤 Trưa', dinner: '🌙 Tối', snack: '🍎 Snack' }
                    const meal = displayPlan[key]
                    if (!meal) return null
                    return (
                      <div key={key} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#a89af8', marginBottom: 6 }}>{labels[key]}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#d0d0f0', marginBottom: 8 }}>{meal.name}</div>
                        <ul style={{ marginBottom: 8 }}>
                          {meal.items?.map((item: string, i: number) => (
                            <li key={i} style={{ fontSize: 11, color: '#3a3a6a', marginBottom: 2 }}>• {item}</li>
                          ))}
                        </ul>
                        <div style={{ fontSize: 11, color: '#fb923c' }}>🔥 {meal.calories} kcal</div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: 13 }}>
                  <span style={{ color: '#5858a0' }}>Tổng ngày {activeDay + 1}: </span>
                  <span style={{ color: '#a89af8', fontWeight: 700 }}>{displayPlan.total_calories} kcal</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
