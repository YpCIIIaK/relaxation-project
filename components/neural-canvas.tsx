"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
// Removed Tone.js - using native Web Audio API instead
import {
  Sparkles,
  Palette,
  Zap,
  Download,
  RotateCcw,
  Play,
  Pause,
  Settings2,
  Maximize,
  Minimize,
  EyeOff,
  Eye,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  hue: number
  size: number
}

export function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [hideUI, setHideUI] = useState(false)
  const [particleCount, setParticleCount] = useState([50])
  const [particleSpeed, setParticleSpeed] = useState([50])
  const [colorShift, setColorShift] = useState([180])
  const [connectionDistance, setConnectionDistance] = useState([150])
  const [mode, setMode] = useState<"flow" | "burst" | "neural" | "spiral" | "galaxy" | "wave" | "orbit" | "implode" | "explode" | "aurora" | "ripple" | "constellation">("neural")
  const [glowIntensity, setGlowIntensity] = useState([50])
  const [particleOpacity, setParticleOpacity] = useState([80])
  const [trailLength, setTrailLength] = useState([5])
  const [particleSize, setParticleSize] = useState([50])
  const [gravity, setGravity] = useState([0])
  const [autoRotate, setAutoRotate] = useState(false)
  const [breathingMode, setBreathingMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [primaryHue, setPrimaryHue] = useState([180])
  const [secondaryHue, setSecondaryHue] = useState([280])
  const [useCustomColors, setUseCustomColors] = useState(false)
  const [enableTrails, setEnableTrails] = useState(true)
  const [fadeSpeed, setFadeSpeed] = useState([18])
  const [bgColor, setBgColor] = useState({ r: 0, g: 0, b: 0 })
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)
  const [audioReactive, setAudioReactive] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [musicVolume, setMusicVolume] = useState([15])
  const [audioLevel, setAudioLevel] = useState(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const animationRef = useRef<number | undefined>(undefined)
  const breathingRef = useRef({ phase: 0, scale: 1 })
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(0))
  const micStreamRef = useRef<MediaStream | null>(null)
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const audioReactiveRef = useRef<boolean>(false)
  const lastAudioLevelUpdate = useRef<number>(0)
  const musicContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const gainNodesRef = useRef<GainNode[]>([])
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const initAudio = async () => {
    try {
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      
      audioContextRef.current = context
      analyserRef.current = analyser
      audioDataRef.current = new Uint8Array(analyser.frequencyBinCount)
      
      setAudioEnabled(true)
    } catch (err) {
      console.error('Audio initialization failed:', err)
    }
  }

  const toggleMicrophone = async () => {
    if (!micEnabled) {
      try {
        // Создаем новый AudioContext и analyser каждый раз
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          await initAudio()
        }
        
        // Возобновляем AudioContext если он приостановлен
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const source = audioContextRef.current!.createMediaStreamSource(stream)
        source.connect(analyserRef.current!)
        
        // Сохраняем stream и source чтобы можно было остановить
        micStreamRef.current = stream
        micSourceRef.current = source
        
        setMicEnabled(true)
        setAudioReactive(true)
        audioReactiveRef.current = true // Обновляем ref для анимации
      } catch (err) {
        console.error('❌ Microphone access denied:', err)
        alert('Microphone access is required for audio reactivity')
      }
    } else {
      // Отключаем source node от analyser
      if (micSourceRef.current) {
        try {
          micSourceRef.current.disconnect()
        } catch (e) {}
        micSourceRef.current = null
      }
      
      // Останавливаем все треки микрофона
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
        micStreamRef.current = null
      }
      
      setMicEnabled(false)
      setAudioReactive(false)
      audioReactiveRef.current = false // Обновляем ref для анимации
      setAudioLevel(0)
    }
  }

  const initMusic = () => {
    try {
      // Create Web Audio context
      if (!musicContextRef.current) {
        musicContextRef.current = new AudioContext()
      }
      
      // Stop any existing oscillators
      stopMusic()
      
      return musicContextRef.current
    } catch (err) {
      console.error('Music initialization failed:', err)
      return null
    }
  }

  const stopMusic = () => {
    // Stop all oscillators
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop()
        osc.disconnect()
      } catch (e) {
        // Ignore errors
      }
    })
    oscillatorsRef.current = []
    gainNodesRef.current = []
    
    // Clear timeout
    if (musicIntervalRef.current) {
      clearTimeout(musicIntervalRef.current as any)
      musicIntervalRef.current = null
    }
  }

  const playNote = (frequency: number, duration: number, volume: number = 0.3) => {
    const ctx = musicContextRef.current
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    const now = ctx.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * (musicVolume[0] / 100), now + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)

    oscillatorsRef.current.push(oscillator)
    gainNodesRef.current.push(gainNode)

    // Clean up after note ends
    setTimeout(() => {
      try {
        oscillator.disconnect()
        gainNode.disconnect()
      } catch (e) {
        // Ignore
      }
    }, duration * 1000 + 100)
  }

  const playMeditativeNote = (frequency: number, duration: number, volume: number = 0.06) => {
    const ctx = musicContextRef.current
    if (!ctx) return

    const now = ctx.currentTime
    const attackTime = 2.0 // Очень плавное нарастание 2 сек
    const releaseTime = 4 // ОЧЕНЬ медленное затухание 4 сек
    const sustainTime = Math.max(duration - attackTime - releaseTime, 0.5)

    // Один чистый осциллятор
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine' // Чистая sine wave

    const finalVolume = volume * (musicVolume[0] / 100)
    
    gainNode.gain.setValueAtTime(0, now)
    // Плавное нарастание
    gainNode.gain.linearRampToValueAtTime(finalVolume, now + attackTime)
    // Sustain
    gainNode.gain.setValueAtTime(finalVolume, now + attackTime + sustainTime)
    // Начало затухания - медленно снижаем до 30%
    gainNode.gain.linearRampToValueAtTime(finalVolume * 0.3, now + attackTime + sustainTime + releaseTime * 0.6)
    // Финальное затухание - очень плавно до нуля
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)

    oscillatorsRef.current.push(oscillator)
    gainNodesRef.current.push(gainNode)

    // Clean up
    setTimeout(() => {
      try {
        oscillator.disconnect()
        gainNode.disconnect()
      } catch (e) {
        // Ignore
      }
    }, duration * 1000 + 100)
  }

  const createAmbientMusic = (currentMode: string) => {
    stopMusic()
    
    const ctx = musicContextRef.current
    if (!ctx) return
    
    // Base frequencies for ambient pads - СРЕДНИЕ частоты без вибраций
    const baseNotes: { [key: string]: number[] } = {
      'neural': [130.81, 155.56, 196.0], // C3, Eb3, G3 - спокойный, чистый
      'spiral': [220.0, 261.63, 329.63], // A3, C4, E4 - легкий, воздушный
      'galaxy': [87.31, 103.83, 130.81], // F2, Ab2, C3 - глубокий без вибраций
      'wave': [146.83, 174.61, 220.0], // D3, F3, A3 - плавный, текучий
      'orbit': [98.0, 130.81, 146.83], // G2, C3, D3 - средний диапазон
      'burst': [261.63, 329.63, 392.0], // C4, E4, G4 - яркий, чистый
      'flow': [130.81, 174.61, 196.0], // C3, F3, G3 - сбалансированный
      'implode': [196.0, 220.0, 261.63], // G3, A3, C4 - напряженный, сжимающийся
      'explode': [293.66, 349.23, 392.0], // D4, F4, G4 - яркий, расширяющийся
      'aurora': [164.81, 196.0, 220.0], // E3, G3, A3 - мягкий, северный
      'ripple': [146.83, 174.61, 196.0], // D3, F3, G3 - спокойный, водный
      'constellation': [130.81, 164.81, 196.0] // C3, E3, G3 - звездный, тихий
    }
    
    const notes = baseNotes[currentMode] || baseNotes['flow']
    
    // Медитативная музыка: отдельные ноты с паузами
    let noteIndex = 0
    
    const playNextNote = () => {
      const particles = particlesRef.current
      if (!particles || particles.length === 0) return
      
      // Параметры от частиц
      const particleDensity = Math.min(particleCount[0] / 100, 1)
      const speed = particleSpeed[0] / 100
      const glowLevel = glowIntensity[0] / 100
      
      // Длительность ноты: 6-8 секунд (долгое затухание)
      const noteDuration = 6 + glowLevel * 2 // 6-8 сек
      
      // Интервал до следующей ноты: 3-5 секунд (следующая начнется пока эта затухает)
      const nextNoteDelay = 3000 + (1 - speed) * 2000 // 3-5 сек
      
      // Громкость - очень тихая для фона
      const volume = 0.05 * (0.4 + particleDensity * 0.3)
      
      // Выбираем ноту из гаммы
      const frequency = notes[noteIndex % notes.length]
      
      // Играем одну ноту
      playMeditativeNote(frequency, noteDuration, volume)
      
      // Иногда играем гармонию (интервал квинта или терция)
      if (Math.random() < 0.3) {
        const harmonicInterval = Math.random() < 0.5 ? 2 : 4 // терция или квинта
        const harmonicFreq = notes[(noteIndex + harmonicInterval) % notes.length]
        setTimeout(() => {
          playMeditativeNote(harmonicFreq, noteDuration, volume * 0.5)
        }, 200)
      }
      
      // Переход к следующей ноте (шаг 1-2 ноты)
      noteIndex += Math.random() < 0.7 ? 1 : 2
      
      // Следующая нота начинается пока предыдущая затухает (overlap)
      musicIntervalRef.current = setTimeout(playNextNote, nextNoteDelay) as any
    }
    
    // Начинаем с первой ноты
    playNextNote()
  }

  const toggleMusic = () => {
    if (!musicEnabled) {
      try {
        const ctx = initMusic()
        if (ctx && ctx.state === 'suspended') {
          ctx.resume()
        }
        createAmbientMusic(mode)
        setMusicEnabled(true)
      } catch (err) {
        console.error('Failed to start music:', err)
      }
    } else {
      stopMusic()
      setMusicEnabled(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < particleCount[0]; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (particleSpeed[0] / 25),
          vy: (Math.random() - 0.5) * (particleSpeed[0] / 25),
          life: Math.random() * 100,
          maxLife: 100,
          hue: Math.random() * 360,
          size: Math.random() * 3 + 1,
        })
      }
    }
    initParticles()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleMouseDown = () => {
      mouseRef.current.isDown = true
    }

    const handleMouseUp = () => {
      mouseRef.current.isDown = false
    }

    const handleClick = (e: MouseEvent) => {
      if (mode === "burst") {
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20
          const speed = Math.random() * 5 + 2
          particlesRef.current.push({
            x: e.clientX,
            y: e.clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 100,
            maxLife: 100,
            hue: Math.random() * 360,
            size: Math.random() * 4 + 2,
          })
        }
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("click", handleClick)

    const animate = () => {
      if (!isPlaying) return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      if (enableTrails) {
        ctx.fillStyle = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, ${fadeSpeed[0] / 100})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (breathingMode) {
        breathingRef.current.phase += 0.01
        breathingRef.current.scale = 1 + Math.sin(breathingRef.current.phase) * 0.1
      } else {
        breathingRef.current.scale = 1
      }

      // Audio analysis
      let bassLevel = 0
      let midLevel = 0
      let trebleLevel = 0
      let overallVolume = 0
      
      // Отладка: проверяем условия
      const isAudioReactive = audioReactiveRef.current
      
      if (isAudioReactive && analyserRef.current && audioDataRef.current) {
        try {
          analyserRef.current.getByteFrequencyData(audioDataRef.current)
          const data = audioDataRef.current
          
          // Вычисляем уровни частот
          const bassData = data.slice(0, 10)
          const midData = data.slice(10, 50)
          const trebleData = data.slice(50, 100)
          
          bassLevel = bassData.reduce((a, b) => a + b, 0) / 10 / 255
          midLevel = midData.reduce((a, b) => a + b, 0) / 40 / 255
          trebleLevel = trebleData.reduce((a, b) => a + b, 0) / 50 / 255
          
          // Общая громкость для реактивного glow
          overallVolume = (bassLevel + midLevel + trebleLevel) / 3
          
          // Обновляем индикатор уровня звука для UI (throttle: раз в 100мс)
          const now = Date.now()
          if (now - lastAudioLevelUpdate.current > 100) {
            setAudioLevel(Math.round(overallVolume * 100))
            lastAudioLevelUpdate.current = now
          }
        } catch (e) {
          console.error('❌ Audio analysis error:', e)
        }
      } else {
        setAudioLevel(0)
      }

      const particles = particlesRef.current

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        if (gravity[0] !== 0) {
          p.vy += gravity[0] / 1000
        }

        // Mode-specific behaviors
        if (mode === "spiral") {
          // ВОДОВОРОТ - сильное затягивание к центру по спирали
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const angle = Math.atan2(dy, dx)
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Очень сильное вращение (быстрее ближе к центру)
          const spiralSpeed = Math.min(250 / (distance + 10), 0.2)
          
          // СИЛЬНОЕ притяжение к центру - водоворот затягивает!
          const inwardSpeed = Math.min(distance * 0.0003, 0.05)
          
          // Вращательная сила
          p.vx += Math.cos(angle + Math.PI / 2) * spiralSpeed
          p.vy += Math.sin(angle + Math.PI / 2) * spiralSpeed
          
          // Сильная сила затягивания к центру
          p.vx += (dx / distance) * -inwardSpeed
          p.vy += (dy / distance) * -inwardSpeed
          
          // Меньше затухание для более динамичного водоворота
          p.vx *= 0.97
          p.vy *= 0.97
        } else if (mode === "galaxy") {
          // ГАЛАКТИКА - спиральные рукава с разной скоростью
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx)
          
          // Скорость зависит от расстояния (дальше = медленнее, как в реальной галактике)
          const rotationSpeed = Math.min(200 / Math.sqrt(distance + 50), 0.12)
          
          // Спиральные рукава - добавляем волну к углу
          const armCount = 3 // Количество спиральных рукавов
          const armStrength = Math.sin(angle * armCount - distance * 0.01) * 0.02
          
          // Вращательная сила + эффект спиральных рукавов
          p.vx += Math.cos(angle + Math.PI / 2) * (rotationSpeed + armStrength)
          p.vy += Math.sin(angle + Math.PI / 2) * (rotationSpeed + armStrength)
          
          // ОЧЕНЬ слабое притяжение к центру (галактика стабильна)
          const inwardPull = 0.00008
          p.vx += (dx / distance) * -inwardPull
          p.vy += (dy / distance) * -inwardPull
          
          // Небольшое сопротивление для плавности
          p.vx *= 0.96
          p.vy *= 0.96
        } else if (mode === "wave") {
          const time = Date.now() * 0.002
          const waveFrequency = 0.008
          const waveAmplitude = 1.5
          
          // Create flowing wave patterns
          const waveX = Math.sin(p.y * waveFrequency + time) * waveAmplitude
          const waveY = Math.cos(p.x * waveFrequency + time * 0.7) * waveAmplitude
          
          // Add secondary wave for complexity
          const wave2X = Math.sin(p.y * waveFrequency * 2 + time * 1.5) * waveAmplitude * 0.5
          const wave2Y = Math.cos(p.x * waveFrequency * 2 + time * 1.2) * waveAmplitude * 0.5
          
          p.vx += (waveX + wave2X) * 0.3
          p.vy += (waveY + wave2Y) * 0.3
          
          // Slight dampening for smoother motion
          p.vx *= 0.96
          p.vy *= 0.96
        } else if (mode === "orbit") {
          const mouseX = mouseRef.current.x
          const mouseY = mouseRef.current.y
          const dx = p.x - mouseX
          const dy = p.y - mouseY
          const distance = Math.sqrt(dx * dx + dy * dy)
          // Увеличенный радиус взаимодействия только для orbit
          if (distance > 30 && distance < 600) {
            const angle = Math.atan2(dy, dx)
            const orbitSpeed = 100 / distance * 0.05
            p.vx += Math.cos(angle + Math.PI / 2) * orbitSpeed
            p.vy += Math.sin(angle + Math.PI / 2) * orbitSpeed
          }
        } else if (mode === "implode") {
          // ТУННЕЛЬ ВНУТРЬ - частицы летят к центру по спирали
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx)
          
          // Сила притяжения к центру (сильнее на расстоянии)
          const pullStrength = Math.min(distance * 0.0004, 0.08)
          
          // Спиральное движение к центру (эффект туннеля)
          const spiralAngle = angle + Math.PI / 2
          const spiralStrength = 0.03
          
          // Движение к центру + спираль
          p.vx += -dx / distance * pullStrength + Math.cos(spiralAngle) * spiralStrength
          p.vy += -dy / distance * pullStrength + Math.sin(spiralAngle) * spiralStrength
          
          // Ускорение ближе к центру (эффект туннеля)
          if (distance < 100) {
            const boost = (100 - distance) / 100 * 0.05
            p.vx += -dx / distance * boost
            p.vy += -dy / distance * boost
          }
          
          p.vx *= 0.98
          p.vy *= 0.98
        } else if (mode === "explode") {
          // ТУННЕЛЬ НАРУЖУ - частицы летят от центра по спирали
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx)
          
          // РЕСПАУН в центре: частицы возвращаются в центр когда улетают далеко
          const maxDistance = Math.max(canvas.width, canvas.height) * 0.6
          if (distance > maxDistance) {
            // Возвращаем частицу в центр с небольшим случайным разбросом
            const spawnRadius = 20
            const randomAngle = Math.random() * Math.PI * 2
            p.x = centerX + Math.cos(randomAngle) * spawnRadius
            p.y = centerY + Math.sin(randomAngle) * spawnRadius
            
            // Начальная скорость от центра
            const initialSpeed = 0.5 + Math.random() * 0.5
            p.vx = Math.cos(randomAngle) * initialSpeed
            p.vy = Math.sin(randomAngle) * initialSpeed
          }
          
          // Сила отталкивания от центра (сильнее у центра)
          const pushStrength = Math.min(300 / (distance + 20), 0.1)
          
          // Спиральное движение от центра (эффект туннеля)
          const spiralAngle = angle + Math.PI / 2
          const spiralStrength = 0.04
          
          // Движение от центра + спираль
          p.vx += dx / distance * pushStrength + Math.cos(spiralAngle) * spiralStrength
          p.vy += dy / distance * pushStrength + Math.sin(spiralAngle) * spiralStrength
          
          // Дополнительное ускорение в центре (эффект взрыва)
          if (distance < 150) {
            const boost = (150 - distance) / 150 * 0.08
            p.vx += dx / distance * boost
            p.vy += dy / distance * boost
          }
          
          p.vx *= 0.97
          p.vy *= 0.97
        } else if (mode === "aurora") {
          // АВРОРА - плавные волны северного сияния
          const time = Date.now() * 0.0003
          const waveFreq = 0.004
          const waveAmp = 0.8
          
          // Медленные вертикальные волны
          const wave1X = Math.sin(p.y * waveFreq + time) * waveAmp
          const wave1Y = Math.cos(p.x * waveFreq * 0.5 + time * 0.5) * waveAmp * 0.3
          
          // Вторая волна для глубины
          const wave2X = Math.sin(p.y * waveFreq * 1.5 + time * 1.3) * waveAmp * 0.5
          const wave2Y = Math.cos(p.x * waveFreq * 0.8 + time * 0.7) * waveAmp * 0.2
          
          p.vx += (wave1X + wave2X) * 0.2
          p.vy += (wave1Y + wave2Y) * 0.2
          
          // Плавное движение вверх (как сияние)
          p.vy -= 0.1
          if (p.y < 0) p.y = canvas.height
          
          p.vx *= 0.98
          p.vy *= 0.98
        } else if (mode === "ripple") {
          // РЯБЬ - концентрические круги от центра
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx)
          
          // Пульсация от центра
          const time = Date.now() * 0.001
          const ripple = Math.sin(distance * 0.03 - time * 2) * 0.3
          
          // Движение по кругу + пульсация
          p.vx += Math.cos(angle) * ripple * 0.1
          p.vy += Math.sin(angle) * ripple * 0.1
          
          // Медленное вращение
          const rotateSpeed = 0.015
          p.vx += Math.cos(angle + Math.PI / 2) * rotateSpeed
          p.vy += Math.sin(angle + Math.PI / 2) * rotateSpeed
          
          p.vx *= 0.96
          p.vy *= 0.96
        } else if (mode === "constellation") {
          // СОЗВЕЗДИЕ - медленное дрейфование звезд
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Очень слабое притяжение к центру
          const centerPull = 0.00005
          p.vx += -(dx / distance) * centerPull * distance
          p.vy += -(dy / distance) * centerPull * distance
          
          // Медленное плавное движение
          const time = Date.now() * 0.0002
          p.vx += Math.sin(time + p.hue) * 0.05
          p.vy += Math.cos(time + p.hue * 0.7) * 0.05
          
          // Сильное затухание для очень плавного движения
          p.vx *= 0.98
          p.vy *= 0.98
        }

        if (autoRotate && mode === "neural") {
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const angle = Math.atan2(dy, dx)
          const rotationSpeed = 0.001
          p.vx += Math.cos(angle + Math.PI / 2) * rotationSpeed
          p.vy += Math.sin(angle + Math.PI / 2) * rotationSpeed
        }

        if (mouseRef.current.isDown) {
          const dx = mouseRef.current.x - p.x
          const dy = mouseRef.current.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            const force = (200 - dist) / 200
            p.vx += (dx / dist) * force * 0.5
            p.vy += (dy / dist) * force * 0.5
          }
        }

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        p.vx *= 0.99
        p.vy *= 0.99

        p.life -= 0.5
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        let particleHue = p.hue
        if (useCustomColors) {
          const t = p.life / p.maxLife
          particleHue = primaryHue[0] + (secondaryHue[0] - primaryHue[0]) * (1 - t)
        } else {
          particleHue = (p.hue + colorShift[0]) % 360
        }

        // Audio-reactive modifications
        if (isAudioReactive) {
          particleHue = (particleHue + trebleLevel * 60) % 360
        }

        const baseSize = (p.size * particleSize[0]) / 50
        const audioSizeMultiplier = isAudioReactive ? (1 + bassLevel * 2) : 1
        const scaledSize = baseSize * breathingRef.current.scale * audioSizeMultiplier
        const audioAlphaBoost = isAudioReactive ? (midLevel * 0.5) : 0
        const alpha = ((p.life / p.maxLife) * (particleOpacity[0] / 100)) + audioAlphaBoost

        ctx.beginPath()
        ctx.arc(p.x, p.y, scaledSize, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particleHue}, 80%, 60%, ${alpha})`
        ctx.fill()

        // Реактивное свечение: громкость звука влияет на glow intensity
        const audioGlowBoost = isAudioReactive ? (overallVolume * 100) : 0 // 0-100 бонус
        const reactiveGlowIntensity = glowIntensity[0] + audioGlowBoost
        
        const glowSize = scaledSize * 3 * (reactiveGlowIntensity / 50)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize)
        gradient.addColorStop(0, `hsla(${particleHue}, 80%, 60%, ${alpha * 0.5 * (reactiveGlowIntensity / 100)})`)
        gradient.addColorStop(1, `hsla(${particleHue}, 80%, 60%, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2)
        ctx.fill()
      }

      if (mode === "neural") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 0.5
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < connectionDistance[0]) {
              const alpha = (1 - dist / connectionDistance[0]) * 0.5
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      } else if (mode === "aurora") {
        // АВРОРА - плавные градиентные линии
        ctx.lineWidth = 1
        
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            
            if (dist < connectionDistance[0]) {
              const alpha = (1 - dist / connectionDistance[0]) * 0.4
              
              // Плавный градиент цветов (зеленый-синий-фиолетовый)
              const hue = 120 + (particles[i].y / canvas.height) * 80
              ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`
              
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      } else if (mode === "ripple") {
        // РЯБЬ - концентрические круговые волны
        ctx.lineWidth = 1
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dist1 = Math.sqrt((particles[i].x - centerX) ** 2 + (particles[i].y - centerY) ** 2)
            const dist2 = Math.sqrt((particles[j].x - centerX) ** 2 + (particles[j].y - centerY) ** 2)
            const distDiff = Math.abs(dist1 - dist2)
            
            // Соединяем частицы на одном радиусе (концентрические кольца)
            if (distDiff < 40) {
              const dx = particles[i].x - particles[j].x
              const dy = particles[i].y - particles[j].y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 200) {
                const alpha = (1 - dist / 200) * 0.4
                const hue = 180 + (dist1 / 5) % 60
                ctx.strokeStyle = `hsla(${hue}, 60%, 65%, ${alpha})`
                ctx.beginPath()
                ctx.moveTo(particles[i].x, particles[i].y)
                ctx.lineTo(particles[j].x, particles[j].y)
                ctx.stroke()
              }
            }
          }
        }
      } else if (mode === "constellation") {
        // СОЗВЕЗДИЕ - редкие линии только между самыми близкими звездами
        ctx.lineWidth = 1.5
        
        // Для каждой частицы находим только САМУЮ близкую
        for (let i = 0; i < particles.length; i++) {
          let closestDist = Infinity
          let closestIndex = -1
          
          // Находим ближайшую звезду
          for (let j = 0; j < particles.length; j++) {
            if (i === j) continue
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            
            if (dist < closestDist && dist < connectionDistance[0] * 0.8) {
              closestDist = dist
              closestIndex = j
            }
          }
          
          // Рисуем связь только с ближайшей звездой (и только если i < j чтобы не дублировать)
          if (closestIndex !== -1 && i < closestIndex) {
            const alpha = (1 - closestDist / (connectionDistance[0] * 0.8)) * 0.5
            ctx.strokeStyle = `rgba(180, 200, 255, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[closestIndex].x, particles[closestIndex].y)
            ctx.stroke()
          }
        }
      }

      while (particles.length < particleCount[0]) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (particleSpeed[0] / 25),
          vy: (Math.random() - 0.5) * (particleSpeed[0] / 25),
          life: 100,
          maxLife: 100,
          hue: Math.random() * 360,
          size: Math.random() * 3 + 1,
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      animate()
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("click", handleClick)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // НЕ останавливаем микрофон здесь - это делается в toggleMicrophone
      // Микрофон нужно остановить только при полном размонтировании компонента
    }
  }, [
    isPlaying,
    particleCount,
    particleSpeed,
    colorShift,
    connectionDistance,
    mode,
    glowIntensity,
    particleOpacity,
    trailLength,
    particleSize,
    gravity,
    autoRotate,
    breathingMode,
    useCustomColors,
    primaryHue,
    secondaryHue,
    enableTrails,
    fadeSpeed,
    bgColor,
    // audioReactive не нужен здесь - анимация читает текущее значение напрямую
  ])

  // Cleanup microphone on component unmount only
  useEffect(() => {
    return () => {
      // Останавливаем микрофон только при размонтировании компонента
      if (micSourceRef.current) {
        try {
          micSourceRef.current.disconnect()
        } catch (e) {}
        micSourceRef.current = null
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
        micStreamRef.current = null
      }
    }
  }, []) // Empty deps = runs only on mount/unmount

  // Clear canvas when background color changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with new background color
    ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [bgColor])

  // Change music when mode changes
  useEffect(() => {
    if (musicEnabled) {
      createAmbientMusic(mode)
    }
  }, [mode, musicEnabled])

  // Restart music when volume changes to apply new volume immediately
  useEffect(() => {
    if (musicEnabled) {
      createAmbientMusic(mode)
    }
  }, [musicVolume])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `neural-canvas-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleReset = () => {
    particlesRef.current = []
  }

  const resetToDefaults = () => {
    setParticleCount([50])
    setParticleSpeed([50])
    setColorShift([180])
    setConnectionDistance([150])
    setGlowIntensity([50])
    setParticleOpacity([80])
    setTrailLength([5])
    setParticleSize([50])
    setGravity([0])
    setAutoRotate(false)
    setBreathingMode(false)
    setUseCustomColors(false)
    setPrimaryHue([180])
    setSecondaryHue([280])
    setMode("neural")
    setEnableTrails(true)
    setFadeSpeed([18])
    setBgColor({ r: 0, g: 0, b: 0 })
  }

  const applyPreset = (preset: string) => {
    switch (preset) {
      case "calm":
        setParticleCount([30])
        setParticleSpeed([20])
        setGlowIntensity([70])
        setParticleOpacity([60])
        setTrailLength([3])
        setAutoRotate(false)
        setBreathingMode(true)
        break
      case "meditate":
        setParticleCount([15])
        setParticleSpeed([10])
        setGlowIntensity([90])
        setParticleOpacity([40])
        setTrailLength([2])
        setAutoRotate(true)
        setBreathingMode(true)
        break
      case "energize":
        setParticleCount([100])
        setParticleSpeed([70])
        setGlowIntensity([40])
        setParticleOpacity([90])
        setTrailLength([8])
        setAutoRotate(false)
        setBreathingMode(false)
        break
      case "cosmic":
        setParticleCount([60])
        setParticleSpeed([30])
        setGlowIntensity([100])
        setParticleOpacity([70])
        setTrailLength([1])
        setAutoRotate(true)
        setBreathingMode(false)
        break
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H" || e.key === "р" || e.key === "Р") {
        setHideUI((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ backgroundColor: `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})` }}
      />

      {!hideUI && (
        <>
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-6 w-6 text-accent" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                  Neural Canvas
                </h1>
              </div>
              <div className="hidden md:block text-sm text-white/60">Interactive Relaxation Studio</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/10"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleReset} className="text-white hover:bg-white/10">
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetToDefaults}
                className="text-white hover:bg-white/10"
                title="Reset to defaults"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:bg-white/10">
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMicrophone} 
                className={`text-white hover:bg-white/10 ${audioReactive ? 'bg-white/20' : ''}`}
                title="Toggle audio reactivity"
              >
                {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMusic} 
                className={`text-white hover:bg-white/10 ${musicEnabled ? 'bg-white/20' : ''}`}
                title="Toggle ambient music"
              >
                {musicEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHideUI(true)}
                className="text-white hover:bg-white/10"
                title="Hide UI (press H to toggle)"
              >
                <EyeOff className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowControls(!showControls)}
                className="text-white hover:bg-white/10"
              >
                <Settings2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="absolute top-24 left-6 z-10 flex flex-col gap-2">
            <Button
              variant={mode === "neural" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("neural")}
              className={
                mode === "neural"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <Zap className="h-4 w-4 mr-2" />
              Neural
            </Button>
            <Button
              variant={mode === "flow" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("flow")}
              className={
                mode === "flow"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Flow
            </Button>
            <Button
              variant={mode === "burst" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("burst")}
              className={
                mode === "burst"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <Palette className="h-4 w-4 mr-2" />
              Burst
            </Button>
            <Button
              variant={mode === "spiral" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("spiral")}
              className={
                mode === "spiral"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Spiral
            </Button>
            <Button
              variant={mode === "galaxy" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("galaxy")}
              className={
                mode === "galaxy"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Galaxy
            </Button>
            <Button
              variant={mode === "wave" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("wave")}
              className={
                mode === "wave"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <Zap className="h-4 w-4 mr-2" />
              Wave
            </Button>
            <Button
              variant={mode === "orbit" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("orbit")}
              className={
                mode === "orbit"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Orbit
            </Button>
            <Button
              variant={mode === "implode" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("implode")}
              className={
                mode === "implode"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <Minimize className="h-4 w-4 mr-2" />
              Implode
            </Button>
            <Button
              variant={mode === "explode" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("explode")}
              className={
                mode === "explode"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <Maximize className="h-4 w-4 mr-2" />
              Explode
            </Button>
            <Button
              variant={mode === "aurora" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("aurora")}
              className={
                mode === "aurora"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <span className="mr-2">🌄</span>
              Aurora
            </Button>
            <Button
              variant={mode === "ripple" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("ripple")}
              className={
                mode === "ripple"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <span className="mr-2">🌊</span>
              Ripple
            </Button>
            <Button
              variant={mode === "constellation" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("constellation")}
              className={
                mode === "constellation"
                  ? "bg-accent text-accent-foreground"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            >
              <span className="mr-2">✨</span>
              Constellation
            </Button>
          </div>

          {showControls && (
            <Card className="absolute bottom-6 left-6 right-6 md:left-auto md:w-96 bg-black/80 backdrop-blur-xl border-white/10 p-6 z-10 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    variant={breathingMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBreathingMode(!breathingMode)}
                    className={
                      breathingMode
                        ? "bg-accent text-accent-foreground flex-1"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20 flex-1"
                    }
                  >
                    Breathing
                  </Button>
                  <Button
                    variant={autoRotate ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={
                      autoRotate
                        ? "bg-accent text-accent-foreground flex-1"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20 flex-1"
                    }
                  >
                    Auto Rotate
                  </Button>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Audio Reactive</label>
                    <Button
                      variant={audioReactive ? "default" : "outline"}
                      size="sm"
                      onClick={toggleMicrophone}
                      className={
                        audioReactive
                          ? "bg-accent text-accent-foreground"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }
                    >
                      <Waves className="h-4 w-4 mr-1" />
                      {audioReactive ? "On" : "Off"}
                    </Button>
                  </div>
                  {audioReactive && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/60 leading-relaxed">
                        🎤 Microphone active - glow pulses with sound volume!
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">Level:</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                            style={{ width: `${audioLevel}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60 min-w-[3ch]">{audioLevel}%</span>
                      </div>
                      <p className="text-xs text-white/40 italic leading-relaxed">
                        💡 If not working: check microphone settings in your browser (microphone icon in address bar)
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <label className="text-sm font-medium text-white">Ambient Music</label>
                  <Button
                    variant={musicEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={toggleMusic}
                    className={
                      musicEnabled
                        ? "bg-accent text-accent-foreground"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    }
                  >
                    <Volume2 className="h-4 w-4 mr-1" />
                    {musicEnabled ? "On" : "Off"}
                  </Button>
                </div>

                {musicEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-white">Music Volume</label>
                      <span className="text-sm text-white/60">{musicVolume[0]}%</span>
                    </div>
                    <Slider
                      value={musicVolume}
                      onValueChange={setMusicVolume}
                      min={0}
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <label className="text-sm font-medium text-white">Motion Blur</label>
                  <Button
                    variant={enableTrails ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnableTrails(!enableTrails)}
                    className={
                      enableTrails
                        ? "bg-accent text-accent-foreground"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    }
                  >
                    {enableTrails ? "On" : "Off"}
                  </Button>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white">Custom Colors</label>
                    <Button
                      variant={useCustomColors ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseCustomColors(!useCustomColors)}
                      className={
                        useCustomColors
                          ? "bg-accent text-accent-foreground"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }
                    >
                      {useCustomColors ? "On" : "Off"}
                    </Button>
                  </div>

                  {useCustomColors && (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-white/80">Primary Color</label>
                          <div
                            className="w-8 h-8 rounded border border-white/20"
                            style={{ backgroundColor: `hsl(${primaryHue[0]}, 80%, 60%)` }}
                          />
                        </div>
                        <Slider
                          value={primaryHue}
                          onValueChange={setPrimaryHue}
                          min={0}
                          max={360}
                          step={1}
                          className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-white/80">Secondary Color</label>
                          <div
                            className="w-8 h-8 rounded border border-white/20"
                            style={{ backgroundColor: `hsl(${secondaryHue[0]}, 80%, 60%)` }}
                          />
                        </div>
                        <Slider
                          value={secondaryHue}
                          onValueChange={setSecondaryHue}
                          min={0}
                          max={360}
                          step={1}
                          className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white">Particle Count</label>
                    <span className="text-sm text-white/60">{particleCount[0]}</span>
                  </div>
                  <Slider
                    value={particleCount}
                    onValueChange={setParticleCount}
                    min={10}
                    max={200}
                    step={10}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white">Speed</label>
                    <span className="text-sm text-white/60">{particleSpeed[0]}%</span>
                  </div>
                  <Slider
                    value={particleSpeed}
                    onValueChange={setParticleSpeed}
                    min={10}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white">Particle Size</label>
                    <span className="text-sm text-white/60">{particleSize[0]}%</span>
                  </div>
                  <Slider
                    value={particleSize}
                    onValueChange={setParticleSize}
                    min={20}
                    max={150}
                    step={10}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white">Glow Intensity</label>
                    <span className="text-sm text-white/60">{glowIntensity[0]}%</span>
                  </div>
                  <Slider
                    value={glowIntensity}
                    onValueChange={setGlowIntensity}
                    min={0}
                    max={150}
                    step={10}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white">Opacity</label>
                    <span className="text-sm text-white/60">{particleOpacity[0]}%</span>
                  </div>
                  <Slider
                    value={particleOpacity}
                    onValueChange={setParticleOpacity}
                    min={10}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>

                {enableTrails && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-white">Blur Amount</label>
                        <span className="text-sm text-white/60">{trailLength[0]}%</span>
                      </div>
                      <Slider
                        value={trailLength}
                        onValueChange={setTrailLength}
                        min={1}
                        max={20}
                        step={1}
                        className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-white">Fade Speed</label>
                        <span className="text-sm text-white/60">{fadeSpeed[0]}%</span>
                      </div>
                      <Slider
                        value={fadeSpeed}
                        onValueChange={setFadeSpeed}
                        min={1}
                        max={50}
                        step={1}
                        className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                      />
                      <p className="text-xs text-white/40 mt-1">Higher = trails fade faster</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-white">Background Color</label>
                        <div
                          className="w-8 h-8 rounded border border-white/20"
                          style={{ backgroundColor: `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})` }}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60 w-6">R</span>
                          <Slider
                            value={[bgColor.r]}
                            onValueChange={(v) => setBgColor({ ...bgColor, r: v[0] })}
                            min={0}
                            max={255}
                            step={1}
                            className="[&_[role=slider]]:bg-red-500 [&_[role=slider]]:border-red-500"
                          />
                          <span className="text-xs text-white/60 w-8 text-right">{bgColor.r}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60 w-6">G</span>
                          <Slider
                            value={[bgColor.g]}
                            onValueChange={(v) => setBgColor({ ...bgColor, g: v[0] })}
                            min={0}
                            max={255}
                            step={1}
                            className="[&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-500"
                          />
                          <span className="text-xs text-white/60 w-8 text-right">{bgColor.g}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60 w-6">B</span>
                          <Slider
                            value={[bgColor.b]}
                            onValueChange={(v) => setBgColor({ ...bgColor, b: v[0] })}
                            min={0}
                            max={255}
                            step={1}
                            className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500"
                          />
                          <span className="text-xs text-white/60 w-8 text-right">{bgColor.b}</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/40 mt-1">Match this to shadow color to hide trails</p>
                    </div>
                  </>
                )}

                {!useCustomColors && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-white">Color Shift</label>
                      <span className="text-sm text-white/60">{colorShift[0]}°</span>
                    </div>
                    <Slider
                      value={colorShift}
                      onValueChange={setColorShift}
                      min={0}
                      max={360}
                      step={10}
                      className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                    />
                  </div>
                )}

                {mode === "neural" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-white">Connection Distance</label>
                      <span className="text-sm text-white/60">{connectionDistance[0]}px</span>
                    </div>
                    <Slider
                      value={connectionDistance}
                      onValueChange={setConnectionDistance}
                      min={50}
                      max={300}
                      step={10}
                      className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/60 leading-relaxed">
                    {audioReactive 
                      ? "🎵 Particles react to sound! Make some noise or play music"
                      : musicEnabled
                      ? `🧘 Meditative notes with pauses (2-8s) - calming intervals, 40-60 BPM`
                      : mode === "burst" 
                      ? "Click to create bursts" 
                      : mode === "orbit" 
                      ? "Move mouse to create orbital motion"
                      : mode === "spiral"
                      ? "Vortex effect - particles spiral rapidly into center"
                      : mode === "galaxy"
                      ? "3-arm spiral galaxy with realistic rotation speed"
                      : mode === "wave"
                      ? "Sine wave particle motion"
                      : mode === "implode"
                      ? "Tunnel effect - particles spiral into center"
                      : mode === "explode"
                      ? "Supernova effect - particles burst from center"
                      : mode === "aurora"
                      ? "Northern lights - smooth flowing gradient waves"
                      : mode === "ripple"
                      ? "Water ripples - concentric rings from center"
                      : mode === "constellation"
                      ? "Star field - sparse connections like night sky"
                      : "Click and drag to interact"}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!showControls && (
            <div className="absolute bottom-6 left-6 text-white/40 text-sm">
              <p className="text-balance">
                {audioReactive 
                  ? "🎵 Audio reactive mode - particles respond to sound"
                  : mode === "burst" 
                  ? "Click to create bursts" 
                  : mode === "orbit" 
                  ? "Move mouse to create orbital motion"
                  : mode === "spiral"
                  ? "Vortex effect - particles spiral rapidly into center"
                  : mode === "galaxy"
                  ? "3-arm spiral galaxy with realistic rotation speed"
                  : mode === "wave"
                  ? "Sine wave particle motion"
                  : mode === "implode"
                  ? "Tunnel effect - particles spiral into center"
                  : mode === "explode"
                  ? "Supernova effect - particles burst from center"
                  : mode === "aurora"
                  ? "Northern lights - smooth flowing gradient waves"
                  : mode === "ripple"
                  ? "Water ripples - concentric rings from center"
                  : mode === "constellation"
                  ? "Star field - sparse connections like night sky"
                  : "Click and drag to interact"}
              </p>
            </div>
          )}
        </>
      )}

      {hideUI && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 text-sm animate-pulse">
          <p>Press H to show UI</p>
        </div>
      )}
    </div>
  )
}
