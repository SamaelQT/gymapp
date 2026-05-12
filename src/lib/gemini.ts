import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Profile, DayPlan } from '../types'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''

export const isGeminiConfigured = !!apiKey

function getGoalLabel(goal: string) {
  if (goal === 'lose_fat') return 'giảm mỡ'
  if (goal === 'gain_muscle') return 'tăng cơ'
  return 'duy trì cân nặng'
}

function getActivityLabel(level: string) {
  const map: Record<string, string> = {
    sedentary: 'ít vận động',
    light: 'vận động nhẹ',
    moderate: 'vận động vừa',
    active: 'vận động nhiều',
    very_active: 'vận động rất nhiều',
  }
  return map[level] || 'vận động vừa'
}

export async function getNutritionSuggestion(profile: Profile): Promise<DayPlan[]> {
  if (!apiKey) throw new Error('Gemini API key chưa được cấu hình')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Gợi ý thực đơn 7 ngày cho người có thông tin sau:
- Giới tính: ${profile.gender === 'male' ? 'Nam' : 'Nữ'}
- Tuổi: ${profile.age} tuổi
- Cân nặng: ${profile.weight}kg
- Chiều cao: ${profile.height}cm
- Mức độ vận động: ${getActivityLabel(profile.activity_level)}
- Mục tiêu: ${getGoalLabel(profile.goal)}

Trả về JSON hợp lệ (không có markdown, không có text khác), format:
{"days":[{"breakfast":{"name":"tên bữa","items":["món 1","món 2"],"calories":số,"macro":{"protein":số,"carbs":số,"fat":số}},"lunch":{"name":"tên bữa","items":["món 1"],"calories":số,"macro":{"protein":số,"carbs":số,"fat":số}},"dinner":{"name":"tên bữa","items":["món 1"],"calories":số,"macro":{"protein":số,"carbs":số,"fat":số}},"snack":{"name":"tên snack","items":["món 1"],"calories":số,"macro":{"protein":số,"carbs":số,"fat":số}},"total_calories":số}]}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Không thể parse response từ Gemini')

  const parsed = JSON.parse(jsonMatch[0])
  return parsed.days as DayPlan[]
}
