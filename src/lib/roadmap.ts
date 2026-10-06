import type { Profile } from '../types'
import { calculateTDEE, calculateMacros } from './nutrition'

/* ══════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════ */
export interface RoadmapExercise {
  name: string
  sets: number
  reps: string        // e.g. "5-8", "12-15", "AMRAP", "60s"
  rest: string        // e.g. "2 phút"
  muscleGroups: string[]
  primaryMuscle: string  // key into MUSCLE_META
  secondaryMuscles?: string[]  // keys into MUSCLE_META
  emoji: string
  category: 'compound' | 'isolation' | 'core' | 'cardio'
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string[]
  mistakes: string[]
  liveAIId?: string   // matches exercise id in EXERCISES data
  youtubeId?: string  // YouTube video ID for embed
}

/* ─── Muscle metadata ─── */
export const MUSCLE_META: Record<string, { label: string; emoji: string; color: string; desc: string }> = {
  chest:      { label: 'Ngực',               emoji: '🫀', color: '#f87171', desc: 'Pectoralis Major & Minor' },
  back:       { label: 'Lưng rộng',          emoji: '🔙', color: '#34d399', desc: 'Latissimus Dorsi, Rhomboids' },
  mid_back:   { label: 'Lưng giữa',          emoji: '🔙', color: '#6ee7b7', desc: 'Rhomboids, Trapezius giữa' },
  lower_back: { label: 'Lưng dưới',          emoji: '🔋', color: '#a7f3d0', desc: 'Erector Spinae' },
  quads:      { label: 'Đùi trước',          emoji: '🦵', color: '#fbbf24', desc: 'Quadriceps — Vastus Lateralis/Medialis' },
  hamstrings: { label: 'Đùi sau',            emoji: '🦵', color: '#fb923c', desc: 'Biceps Femoris, Semitendinosus' },
  glutes:     { label: 'Mông',               emoji: '🍑', color: '#f472b6', desc: 'Gluteus Maximus & Medius' },
  calves:     { label: 'Bắp chân',           emoji: '🦿', color: '#a78bfa', desc: 'Gastrocnemius, Soleus' },
  shoulders:  { label: 'Vai',                emoji: '💫', color: '#38bdf8', desc: 'Anterior, Lateral & Posterior Deltoid' },
  rear_delt:  { label: 'Vai sau',            emoji: '🎯', color: '#7dd3fc', desc: 'Posterior Deltoid, Rotator Cuff' },
  biceps:     { label: 'Tay trước (Biceps)', emoji: '💪', color: '#a89af8', desc: 'Biceps Brachii, Brachialis' },
  triceps:    { label: 'Tay sau (Triceps)',  emoji: '🦾', color: '#4ade80', desc: 'Triceps Brachii — 3 đầu' },
  forearms:   { label: 'Cẳng tay / Cổ tay', emoji: '✋', color: '#fdba74', desc: 'Brachioradialis, Wrist Flexors' },
  core:       { label: 'Core / Bụng',        emoji: '🎯', color: '#e879f9', desc: 'Rectus Abdominis, Obliques, TVA' },
}

export interface TrainingDay {
  day: string
  short: string
  type: 'workout' | 'rest' | 'active_rest'
  focus: string
  emoji: string
  muscles: string[]
  keyExercises: RoadmapExercise[]
  totalSets: number
  duration: number
  repRange: string
  restBetweenSets: string
}

export interface ProgressionPhase {
  phase: number; weeks: string; title: string; goal: string
  volume: string; intensity: string; tips: string[]; color: string
}

export interface MealSlot {
  time: string; name: string; calories: number
  description: string; examples: string[]; color: string
}

export interface FoodCategory {
  category: string; emoji: string; color: string
  items: { name: string; amount: string; note: string }[]
}

export interface RecoveryBlock {
  title: string; emoji: string; color: string; items: string[]
}

/* ══════════════════════════════════════════════════
   EXERCISE DATABASE  (PT-level coaching cues)
══════════════════════════════════════════════════ */
export const EXERCISE_DB: Record<string, RoadmapExercise> = {

  /* ── COMPOUND LOWER ── */
  squat: {
    name: 'Back Squat', sets: 4, reps: '5-8', rest: '2-3 phút',
    muscleGroups: ['Đùi trước', 'Mông', 'Đùi sau', 'Core'],
    primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'hamstrings', 'core'],
    emoji: '🏋️', category: 'compound', difficulty: 'hard', liveAIId: 'squat',
    youtubeId: 'ultWZbUMPL8',
    tips: [
      'Chân rộng bằng vai hoặc hơn, mũi chân hướng ngoài 30°',
      'Hít sâu, giữ hơi Valsalva trước khi xuống — bảo vệ cột sống',
      'Ngồi "ra sau" như ngồi ghế — không để gối vượt quá ngón chân quá nhiều',
      'Gối luôn hướng theo ngón chân, không để sụp vào trong',
      'Xuống đến parallel (đùi song song sàn) hoặc sâu hơn nếu linh hoạt tốt',
      'Đẩy qua gót chân khi đứng lên — cảm nhận mông co lại ở trên cùng',
    ],
    mistakes: [
      'Knee cave (gối đổ vào trong) → tập abductor, tăng cường cơ hông',
      'Gót chân nhấc → thiếu linh hoạt cổ chân, kê tấm nâng gót tạm thời',
      'Lưng tròn (butt wink quá mức) → giảm tạ, tập hip flexor stretch',
      'Nhìn xuống → luôn nhìn thẳng hoặc hơi lên, giữ ngực ưỡn',
    ],
  },

  goblet_squat: {
    name: 'Goblet Squat', sets: 3, reps: '10-15', rest: '90 giây',
    muscleGroups: ['Đùi trước', 'Mông', 'Core'], primaryMuscle: 'quads',
    emoji: '🥛', category: 'compound', difficulty: 'easy',
    tips: [
      'Giữ tạ sát ngực, khuỷu tay chỉ xuống đất',
      'Chân rộng hơn squat thường, dễ xuống sâu hơn',
      'Bài tập hoàn hảo để học kỹ thuật squat — không cần tạ nặng',
      'Xuống hết tầm (deep squat) — tốt cho linh hoạt hông',
    ],
    mistakes: ['Tạ quá nặng làm mất kỹ thuật', 'Không xuống đủ sâu'],
  },

  rdl: {
    name: 'Romanian Deadlift', sets: 3, reps: '8-12', rest: '2 phút',
    muscleGroups: ['Đùi sau', 'Mông', 'Lưng dưới'], primaryMuscle: 'hamstrings',
    secondaryMuscles: ['glutes', 'lower_back'],
    emoji: '🏋️', category: 'compound', difficulty: 'medium',
    youtubeId: 'JCXUYuzwNrM',
    tips: [
      'Lưng thẳng tuyệt đối — đây là rule số 1',
      'Kéo hông ra sau (hip hinge) — không gập lưng',
      'Hạ tạ theo sát chân (trong vòng 5cm từ ống chân), đến cảm thấy hamstring căng',
      'Đứng lên bằng cách đẩy hông về trước — không phải co lưng',
      'Giữ bar gần thân người nhất có thể',
    ],
    mistakes: [
      'Lưng cong → giảm tạ, tập hip hinge không tạ trước',
      'Gập gối quá nhiều → đây là deadlift không phải squat',
      'Hạ tạ xuống sàn → RDL chỉ hạ đến cẳng chân, giữ tension hamstring',
    ],
  },

  deadlift: {
    name: 'Deadlift', sets: 4, reps: '3-6', rest: '3 phút',
    muscleGroups: ['Lưng dưới', 'Đùi sau', 'Mông', 'Bẫy', 'Core'],
    primaryMuscle: 'lower_back', secondaryMuscles: ['hamstrings', 'glutes', 'mid_back', 'core'],
    emoji: '⚡', category: 'compound', difficulty: 'hard',
    youtubeId: 'op9kVnSso6Q',
    tips: [
      'Setup: chân dưới bar (bar trên mid-foot), gập hông xuống, giữ lưng thẳng',
      'Vai hơi ra trước so với bar — tạo "lò xo" để kéo',
      'Kéo bar lên bằng cách đẩy chân xuống đất — nghĩ như "leg press"',
      'Giữ lat "bóp cam" — tưởng tượng kẹp cam nách',
      'Hít vào, giữ hơi (Valsalva), thở ra khi đặt tạ xuống',
    ],
    mistakes: [
      'Lưng cong → DỪNG NGAY, đây là chấn thương nghiêm trọng',
      'Bar rời xa người → kéo theo đường thẳng sát ống chân',
      'Giật tạ lên → kéo chậm, kiểm soát từ đầu đến cuối',
    ],
  },

  leg_press: {
    name: 'Leg Press', sets: 3, reps: '10-15', rest: '90 giây',
    muscleGroups: ['Đùi trước', 'Mông'], primaryMuscle: 'quads',
    emoji: '🦿', category: 'compound', difficulty: 'easy',
    tips: [
      'Chân rộng vai, mũi chân hướng ngoài nhẹ',
      'Đặt chân cao hơn → tác động mông nhiều hơn',
      'Đặt chân thấp hơn → tác động đùi trước nhiều hơn',
      'Không khóa gối hoàn toàn ở trên cùng — giữ slight bend',
      'Hạ xuống đến đùi gần song song sàn hoặc sâu hơn',
    ],
    mistakes: ['Đặt chân quá thấp và tạ quá nặng → đau gối', 'Mông nhấc khỏi ghế khi hạ'],
  },

  bulgarian: {
    name: 'Bulgarian Split Squat', sets: 3, reps: '10-12/chân', rest: '2 phút',
    muscleGroups: ['Đùi trước', 'Mông', 'Đùi sau'], primaryMuscle: 'glutes',
    emoji: '🦵', category: 'compound', difficulty: 'medium',
    tips: [
      'Chân sau đặt lên ghế, không quá cao (ngang gối)',
      'Bước chân trước đủ xa để gối không vượt ngón chân khi xuống',
      'Xuống thẳng đứng — không nghiêng người về trước',
      'Tác động mông: thân người thẳng. Tác động đùi: hơi nghiêng về trước',
      'Tập chân yếu hơn trước để tránh mất cân bằng',
    ],
    mistakes: ['Chân sau quá xa → mất thăng bằng', 'Gối chạm sàn thay vì hạ chậm'],
  },

  leg_curl: {
    name: 'Leg Curl', sets: 3, reps: '12-15', rest: '60 giây',
    muscleGroups: ['Đùi sau'], primaryMuscle: 'hamstrings',
    emoji: '🦵', category: 'isolation', difficulty: 'easy',
    tips: [
      'Hạ xuống chậm (3-4 giây eccentric) — đây là lúc cơ phát triển nhất',
      'Co mông khi curl lên — tăng hiệu quả hamstring',
      'Full range of motion — kéo lên hết tầm',
    ],
    mistakes: ['Tạ quá nặng làm cử giật', 'Không co đủ hết tầm'],
  },

  calf_raise: {
    name: 'Calf Raise', sets: 4, reps: '15-20', rest: '45 giây',
    muscleGroups: ['Bắp chân'], primaryMuscle: 'calves',
    emoji: '🦵', category: 'isolation', difficulty: 'easy',
    tips: [
      'Đứng trên bậc thang hoặc tấm nâng để có full ROM',
      'Hạ xuống chậm cho đến khi cảm thấy bắp chân kéo căng',
      'Co lên hết tầm — giữ 1 giây ở trên cùng',
      'Bắp chân rất dai — cần rep cao và volume lớn để phát triển',
    ],
    mistakes: ['ROM quá ngắn (không hạ đủ sâu)', 'Tạ quá nặng mất kiểm soát'],
  },

  /* ── COMPOUND UPPER PUSH ── */
  bench_press: {
    name: 'Bench Press', sets: 4, reps: '5-8', rest: '2-3 phút',
    muscleGroups: ['Ngực giữa', 'Ngực trên', 'Vai trước', 'Tay sau'],
    primaryMuscle: 'chest', secondaryMuscles: ['shoulders', 'triceps'],
    emoji: '🏋️', category: 'compound', difficulty: 'hard',
    youtubeId: 'rT7DgCr-3pg',
    tips: [
      'Co xương vai lại (retract scapula) — tạo nền ổn định',
      'Lưng hơi cong tự nhiên, mông dính ghế',
      'Tay rộng hơn vai một chút, cổ tay thẳng với khuỷu',
      'Hạ bar đến dưới ngực (xương ức), không phải cổ',
      'Đẩy theo đường chéo lên trên — không đẩy thẳng đứng',
      'Chân đặt phẳng xuống sàn hoặc đứng bằng mũi chân (leg drive)',
    ],
    mistakes: [
      'Xương vai không co → vai bị tổn thương, mất sức',
      'Bật bar từ ngực → eccentric quan trọng, hạ có kiểm soát',
      'Khuỷu tay 90° với thân → góc 45-75° an toàn hơn cho vai',
    ],
  },

  incline_db_press: {
    name: 'Incline DB Press', sets: 3, reps: '8-12', rest: '90 giây',
    muscleGroups: ['Ngực trên', 'Vai trước', 'Tay sau'],
    primaryMuscle: 'chest',
    emoji: '💪', category: 'compound', difficulty: 'medium',
    tips: [
      'Góc ghế 30-45° — quá cao thành bài shoulder press',
      'Hạ tạ ra ngoài và xuống — tạo stretch ngực trên',
      'Ép tạ vào nhau ở trên cùng (không chạm) — squeeze ngực',
      'Giữ khuỷu tay không quá banh ra',
    ],
    mistakes: ['Ghế quá cao (>45°) → thành OHP', 'Không hạ đủ sâu → mất ROM'],
  },

  ohp: {
    name: 'Overhead Press', sets: 3, reps: '8-12', rest: '2 phút',
    muscleGroups: ['Vai trước', 'Vai giữa', 'Tay sau', 'Core'],
    primaryMuscle: 'shoulders', secondaryMuscles: ['triceps', 'core'],
    emoji: '🏋️', category: 'compound', difficulty: 'medium',
    youtubeId: '2yjwXTZQDDI',
    tips: [
      'Kẹp mông, co bụng — không để lưng dưới ưỡn cong',
      'Bar bắt đầu tại đòn cổ, đẩy thẳng lên trên',
      'Đưa đầu ra sau khi bar đi qua mặt, rồi đưa về dưới bar',
      'Nhìn thẳng — không ngửa cổ ra sau',
      'Full lockout ở trên (khuỷu thẳng hoàn toàn)',
    ],
    mistakes: [
      'Lưng dưới ưỡn quá (hyperextension) → yếu core, giảm tạ',
      'Bar đi đường vòng tránh mặt → lãng phí sức lực',
      'Không lockout → bỏ sót range of motion',
    ],
  },

  pushup: {
    name: 'Push-up', sets: 3, reps: '10-20', rest: '60 giây',
    muscleGroups: ['Ngực', 'Vai trước', 'Tay sau', 'Core'],
    primaryMuscle: 'chest', secondaryMuscles: ['shoulders', 'triceps', 'core'],
    emoji: '🤸', category: 'compound', difficulty: 'easy', liveAIId: 'pushup',
    youtubeId: 'IODxDxX7oi4',
    tips: [
      'Thân người thẳng tuyệt đối từ đầu đến gót chân',
      'Tay rộng hơn vai nhẹ, ngón tay hướng thẳng hoặc hơi ngoài',
      'Hạ ngực chạm sàn, không chỉ gập khuỷu',
      'Khuỷu tay góc 45° với thân — không mở 90°',
      'Co core và mông suốt bài để giữ thân thẳng',
    ],
    mistakes: [
      'Mông nhô lên hoặc hạ xuống → mất straight body',
      'Nhìn về phía trước → cổ căng, nhìn xuống đất',
      'Không xuống đủ sâu → half rep không hiệu quả',
    ],
  },

  dips: {
    name: 'Dips', sets: 3, reps: '8-15', rest: '90 giây',
    muscleGroups: ['Ngực dưới', 'Tay sau', 'Vai trước'],
    primaryMuscle: 'chest',
    emoji: '🤸', category: 'compound', difficulty: 'medium',
    tips: [
      'Nghiêng người về trước 30° → tác động ngực nhiều hơn',
      'Thân thẳng đứng → tác động tay sau nhiều hơn',
      'Hạ xuống đến khuỷu tay 90° hoặc thấp hơn',
      'Đẩy lên không khóa khuỷu hoàn toàn — giữ tension',
    ],
    mistakes: ['Vai hướng lên (shrug) → vai trước bị quá tải', 'Khuỷu banh ra ngoài → đau vai'],
  },

  /* ── COMPOUND UPPER PULL ── */
  pullup: {
    name: 'Pull-up', sets: 4, reps: 'AMRAP', rest: '2 phút',
    muscleGroups: ['Lưng rộng', 'Tay trước', 'Lưng giữa'],
    primaryMuscle: 'back', secondaryMuscles: ['biceps', 'mid_back'],
    emoji: '🧗', category: 'compound', difficulty: 'hard', liveAIId: 'pullup',
    youtubeId: 'eGo4IYlbE5g',
    tips: [
      'Bắt đầu từ dead hang — vai nâng lên tai (shrug) TRƯỚC khi kéo',
      'Kéo bằng lưng — tưởng tượng kéo khuỷu xuống đất',
      'Ngực hướng lên bar — không phải mặt',
      'Hạ xuống chậm (3 giây) — eccentric quan trọng nhất',
      'Kéo đến khi cằm qua bar, lý tưởng nhất là ngực chạm bar',
    ],
    mistakes: [
      'Kéo bằng tay không phải lưng → cảm nhận lưng rộng "bóp" lại',
      'Swinging body (đung đưa) → giảm reps, tập strict',
      'Không dead hang hoàn toàn → giới hạn ROM và phát triển lưng',
    ],
  },

  lat_pulldown: {
    name: 'Lat Pulldown', sets: 3, reps: '8-12', rest: '90 giây',
    muscleGroups: ['Lưng rộng', 'Tay trước'],
    primaryMuscle: 'back',
    emoji: '💪', category: 'compound', difficulty: 'easy',
    tips: [
      'Hơi nghiêng người ra sau 10-15° — giống góc pull-up',
      'Kéo xuống về phía ngực trên — không kéo ra sau gáy',
      'Co lưng rộng trước khi kéo — khởi động scapula',
      'Hạ lên chậm — eccentric 3 giây, cảm nhận lưng kéo căng',
    ],
    mistakes: ['Kéo sau gáy → nguy hiểm cho cổ và vai', 'Dùng đà lắc người → isolate lat tốt hơn'],
  },

  barbell_row: {
    name: 'Barbell Row', sets: 4, reps: '6-10', rest: '2 phút',
    muscleGroups: ['Lưng giữa', 'Lưng rộng', 'Tay trước', 'Tay sau'],
    primaryMuscle: 'mid_back', secondaryMuscles: ['back', 'biceps', 'rear_delt'],
    emoji: '🏋️', category: 'compound', difficulty: 'hard',
    youtubeId: 'G8l_8chR5BE',
    tips: [
      'Lưng song song sàn (hoặc gần vậy) — đây là quan trọng nhất',
      'Kéo về RỐN — không phải về ngực (row khác nhau cho lưng khác nhau)',
      'Squeeze lưng ở đỉnh — giữ 1 giây',
      'Hít vào, giữ hơi khi kéo — bảo vệ lưng dưới',
      'Hạ bar xuống chậm — không thả rơi',
    ],
    mistakes: [
      'Lưng quá đứng → trở thành OHP bằng lưng',
      'Kéo bằng tay không phải lưng → cảm nhận xương bả vai di chuyển',
      'Dùng momentum quá nhiều → giảm tạ, học kỹ thuật',
    ],
  },

  db_row: {
    name: 'DB One-arm Row', sets: 4, reps: '10-12/tay', rest: '90 giây',
    muscleGroups: ['Lưng rộng', 'Lưng giữa', 'Tay trước'],
    primaryMuscle: 'back',
    emoji: '💪', category: 'compound', difficulty: 'medium',
    tips: [
      'Một tay và đầu gối cùng bên chống lên ghế',
      'Lưng song song sàn, không xoay hông',
      'Kéo tạ lên hông — không phải lên vai',
      'Khuỷu tay gần thân người — không banh ra',
      'Hạ tạ đến khi tay thẳng hoàn toàn — full stretch',
    ],
    mistakes: ['Xoay hông khi kéo → bài tập mất focus', 'Không full stretch ở dưới → mất ROM'],
  },

  face_pull: {
    name: 'Face Pull', sets: 3, reps: '15-20', rest: '60 giây',
    muscleGroups: ['Vai sau', 'Xoay cơ vai', 'Lưng trên'],
    primaryMuscle: 'rear_delt',
    emoji: '🎯', category: 'isolation', difficulty: 'easy',
    tips: [
      'Kéo về phía mặt — hai tay ra ngang tai khi kết thúc',
      'Khuỷu tay cao bằng vai hoặc hơn',
      'Xoay ngoài vai — ngón tay cái hướng ra sau',
      'Đây là bài BẮT BUỘC cho sức khỏe vai — tập mỗi buổi push và pull',
      'Tạ nhẹ + nhiều reps — đây là bài rehab không phải strength',
    ],
    mistakes: ['Tạ quá nặng → mất kỹ thuật', 'Kéo vào cổ thay vì mặt'],
  },

  /* ── ISOLATION ── */
  lateral_raise: {
    name: 'Lateral Raise', sets: 4, reps: '15-20', rest: '60 giây',
    muscleGroups: ['Vai giữa'], primaryMuscle: 'shoulders',
    emoji: '🙌', category: 'isolation', difficulty: 'easy',
    tips: [
      'Hơi nghiêng người về trước 10-15° — tăng kích hoạt vai giữa',
      'Nâng tạ đến ngang vai — không cần lên quá cao',
      'Ngón út hơi cao hơn ngón cái (internal rotation nhẹ)',
      'Hạ chậm 3 giây — eccentric quan trọng',
      'Tạ nhẹ + cảm nhận cơ là đúng — đừng ego lift',
    ],
    mistakes: [
      'Dùng đà swing tạ → đứng sát tường để kiểm tra',
      'Tạ quá nặng → vai trước compensate, vai giữa mất tác động',
      'Cổ tay xoay ngón cái lên → giảm hiệu quả',
    ],
  },

  tricep_pushdown: {
    name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest: '60 giây',
    muscleGroups: ['Tay sau'], primaryMuscle: 'triceps',
    emoji: '💪', category: 'isolation', difficulty: 'easy',
    tips: [
      'Khuỷu tay gần thân người, không di chuyển',
      'Đẩy xuống hết tầm — lockout hoàn toàn',
      'Hạ lên chậm — eccentric quan trọng hơn concentric',
      'Đứng thẳng hoặc hơi nghiêng về trước',
    ],
    mistakes: ['Khuỷu ra ngoài → mất isolation', 'Không lockout → ROM ngắn'],
  },

  overhead_tricep: {
    name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', rest: '60 giây',
    muscleGroups: ['Tay sau (long head)'], primaryMuscle: 'triceps',
    emoji: '💪', category: 'isolation', difficulty: 'medium',
    tips: [
      'Bài duy nhất stretch long head tricep — không bỏ qua',
      'Giữ khuỷu gần tai — không để banh ra ngoài',
      'Hạ xuống hết tầm sau đầu — full stretch',
      'Có thể dùng dumbbell hoặc EZ bar',
    ],
    mistakes: ['Khuỷu banh ra → vai phải chịu thêm tải', 'Tạ quá nặng → khuỷu không giữ được'],
  },

  barbell_curl: {
    name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '90 giây',
    muscleGroups: ['Tay trước (bicep)'], primaryMuscle: 'biceps', secondaryMuscles: ['forearms'],
    emoji: '💪', category: 'isolation', difficulty: 'easy', liveAIId: 'bicep_curl',
    youtubeId: 'ykJmrZ5v0Oo',
    tips: [
      'Khuỷu tay CỐ ĐỊNH sát hông — chỉ cẳng tay di chuyển',
      'Curl lên hết tầm — co bicep ở đỉnh 1 giây',
      'Hạ xuống chậm hoàn toàn — đừng để tạ rơi',
      'Tay rộng hơn vai nhẹ → kích hoạt long head nhiều hơn',
    ],
    mistakes: [
      'Dùng lưng/hông swing → ego injury, giảm tạ',
      'Không hạ hết tầm → bỏ mất 40% ROM',
      'Chỉ curl đến 90° → không co bicep đầy đủ',
    ],
  },

  hammer_curl: {
    name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '60 giây',
    muscleGroups: ['Tay trước (brachialis)', 'Cẳng tay'],
    primaryMuscle: 'forearms',
    emoji: '🔨', category: 'isolation', difficulty: 'easy',
    tips: [
      'Ngón cái hướng lên — neutral grip khác với supinated curl',
      'Khuỷu cố định sát hông',
      'Co lên hết tầm — cảm nhận brachialis co',
      'Alternate hoặc tập cùng lúc đều được',
    ],
    mistakes: ['Quay cổ tay → đây không phải supinated curl'],
  },

  /* ── CORE ── */
  plank: {
    name: 'Plank', sets: 3, reps: '45-60 giây', rest: '45 giây',
    muscleGroups: ['Core', 'Vai', 'Mông'], primaryMuscle: 'core', secondaryMuscles: ['shoulders', 'glutes'],
    emoji: '🧘', category: 'core', difficulty: 'easy', liveAIId: 'plank',
    youtubeId: 'ASdvN_XEl_c',
    tips: [
      'Thân thẳng tuyệt đối — không nhô mông lên hoặc võng lưng',
      'Co cơ bụng CHỦ ĐỘNG — không để trọng lực giữ',
      'Khuỷu tay dưới vai — không ra trước hay sau',
      'Nhìn xuống đất — cổ thẳng với cột sống',
      'Thở bình thường — không nín thở',
    ],
    mistakes: ['Mông quá cao → dễ nhưng mất tác động core', 'Hông võng xuống → đau lưng dưới'],
  },

  leg_raise: {
    name: 'Hanging Leg Raise', sets: 3, reps: '12-15', rest: '60 giây',
    muscleGroups: ['Bụng dưới', 'Hip flexor', 'Core'], primaryMuscle: 'core',
    emoji: '🤸', category: 'core', difficulty: 'medium',
    tips: [
      'Co bụng TRƯỚC khi nâng chân — không dùng momentum',
      'Nâng đến khi đùi song song sàn (dễ) hoặc chân thẳng lên trên (khó)',
      'Hạ chậm — eccentric quan trọng nhất',
      'Giữ lưng không ưỡn khi hạ — bụng luôn co',
    ],
    mistakes: ['Swing người → treo người cứng, không swing', 'Hạ quá nhanh → mất eccentric'],
  },

  /* ── PUSH BODYWEIGHT ── */
  diamond_pushup: {
    name: 'Diamond Push-up', sets: 3, reps: '8-15', rest: '60 giây',
    muscleGroups: ['Tay sau', 'Ngực trong'], primaryMuscle: 'triceps',
    emoji: '💎', category: 'compound', difficulty: 'medium',
    tips: [
      'Tay tạo hình kim cương — ngón cái và ngón trỏ chạm nhau',
      'Thân thẳng như plank',
      'Hạ ngực đến tay — khuỷu gần thân',
    ],
    mistakes: ['Hông nhô lên → core không hoạt động'],
  },

  pike_pushup: {
    name: 'Pike Push-up', sets: 3, reps: '8-12', rest: '60 giây',
    muscleGroups: ['Vai trước', 'Tay sau'], primaryMuscle: 'shoulders',
    emoji: '🙆', category: 'compound', difficulty: 'medium',
    tips: [
      'Mông lên cao, người hình chữ V ngược',
      'Hạ đầu về phía tay — hướng thẳng đứng',
      'Bài tập chuẩn bị cho handstand push-up',
    ],
    mistakes: ['Hông không đủ cao → trở thành push-up thường'],
  },
}

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
const maxFreq = (f = '3-4') => parseInt(f.split('-').pop() ?? '4')
type SplitKey = 'fullbody' | 'upperlower' | 'ppl' | 'bro'

function chooseSplit(profile: Profile): SplitKey {
  const freq = maxFreq(profile.frequency)
  const exp  = profile.experience ?? 'beginner'
  if (freq <= 2) return 'fullbody'
  if (freq <= 3 && exp === 'beginner') return 'fullbody'
  if (freq <= 4) return 'upperlower'
  if (exp === 'advanced' && freq >= 6) return 'bro'
  return 'ppl'
}

function ex(...keys: string[]): RoadmapExercise[] {
  return keys.map(k => EXERCISE_DB[k]).filter(Boolean)
}

function adjustVolume(exercises: RoadmapExercise[], profile: Profile): RoadmapExercise[] {
  const exp   = profile.experience ?? 'beginner'
  const goal  = profile.goal
  return exercises.map(e => ({
    ...e,
    sets: exp === 'beginner'   ? Math.max(2, e.sets - 1)
        : exp === 'advanced'   ? e.sets + 1
        : e.sets,
    reps: goal === 'lose_fat' && e.category === 'isolation'
        ? '15-20'
        : goal === 'lose_fat' && e.category === 'compound'
        ? '10-15'
        : e.reps,
    rest: goal === 'lose_fat' ? '45-75 giây' : e.rest,
  }))
}

/* ── PT-optimized workout splits ── */

const SPLITS: Record<SplitKey, { label: string; workouts: Record<string, string[]> }> = {
  fullbody: {
    label: 'Full Body',
    workouts: {
      'Toàn thân A': ['squat',       'bench_press', 'barbell_row', 'ohp',         'rdl',        'plank'],
      'Toàn thân B': ['goblet_squat','incline_db_press','db_row',  'barbell_curl','leg_press',  'leg_raise'],
      'Toàn thân C': ['bulgarian',   'pushup',      'lat_pulldown','lateral_raise','leg_curl',  'plank'],
    },
  },
  upperlower: {
    label: 'Upper / Lower',
    workouts: {
      'Upper A (Sức mạnh)': ['bench_press',    'barbell_row',    'ohp',          'lat_pulldown',  'lateral_raise', 'tricep_pushdown'],
      'Lower A (Sức mạnh)': ['squat',          'rdl',            'leg_press',    'leg_curl',      'calf_raise'],
      'Upper B (Hypertrophy)':['incline_db_press','db_row',      'face_pull',    'barbell_curl',  'overhead_tricep','hammer_curl'],
      'Lower B (Hypertrophy)':['bulgarian',    'goblet_squat',   'leg_press',    'leg_curl',      'leg_raise',     'calf_raise'],
    },
  },
  ppl: {
    label: 'Push / Pull / Legs',
    workouts: {
      'Push (Đẩy)': ['bench_press',  'ohp',       'incline_db_press','lateral_raise','overhead_tricep','tricep_pushdown'],
      'Pull (Kéo)': ['pullup',       'barbell_row','lat_pulldown',   'face_pull',    'barbell_curl',   'hammer_curl'],
      'Legs (Chân)':['squat',        'rdl',        'leg_press',      'leg_curl',     'bulgarian',      'calf_raise'],
    },
  },
  bro: {
    label: 'Body Part',
    workouts: {
      'Ngực':       ['bench_press', 'incline_db_press','dips',       'pushup',       'plank'],
      'Lưng':       ['deadlift',    'barbell_row',     'lat_pulldown','db_row',       'face_pull'],
      'Chân':       ['squat',       'rdl',             'leg_press',   'leg_curl',     'bulgarian','calf_raise'],
      'Vai':        ['ohp',         'lateral_raise',   'face_pull',   'overhead_tricep','plank'],
      'Tay':        ['barbell_curl','hammer_curl',     'tricep_pushdown','overhead_tricep','diamond_pushup'],
    },
  },
}

const MUSCLE_MAP: Record<string, string[]> = {
  'Toàn thân A':        ['Ngực', 'Lưng', 'Chân', 'Core'],
  'Toàn thân B':        ['Vai', 'Lưng', 'Chân', 'Tay'],
  'Toàn thân C':        ['Ngực', 'Lưng', 'Mông', 'Bụng'],
  'Upper A (Sức mạnh)': ['Ngực', 'Lưng trên', 'Vai', 'Tay'],
  'Lower A (Sức mạnh)': ['Đùi trước', 'Đùi sau', 'Mông'],
  'Upper B (Hypertrophy)':['Ngực trên', 'Lưng giữa', 'Vai sau', 'Tay'],
  'Lower B (Hypertrophy)':['Mông', 'Đùi', 'Bắp chân', 'Core'],
  'Push (Đẩy)':         ['Ngực', 'Vai trước', 'Tay sau'],
  'Pull (Kéo)':         ['Lưng rộng', 'Lưng giữa', 'Tay trước', 'Vai sau'],
  'Legs (Chân)':        ['Đùi trước', 'Đùi sau', 'Mông', 'Bắp chân'],
  'Ngực':               ['Ngực toàn diện', 'Vai trước', 'Tay sau'],
  'Lưng':               ['Lưng rộng', 'Lưng giữa', 'Lưng dưới'],
  'Chân':               ['Đùi trước', 'Đùi sau', 'Mông', 'Bắp chân'],
  'Vai':                ['Vai giữa', 'Vai sau', 'Tay sau'],
  'Tay':                ['Tay trước', 'Tay sau'],
}

const DAYS = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','CN']
const SHORTS = ['T2','T3','T4','T5','T6','T7','CN']

/* ══════════════════════════════════════════════════
   GENERATE WEEKLY SCHEDULE  (PT-optimized)
══════════════════════════════════════════════════ */
export function generateWeeklySchedule(profile: Profile): TrainingDay[] {
  const split  = chooseSplit(profile)
  const config = SPLITS[split]
  const freq   = maxFreq(profile.frequency)
  const dur    = profile.session_duration ?? 60
  const goal   = profile.goal
  const exp    = profile.experience ?? 'beginner'

  const restRange = goal === 'lose_fat' ? '45-75 giây'
                  : exp === 'beginner'  ? '90 giây'
                  : exp === 'advanced'  ? '2-3 phút'
                  : '90-120 giây'

  const repRange  = goal === 'lose_fat' ? '12-20' : exp === 'advanced' ? '4-10' : '8-12'

  // Build the week pattern
  const workoutNames = Object.keys(config.workouts)
  const weekPattern: { type: TrainingDay['type']; name: string }[] = []

  if (split === 'fullbody') {
    // Mon/Wed/Fri workout, Tue/Thu/Sat active rest, Sun rest
    const pattern = ['workout','active_rest','workout','active_rest','workout','active_rest','rest']
    let wIdx = 0
    pattern.forEach(t => {
      weekPattern.push({ type: t as TrainingDay['type'], name: t === 'workout' ? workoutNames[wIdx++ % workoutNames.length] : t === 'active_rest' ? 'Cardio nhẹ / Giãn cơ' : 'Nghỉ ngơi hoàn toàn' })
    })
  } else if (split === 'upperlower') {
    // Mon Upper, Tue Lower, Wed rest, Thu Upper, Fri Lower, Sat active, Sun rest
    weekPattern.push(
      { type: 'workout',     name: workoutNames[0] },
      { type: 'workout',     name: workoutNames[1] },
      { type: 'rest',        name: 'Nghỉ ngơi' },
      { type: 'workout',     name: workoutNames[2] },
      { type: 'workout',     name: workoutNames[3] },
      { type: 'active_rest', name: 'Cardio / Giãn cơ' },
      { type: 'rest',        name: 'Nghỉ ngơi hoàn toàn' },
    )
  } else if (split === 'ppl') {
    // Push Pull Legs Rest Push Pull Legs (or active rest on day 4)
    const pplOrder = freq >= 6
      ? ['workout','workout','workout','workout','workout','workout','rest']
      : ['workout','workout','workout','active_rest','workout','workout','workout']
    let wIdx = 0
    pplOrder.forEach(t => {
      weekPattern.push({ type: t as TrainingDay['type'], name: t === 'workout' ? workoutNames[wIdx++ % 3] : t === 'active_rest' ? 'Active Rest' : 'Nghỉ ngơi' })
    })
  } else { // bro
    weekPattern.push(
      { type: 'workout',     name: workoutNames[0] }, // chest
      { type: 'workout',     name: workoutNames[1] }, // back
      { type: 'workout',     name: workoutNames[2] }, // legs
      { type: 'workout',     name: workoutNames[3] }, // shoulders
      { type: 'workout',     name: workoutNames[4] }, // arms
      { type: 'active_rest', name: 'Cardio nhẹ / Bơi' },
      { type: 'rest',        name: 'Nghỉ ngơi hoàn toàn' },
    )
  }

  return DAYS.map((day, i) => {
    const slot = weekPattern[i]
    const isWorkout = slot.type === 'workout'
    const workoutData = isWorkout ? config.workouts[slot.name] ?? [] : []
    const rawExercises = ex(...workoutData)
    const exercises = adjustVolume(rawExercises, profile)
    const totalSets = exercises.reduce((s, e) => s + e.sets, 0)

    return {
      day, short: SHORTS[i],
      type: slot.type,
      focus: slot.name,
      emoji: slot.type === 'workout' ? '🏋️' : slot.type === 'active_rest' ? '🚶' : '😴',
      muscles: MUSCLE_MAP[slot.name] ?? [],
      keyExercises: exercises,
      totalSets,
      duration: isWorkout ? dur : slot.type === 'active_rest' ? 30 : 0,
      repRange,
      restBetweenSets: restRange,
    }
  })
}

/* ══════════════════════════════════════════════════
   12-WEEK PROGRESSION  (unchanged logic)
══════════════════════════════════════════════════ */
export function generateProgressionPlan(profile: Profile): ProgressionPhase[] {
  const goal = profile.goal
  const exp  = profile.experience ?? 'beginner'

  if (goal === 'lose_fat') return [
    { phase: 1, weeks: 'Tuần 1–4', color: '#38bdf8',
      title: 'Thích nghi & Hình thành thói quen',
      goal: 'Làm quen với lịch tập, thiết lập chế độ ăn thâm hụt calo',
      volume: 'Thấp–Vừa (12–15 sets/buổi)', intensity: '60–65% 1RM',
      tips: ['Tập trung vào kỹ thuật', 'Thâm hụt 300–500 kcal/ngày', 'Cardio 2–3 lần/tuần 20–30 phút', 'Cân hàng tuần vào sáng sớm'] },
    { phase: 2, weeks: 'Tuần 5–8', color: '#fb923c',
      title: 'Tăng cường & Đốt mỡ tích cực',
      goal: 'Tăng khối lượng tập, duy trì cơ trong khi giảm mỡ',
      volume: 'Vừa–Cao (15–20 sets/buổi)', intensity: '65–75% 1RM',
      tips: ['Tăng cardio lên 3–4 lần/tuần', 'Giữ protein cao (1.8–2.2g/kg)', 'Theo dõi body fat %', 'Điều chỉnh calo nếu cân không đổi sau 2 tuần'] },
    { phase: 3, weeks: 'Tuần 9–12', color: '#f87171',
      title: 'Định hình & Bứt phá cuối cùng',
      goal: 'Giảm mỡ sâu, định hình cơ thể, chuẩn bị duy trì',
      volume: 'Cao (18–22 sets/buổi)', intensity: '70–80% 1RM',
      tips: ['Superset để tăng mật độ tập', 'Refeed day 1 lần/tuần', 'HIIT cardio 2 lần/tuần', 'Chuẩn bị kế hoạch maintenance'] },
  ]

  if (goal === 'gain_muscle') return [
    { phase: 1, weeks: 'Tuần 1–4', color: '#34d399',
      title: exp === 'beginner' ? 'Thích nghi thần kinh cơ' : 'Accumulation Phase',
      goal: 'Xây nền tảng kỹ thuật và thích nghi mô',
      volume: exp === 'beginner' ? 'Thấp (9–12 sets/cơ/tuần)' : 'Vừa (12–16 sets/cơ/tuần)',
      intensity: exp === 'beginner' ? '60–70% 1RM' : '65–75% 1RM',
      tips: ['Tăng calo thặng dư 200–300 kcal', 'Protein 1.8–2.2g/kg mỗi ngày', 'Ngủ 7–9 tiếng để GH release', 'Ghi chép tạ mỗi buổi tập'] },
    { phase: 2, weeks: 'Tuần 5–8', color: '#a89af8',
      title: 'Intensification Phase',
      goal: 'Tăng cường độ, kích thích hypertrophy',
      volume: 'Cao (16–20 sets/cơ/tuần)', intensity: '70–80% 1RM',
      tips: ['Progressive overload mỗi 1–2 tuần', 'Ăn nhiều hơn vào ngày tập nặng', 'Thêm kỹ thuật drop set / superset', 'Chụp ảnh so sánh mỗi 2 tuần'] },
    { phase: 3, weeks: 'Tuần 9–12', color: '#fbbf24',
      title: 'Peak & Deload',
      goal: 'Bứt phá đỉnh cao, sau đó deload để phục hồi',
      volume: 'Rất cao → Deload (tuần 12: 50% volume)', intensity: '80–90% 1RM → Deload 60%',
      tips: ['Đặt PR ở tuần 10–11', 'Tuần 12: Deload bắt buộc', 'Tăng calo thêm 100–200 kcal', 'Bắt đầu chu kỳ mới sau deload'] },
  ]

  return [
    { phase: 1, weeks: 'Tuần 1–4', color: '#38bdf8', title: 'Thiết lập nền tảng', goal: 'Ổn định lịch tập và chế độ ăn cân bằng', volume: 'Vừa', intensity: '65–70% 1RM', tips: ['Tập đủ tần suất, không quá sức', 'Ăn đủ TDEE', 'Ưu tiên ngủ đủ giấc', 'Theo dõi sức khỏe tổng thể'] },
    { phase: 2, weeks: 'Tuần 5–8', color: '#34d399', title: 'Nâng cao thể lực', goal: 'Tăng sức mạnh và sức bền toàn diện', volume: 'Vừa–Cao', intensity: '70–75% 1RM', tips: ['Tăng tạ khi reps dễ dàng', 'Thử bài tập mới', 'Cardio 2 lần/tuần', 'Đánh giá lại mục tiêu'] },
    { phase: 3, weeks: 'Tuần 9–12', color: '#a89af8', title: 'Duy trì & Phát triển bền vững', goal: 'Xây dựng thói quen lâu dài', volume: 'Vừa (bền vững)', intensity: '70–80% 1RM', tips: ['Tập vì cảm giác tốt', 'Tích hợp ngoài gym', 'Lập kế hoạch 3 tháng tiếp', 'Nghỉ không có lỗi'] },
  ]
}

/* ══════════════════════════════════════════════════
   NUTRITION + RECOVERY  (same as before)
══════════════════════════════════════════════════ */
export function generateMealTimeline(profile: Profile): MealSlot[] {
  const tdee   = calculateTDEE(profile)
  const { calories: target, macro } = calculateMacros(tdee, profile.goal)
  const dur    = profile.session_duration ?? 60
  const freq   = maxFreq(profile.frequency)
  const isGain = profile.goal === 'gain_muscle'
  const isLose = profile.goal === 'lose_fat'
  void macro

  const slots: MealSlot[] = [
    { time: '6:30 – 7:30', name: 'Bữa sáng', calories: Math.round(target * (isLose ? 0.22 : 0.25)), color: '#fbbf24', description: 'Bữa quan trọng nhất — nạp năng lượng cho ngày dài', examples: isGain ? ['Yến mạch + chuối + whey protein', 'Trứng 4 quả + bánh mì nguyên cám', 'Cơm gạo lứt + ức gà + rau'] : isLose ? ['Trứng luộc 2-3 quả + rau xào', 'Sữa chua Hy Lạp + quả mọng', 'Omelette rau + bánh mì đen'] : ['Yến mạch + trứng 2 quả', 'Bánh mì nguyên cám + bơ đậu phộng', 'Cơm + thịt nạc + rau'] },
    { time: '10:00 – 10:30', name: 'Bữa phụ sáng', calories: Math.round(target * (isLose ? 0.10 : 0.12)), color: '#34d399', description: 'Snack duy trì năng lượng, tránh đói trước trưa', examples: isGain ? ['Chuối + 30g hạt hỗn hợp', 'Protein bar', 'Sữa chua + granola'] : ['Táo + 10 hạnh nhân', 'Protein shake nhỏ', '1 quả trứng luộc + cà rốt'] },
    { time: '12:00 – 13:00', name: 'Bữa trưa', calories: Math.round(target * (isLose ? 0.28 : 0.25)), color: '#38bdf8', description: 'Bữa chính với đầy đủ protein + carb + rau xanh', examples: isGain ? ['Cơm 150–200g + ức gà 200g + rau + trứng', 'Mì ý + thịt bò + salad', 'Cơm lứt + cá hồi + bông cải'] : isLose ? ['Salad ức gà + quinoa', 'Cơm lứt 100g + cá hấp + rau', 'Bún bò ít mỡ + rau thơm'] : ['Cơm gạo lứt + thịt nạc + rau', 'Sandwich + thịt nguội + salad', 'Phở bò ít bánh + nhiều rau'] },
    ...(dur >= 45 && freq >= 3 ? [{ time: '15:30 – 16:30', name: 'Pre-workout', calories: Math.round(target * (isLose ? 0.08 : 0.10)), color: '#a89af8', description: 'Nạp năng lượng 60–90 phút trước tập', examples: isGain ? ['Chuối + 30g yến mạch', 'Bánh gạo + mật ong', 'Trái cây + protein shake'] : ['Chuối nhỏ + 1 thìa bơ đậu phộng', 'Táo + whey nhỏ', 'Bánh gạo + mật ong'] }] : []),
    ...(dur >= 45 && freq >= 3 ? [{ time: '18:30 – 19:30', name: 'Post-workout', calories: Math.round(target * (isGain ? 0.18 : 0.13)), color: '#fb923c', description: 'Cửa sổ vàng — protein + carb trong 30–60 phút sau tập', examples: isGain ? ['Whey protein 30–40g + chuối', 'Cơm 150g + ức gà 200g', 'Sữa tươi 500ml + cơm'] : ['Whey protein 25g + nước', 'Ức gà luộc + khoai lang nhỏ', 'Sữa chua Hy Lạp + granola nhỏ'] }] : []),
    { time: '19:30 – 20:30', name: 'Bữa tối', calories: Math.round(target * (isLose ? 0.20 : 0.18)), color: '#f472b6', description: 'Nhẹ hơn bữa trưa, ưu tiên protein và rau xanh', examples: isGain ? ['Cơm 100–150g + cá hồi áp chảo + rau', 'Mì gạo + tôm + rau cải', 'Trứng chiên + cơm + salad'] : isLose ? ['Ức gà nướng + rau củ hấp', 'Canh cá + rau luộc ít cơm', 'Salad tôm + dầu ô liu + chanh'] : ['Cá hấp + cơm lứt 80g + rau xào', 'Soup gà + bánh mì ít', 'Thịt nạc + khoai lang + salad'] },
    { time: '21:30 – 22:00', name: 'Bữa đêm (tùy chọn)', calories: Math.round(target * (isLose ? 0.05 : isGain ? 0.08 : 0.05)), color: '#6366f1', description: isGain ? 'Casein protein chậm tiêu — nuôi cơ trong khi ngủ' : 'Nhẹ nếu đói, ưu tiên protein', examples: isGain ? ['Casein protein shake 30g', 'Phô mai cottage 200g', '100g sữa chua Hy Lạp nguyên kem'] : ['100g sữa chua ít đường', '1 quả trứng luộc', 'Kefir 200ml'] },
  ]
  return slots
}

export function generateFoodGuide(profile: Profile): FoodCategory[] {
  const isGain = profile.goal === 'gain_muscle'
  const isLose = profile.goal === 'lose_fat'
  return [
    { category: 'Nguồn Protein 💪', emoji: '🥩', color: '#f87171', items: [
      { name: 'Ức gà', amount: '150–250g/bữa', note: isGain ? 'Ưu tiên' : 'Chính' },
      { name: 'Cá hồi', amount: '150–200g/bữa', note: 'Omega-3 tốt cho phục hồi' },
      { name: 'Trứng gà', amount: '3–5 quả/ngày', note: isGain ? 'Cả lòng đỏ' : '1-2 lòng đỏ' },
      { name: 'Whey Protein', amount: '25–40g/lần', note: 'Sau tập hoặc bữa phụ' },
      { name: 'Thịt bò nạc', amount: '150–200g/bữa', note: 'Creatine tự nhiên' },
      { name: 'Tôm, mực', amount: '150–200g/bữa', note: 'Protein cao, calo thấp' },
    ]},
    { category: 'Carbohydrate ⚡', emoji: '🌾', color: '#fbbf24', items: isLose
      ? [
        { name: 'Gạo lứt', amount: '80–120g khô/ngày', note: 'Chỉ số GI thấp' },
        { name: 'Khoai lang', amount: '150–200g/ngày', note: 'Fiber cao, no lâu' },
        { name: 'Yến mạch', amount: '50–80g/sáng', note: 'Ổn định đường huyết' },
        { name: 'Rau xanh', amount: 'Không giới hạn', note: 'Tăng no, ít calo' },
        { name: 'Trái cây ít đường', amount: '1–2 quả/ngày', note: 'Táo, bưởi, dâu' },
      ] : [
        { name: 'Cơm trắng/gạo lứt', amount: '150–250g/bữa', note: isGain ? 'Chính trong ngày tập' : 'Cân bằng' },
        { name: 'Bánh mì nguyên cám', amount: '2–4 lát/ngày', note: 'Fiber + carb' },
        { name: 'Khoai lang', amount: '150–300g/ngày', note: 'Carb phức hợp' },
        { name: 'Yến mạch', amount: '80–100g/sáng', note: 'Pre-workout tốt' },
        { name: 'Chuối', amount: '1–2 quả/ngày', note: 'Tốt nhất trước tập' },
      ]
    },
    { category: 'Chất Béo Lành Mạnh', emoji: '🫒', color: '#34d399', items: [
      { name: 'Dầu ô liu', amount: '1–2 muỗng/ngày', note: 'Nấu ăn hoặc salad' },
      { name: 'Bơ (avocado)', amount: '1/2–1 quả/ngày', note: 'Chất béo đơn không bão hòa' },
      { name: 'Hạnh nhân/Óc chó', amount: '20–30g/ngày', note: 'Omega-3, vitamin E' },
      { name: 'Cá hồi/cá thu', amount: '2–3 lần/tuần', note: 'Omega-3 tốt nhất' },
      { name: 'Bơ đậu phộng', amount: '1–2 muỗng/ngày', note: 'Pre-workout + snack' },
    ]},
    { category: 'Rau & Vi Chất', emoji: '🥗', color: '#38bdf8', items: [
      { name: 'Bông cải xanh', amount: '100–200g/ngày', note: 'Vitamin K, C, chống viêm' },
      { name: 'Rau bina/cải bó xôi', amount: '100–150g/ngày', note: 'Sắt, folate' },
      { name: 'Cà rốt', amount: '1–2 củ/ngày', note: 'Beta-carotene, snack tốt' },
      { name: 'Ớt chuông', amount: 'Thoải mái', note: 'Vitamin C gấp 3 cam' },
      { name: 'Tỏi + Gừng', amount: 'Mỗi ngày', note: 'Kháng viêm, tăng miễn dịch' },
    ]},
  ]
}

export function generateRecoveryPlan(profile: Profile): RecoveryBlock[] {
  const freq   = maxFreq(profile.frequency)
  const isGain = profile.goal === 'gain_muscle'
  const exp    = profile.experience ?? 'beginner'
  return [
    { title: 'Lịch ngủ tối ưu', emoji: '😴', color: '#6366f1', items: [
      `Ngủ ${isGain ? '8–9' : '7–8'} tiếng mỗi đêm${isGain ? ' (GH tiết ra nhiều nhất lúc ngủ sâu)' : ''}`,
      'Ngủ trước 23:00 — đặc biệt ngày tập nặng',
      'Phòng tối, mát 18–22°C, không điện thoại 30 phút trước ngủ',
      'Ngủ và thức đúng giờ mỗi ngày (kể cả cuối tuần)',
      isGain ? 'Casein protein trước ngủ để cung cấp amino acid liên tục' : 'Tránh ăn nặng trong 2 giờ trước ngủ',
    ]},
    { title: 'Ngày nghỉ tích cực', emoji: '🚶', color: '#34d399', items: [
      'Đi bộ 20–40 phút nhẹ nhàng — tăng lưu thông máu, giảm DOMS',
      'Yoga / giãn cơ 15–20 phút — focus cơ đã tập ngày hôm trước',
      'Bơi lội nhẹ hoặc đạp xe chậm 20–30 phút',
      'Foam rolling toàn thân 10–15 phút',
      'Tắm nước lạnh hoặc xen kẽ nóng–lạnh để giảm viêm',
    ]},
    { title: 'Dinh dưỡng phục hồi', emoji: '🥗', color: '#fb923c', items: [
      `Uống ${Math.round(profile.weight * 0.035 * 10) / 10}–${Math.round(profile.weight * 0.04 * 10) / 10} lít nước/ngày`,
      `Protein ${isGain ? '2.0–2.4' : '1.6–2.0'}g/kg = ${Math.round(profile.weight * (isGain ? 2.2 : 1.8))}g/ngày`,
      'Ăn đủ carb ngày tập — không cắt carb khi tập nặng',
      'Creatine Monohydrate 3–5g/ngày (đặc biệt gain muscle)',
      'Omega-3 1–2g/ngày — giảm viêm cơ',
    ]},
    { title: `Deload — mỗi ${exp === 'beginner' ? '6–8' : '4–6'} tuần`, emoji: '📉', color: '#a89af8', items: [
      `Giảm 40–50% volume: ${exp === 'beginner' ? '2 sets/bài' : '2–3 sets/bài'} thay vì bình thường`,
      'Giữ cường độ (tạ) nhưng giảm sets và reps',
      'KHÔNG bỏ buổi tập — deload khác nghỉ hoàn toàn',
      'Tập trung vào kỹ thuật và mind-muscle connection',
      'Sau deload: hiệu suất thường tăng đáng kể',
    ]},
    { title: 'Stress & Tinh thần', emoji: '🧠', color: '#38bdf8', items: [
      'Cortisol cao do stress phá hủy cơ — quản lý stress quan trọng như tập luyện',
      'Thiền 5–10 phút/ngày hoặc hít thở sâu trước ngủ',
      freq >= 5 ? 'Cảnh báo: tập 5+ ngày/tuần đòi hỏi recovery cực kỳ nghiêm túc' : 'Tần suất tập của bạn tốt cho cân bằng cuộc sống',
    ]},
  ]
}

/* ── Utils ── */
export function getSplitName(profile: Profile): string {
  return SPLITS[chooseSplit(profile)].label
}

export function getWeeklyStats(profile: Profile) {
  const schedule    = generateWeeklySchedule(profile)
  const workoutDays = schedule.filter(d => d.type === 'workout').length
  const totalVolume = schedule.reduce((s, d) => s + d.duration, 0)
  const tdee        = calculateTDEE(profile)
  const { calories } = calculateMacros(tdee, profile.goal)
  return { workoutDays, totalVolume, calories, tdee }
}
