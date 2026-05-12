import type { Profile, Goal, Macro } from '../types'

export function calculateTDEE(profile: Profile): number {
  const { weight, height, age, gender, activity_level } = profile

  // Harris-Benedict formula
  let bmr: number
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  return Math.round(bmr * (activityMultipliers[activity_level] || 1.55))
}

export function calculateMacros(tdee: number, goal: Goal): { calories: number; macro: Macro } {
  let calories: number
  let proteinRatio: number
  let carbRatio: number
  let fatRatio: number

  switch (goal) {
    case 'lose_fat':
      calories = tdee - 400
      proteinRatio = 0.35
      carbRatio = 0.35
      fatRatio = 0.30
      break
    case 'gain_muscle':
      calories = tdee + 250
      proteinRatio = 0.30
      carbRatio = 0.45
      fatRatio = 0.25
      break
    default:
      calories = tdee
      proteinRatio = 0.25
      carbRatio = 0.45
      fatRatio = 0.30
  }

  return {
    calories,
    macro: {
      protein: Math.round((calories * proteinRatio) / 4),
      carbs: Math.round((calories * carbRatio) / 4),
      fat: Math.round((calories * fatRatio) / 9),
    },
  }
}

export const MEAL_PLANS = {
  lose_fat: {
    name: 'Thực đơn giảm mỡ',
    days: [
      {
        breakfast: {
          name: 'Sáng nhẹ',
          items: ['2 quả trứng luộc', 'Bánh mì ngũ cốc', 'Sữa chua Hy Lạp'],
          calories: 350,
          macro: { protein: 25, carbs: 35, fat: 12 },
        },
        lunch: {
          name: 'Trưa dinh dưỡng',
          items: ['Ức gà nướng 150g', 'Cơm gạo lứt', 'Salad rau xanh'],
          calories: 480,
          macro: { protein: 40, carbs: 50, fat: 10 },
        },
        dinner: {
          name: 'Tối thanh đạm',
          items: ['Cá hồi hấp 120g', 'Khoai lang', 'Rau cải xào tỏi'],
          calories: 400,
          macro: { protein: 35, carbs: 35, fat: 12 },
        },
        snack: {
          name: 'Snack lành mạnh',
          items: ['Hạnh nhân 30g', 'Táo'],
          calories: 200,
          macro: { protein: 6, carbs: 20, fat: 12 },
        },
        total_calories: 1430,
      },
    ],
  },
  gain_muscle: {
    name: 'Thực đơn tăng cơ',
    days: [
      {
        breakfast: {
          name: 'Sáng protein cao',
          items: ['Cháo yến mạch + protein shake', '3 quả trứng chiên', 'Chuối'],
          calories: 620,
          macro: { protein: 45, carbs: 70, fat: 15 },
        },
        lunch: {
          name: 'Trưa năng lượng',
          items: ['Bò xào 180g', 'Cơm trắng 2 bát', 'Đậu hũ xào'],
          calories: 750,
          macro: { protein: 50, carbs: 85, fat: 18 },
        },
        dinner: {
          name: 'Tối phục hồi',
          items: ['Gà luộc 200g', 'Khoai tây nghiền', 'Súp lơ hấp'],
          calories: 580,
          macro: { protein: 48, carbs: 55, fat: 14 },
        },
        snack: {
          name: 'Snack tăng cơ',
          items: ['Protein shake', 'Bánh gạo', 'Peanut butter'],
          calories: 380,
          macro: { protein: 30, carbs: 40, fat: 12 },
        },
        total_calories: 2330,
      },
    ],
  },
  maintain: {
    name: 'Thực đơn duy trì',
    days: [
      {
        breakfast: {
          name: 'Sáng cân bằng',
          items: ['Bánh mì sandwich trứng', 'Sữa tươi', 'Trái cây tươi'],
          calories: 450,
          macro: { protein: 22, carbs: 55, fat: 14 },
        },
        lunch: {
          name: 'Trưa cân đối',
          items: ['Cơm trắng', 'Thịt lợn kho', 'Canh rau'],
          calories: 600,
          macro: { protein: 35, carbs: 65, fat: 16 },
        },
        dinner: {
          name: 'Tối vừa phải',
          items: ['Mì ý sốt cà', 'Salad trộn', 'Nước ép rau củ'],
          calories: 520,
          macro: { protein: 28, carbs: 60, fat: 14 },
        },
        snack: {
          name: 'Snack nhẹ',
          items: ['Sữa chua', 'Granola'],
          calories: 220,
          macro: { protein: 10, carbs: 30, fat: 7 },
        },
        total_calories: 1790,
      },
    ],
  },
}
