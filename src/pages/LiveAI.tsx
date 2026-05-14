import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { EXERCISES } from '../data/exercises'
import { analyzeExercise } from '../lib/poseAnalyzer'
import type { Exercise, ExerciseType, RepState, PoseFeedback } from '../types'
import { useWorkoutStore } from '../store/useWorkoutStore'

declare global {
  interface Window { Pose: any; Camera: any; drawConnectors: any; drawLandmarks: any; POSE_CONNECTIONS: any }
}

const initialRepState: RepState = { count: 0, phase: 'idle', score: 100, feedback: [] }

/* ─── Inline button ─── */
const Btn = ({
  children, onClick, disabled = false, danger = false, full = false
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; danger?: boolean; full?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: full ? '100%' : undefined,
      padding: '11px 20px', borderRadius: 12, border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      background: danger
        ? 'linear-gradient(135deg, #7f1d1d, #ef4444)'
        : 'linear-gradient(135deg, #7c6df0, #a89af8)',
      boxShadow: danger
        ? '0 4px 18px rgba(239,68,68,0.35)'
        : '0 4px 18px rgba(124,109,240,0.4)',
      color: 'white', fontSize: 13, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'opacity 0.15s',
    }}
  >
    {children}
  </button>
)

/* ─── Feedback item ─── */
function FeedbackItem({ item }: { item: PoseFeedback }) {
  const styles = {
    success: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)', color: '#34d399' },
    warning: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24' },
    error:   { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', color: '#f87171' },
  }
  const s = styles[item.type]
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 500,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>
      {item.message}
    </div>
  )
}

/* ─── Score bar ─── */
function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2e2e58' }}>Điểm tư thế</span>
        <span style={{ fontSize: 13, fontWeight: 900, color }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 99, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  )
}

/* ─── Card ─── */
const C = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20, padding: 20, ...style,
  }}>
    {children}
  </div>
)

export default function LiveAI() {
  const [searchParams] = useSearchParams()
  const initialExercise = EXERCISES.find((e) => e.id === searchParams.get('exercise')) || EXERCISES[0]

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const poseRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const repStateRef = useRef<RepState>(initialRepState)
  const startTimeRef = useRef<number>(0)

  const [selectedExercise, setSelectedExercise] = useState<Exercise>(initialExercise)
  const [repState, setRepState] = useState<RepState>(initialRepState)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [plankSeconds, setPlankSeconds] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false)
  const { addSession } = useWorkoutStore()

  useEffect(() => {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
    ]
    let loaded = 0
    const trySetLoaded = () => { loaded++; if (loaded === scripts.length) setMediapipeLoaded(true) }
    scripts.forEach((src) => {
      if (document.querySelector(`script[src="${src}"]`)) { trySetLoaded(); return }
      const s = document.createElement('script')
      s.src = src; s.crossOrigin = 'anonymous'; s.onload = trySetLoaded; s.onerror = trySetLoaded
      document.head.appendChild(s)
    })
  }, [])

  useEffect(() => {
    if (!isActive || selectedExercise.type !== 'plank') return
    const interval = setInterval(() => setPlankSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isActive, selectedExercise.type])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [isActive])

  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current; const video = videoRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480
    ctx.save(); ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (results.poseLandmarks) {
      if (window.drawConnectors && window.POSE_CONNECTIONS)
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#7c6df0', lineWidth: 2 })
      if (window.drawLandmarks)
        window.drawLandmarks(ctx, results.poseLandmarks, { color: '#a89af8', fillColor: '#7c6df0', lineWidth: 1, radius: 4 })
      const newState = analyzeExercise(selectedExercise.type as ExerciseType, results.poseLandmarks, repStateRef.current)
      repStateRef.current = newState; setRepState({ ...newState })
    }
    ctx.restore()
  }, [selectedExercise.type])

  const startCamera = async () => {
    if (!mediapipeLoaded) { alert('MediaPipe đang tải, vui lòng thử lại sau vài giây.'); return }
    setIsLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      const pose = new window.Pose({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` })
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 })
      pose.onResults(onResults); poseRef.current = pose
      if (window.Camera && videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => { if (videoRef.current) await pose.send({ image: videoRef.current }) },
          width: 640, height: 480,
        })
        camera.start(); cameraRef.current = camera
      }
      repStateRef.current = initialRepState; setRepState(initialRepState)
      setPlankSeconds(0); startTimeRef.current = Date.now(); setElapsedSeconds(0); setIsActive(true)
    } catch (err) {
      console.error('Camera error:', err); alert('Không thể truy cập camera. Vui lòng cho phép quyền camera.')
    } finally { setIsLoading(false) }
  }

  const stopCamera = () => {
    cameraRef.current?.stop()
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop()); videoRef.current.srcObject = null
    }
    poseRef.current = null
    if (repStateRef.current.count > 0 || plankSeconds > 0) {
      const duration = Math.max(1, Math.floor(elapsedSeconds / 60))
      addSession({ date: new Date().toISOString().split('T')[0], duration, exercises: [{ exercise: selectedExercise, sets: 1, reps: repStateRef.current.count }], calories: Math.round(duration * 6), totalReps: repStateRef.current.count })
    }
    setIsActive(false)
  }

  const switchExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise); repStateRef.current = initialRepState; setRepState(initialRepState); setPlankSeconds(0)
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const phaseColor = repState.phase === 'up' ? '#34d399' : repState.phase === 'down' ? '#fbbf24' : '#5858a0'
  const phaseLabel = repState.phase === 'idle' ? 'Sẵn sàng' : repState.phase === 'down' ? '⬇ Xuống' : '⬆ Lên'

  return (
    <div>
      <Header title="Live AI" subtitle="Phân tích tư thế tập luyện real-time" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* ── Left: Camera + exercise selector ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Camera */}
          <C style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', background: '#050510', aspectRatio: '4/3' }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }} muted playsInline />
              <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }} />

              {!isActive && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,16,0.95)',
                }}>
                  {/* Camera icon */}
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', marginBottom: 20,
                    background: 'rgba(124,109,240,0.12)', border: '1px solid rgba(124,109,240,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#a89af8" strokeWidth={1.5} strokeLinecap="round" style={{ width: 32, height: 32 }}>
                      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <p style={{ color: '#d0d0f0', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Camera chưa bật</p>
                  <p style={{ color: '#3a3a6a', fontSize: 13, marginBottom: 24 }}>Bật camera để bắt đầu phân tích tư thế AI</p>
                  <Btn onClick={startCamera} disabled={isLoading}>
                    {isLoading ? '⏳ Đang tải...' : '▶ Bật Camera'}
                  </Btn>
                  {!mediapipeLoaded && (
                    <p style={{ color: '#2e2e58', fontSize: 11, marginTop: 10 }}>⏳ Đang tải MediaPipe...</p>
                  )}
                </div>
              )}

              {isActive && (
                <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                    background: 'rgba(124,109,240,0.85)', backdropFilter: 'blur(12px)', color: 'white',
                  }}>
                    {selectedExercise.emoji} {selectedExercise.nameVi}
                  </div>
                  <div style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                    background: 'rgba(10,10,22,0.85)', backdropFilter: 'blur(12px)', color: '#d0d0f0',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    ⏱ {formatTime(elapsedSeconds)}
                  </div>
                </div>
              )}
            </div>
          </C>

          {/* Exercise selector */}
          <C>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2e2e58', marginBottom: 12 }}>
              Chọn bài tập
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {EXERCISES.map((ex) => {
                const active = selectedExercise.id === ex.id
                return (
                  <button
                    key={ex.id}
                    onClick={() => switchExercise(ex)}
                    style={{
                      padding: '12px 8px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', border: 'none',
                      background: active ? 'rgba(124,109,240,0.16)' : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${active ? 'rgba(124,109,240,0.45)' : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 0.15s',
                    } as React.CSSProperties}
                  >
                    <div style={{ fontSize: 22, marginBottom: 5 }}>{ex.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? '#a89af8' : '#d0d0f0' }}>{ex.nameVi}</div>
                    <div style={{ fontSize: 10, color: '#2e2e58', marginTop: 2 }}>{ex.muscleGroups[0]}</div>
                  </button>
                )
              })}
            </div>
          </C>
        </div>

        {/* ── Right panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Rep counter */}
          <C style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#2e2e58', marginBottom: 8 }}>
              {selectedExercise.type === 'plank' ? 'Thời gian giữ' : 'Số Reps'}
            </div>
            <div style={{
              fontSize: 64, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
              background: 'linear-gradient(135deg, #a89af8, #7c6df0)', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12,
            }}>
              {selectedExercise.type === 'plank' ? formatTime(plankSeconds) : repState.count}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 99,
              background: `${phaseColor}14`, border: `1px solid ${phaseColor}40`,
              color: phaseColor, fontSize: 12, fontWeight: 700,
            }}>
              {phaseLabel}
            </div>
          </C>

          {/* Score */}
          <C>
            <ScoreBar score={repState.score} />
          </C>

          {/* Feedback */}
          <C style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2e2e58', marginBottom: 10 }}>
              Phản hồi tư thế
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 }}>
              {repState.feedback.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#2e2e58', fontSize: 12 }}>
                  {isActive ? 'Hãy thực hiện động tác...' : 'Bật camera để nhận phản hồi'}
                </div>
              ) : (
                repState.feedback.map((fb, i) => <FeedbackItem key={i} item={fb} />)
              )}
            </div>
          </C>

          {/* Exercise info */}
          <C>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{selectedExercise.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#d0d0f0' }}>{selectedExercise.nameVi}</span>
            </div>
            <p style={{ fontSize: 11, color: '#3a3a6a', lineHeight: 1.6, marginBottom: 10 }}>{selectedExercise.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
              {selectedExercise.muscleGroups.map((m) => (
                <span key={m} style={{
                  padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                  background: 'rgba(124,109,240,0.12)', border: '1px solid rgba(124,109,240,0.25)', color: '#a89af8',
                }}>
                  {m}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
              <div><span style={{ color: '#2e2e58' }}>Sets: </span><span style={{ color: '#d0d0f0', fontWeight: 700 }}>{selectedExercise.suggestedSets}</span></div>
              <div><span style={{ color: '#2e2e58' }}>Reps: </span><span style={{ color: '#d0d0f0', fontWeight: 700 }}>{selectedExercise.suggestedReps}</span></div>
            </div>
          </C>

          {/* Control */}
          {isActive
            ? <Btn onClick={stopCamera} danger full>⏹ Dừng &amp; Lưu</Btn>
            : <Btn onClick={startCamera} disabled={isLoading} full>{isLoading ? '⏳ Đang tải...' : '▶ Bắt đầu'}</Btn>
          }
        </div>
      </div>
    </div>
  )
}
