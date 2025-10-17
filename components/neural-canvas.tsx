"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
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
  Volume2,
  VolumeX,
  EyeOff,
  RefreshCw,
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
  const [mode, setMode] = useState<"flow" | "burst" | "neural">("neural")
  const [glowIntensity, setGlowIntensity] = useState([50])
  const [particleOpacity, setParticleOpacity] = useState([80])
  const [trailLength, setTrailLength] = useState([5])
  const [particleSize, setParticleSize] = useState([50])
  const [gravity, setGravity] = useState([0])
  const [autoRotate, setAutoRotate] = useState(false)
  const [breathingMode, setBreathingMode] = useState(false)
  const [ambientSound, setAmbientSound] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [primaryHue, setPrimaryHue] = useState([180])
  const [secondaryHue, setSecondaryHue] = useState([280])
  const [useCustomColors, setUseCustomColors] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const animationRef = useRef<number>()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const breathingRef = useRef({ phase: 0, scale: 1 })

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.loop = true
    audioRef.current.volume = 0.3
    // Using a relaxing ambient sound URL
    audioRef.current.src =
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0vBSh+zPDajzsKElyx6OyrWBQLSKHe8sFuJAUuhM/z24k2CBhku+zooVARC0yl4fG5ZRwFNo3V7859LwUofsz=..."

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      if (ambientSound) {
        audioRef.current.play().catch(() => {})
      } else {
        audioRef.current.pause()
      }
    }
  }, [ambientSound])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H" || e.key === "ч" || e.key === "Ч") {
        setHideUI((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
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

    // Mouse events
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
        // Create burst effect
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

    // Animation loop
    const animate = () => {
      if (!isPlaying) return

      ctx.fillStyle = `rgba(0, 0, 0, ${trailLength[0] / 100})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (breathingMode) {
        breathingRef.current.phase += 0.01
        breathingRef.current.scale = 1 + Math.sin(breathingRef.current.phase) * 0.1
      } else {
        breathingRef.current.scale = 1
      }

      const particles = particlesRef.current

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // Update position
        p.x += p.vx
        p.y += p.vy

        if (gravity[0] !== 0) {
          p.vy += gravity[0] / 1000
        }

        if (autoRotate) {
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = p.x - centerX
          const dy = p.y - centerY
          const angle = Math.atan2(dy, dx)
          const rotationSpeed = 0.001
          p.vx += Math.cos(angle + Math.PI / 2) * rotationSpeed
          p.vy += Math.sin(angle + Math.PI / 2) * rotationSpeed
        }

        // Mouse interaction
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

        // Boundary check with wrap
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Apply friction
        p.vx *= 0.99
        p.vy *= 0.99

        // Update life
        p.life -= 0.5
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        // Color shift
        let particleHue = p.hue
        if (useCustomColors) {
          const t = p.life / p.maxLife
          particleHue = primaryHue[0] + (secondaryHue[0] - primaryHue[0]) * (1 - t)
        } else {
          particleHue = (p.hue + colorShift[0]) % 360
        }

        const baseSize = (p.size * particleSize[0]) / 50
        const scaledSize = baseSize * breathingRef.current.scale
        const alpha = (p.life / p.maxLife) * (particleOpacity[0] / 100)

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, scaledSize, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particleHue}, 80%, 60%, ${alpha})`
        ctx.fill()

        const glowSize = scaledSize * 3 * (glowIntensity[0] / 50)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize)
        gradient.addColorStop(0, `hsla(${particleHue}, 80%, 60%, ${alpha * 0.5 * (glowIntensity[0] / 100)})`)
        gradient.addColorStop(1, `hsla(${particleHue}, 80%, 60%, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw connections (neural mode)
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
      }

      // Spawn new particles to maintain count
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
  ])

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

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="absolute inset-0 bg-black" />

      {!hideUI && (
        <>
          {/* Header */}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAmbientSound(!ambientSound)}
                className="text-white hover:bg-white/10"
              >
                {ambientSound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
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
                <Maximize className="h-5 w-5" />
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

          {/* Mode Selector */}
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
          </div>

          {showControls && (
            <div className="absolute top-24 right-6 z-10 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("calm")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Calm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("meditate")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Meditate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("energize")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Energize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("cosmic")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Cosmic
              </Button>
            </div>
          )}

          {/* Controls Panel */}
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

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white">Trail Length</label>
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
                    <label className="text-sm font-medium text-white">Gravity</label>
                    <span className="text-sm text-white/60">{gravity[0]}</span>
                  </div>
                  <Slider
                    value={gravity}
                    onValueChange={setGravity}
                    min={-50}
                    max={50}
                    step={5}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>

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
                    {mode === "neural" && "Click and drag to attract particles. Watch neural connections form."}
                    {mode === "flow" && "Click and drag to create flowing particle streams."}
                    {mode === "burst" && "Click anywhere to create explosive particle bursts."}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Instructions */}
          {!showControls && (
            <div className="absolute bottom-6 left-6 text-white/40 text-sm">
              <p className="text-balance">
                {mode === "burst" ? "Click to create bursts" : "Click and drag to interact"}
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
