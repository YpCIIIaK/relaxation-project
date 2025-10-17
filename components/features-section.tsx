"use client"

import { useEffect, useRef, useState } from "react"
import { Zap, Palette, Sparkles, Layers, Code2, Rocket } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with cutting-edge technologies for instant interactions",
  },
  {
    icon: Palette,
    title: "Stunning Design",
    description: "Award-winning aesthetics that captivate and engage your audience",
  },
  {
    icon: Sparkles,
    title: "Micro-interactions",
    description: "Delightful animations and transitions that bring interfaces to life",
  },
  {
    icon: Layers,
    title: "Depth & Dimension",
    description: "3D elements and layered compositions for immersive experiences",
  },
  {
    icon: Code2,
    title: "Clean Code",
    description: "Production-ready, maintainable code following best practices",
  },
  {
    icon: Rocket,
    title: "Innovation First",
    description: "Pushing boundaries with experimental features and bold ideas",
  },
]

export function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h2
            className={`text-5xl md:text-6xl font-bold tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Crafted with{" "}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Excellence</span>
          </h2>
          <p
            className={`text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Every detail matters. Every interaction counts. Every pixel perfect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl border border-border bg-card hover:bg-card/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 cursor-pointer ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 space-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center transition-transform duration-500 ${
                      hoveredIndex === index ? "rotate-12 scale-110" : ""
                    }`}
                  >
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>

                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
