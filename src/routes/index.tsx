import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: LandingPage })

// ---------------------------------------------------------------------------
// Scroll-reveal hook
// ---------------------------------------------------------------------------
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

// ---------------------------------------------------------------------------
// Inline SVG Illustrations (undraw-inspired)
// ---------------------------------------------------------------------------
function IllustrationHero() {
  return (
    <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Background circle */}
      <circle cx="240" cy="180" r="160" fill="#ecfdf5" />
      {/* Desk */}
      <rect x="80" y="250" width="320" height="12" rx="6" fill="#d1fae5" />
      <rect x="100" y="262" width="10" height="50" rx="5" fill="#d1fae5" />
      <rect x="370" y="262" width="10" height="50" rx="5" fill="#d1fae5" />
      {/* Laptop */}
      <rect x="150" y="180" width="180" height="70" rx="8" fill="#065f46" />
      <rect x="155" y="185" width="170" height="60" rx="5" fill="#ecfdf5" />
      {/* Screen content - bar chart */}
      <rect x="170" y="220" width="15" height="20" rx="2" fill="#10b981" />
      <rect x="192" y="210" width="15" height="30" rx="2" fill="#34d399" />
      <rect x="214" y="200" width="15" height="40" rx="2" fill="#10b981" />
      <rect x="236" y="205" width="15" height="35" rx="2" fill="#34d399" />
      <rect x="258" y="195" width="15" height="45" rx="2" fill="#059669" />
      <rect x="280" y="210" width="15" height="30" rx="2" fill="#10b981" />
      {/* Laptop base */}
      <rect x="130" y="250" width="220" height="10" rx="5" fill="#065f46" />
      {/* Person */}
      {/* Head */}
      <circle cx="380" cy="170" r="28" fill="#fde68a" />
      {/* Hair */}
      <path d="M352 165 Q360 140 380 138 Q400 140 408 165" fill="#92400e" />
      {/* Body */}
      <rect x="355" y="198" width="50" height="52" rx="12" fill="#10b981" />
      {/* Arms */}
      <path d="M355 210 Q330 225 340 245" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />
      <path d="M405 210 Q425 225 415 245" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />
      {/* Smile */}
      <path d="M370 175 Q380 185 390 175" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <circle cx="372" cy="167" r="3" fill="#1f2937" />
      <circle cx="388" cy="167" r="3" fill="#1f2937" />
      {/* Floating coins / profit indicators */}
      <circle cx="120" cy="130" r="18" fill="#fbbf24" />
      <text x="113" y="136" fontSize="16" fill="#78350f" fontWeight="bold">€</text>
      <circle cx="420" cy="120" r="14" fill="#fbbf24" />
      <text x="414" y="126" fontSize="13" fill="#78350f" fontWeight="bold">€</text>
      <circle cx="440" cy="160" r="10" fill="#fbbf24" />
      <text x="435" y="165" fontSize="9" fill="#78350f" fontWeight="bold">€</text>
      {/* Upward arrows */}
      <path d="M100 90 L100 60 M90 72 L100 60 L110 72" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M450 90 L450 65 M441 77 L450 65 L459 77" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IllustrationAbout() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-sm mx-auto">
      <circle cx="200" cy="150" r="130" fill="#fef3c7" />
      {/* Person looking at papers */}
      <circle cx="200" cy="110" r="30" fill="#fde68a" />
      <path d="M170 108 Q178 85 200 83 Q222 85 230 108" fill="#92400e" />
      <rect x="172" y="140" width="56" height="60" rx="12" fill="#ef4444" />
      {/* Question marks floating */}
      <text x="110" y="100" fontSize="36" fill="#f59e0b" fontWeight="bold" opacity="0.8">?</text>
      <text x="268" y="90" fontSize="28" fill="#f59e0b" fontWeight="bold" opacity="0.6">?</text>
      <text x="130" y="155" fontSize="20" fill="#f59e0b" fontWeight="bold" opacity="0.4">?</text>
      {/* Papers/invoices on desk */}
      <rect x="100" y="210" width="200" height="8" rx="4" fill="#d1d5db" />
      <rect x="115" y="175" width="70" height="90" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <rect x="215" y="165" width="70" height="90" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1.5" transform="rotate(8 215 165)" />
      <line x1="125" y1="190" x2="175" y2="190" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
      <line x1="125" y1="200" x2="165" y2="200" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
      <line x1="125" y1="210" x2="170" y2="210" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
      {/* Worried eyes */}
      <circle cx="190" cy="105" r="4" fill="#1f2937" />
      <circle cx="210" cy="105" r="4" fill="#1f2937" />
      <path d="M188 118 Q200 113 212 118" stroke="#92400e" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function IllustrationSuccess() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-sm mx-auto">
      <circle cx="200" cy="150" r="130" fill="#ecfdf5" />
      {/* Trophy/chart */}
      <rect x="150" y="200" width="100" height="10" rx="5" fill="#10b981" />
      <rect x="175" y="188" width="50" height="14" rx="3" fill="#34d399" />
      {/* Chart bars going up */}
      <rect x="160" y="170" width="18" height="40" rx="4" fill="#6ee7b7" />
      <rect x="185" y="150" width="18" height="60" rx="4" fill="#34d399" />
      <rect x="210" y="130" width="18" height="80" rx="4" fill="#10b981" />
      <rect x="235" y="145" width="18" height="65" rx="4" fill="#059669" />
      {/* Star sparkle */}
      <path d="M310 80 L315 95 L330 95 L318 104 L323 119 L310 110 L297 119 L302 104 L290 95 L305 95 Z" fill="#fbbf24" />
      {/* Person celebrating */}
      <circle cx="120" cy="120" r="28" fill="#fde68a" />
      <path d="M92 118 Q100 95 120 93 Q140 95 148 118" fill="#7c3aed" />
      <rect x="95" y="148" width="50" height="55" rx="12" fill="#7c3aed" />
      {/* Arms raised */}
      <path d="M95 155 Q70 130 75 108" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />
      <path d="M145 155 Q170 130 165 108" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />
      {/* Happy face */}
      <circle cx="110" cy="113" r="3.5" fill="#1f2937" />
      <circle cx="130" cy="113" r="3.5" fill="#1f2937" />
      <path d="M108 124 Q120 134 132 124" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Sparkles */}
      <circle cx="75" cy="95" r="5" fill="#fbbf24" />
      <circle cx="168" cy="90" r="4" fill="#fbbf24" />
      <circle cx="82" cy="70" r="3" fill="#34d399" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-emerald-100" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              ZISK<span className="text-emerald-600">ovač</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {["About", "How It Works", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-gray-600">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-emerald-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 animate-in slide-in-from-top duration-200">
          {["About", "How It Works", "Pricing", "FAQ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-medium text-gray-700 py-1"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Log in</Button>
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 pt-16"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-80 h-80 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-50/30 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Profitability automation for freelancers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Stop guessing,
            <br />
            <span className="text-emerald-600">start profiting.</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
            ZISKovač automates the transition from gut-feeling pricing to
            data-driven profitability. Know your real costs, set the right
            rates, and generate professional quotes — in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:-translate-y-0.5"
              >
                Get Started — It's Free
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                See How It Works
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 mt-10">
            <div className="flex -space-x-2">
              {["bg-emerald-400", "bg-teal-500", "bg-cyan-500", "bg-green-500"].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                  {["J", "M", "A", "P"][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Join <span className="font-semibold text-gray-700">500+</span> freelancers already profiting
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="animate-in fade-in slide-in-from-right duration-700 delay-200 hidden lg:block">
          <IllustrationHero />
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// About Section
// ---------------------------------------------------------------------------
function AboutSection() {
  const { ref, visible } = useInView()

  const painPoints = [
    {
      icon: "💸",
      title: "Invisible overhead costs",
      description:
        "Most freelancers price only their time — ignoring software, taxes, downtime, and equipment.",
    },
    {
      icon: "🤷",
      title: "Gut-feeling pricing",
      description:
        "Quoting from instinct means inconsistent margins. Some projects profit, others quietly lose money.",
    },
    {
      icon: "📉",
      title: "The profitability gap",
      description:
        "You work hard, invoices go out — but your bank account doesn't reflect your effort.",
    },
  ]

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Illustration */}
          <div className="order-2 lg:order-1">
            <IllustrationAbout />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              The Profitability Gap is real — and it's costing you.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Freelancers and micro-SMEs often feel like they're doing well —
              staying busy, sending invoices, serving clients. But without
              proper cost accounting and rate calculation, many unknowingly work
              at a loss.
            </p>

            <div className="space-y-5">
              {painPoints.map((point) => (
                <div key={point.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 text-xl">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{point.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// How It Works Section
// ---------------------------------------------------------------------------
function HowItWorksSection() {
  const { ref, visible } = useInView(0.1)

  const steps = [
    {
      step: "01",
      title: "Enter your real costs",
      description:
        "Add your monthly overhead: software subscriptions, equipment, taxes, desired salary, and non-billable hours.",
      color: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-200",
    },
    {
      step: "02",
      title: "Set your hourly rate",
      description:
        "ZISKovač calculates the minimum viable rate you need to charge to actually profit — not just survive.",
      color: "bg-teal-50 text-teal-700",
      border: "border-teal-200",
    },
    {
      step: "03",
      title: "Build professional quotes",
      description:
        "Create itemized quotes for clients in seconds. Every line item is linked to your real cost data.",
      color: "bg-cyan-50 text-cyan-700",
      border: "border-cyan-200",
    },
    {
      step: "04",
      title: "Track your profit",
      description:
        "See exactly how much you're making per project, per client, and per month — at a glance.",
      color: "bg-green-50 text-green-700",
      border: "border-green-200",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            The Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            From gut-feeling to data-driven in 4 steps
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ZISKovač gives you a clear, repeatable system for pricing
            profitably. No spreadsheets. No guessing.
          </p>
        </div>

        {/* Steps grid */}
        <div
          ref={ref}
          className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`relative bg-white rounded-2xl p-6 border ${step.border} shadow-sm hover:shadow-md transition-shadow`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-emerald-200 z-10" />
              )}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm mb-4 ${step.color}`}>
                {step.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Illustration */}
        <div className="mt-16 max-w-sm mx-auto">
          <IllustrationSuccess />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Pricing Section
// ---------------------------------------------------------------------------
function PricingSection() {
  const { ref, visible } = useInView(0.1)
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: "Starter",
      price: annual ? 0 : 0,
      description: "Perfect for solo freelancers just getting started.",
      features: [
        "Cost calculator",
        "Up to 5 quotes/month",
        "Basic PDF export",
        "1 user",
      ],
      cta: "Start for Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: annual ? 9 : 12,
      description: "For serious freelancers who want full profitability control.",
      features: [
        "Everything in Starter",
        "Unlimited quotes",
        "Branded PDF templates",
        "Profit analytics dashboard",
        "Client management",
        "Priority support",
      ],
      cta: "Start 14-day Trial",
      highlight: true,
    },
    {
      name: "Business",
      price: annual ? 24 : 29,
      description: "For micro-SMEs and small teams.",
      features: [
        "Everything in Pro",
        "Up to 5 team members",
        "Multi-project tracking",
        "Expense tracking",
        "API access",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-600 mb-6">
            No hidden fees. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !annual ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                annual ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Annual
              <span className="ml-1.5 text-emerald-600 text-xs font-semibold">–25%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div
          ref={ref}
          className={`grid sm:grid-cols-3 gap-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200 ring-2 ring-emerald-600"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-emerald-100" : "text-gray-500"}`}>
                  {plan.description}
                </p>
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    €{plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-emerald-200" : "text-gray-400"}`}>
                      /mo
                    </span>
                  )}
                  {plan.price === 0 && (
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-emerald-200" : "text-gray-400"}`}>
                      forever free
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <svg
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-emerald-200" : "text-emerald-500"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlight ? "text-emerald-50" : "text-gray-600"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <Button
                  className={`w-full ${
                    plan.highlight
                      ? "bg-white text-emerald-700 hover:bg-emerald-50"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FAQ Section
// ---------------------------------------------------------------------------
function FAQSection() {
  const { ref, visible } = useInView()
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    {
      q: "Who is ZISKovač designed for?",
      a: "ZISKovač is built for freelancers, solo consultants, and micro-SMEs (1–10 people) who want to price their services profitably and generate professional quotes without complex accounting software.",
    },
    {
      q: "Do I need accounting knowledge to use it?",
      a: "Not at all. ZISKovač is designed to be intuitive. You enter plain numbers — your monthly expenses, desired income, working hours — and the app does the math for you.",
    },
    {
      q: "How does the pricing calculator work?",
      a: "You input all your real costs (overhead, subscriptions, taxes, non-billable hours) and your desired take-home income. ZISKovač calculates the minimum hourly or daily rate you must charge to be profitable.",
    },
    {
      q: "Can I generate quotes for clients?",
      a: "Yes! With the Pro and Business plans, you can generate branded PDF quotes linked to your real cost data. Clients receive a professional document; you see your actual margin on every line.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. All data is encrypted at rest and in transit. We never share your business data with third parties. You can export or delete your data at any time.",
    },
    {
      q: "Can I try it before paying?",
      a: "Absolutely. The Starter plan is free forever. Pro and Business plans offer a 14-day free trial with no credit card required.",
    },
  ]

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-gray-600">
            Still have questions?{" "}
            <a href="mailto:hello@ziskovac.com" className="text-emerald-600 hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <div
          ref={ref}
          className={`space-y-3 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 text-emerald-600 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? "max-h-48" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// CTA Banner
// ---------------------------------------------------------------------------
function CTABanner() {
  const { ref, visible } = useInView()

  return (
    <section className="py-20 bg-emerald-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/40 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-teal-500/40 blur-2xl" />
      </div>

      <div
        ref={ref}
        className={`relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to close the profitability gap?
        </h2>
        <p className="text-emerald-100 text-lg mb-8">
          Join hundreds of freelancers who stopped undercharging and started
          building sustainable businesses.
        </p>
        <Link to="/register">
          <Button
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 font-semibold"
          >
            Start for Free — No Credit Card Required
          </Button>
        </Link>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">Z</span>
              </div>
              <span className="text-white font-bold">
                ZISK<span className="text-emerald-400">ovač</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Data-driven profitability for freelancers and micro-SMEs.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              {["About", "How It Works", "Pricing", "FAQ"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} ZISKovač. All rights reserved.</p>
          <p>
            Designed for freelancers who deserve to profit.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Main Landing Page
// ---------------------------------------------------------------------------
function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTABanner />
      <Footer />
    </div>
  )
}
