"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">N</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Nexus</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-sm font-medium hover:text-secondary transition-colors">
              Work
            </a>
            <a href="#features" className="text-sm font-medium hover:text-secondary transition-colors">
              Features
            </a>
            <a href="#showcase" className="text-sm font-medium hover:text-secondary transition-colors">
              Showcase
            </a>
            <a href="#insights" className="text-sm font-medium hover:text-secondary transition-colors">
              Insights
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-secondary to-accent hover:opacity-90">
              Get Started
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <a href="#work" className="block text-sm font-medium hover:text-secondary transition-colors">
              Work
            </a>
            <a href="#features" className="block text-sm font-medium hover:text-secondary transition-colors">
              Features
            </a>
            <a href="#showcase" className="block text-sm font-medium hover:text-secondary transition-colors">
              Showcase
            </a>
            <a href="#insights" className="block text-sm font-medium hover:text-secondary transition-colors">
              Insights
            </a>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="ghost" size="sm" className="w-full">
                Sign In
              </Button>
              <Button size="sm" className="w-full bg-gradient-to-r from-secondary to-accent">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
