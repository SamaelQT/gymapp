import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EXERCISES } from '../data/exercises'
import { analyzeExercise } from '../lib/poseAnalyzer'
import type { Exercise, ExerciseType, RepState, PoseFeedback } from '../types'
import { useWorkoutStore } from '../store/useWorkoutStore'

declare global {
  interface Window {
    Pose: any
    Camera: any
    drawConnectors: any
    drawLandmarks: any
    POSE_CONNECTIONS: any
  }
}

const initialRepState: RepState = { count: 0, phase: 'idle', score: 100, feedback: [] }

function FeedbackItem({ item }: { item: PoseFeedback }) {
  const colors = {
    success: 'border-green-500/40 bg-green-500/10 text-green-400',
    warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
    error: 'border-red-500/40 bg-red-500/10 text-red-400',
  }
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs font-medium ${colors[item.type]}`}>
      {item.message}
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#8888aa]">Điểm tư thế</span>
        <span style={{ color }} className="font-bold">{score}%</span>
      </div>
      <div className="h-2 bg-[#1a1a28] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  )
}

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

  // Load MediaPipe scripts from CDN
  useEffect(() => {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
    ]

    let loaded = 0
    const trySetLoaded = () => {
      loaded++
      if (loaded === scripts.length) setMediapipeLoaded(true)
    }

    scripts.forEach((src) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        trySetLoaded()
        return
      }
      const s = document.createElement('script')
      s.src = src
      s.crossOrigin = 'anonymous'
      s.onload = trySetLoaded
      s.onerror = trySetLoaded
      document.head.appendChild(s)
    })
  }, [])

  // Plank timer
  useEffect(() => {
    if (!isActive || selectedExercise.type !== 'plank') return
    const interval = setInterval(() => {
      setPlankSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, selectedExercise.type])

  // Elapsed time
  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive])

  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.poseLandmarks) {
      if (window.drawConnectors && window.POSE_CONNECTIONS) {
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
          color: '#7c6ff7',
          lineWidth: 2,
        })
      }
      if (window.drawLandmarks) {
        window.drawLandmarks(ctx, results.poseLandmarks, {
          color: '#9d92ff',
          fillColor: '#7c6ff7',
          lineWidth: 1,
          radius: 4,
        })
      }

      const newState = analyzeExercise(
        selectedExercise.type as ExerciseType,
        results.poseLandmarks,
        repStateRef.current
      )
      repStateRef.current = newState
      setRepState({ ...newState })
    }
    ctx.restore()
  }, [selectedExercise.type])

  const startCamera = async () => {
    if (!mediapipeLoaded) {
      alert('MediaPipe đang tải, vui lòng thử lại sau vài giây.')
      return
    }
    setIsLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const pose = new window.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      })
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      })
      pose.onResults(onResults)
      poseRef.current = pose

      if (window.Camera && videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) await pose.send({ image: videoRef.current })
          },
          width: 640,
          height: 480,
        })
        camera.start()
        cameraRef.current = camera
      }

      repStateRef.current = initialRepState
      setRepState(initialRepState)
      setPlankSeconds(0)
      startTimeRef.current = Date.now()
      setElapsedSeconds(0)
      setIsActive(true)
    } catch (err) {
      console.error('Camera error:', err)
      alert('Không thể truy cập camera. Vui lòng cho phép quyền camera.')
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    cameraRef.current?.stop()
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    poseRef.current = null

    // Save session
    if (repStateRef.current.count > 0 || plankSeconds > 0) {
      const duration = Math.max(1, Math.floor(elapsedSeconds / 60))
      addSession({
        date: new Date().toISOString().split('T')[0],
        duration,
        exercises: [{ exercise: selectedExercise, sets: 1, reps: repStateRef.current.count }],
        calories: Math.round(duration * 6),
        totalReps: repStateRef.current.count,
      })
    }

    setIsActive(false)
  }

  const switchExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    repStateRef.current = initialRepState
    setRepState(initialRepState)
    setPlankSeconds(0)
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div>
      <Header title="Live AI" subtitle="Phân tích tư thế tập luyện real-time" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Camera view */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'scaleX(-1)' }}
              />
              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f]/90">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-[#f0f0ff] font-semibold text-lg mb-2">Camera chưa bật</p>
                  <p className="text-[#8888aa] text-sm mb-6">Bật camera để bắt đầu phân tích tư thế</p>
                  <Button onClick={startCamera} size="lg" disabled={isLoading}>
                    {isLoading ? '⏳ Đang tải...' : '🎥 Bật Camera'}
                  </Button>
                  {!mediapipeLoaded && (
                    <p className="text-[#555570] text-xs mt-3">⏳ Đang tải MediaPipe...</p>
                  )}
                </div>
              )}
              {isActive && (
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <Badge variant="accent">{selectedExercise.emoji} {selectedExercise.nameVi}</Badge>
                  <Badge variant="default">⏱ {formatTime(elapsedSeconds)}</Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Exercise selector */}
          <Card>
            <h3 className="text-sm font-semibold text-[#f0f0ff] mb-3">Chọn bài tập</h3>
            <div className="grid grid-cols-3 gap-2">
              {EXERCISES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => switchExercise(ex)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExercise.id === ex.id
                      ? 'border-[#7c6ff7] bg-[#7c6ff7]/15'
                      : 'border-[#22223a] bg-[#1a1a28] hover:border-[#7c6ff7]/50'
                  }`}
                >
                  <div className="text-xl mb-1">{ex.emoji}</div>
                  <div className="text-xs font-medium text-[#f0f0ff]">{ex.nameVi}</div>
                  <div className="text-xs text-[#555570]">{ex.muscleGroups[0]}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Rep counter */}
          <Card className="text-center">
            <p className="text-xs text-[#8888aa] mb-2">
              {selectedExercise.type === 'plank' ? 'Thời gian giữ' : 'Số Reps'}
            </p>
            <div className="text-7xl font-black text-[#7c6ff7] my-4">
              {selectedExercise.type === 'plank' ? formatTime(plankSeconds) : repState.count}
            </div>
            <Badge variant={repState.phase === 'down' ? 'warning' : repState.phase === 'up' ? 'success' : 'default'}>
              {repState.phase === 'idle' ? 'Sẵn sàng' : repState.phase === 'down' ? '⬇ Xuống' : '⬆ Lên'}
            </Badge>
          </Card>

          {/* Score */}
          <Card>
            <ScoreBar score={repState.score} />
          </Card>

          {/* Feedback */}
          <Card>
            <h3 className="text-sm font-semibold text-[#f0f0ff] mb-3">Phản hồi tư thế</h3>
            <div className="space-y-2 min-h-[100px]">
              {repState.feedback.length === 0 ? (
                <p className="text-xs text-[#555570] text-center py-4">
                  {isActive ? 'Hãy thực hiện động tác...' : 'Bật camera để nhận phản hồi'}
                </p>
              ) : (
                repState.feedback.map((fb, i) => <FeedbackItem key={i} item={fb} />)
              )}
            </div>
          </Card>

          {/* Exercise info */}
          <Card>
            <h3 className="text-sm font-semibold text-[#f0f0ff] mb-2">
              {selectedExercise.emoji} {selectedExercise.nameVi}
            </h3>
            <p className="text-xs text-[#8888aa] mb-3">{selectedExercise.description}</p>
            <div className="flex flex-wrap gap-1">
              {selectedExercise.muscleGroups.map((m) => (
                <Badge key={m} variant="accent">{m}</Badge>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#22223a] flex gap-4 text-xs">
              <div>
                <span className="text-[#555570]">Sets: </span>
                <span className="text-[#f0f0ff] font-medium">{selectedExercise.suggestedSets}</span>
              </div>
              <div>
                <span className="text-[#555570]">Reps: </span>
                <span className="text-[#f0f0ff] font-medium">{selectedExercise.suggestedReps}</span>
              </div>
            </div>
          </Card>

          {/* Control button */}
          {isActive ? (
            <Button onClick={stopCamera} variant="danger" size="lg" className="w-full">
              ⏹ Dừng & Lưu
            </Button>
          ) : (
            <Button onClick={startCamera} size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? '⏳ Đang tải...' : '▶ Bắt đầu'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
