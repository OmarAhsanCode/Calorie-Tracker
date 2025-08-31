// Hero: Establishes brand identity quickly with gradient headline, concise value prop, and trust-building preview card.
import React from 'react'
import { motion } from 'framer-motion'
import HeroPreview from './HeroPreview'

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-page-bg">
      {/* Soft gradient aura background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 bg-gradient-to-br from-brand-green/10 to-brand-orange/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-gradient-to-tr from-brand-orange/10 to-brand-green/10 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & copy */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-orange mb-6"
              >
                Instant Nutrition Analysis
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8"
              >
                Type or snap your meal and get a smart macro breakdown in seconds. No manual logging. Just clarity.
              </motion.p>
              {/* Credibility badges */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex flex-wrap gap-3"
              >
                {[
                  { label: 'Accurate Macros', icon: '✅' },
                  { label: 'AI Powered', icon: '🤖' },
                  { label: 'Mobile Friendly', icon: '📱' },
                  { label: 'Fast Results', icon: '⚡' },
                ].map(b => (
                  <span key={b.label} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm text-sm font-medium text-gray-700 shadow-sm border border-gray-200">
                    <span>{b.icon}</span>{b.label}
                  </span>
                ))}
              </motion.div>
            </div>
          {/* Right: Preview */}
          <div className="relative">
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
