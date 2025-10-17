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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [primaryHue, setPrimaryHue] = useState([180])
  const [secondaryHue, setSecondaryHue] = useState([280])
  const [useCustomColors, setUseCustomColors] = useState(false)
  const [enableTrails, setEnableTrails] = useState(true)
  const [fadeSpeed, setFadeSpeed] = useState([18])
  const [bgColor, setBgColor] = useState({ r: 0, g: 0, b: 0 })
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const animationRef = useRef<number>()
  const breathingRef = useRef({ phase: 0, scale: 1 })

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

      const particles = particlesRef.current

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

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

        const baseSize = (p.size * particleSize[0]) / 50
        const scaledSize = baseSize * breathingRef.current.scale
        const alpha = (p.life / p.maxLife) * (particleOpacity[0] / 100)

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
    enableTrails,
    fadeSpeed,
    bgColor,
  ])

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
                    {mode === "burst" ? "Click to create bursts" : "Click and drag to interact"}
                  </p>
                </div>
              </div>
            </Card>
          )}

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
