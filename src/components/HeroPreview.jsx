// HeroPreview: Visual sample card to build trust by showing an example output without requiring user action.
import { motion } from 'framer-motion'

const HeroPreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-white shadow-elevate rounded-2xl p-6 border border-gray-100 relative overflow-hidden"
      aria-label="Sample nutrition analysis preview"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-brand-green/10 to-brand-orange/10 rounded-full blur-2xl" />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Grilled Chicken Bowl</h3>
          <p className="text-sm text-gray-500">Example Meal • Portion: 1 bowl</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
          ✓ Accurate Macros
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Calories', value: 520, unit: 'kcal', color: 'bg-orange-50 text-orange-600' },
          { label: 'Protein', value: 42, unit: 'g', color: 'bg-brand-green/10 text-brand-green' },
          { label: 'Carbs', value: 48, unit: 'g', color: 'bg-blue-50 text-blue-600' },
          { label: 'Fat', value: 18, unit: 'g', color: 'bg-pink-50 text-pink-600' },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className={`text-sm font-semibold rounded-lg px-2 py-1 ${stat.color}`}>{stat.value}{stat.unit}</div>
            <div className="text-[11px] uppercase tracking-wide mt-1 text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2 relative z-10">
        {[
          { name: 'Grilled Chicken Breast', protein: 32, carbs: 0, fat: 8 },
          { name: 'Quinoa (cooked)', protein: 8, carbs: 30, fat: 3 },
          { name: 'Roasted Veggies', protein: 2, carbs: 12, fat: 4 },
        ].map(item => (
          <div key={item.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <span className="text-sm text-gray-700 font-medium truncate pr-2">{item.name}</span>
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <span className="text-brand-green">P{item.protein}</span>
              <span className="text-blue-600">C{item.carbs}</span>
              <span className="text-pink-600">F{item.fat}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-gray-400">Live analysis varies. This is illustrative only.</p>
    </motion.div>
  )
}

export default HeroPreview
