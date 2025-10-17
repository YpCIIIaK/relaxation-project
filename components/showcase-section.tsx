"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

const projects = [
  {
    title: "Quantum Interface",
    category: "Web Experience",
    description: "An immersive 3D portfolio showcasing next-gen design patterns",
    image: "/futuristic-3d-interface-with-holographic-elements.jpg",
  },
  {
    title: "Neural Dashboard",
    category: "Data Visualization",
    description: "Real-time analytics platform with stunning visual representations",
    image: "/modern-dashboard-with-data-visualization-and-graph.jpg",
  },
  {
    title: "Ethereal Commerce",
    category: "E-commerce",
    description: "Luxury shopping experience with seamless micro-interactions",
    image: "/elegant-luxury-ecommerce-website-design.jpg",
  },
  {
    title: "Sonic Waves",
    category: "Music Platform",
    description: "Audio streaming app with fluid animations and rich visuals",
    image: "/music-streaming-app-with-waveforms-and-vibrant-col.jpg",
  },
]

export function ShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0)
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
    <section
      id="showcase"
      ref={sectionRef}
      className="py-32 relative overflow-hidden bg-gradient-to-b from-transparent via-muted/30 to-transparent"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <h2
            className={`text-5xl md:text-6xl font-bold tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Featured{" "}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Masterpieces
            </span>
          </h2>
          <p
            className={`text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            A curated collection of our most innovative and award-winning projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 hover:scale-[1.02] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${index * 150}ms`,
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="inline-block px-3 py-1 rounded-full bg-secondary/20 backdrop-blur-sm border border-secondary/30">
                  <span className="text-xs font-medium text-secondary">{project.category}</span>
                </div>
                <h3 className="text-3xl font-bold text-foreground">{project.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                <Button
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 hover:bg-secondary/20"
                >
                  View Project
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-gradient-to-br from-secondary/30 to-accent/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
