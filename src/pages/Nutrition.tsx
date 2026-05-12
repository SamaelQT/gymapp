import { useState } from 'react'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useUserStore } from '../store/useUserStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { calculateTDEE, calculateMacros, MEAL_PLANS } from '../lib/nutrition'
import { getNutritionSuggestion, isGeminiConfigured } from '../lib/gemini'
import type { DayPlan, Macro } from '../types'

function MacroRing({ macro, total }: { macro: Macro; total: number }) {
  const protein = (macro.protein * 4 / total) * 100
  const carbs = (macro.carbs * 4 / total) * 100
  const fat = (macro.fat * 9 / total) * 100

  const size = 120
  const strokeWidth = 12
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r

  let offset = 0
  const segments = [
    { pct: protein, color: '#7c6ff7', label: 'Protein', value: macro.protein, unit: 'g' },
    { pct: carbs, color: '#22c55e', label: 'Carbs', value: macro.carbs, unit: 'g' },
    { pct: fat, color: '#f59e0b', label: 'Fat', value: macro.fat, unit: 'g' },
  ]

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1a28" strokeWidth={strokeWidth} />
          {segments.map((seg, i) => {
            const dash = (seg.pct / 100) * circ
            const curr = offset
            offset += seg.pct
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-curr / 100 * circ}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-[#f0f0ff]">{total}</p>
            <p className="text-xs text-[#555570]">kcal</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-[#8888aa] w-12">{seg.label}</span>
            <span className="text-xs font-bold text-[#f0f0ff]">{seg.value}g</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MealCard({ title, meal, checked, onToggle }: {
  title: string
  meal: DayPlan['breakfast']
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${checked ? 'border-[#7c6ff7]/50 bg-[#7c6ff7]/10' : 'border-[#22223a] bg-[#1a1a28]'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#8888aa] uppercase tracking-wide">{title}</span>
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            checked ? 'bg-[#7c6ff7] border-[#7c6ff7]' : 'border-[#555570]'
          }`}
        >
          {checked && <span className="text-white text-xs">✓</span>}
        </button>
      </div>
      <p className="text-sm font-medium text-[#f0f0ff] mb-1">{meal.name}</p>
      <ul className="space-y-0.5 mb-2">
        {meal.items.map((item, i) => (
          <li key={i} className="text-xs text-[#8888aa]">• {item}</li>
        ))}
      </ul>
      <div className="flex gap-3 text-xs">
        <span className="text-orange-400">🔥 {meal.calories} kcal</span>
        <span className="text-[#7c6ff7]">P:{meal.macro.protein}g</span>
        <span className="text-green-400">C:{meal.macro.carbs}g</span>
        <span className="text-yellow-400">F:{meal.macro.fat}g</span>
      </div>
    </div>
  )
}

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
    if (todayLog) {
      updateNutritionLog(today, { meals: updated })
    } else {
      addNutritionLog({
        date: today,
        meals: updated,
        total_calories: eatenCalories,
        macros: targetMacro,
      })
    }
  }

  const loadAiSuggestion = async () => {
    if (!profile) return
    setAiLoading(true)
    setAiError('')
    try {
      const days = await getNutritionSuggestion(profile)
      setAiPlan(days)
    } catch (e: any) {
      setAiError(e.message || 'Lỗi không xác định')
    } finally {
      setAiLoading(false)
    }
  }

  const displayPlan = aiPlan ? aiPlan[activeDay] : null

  return (
    <div>
      <Header title="Dinh Dưỡng" subtitle="Kế hoạch ăn uống và theo dõi calo" />

      {!profile && (
        <Card className="mb-5 border-yellow-500/30 bg-yellow-500/10">
          <p className="text-yellow-400 text-sm">⚠️ Vui lòng điền thông tin hồ sơ để tính toán dinh dưỡng chính xác</p>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        {/* TDEE card */}
        <Card>
          <h2 className="text-sm font-semibold text-[#f0f0ff] mb-4">Chỉ số dinh dưỡng</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#8888aa]">TDEE</span>
              <span className="text-[#f0f0ff] font-bold">{tdee} kcal</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8888aa]">Mục tiêu</span>
              <span className="text-[#7c6ff7] font-bold">{targetCalories} kcal</span>
            </div>
            <div className="h-px bg-[#22223a]" />
            <MacroRing macro={targetMacro} total={targetCalories} />
          </div>
        </Card>

        {/* Daily tracker */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#f0f0ff]">Theo dõi hôm nay</h2>
            <span className="text-xs text-[#555570]">{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#8888aa]">Calo tiêu thụ</span>
              <span className="text-[#f0f0ff] font-medium">{eatenCalories} / {targetCalories} kcal</span>
            </div>
            <div className="h-3 bg-[#1a1a28] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7c6ff7] to-[#9d92ff] rounded-full transition-all"
                style={{ width: `${Math.min(100, (eatenCalories / targetCalories) * 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((key) => {
              const labels = { breakfast: 'Sáng', lunch: 'Trưa', dinner: 'Tối', snack: 'Snack' }
              return (
                <MealCard
                  key={key}
                  title={labels[key]}
                  meal={defaultMeals[key] as any}
                  checked={!!checkedMeals[key]}
                  onToggle={() => toggleMeal(key)}
                />
              )
            })}
          </div>
        </Card>
      </div>

      {/* AI Nutrition Suggestion */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#f0f0ff]">🤖 Gợi ý AI (Gemini)</h2>
            <p className="text-xs text-[#8888aa] mt-0.5">Thực đơn 7 ngày được cá nhân hóa theo mục tiêu của bạn</p>
          </div>
          <Button
            onClick={loadAiSuggestion}
            disabled={aiLoading || !profile || !isGeminiConfigured}
            size="sm"
          >
            {aiLoading ? '⏳ Đang tạo...' : '✨ Tạo thực đơn'}
          </Button>
        </div>

        {!isGeminiConfigured && (
          <p className="text-xs text-[#555570] bg-[#1a1a28] p-3 rounded-lg">
            💡 Cần cấu hình VITE_GEMINI_API_KEY trong file .env để sử dụng tính năng này
          </p>
        )}

        {aiError && (
          <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            ❌ {aiError}
          </div>
        )}

        {aiPlan && (
          <div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {aiPlan.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeDay === i
                      ? 'bg-[#7c6ff7] text-white'
                      : 'bg-[#1a1a28] text-[#8888aa] border border-[#22223a]'
                  }`}
                >
                  Ngày {i + 1}
                </button>
              ))}
            </div>
            {displayPlan && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((key) => {
                  const labels = { breakfast: 'Sáng', lunch: 'Trưa', dinner: 'Tối', snack: 'Snack' }
                  const meal = displayPlan[key]
                  if (!meal) return null
                  return (
                    <div key={key} className="bg-[#1a1a28] rounded-xl p-3 border border-[#22223a]">
                      <p className="text-xs font-semibold text-[#7c6ff7] mb-1">{labels[key]}</p>
                      <p className="text-sm font-medium text-[#f0f0ff] mb-2">{meal.name}</p>
                      <ul className="space-y-0.5 mb-2">
                        {meal.items?.map((item: string, i: number) => (
                          <li key={i} className="text-xs text-[#8888aa]">• {item}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-orange-400">🔥 {meal.calories} kcal</p>
                    </div>
                  )
                })}
              </div>
            )}
            {displayPlan && (
              <div className="mt-3 pt-3 border-t border-[#22223a] text-center">
                <span className="text-sm text-[#f0f0ff] font-medium">
                  Tổng ngày {activeDay + 1}:
                  <span className="text-[#7c6ff7] ml-1">{displayPlan.total_calories} kcal</span>
                </span>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
