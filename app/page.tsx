"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ImageIcon, Sparkles, Upload, Zap, User, Users, BarChart2, Info, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import HeroAnimation from "@/components/hero-animation"
import FeatureCard from "@/components/feature-card"
import ExampleGallery from "@/components/example-gallery"
import TestimonialSlider from "@/components/testimonial-slider"
import TrendingStyles from "@/components/trending-styles"
import StatsCounter from "@/components/stats-counter"
import ParallaxSection from "@/components/parallax-section"
import ScrollToSection from "@/components/scroll-to-section"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

interface FeatureGroup {
  title: string
  icon: React.ReactNode
  features: string[]
}

interface PricingCardProps {
  index: number
  title: string
  price: string
  yearlyPrice: string
  isYearly: boolean
  description: string
  sessions: string
  thumbnails: string
  overage: string
  featureGroups: FeatureGroup[]
  buttonText: string
  buttonVariant: "default" | "outline"
  popular?: boolean
  monthlyPriceId: string
  yearlyPriceId: string
}

const PricingCard: React.FC<PricingCardProps> = ({
  index,
  title,
  price,
  yearlyPrice,
  isYearly,
  description,
  sessions,
  thumbnails,
  overage,
  featureGroups,
  buttonText,
  buttonVariant,
  popular = false,
  monthlyPriceId,
  yearlyPriceId,
}) => {
  const router = useRouter()
  let savedAmount = 0;
  let percentageSaved = 0;

  if (isYearly) {
    const monthlyNumeric = parseFloat(price.replace('$', ''));
    const yearlyNumeric = parseFloat(yearlyPrice.replace('$', ''));
    if (!isNaN(monthlyNumeric) && !isNaN(yearlyNumeric)) {
      const annualMonthlyCost = monthlyNumeric * 12;
      savedAmount = annualMonthlyCost - yearlyNumeric;
      if (annualMonthlyCost > 0) { // Avoid division by zero
        percentageSaved = Math.round((savedAmount / annualMonthlyCost) * 100);
      }
    }
  }

  const cardClasses = popular
    ? "border-purple-500 dark:border-purple-400 shadow-lg"
    : "border-gray-200 dark:border-gray-700 shadow-sm";

  const handleCheckout = () => {
    const selectedPriceId = isYearly ? yearlyPriceId : monthlyPriceId;
    // For now, always redirect to signup with the priceId.
    // Later, this can be enhanced to check if user is logged in.
    // If logged in, get email from session and call API directly.
    // If not logged in, redirect to signup.
    router.push(`/signup?priceId=${selectedPriceId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      viewport={{ once: true }}
      className={`relative rounded-2xl border bg-white dark:bg-gray-800 ${cardClasses} flex flex-col`}
    >
      <div className="p-6 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <div className="mt-4">
          <div className="relative">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{isYearly ? yearlyPrice : price}</div>
            <div className="absolute top-0.5 right-0 text-sm text-gray-500 dark:text-gray-400">
              {isYearly ? "/ year" : "/ month"}
            </div>
          </div>
          {isYearly && savedAmount > 0 && (
            <div className="mt-1.5">
              <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 px-2 py-0.5 rounded-full">
                Save ${savedAmount.toFixed(0)} ({percentageSaved}%)
              </span>
            </div>
          )}
        </div>
        <ul className="mt-6 space-y-3">
          <li>
            <div className="text-sm text-gray-500 dark:text-gray-400">{sessions}</div>
          </li>
          <li>
            <div className="text-sm text-gray-500 dark:text-gray-400">{thumbnails}</div>
          </li>
          <li>
            <div className="text-sm text-gray-500 dark:text-gray-400">{overage}</div>
          </li>
        </ul>
        {featureGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mt-6">
            <div className="flex items-center space-x-2">
              {group.icon}
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">{group.title}</h4>
            </div>
            <ul className="mt-3 space-y-2">
              {group.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="text-sm text-gray-500 dark:text-gray-400">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="p-6 mt-auto">
        <button
          onClick={handleCheckout}
          className={`w-full rounded-md py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${buttonVariant === "default" ? "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600" : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
        >
          {buttonText}
        </button>
      </div>
    </motion.div>
  )
}

interface PricingToggleProps {
  isYearly: boolean
  onPeriodChange: (yearly: boolean) => void
}

const PricingToggle: React.FC<PricingToggleProps> = ({ isYearly, onPeriodChange }) => {
  return (
    <div className="flex items-center justify-center">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">Monthly</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          checked={isYearly}
          onChange={() => onPeriodChange(!isYearly)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
      </label>
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-3">Yearly</span>
    </div>
  )
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isYearly, setIsYearly] = useState(true)
  
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-200 ${
          hasScrolled ? "bg-white/90 backdrop-blur-md dark:bg-gray-900/90" : "bg-white/80 dark:bg-gray-900/80"
        }`}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              <span className="text-lg md:text-xl font-bold">ThumbAI</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current"></div>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex gap-6">
            <ScrollToSection targetId="features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </ScrollToSection>
            <ScrollToSection targetId="examples" className="text-sm font-medium hover:underline underline-offset-4">
              Examples
            </ScrollToSection>
            <ScrollToSection targetId="pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </ScrollToSection>
            <ScrollToSection targetId="faq" className="text-sm font-medium hover:underline underline-offset-4">
              FAQ
            </ScrollToSection>
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="w-9 px-0">
                <User className="h-4 w-4" />
                <span className="sr-only">Log in</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 dark:text-white"
              >
                Sign up
              </Button>
            </Link>
          </div>

          {/* Mobile auth button */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="w-9 px-0">
                <User className="h-4 w-4" />
                <span className="sr-only">Log in</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 dark:text-white"
              >
                Sign up
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b">
            <nav className="flex flex-col py-4 px-6 space-y-4">
              <ScrollToSection
                targetId="features"
                className="text-sm font-medium py-2"
              >
                Features
              </ScrollToSection>
              <ScrollToSection
                targetId="examples"
                className="text-sm font-medium py-2"
              >
                Examples
              </ScrollToSection>
              <ScrollToSection
                targetId="pricing"
                className="text-sm font-medium py-2"
              >
                Pricing
              </ScrollToSection>
              <ScrollToSection
                targetId="faq"
                className="text-sm font-medium py-2"
              >
                FAQ
              </ScrollToSection>
              <Link href="/login" className="text-sm font-medium py-2">
                Log in
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-white to-purple-50 dark:from-gray-950 dark:to-purple-950 overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-[10%] left-[20%] w-72 h-72 bg-yellow-200 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center relative">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1 text-xs md:text-sm text-purple-600 dark:text-purple-300 shadow-sm">
                  AI-Powered Thumbnails
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl/none font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Create Stunning YouTube Thumbnails in Seconds
                </h1>
                <p className="max-w-[600px] text-sm md:text-base lg:text-xl text-gray-600 dark:text-gray-300">
                  Transform your ideas into eye-catching thumbnails that drive clicks. No design skills needed.
                </p>
                <StatsCounter />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
                <HeroAnimation />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950 relative">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1 text-xs md:text-sm text-purple-600 dark:text-purple-300 shadow-sm">
                  How It Works
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter dark:text-white">
                  Create Thumbnails in 3 Simple Steps
                </h2>
                <p className="max-w-[900px] text-sm md:text-base text-gray-500 dark:text-gray-400">
                  Our AI-powered platform makes thumbnail creation effortless
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 mt-12 relative">
              {/* Connection lines between steps */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 dark:from-purple-900/30 dark:via-purple-700/30 dark:to-purple-900/30 hidden md:block"></div>

              <FeatureCard
                icon={<Upload className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />}
                title="Upload or Sketch"
                description="Start with your own image, sketch, or choose from our templates"
                step={1}
              />
              <FeatureCard
                icon={<ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />}
                title="Describe Your Vision"
                description="Tell our AI what you want with simple text prompts"
                step={2}
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />}
                title="Generate & Download"
                description="Get multiple thumbnail options in seconds, ready to use"
                step={3}
              />
            </div>
          </div>
        </section>

        <ParallaxSection />

        {/* Example Gallery */}
        <section id="examples" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1 text-xs md:text-sm text-purple-600 dark:text-purple-300 shadow-sm">
                  Examples
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter dark:text-white">
                  See the Magic in Action
                </h2>
                <p className="max-w-[900px] text-sm md:text-base text-gray-500 dark:text-gray-400">
                  From basic ideas to stunning thumbnails that drive clicks
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl mt-8 md:mt-12">
              <ExampleGallery />
            </div>
          </div>
        </section>

        {/* Trending Styles */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1 text-xs md:text-sm text-purple-600 dark:text-purple-300 shadow-sm">
                  Trending Now
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter dark:text-white">
                  Popular Thumbnail Styles
                </h2>
                <p className="max-w-[900px] text-sm md:text-base text-gray-500 dark:text-gray-400">
                  Stay ahead with the latest thumbnail trends
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl mt-8 md:mt-12">
              <TrendingStyles />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1 text-xs md:text-sm text-purple-600 dark:text-purple-300 shadow-sm">
                  Testimonials
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter dark:text-white">
                  What Creators Are Saying
                </h2>
                <p className="max-w-[900px] text-sm md:text-base text-gray-500 dark:text-gray-400">
                  Real results from content creators like you
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl mt-8 md:mt-12">
              <TestimonialSlider />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1 text-xs md:text-sm text-purple-600 dark:text-purple-300 shadow-sm">
                  Pricing
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter dark:text-white">
                  Choose Your Perfect Plan
                </h2>
                <p className="max-w-[900px] text-sm md:text-base text-gray-500 dark:text-gray-400">
                  Simple, transparent pricing for creators of all sizes
                </p>
              </div>
              <div className="mt-4 md:mt-6">
              <PricingToggle
                isYearly={isYearly}
                onPeriodChange={(yearly) => {
                  setIsYearly(yearly)
                }}
              />
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              <PricingCard
                index={0}
                title="Hobby"
                price="$10"
                yearlyPrice="$96"
                isYearly={isYearly}
                description="Perfect for occasional creators and personal channels"
                sessions="50 sessions per month"
                thumbnails="100 thumbnails per month"
                overage="Add 25 extra sessions for $5"
                monthlyPriceId={process.env.NEXT_PUBLIC_STRIPE_HOBBY_MONTHLY_PRICE_ID || ""}
                yearlyPriceId={process.env.NEXT_PUBLIC_STRIPE_HOBBY_YEARLY_PRICE_ID || ""}
                featureGroups={[
                  {
                    title: "AI Features",
                    icon: <Zap className="h-4 w-4 text-purple-600" />,
                    features: ["Advanced AI generation", "Premium templates", "1080p resolution"],
                  },
                  {
                    title: "Support & Access",
                    icon: <Users className="h-4 w-4 text-purple-600" />,
                    features: ["Priority email support", "Export to multiple formats"],
                  },
                  {
                    title: "Tools",
                    icon: <BarChart2 className="h-4 w-4 text-purple-600" />,
                    features: ["Thumbnail analyzer"],
                  },
                ]}
                buttonText="Start Creating"
                buttonVariant="outline"
              />
              <PricingCard
                index={1}
                title="Most Popular"
                price="$30"
                yearlyPrice="$288"
                isYearly={isYearly}
                description="Ideal for semi-pro YouTubers or small teams"
                sessions="150 sessions per month"
                thumbnails="300 thumbnails per month"
                overage="Add 75 extra sessions for $15"
                monthlyPriceId={process.env.NEXT_PUBLIC_STRIPE_POPULAR_MONTHLY_PRICE_ID || ""}
                yearlyPriceId={process.env.NEXT_PUBLIC_STRIPE_POPULAR_YEARLY_PRICE_ID || ""}
                featureGroups={[
                  {
                    title: "AI Features",
                    icon: <Zap className="h-4 w-4 text-purple-600" />,
                    features: ["Advanced AI generation", "All premium templates", "1080p resolution"],
                  },
                  {
                    title: "Support & Access",
                    icon: <Users className="h-4 w-4 text-purple-600" />,
                    features: ["Priority support", "Team collaboration (2 seats)"],
                  },
                  {
                    title: "Tools",
                    icon: <BarChart2 className="h-4 w-4 text-purple-600" />,
                    features: ["A/B testing", "Analytics dashboard"],
                  },
                ]}
                buttonText="Choose Plan"
                buttonVariant="default"
                popular={true}
              />
              <PricingCard
                index={2}
                title="Plus"
                price="$60"
                yearlyPrice="$576"
                isYearly={isYearly}
                description="For seasoned content producers needing higher throughput"
                sessions="300 sessions per month"
                thumbnails="600 thumbnails per month"
                overage="Add 150 extra sessions for $30"
                monthlyPriceId={process.env.NEXT_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID || ""}
                yearlyPriceId={process.env.NEXT_PUBLIC_STRIPE_PLUS_YEARLY_PRICE_ID || ""}
                featureGroups={[
                  {
                    title: "AI Features",
                    icon: <Zap className="h-4 w-4 text-purple-600" />,
                    features: ["Advanced AI generation", "All premium templates", "4K resolution"],
                  },
                  {
                    title: "Support & Access",
                    icon: <Users className="h-4 w-4 text-purple-600" />,
                    features: ["Priority support", "Team collaboration (5 seats)", "API access"],
                  },
                  {
                    title: "Tools",
                    icon: <BarChart2 className="h-4 w-4 text-purple-600" />,
                    features: ["A/B testing", "Analytics dashboard", "Custom branding"],
                  },
                ]}
                buttonText="Choose Plan"
                buttonVariant="outline"
              />
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Info className="h-4 w-4" />
                <span>
                  Need more capacity? Check out our{" "}
                  <Link href="/studio-plan" className="text-purple-600 hover:underline">
                    Studio plan
                  </Link>{" "}
                  or{" "}
                  <Link href="/contact-sales" className="text-purple-600 hover:underline">
                    contact sales
                  </Link>{" "}
                  for enterprise options.
                </span>
              </div>
            </div>

            <div className="mt-12 max-w-4xl mx-auto overflow-x-auto">
              <h3 className="text-xl font-bold text-center mb-4 dark:text-white">Usage Comparison</h3>
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Plan</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Sessions
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Thumbnails
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Extra Capacity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">Free</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">1/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">2/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">Hobby</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">50/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">100/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">$5 per 25 sessions</td>
                  </tr>
                  <tr className="bg-purple-50 dark:bg-purple-900/10">
                    <td className="py-3 px-4 text-sm font-medium text-purple-700 dark:text-purple-300">Most Popular</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">150/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">300/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">$15 per 75 sessions</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">Plus</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">300/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">600/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">$30 per 150 sessions</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">Studio</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">1,000/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">2,000/mo</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">$50 per 500 sessions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1 text-xs md:text-sm text-purple-600 dark:text-purple-300 shadow-sm">
                  FAQ
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter dark:text-white">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-sm md:text-base text-gray-500 dark:text-gray-400">
                  Everything you need to know about ThumbAI
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 mt-8 md:mt-12">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">How does the AI thumbnail generator work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                    Our AI analyzes your inputs (sketches, images, and text prompts) and generates thumbnails based on
                    what performs well on YouTube. It uses advanced machine learning to create eye-catching designs
                    optimized for clicks.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">What counts as a session?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                    A session is one generation request that produces two thumbnail options. You can make adjustments to
                    your prompt and regenerate within the same session without using additional credits.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Can I edit the generated thumbnails?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                    Yes! After generation, you can fine-tune your thumbnails with our built-in editor. Adjust text,
                    colors, elements, and more to get exactly what you want.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">What happens if I exceed my monthly limit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                    You can purchase additional sessions in blocks as needed without upgrading your plan. These are
                    available at the overage rates listed for each plan and will be automatically added to your bill.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=500&width=500')] bg-repeat opacity-5"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>

          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter">
                  Ready to Create Stunning Thumbnails?
                </h2>
                <p className="max-w-[900px] text-sm md:text-base lg:text-xl">
                  Join thousands of creators who are boosting their click-through rates with ThumbAI
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 shadow-lg">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="container flex flex-col gap-6 py-8 md:py-12 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              <span className="text-lg md:text-xl font-bold dark:text-white">ThumbAI</span>
            </Link>
            <nav className="flex gap-4 sm:gap-6 flex-wrap justify-center">
              <Link
                href="#"
                className="text-xs md:text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-xs md:text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-xs md:text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className="text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} ThumbAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
