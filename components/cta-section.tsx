"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Mail } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-accent/20 to-secondary/20" />
      <div className="absolute inset-0 backdrop-blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
              Ready to Create
              <br />
              <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                Something Amazing?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Let's collaborate and bring your vision to life with cutting-edge design and technology
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Button
              size="lg"
              className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-all duration-300 hover:scale-105 group text-lg px-8 py-6"
            >
              <Mail className="mr-2 w-5 h-5" />
              Get in Touch
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 hover:bg-secondary/10 transition-all duration-300 hover:scale-105 text-lg px-8 py-6 bg-transparent"
            >
              View All Projects
            </Button>
          </div>

          <div className="pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <p className="text-sm text-muted-foreground">Trusted by innovative companies worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 mt-6 opacity-60">
              <div className="text-2xl font-bold">ACME</div>
              <div className="text-2xl font-bold">APEX</div>
              <div className="text-2xl font-bold">NOVA</div>
              <div className="text-2xl font-bold">ZENITH</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  )
}
