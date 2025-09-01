// Hero: Establishes brand identity quickly with gradient headline, concise value prop, and trust-building preview card.
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCalorieProgress } from '../contexts/CalorieProgressContext'
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
          {/* Left: Headline, copy & progress */}
            <div>
              <CalorieProgressCircle />
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

// Circular progress sub-component (interactive & polished)
const CalorieProgressCircle = () => {
  const { isAuthenticated, profile } = useAuth();
  const { todayCalories, todayProtein, todayCarbs, todayFat } = useCalorieProgress();
  
  // Interactive state: cycle through metrics (calories -> protein -> carbs -> fats)
  const [currentMetric, setCurrentMetric] = React.useState(0); // 0=calories, 1=protein, 2=carbs, 3=fats
  const toggleMetric = () => setCurrentMetric(prev => (prev + 1) % 4);
  
  const calorieGoal = profile?.daily_calorie_goal || 0;
  if (!isAuthenticated || !calorieGoal) return null;

  // Macro goals based on profile and common nutritional guidelines
  const weightKg = profile?.weight_kg;
  const proteinGoal = weightKg ? Math.round(weightKg * 1.6) : Math.round((calorieGoal * 0.15) / 4);
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4); // 45% of calories from carbs
  const fatGoal = Math.round((calorieGoal * 0.30) / 9); // 30% of calories from fats

  const proteinConsumed = todayProtein || 0;
  const carbsConsumed = todayCarbs || 0;
  const fatConsumed = todayFat || 0;

  const caloriePercentRaw = (todayCalories / calorieGoal) * 100;
  const overGoal = caloriePercentRaw >= 100;
  const caloriePercent = Math.min(100, caloriePercentRaw);
  const proteinPercent = proteinGoal ? Math.min(100, (proteinConsumed / proteinGoal) * 100) : 0;
  const carbsPercent = carbsGoal ? Math.min(100, (carbsConsumed / carbsGoal) * 100) : 0;
  const fatPercent = fatGoal ? Math.min(100, (fatConsumed / fatGoal) * 100) : 0;

  // Geometry for 4 concentric rings with better proportions
  const size = 200;
  const stroke = 8;
  const spacing = 12;
  const calorieRadius = (size - stroke) / 2;
  const proteinRadius = calorieRadius - spacing;
  const carbsRadius = proteinRadius - spacing;
  const fatRadius = carbsRadius - spacing;
  
  const calorieCirc = 2 * Math.PI * calorieRadius;
  const proteinCirc = 2 * Math.PI * proteinRadius;
  const carbsCirc = 2 * Math.PI * carbsRadius;
  const fatCirc = 2 * Math.PI * fatRadius;
  
  const calorieOffset = calorieCirc - (caloriePercent / 100) * calorieCirc;
  const proteinOffset = proteinCirc - (proteinPercent / 100) * proteinCirc;
  const carbsOffset = carbsCirc - (carbsPercent / 100) * carbsCirc;
  const fatOffset = fatCirc - (fatPercent / 100) * fatCirc;

  const remaining = Math.max(0, calorieGoal - todayCalories);
  const statusText = overGoal ? `${Math.round(todayCalories - calorieGoal)} over` : `${Math.round(remaining)} left`;

  const arcGlow = overGoal ? 'drop-shadow-[0_0_6px_rgba(220,38,38,0.55)]' : 'drop-shadow-[0_0_6px_rgba(34,197,94,0.45)]';

  return (
    <div className="mb-12">
      <div
        className="group relative inline-flex flex-col items-center select-none cursor-pointer"
        onClick={toggleMetric}
        aria-label="Daily macro progress (click to cycle through calories, protein, carbs, fats)"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleMetric()}
      >
          {/* Desktop circle */}
        <div className="hidden sm:block relative">
          <motion.svg
            width={size}
            height={size}
            className="rotate-[-90deg]"
            initial={false}
          >
            <defs>
              <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="proteinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
              <linearGradient id="carbsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="fatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.1)" />
              </filter>
            </defs>
            {/* Track backgrounds with subtle styling */}
            <circle cx={size/2} cy={size/2} r={calorieRadius} strokeWidth={stroke} stroke="#f1f5f9" className="dark:stroke-gray-700" fill="none" opacity="0.3" />
            <circle cx={size/2} cy={size/2} r={proteinRadius} strokeWidth={stroke} stroke="#f1f5f9" className="dark:stroke-gray-700" fill="none" opacity="0.3" />
            <circle cx={size/2} cy={size/2} r={carbsRadius} strokeWidth={stroke} stroke="#f1f5f9" className="dark:stroke-gray-700" fill="none" opacity="0.3" />
            <circle cx={size/2} cy={size/2} r={fatRadius} strokeWidth={stroke} stroke="#f1f5f9" className="dark:stroke-gray-700" fill="none" opacity="0.3" />
            
            {/* Progress arcs with improved styling */}
            <motion.circle
              cx={size/2}
              cy={size/2}
              r={calorieRadius}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              stroke={overGoal ? '#dc2626' : 'url(#calorieGrad)'}
              strokeDasharray={calorieCirc}
              animate={{ strokeDashoffset: calorieOffset }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0 }}
              filter="url(#shadow)"
              opacity="0.9"
            />
            <motion.circle
              cx={size/2}
              cy={size/2}
              r={proteinRadius}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              stroke="url(#proteinGrad)"
              strokeDasharray={proteinCirc}
              animate={{ strokeDashoffset: proteinOffset }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
              filter="url(#shadow)"
              opacity="0.9"
            />
            <motion.circle
              cx={size/2}
              cy={size/2}
              r={carbsRadius}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              stroke="url(#carbsGrad)"
              strokeDasharray={carbsCirc}
              animate={{ strokeDashoffset: carbsOffset }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
              filter="url(#shadow)"
              opacity="0.9"
            />
            <motion.circle
              cx={size/2}
              cy={size/2}
              r={fatRadius}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              stroke="url(#fatGrad)"
              strokeDasharray={fatCirc}
              animate={{ strokeDashoffset: fatOffset }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
              filter="url(#shadow)"
              opacity="0.9"
            />
          </motion.svg>
          {/* Center content with better styling */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center rotate-0 pointer-events-none">
            <div className={`text-4xl font-black tracking-tight transition-all duration-300 ${overGoal ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {currentMetric === 0 ? Math.round(todayCalories) : 
               currentMetric === 1 ? `${Math.round(proteinConsumed)}g` :
               currentMetric === 2 ? `${Math.round(carbsConsumed)}g` :
               `${Math.round(fatConsumed)}g`}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              {currentMetric === 0 ? 'Calories' : 
               currentMetric === 1 ? 'Protein' :
               currentMetric === 2 ? 'Carbs' :
               'Fats'}
            </div>
            <div className="mt-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50">
              {currentMetric === 0 ? `${Math.round(caloriePercentRaw)}%` : 
               currentMetric === 1 ? `${Math.round(proteinPercent)}%` :
               currentMetric === 2 ? `${Math.round(carbsPercent)}%` :
               `${Math.round(fatPercent)}%`} • {statusText}
            </div>
          </div>
          {/* Enhanced legend */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-600 dark:text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 shadow-sm" />
              <span>{Math.round(todayCalories)}/{calorieGoal}kcal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 shadow-sm" />
              <span>{proteinConsumed}/{proteinGoal}g</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-sm" />
              <span>{carbsConsumed}/{carbsGoal}g</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-700 shadow-sm" />
              <span>{fatConsumed}/{fatGoal}g</span>
            </span>
          </div>
          {/* Enhanced hover tooltip */}
          <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 absolute -right-6 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-4 py-3 w-52 text-xs text-gray-600 dark:text-gray-300 pointer-events-none">
            <div className="font-bold mb-2 text-gray-900 dark:text-white">Daily Progress</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500"></span>
                  Calories
                </span>
                <span className="font-semibold">{Math.round(todayCalories)}/{calorieGoal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"></span>
                  Protein
                </span>
                <span className="font-semibold">{proteinConsumed}/{proteinGoal}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600"></span>
                  Carbs
                </span>
                <span className="font-semibold">{carbsConsumed}/{carbsGoal}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-700"></span>
                  Fats
                </span>
                <span className="font-semibold">{fatConsumed}/{fatGoal}g</span>
              </div>
              <div className="pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                <div className="flex justify-between"><span>Status</span><span className="font-semibold">{statusText}</span></div>
                <div className="text-[10px] text-gray-400 mt-1 italic">Click to cycle through metrics</div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile version */}
        <div className="sm:hidden relative" style={{ width: 120, height: 120 }}>
          <motion.svg
            width={120}
            height={120}
            className="rotate-[-90deg]"
            initial={false}
          >
            <circle cx={60} cy={60} r={50} strokeWidth={10} stroke="#e5e7eb" className="dark:stroke-gray-700" fill="none" />
            <motion.circle
              cx={60}
              cy={60}
              r={50}
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
              stroke={overGoal ? '#dc2626' : 'url(#calorieGrad)'}
              strokeDasharray={2 * Math.PI * 50}
              animate={{ strokeDashoffset: (2*Math.PI*50) - (caloriePercent/100)*(2*Math.PI*50) }}
              transition={{ type: 'spring', stiffness: 120, damping: 24 }}
              className={arcGlow}
            />
            <defs>
              <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </motion.svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <div className={`text-xl font-bold ${overGoal ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{Math.round(todayCalories)}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">kcal</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{Math.round(caloriePercentRaw)}%</div>
          </div>
          <div className="absolute -bottom-3 w-full text-center text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            {statusText}
          </div>
        </div>
      </div>
    </div>
  );
};
