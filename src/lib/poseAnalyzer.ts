import type { ExerciseType, PoseFeedback, RepState } from '../types'

interface Landmark {
  x: number
  y: number
  z?: number
  visibility?: number
}

export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)
  if (angle > 180) angle = 360 - angle
  return angle
}

function isVisible(landmark: Landmark, threshold = 0.5): boolean {
  return (landmark.visibility ?? 1) > threshold
}

// MediaPipe Pose landmark indices
const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
}

export function analyzeSquat(
  landmarks: Landmark[],
  state: RepState
): RepState {
  const lHip = landmarks[LM.LEFT_HIP]
  const lKnee = landmarks[LM.LEFT_KNEE]
  const lAnkle = landmarks[LM.LEFT_ANKLE]
  const lShoulder = landmarks[LM.LEFT_SHOULDER]

  if (!isVisible(lKnee) || !isVisible(lHip)) return state

  const kneeAngle = calculateAngle(lHip, lKnee, lAnkle)
  const backAngle = calculateAngle(lShoulder, lHip, lKnee)

  const feedback: PoseFeedback[] = []
  let score = 100
  let { phase, count } = state
  let repCounted = false

  if (kneeAngle < 90) {
    if (phase === 'idle' || phase === 'up') phase = 'down'
  } else if (kneeAngle > 160) {
    if (phase === 'down') {
      phase = 'up'
      repCounted = true
    }
  }

  if (backAngle < 150) {
    feedback.push({ message: 'Giữ lưng thẳng hơn!', type: 'warning', timestamp: Date.now() })
    score -= 20
  }
  if (kneeAngle > 90 && kneeAngle < 160 && phase !== 'idle') {
    feedback.push({ message: 'Xuống sâu hơn (< 90°)', type: 'warning', timestamp: Date.now() })
    score -= 10
  }
  if (repCounted) {
    feedback.push({ message: 'Đúng tư thế! ✓', type: 'success', timestamp: Date.now() })
  }

  return {
    count: repCounted ? count + 1 : count,
    phase,
    score: Math.max(0, score),
    feedback: [...feedback, ...state.feedback].slice(0, 3),
  }
}

export function analyzePushup(
  landmarks: Landmark[],
  state: RepState
): RepState {
  const lShoulder = landmarks[LM.LEFT_SHOULDER]
  const lElbow = landmarks[LM.LEFT_ELBOW]
  const lWrist = landmarks[LM.LEFT_WRIST]
  const lHip = landmarks[LM.LEFT_HIP]
  const lAnkle = landmarks[LM.LEFT_ANKLE]

  if (!isVisible(lElbow) || !isVisible(lShoulder)) return state

  const elbowAngle = calculateAngle(lShoulder, lElbow, lWrist)
  const bodyAngle = calculateAngle(lShoulder, lHip, lAnkle)

  const feedback: PoseFeedback[] = []
  let score = 100
  let { phase, count } = state
  let repCounted = false

  if (elbowAngle < 90) {
    if (phase === 'idle' || phase === 'up') phase = 'down'
  } else if (elbowAngle > 160) {
    if (phase === 'down') {
      phase = 'up'
      repCounted = true
    }
  }

  if (bodyAngle < 160) {
    feedback.push({ message: 'Giữ thân người thẳng hàng!', type: 'warning', timestamp: Date.now() })
    score -= 25
  }
  if (repCounted) {
    feedback.push({ message: 'Hít đất hoàn hảo! ✓', type: 'success', timestamp: Date.now() })
  }

  return {
    count: repCounted ? count + 1 : count,
    phase,
    score: Math.max(0, score),
    feedback: [...feedback, ...state.feedback].slice(0, 3),
  }
}

export function analyzePlank(
  landmarks: Landmark[],
  state: RepState
): RepState {
  const lShoulder = landmarks[LM.LEFT_SHOULDER]
  const lHip = landmarks[LM.LEFT_HIP]
  const lAnkle = landmarks[LM.LEFT_ANKLE]

  if (!isVisible(lHip) || !isVisible(lShoulder)) return state

  const bodyAngle = calculateAngle(lShoulder, lHip, lAnkle)

  const feedback: PoseFeedback[] = []
  let score = 100

  if (bodyAngle < 150) {
    if (lHip.y < lShoulder.y) {
      feedback.push({ message: 'Hạ mông xuống!', type: 'error', timestamp: Date.now() })
    } else {
      feedback.push({ message: 'Đừng nhướng mông!', type: 'error', timestamp: Date.now() })
    }
    score -= 30
  } else {
    feedback.push({ message: 'Tư thế plank tốt! ✓', type: 'success', timestamp: Date.now() })
  }

  return {
    count: state.count,
    phase: 'idle',
    score: Math.max(0, score),
    feedback: [...feedback, ...state.feedback].slice(0, 3),
  }
}

export function analyzeBicepCurl(
  landmarks: Landmark[],
  state: RepState
): RepState {
  const lShoulder = landmarks[LM.LEFT_SHOULDER]
  const lElbow = landmarks[LM.LEFT_ELBOW]
  const lWrist = landmarks[LM.LEFT_WRIST]

  if (!isVisible(lElbow) || !isVisible(lShoulder)) return state

  const elbowAngle = calculateAngle(lShoulder, lElbow, lWrist)

  const feedback: PoseFeedback[] = []
  let score = 100
  let { phase, count } = state
  let repCounted = false

  if (elbowAngle < 50) {
    if (phase === 'idle' || phase === 'down') phase = 'up'
  } else if (elbowAngle > 150) {
    if (phase === 'up') {
      phase = 'down'
      repCounted = true
    }
  }

  if (repCounted) {
    feedback.push({ message: 'Cuộn hoàn chỉnh! ✓', type: 'success', timestamp: Date.now() })
  }

  return {
    count: repCounted ? count + 1 : count,
    phase,
    score: Math.max(0, score),
    feedback: [...feedback, ...state.feedback].slice(0, 3),
  }
}

export function analyzeLunge(
  landmarks: Landmark[],
  state: RepState
): RepState {
  const lHip = landmarks[LM.LEFT_HIP]
  const lKnee = landmarks[LM.LEFT_KNEE]
  const lAnkle = landmarks[LM.LEFT_ANKLE]

  if (!isVisible(lKnee) || !isVisible(lHip)) return state

  const kneeAngle = calculateAngle(lHip, lKnee, lAnkle)

  const feedback: PoseFeedback[] = []
  let score = 100
  let { phase, count } = state
  let repCounted = false

  if (kneeAngle < 90) {
    if (phase === 'idle' || phase === 'up') phase = 'down'
  } else if (kneeAngle > 160) {
    if (phase === 'down') {
      phase = 'up'
      repCounted = true
    }
  }

  if (repCounted) {
    feedback.push({ message: 'Bước dài hoàn hảo! ✓', type: 'success', timestamp: Date.now() })
  }

  return {
    count: repCounted ? count + 1 : count,
    phase,
    score: Math.max(0, score),
    feedback: [...feedback, ...state.feedback].slice(0, 3),
  }
}

export function analyzeShoulderPress(
  landmarks: Landmark[],
  state: RepState
): RepState {
  const lShoulder = landmarks[LM.LEFT_SHOULDER]
  const lElbow = landmarks[LM.LEFT_ELBOW]
  const lWrist = landmarks[LM.LEFT_WRIST]

  if (!isVisible(lElbow) || !isVisible(lShoulder)) return state

  const elbowAngle = calculateAngle(lShoulder, lElbow, lWrist)

  const feedback: PoseFeedback[] = []
  let score = 100
  let { phase, count } = state
  let repCounted = false

  if (elbowAngle < 90) {
    if (phase === 'idle' || phase === 'up') phase = 'down'
  } else if (elbowAngle > 160) {
    if (phase === 'down') {
      phase = 'up'
      repCounted = true
    }
  }

  if (repCounted) {
    feedback.push({ message: 'Đẩy vai hoàn chỉnh! ✓', type: 'success', timestamp: Date.now() })
  }

  return {
    count: repCounted ? count + 1 : count,
    phase,
    score: Math.max(0, score),
    feedback: [...feedback, ...state.feedback].slice(0, 3),
  }
}

export function analyzeExercise(
  type: ExerciseType,
  landmarks: Landmark[],
  state: RepState
): RepState {
  switch (type) {
    case 'squat': return analyzeSquat(landmarks, state)
    case 'pushup': return analyzePushup(landmarks, state)
    case 'plank': return analyzePlank(landmarks, state)
    case 'bicep_curl': return analyzeBicepCurl(landmarks, state)
    case 'lunge': return analyzeLunge(landmarks, state)
    case 'shoulder_press': return analyzeShoulderPress(landmarks, state)
    default: return state
  }
}
