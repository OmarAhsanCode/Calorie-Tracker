import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { foodService } from '../lib/supabase'
import ShareModal from './ShareModal'

const NutritionResults = ({ data, onAnalyzeAnother }) => {
  const { user, isAuthenticated } = useAuth()
  const [showShareModal, setShowShareModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState('lunch')

  const mealTypes = [
    { value: 'breakfast', label: '🌅 Breakfast' },
    { value: 'lunch', label: '☀️ Lunch' },
    { value: 'dinner', label: '🌙 Dinner' },
    { value: 'snack', label: '🍪 Snack' }
  ]

  const handleSaveResults = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save your nutrition results!')
      return
    }

    setIsSaving(true)
    try {
      console.log('Saving results for user:', user.id)
      console.log('Nutrition data:', data)

      // Extract nutrition data from the AI response
      let nutritionData = data
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        nutritionData = data[0].output
      }

      const { food = [] } = nutritionData
      
      if (!food || food.length === 0) {
        alert('No food items to save!')
        return
      }

      // Save each food item to the database
      const savedEntries = []
      for (const foodItem of food) {
        const entryData = {
          user_id: user.id,
          food_description: foodItem.name || 'Unknown food',
          ai_calculated_calories: parseFloat(foodItem.calories) || 0,
          ai_calculated_protein: parseFloat(foodItem.protein) || 0,
          ai_calculated_carbs: parseFloat(foodItem.carbs) || 0,
          ai_calculated_fat: parseFloat(foodItem.fat) || 0,
          ai_calculated_quantity: foodItem.quantity || '',
          meal_type: selectedMealType,
          date: new Date().toISOString().split('T')[0] // Today's date
        }

        console.log('Saving food entry:', entryData)
        const savedEntry = await foodService.addFoodEntry(entryData)
        savedEntries.push(savedEntry)
      }

      console.log('All entries saved successfully:', savedEntries)
      alert(`✅ Successfully saved ${savedEntries.length} food item(s) to your diary!`)
      
    } catch (error) {
      console.error('Error saving food entries:', error)
      alert('❌ Failed to save results. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareResults = async () => {
    // Open the advanced share modal instead of immediate sharing
    setShowShareModal(true)
  }
  // Handle error state
  if (data.error) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833-.228 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Oops! Only Food Items Allowed</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{data.message}</p>
          <div className="bg-blue-50 dark:bg-blue-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Try describing food like this:
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>• "Grilled chicken breast with brown rice"</p>
              <p>• "Greek yogurt with berries and granola"</p>
              <p>• "Salmon fillet with quinoa and vegetables"</p>
              <p>• "Turkey sandwich with avocado"</p>
            </div>
          </div>
          <button 
            className="btn-primary"
            onClick={onAnalyzeAnother}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Handle the new array-based output format
  let nutritionData = data
  
  // If data is an array, extract the first element's output
  if (Array.isArray(data) && data.length > 0 && data[0].output) {
    nutritionData = data[0].output
  }
  
  // Extract data from the nutrition analysis
  const { food = [], total = {}, status } = nutritionData
  const { calories = 0, protein = 0, carbs = 0, fat = 0 } = total

  // If status shows not analyzed or no food detected
  if (status && status !== 'Analyzed' && (!food || food.length === 0)) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833-.228 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Food Detected</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Status: {status || 'Unknown'}. Please try with a clearer image or description of food items.
          </p>
          <button 
            className="btn-primary"
            onClick={onAnalyzeAnother}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const MacroCard = ({ label, value, unit, color, percentage }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
        <span className={`text-2xl font-bold ${color}`}>
          {value}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )

  // Calculate percentages for visual bars (simplified)
  const totalMacros = protein * 4 + carbs * 4 + fat * 9 // calories from macros
  const proteinPercentage = (protein * 4 / totalMacros) * 100
  const carbsPercentage = (carbs * 4 / totalMacros) * 100
  const fatPercentage = (fat * 9 / totalMacros) * 100

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Nutrition Analysis
        </h3>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-accent-500 dark:bg-accent-400 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {food.length} item{food.length !== 1 ? 's' : ''} detected
          </span>
        </div>
      </div>

      {/* Total Calories */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-700 dark:to-primary-800 rounded-lg p-6 mb-6 text-white text-center">
        <h4 className="text-lg font-medium mb-2">Total Calories</h4>
        <p className="text-4xl font-bold">{calories}</p>
        <p className="text-primary-100 dark:text-primary-200">kcal</p>
      </div>

      {/* Macronutrients */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MacroCard 
          label="Protein" 
          value={protein} 
          unit="g" 
          color="text-red-600 dark:text-red-400" 
          percentage={proteinPercentage}
        />
        <MacroCard 
          label="Carbohydrates" 
          value={carbs} 
          unit="g" 
          color="text-blue-600 dark:text-blue-400" 
          percentage={carbsPercentage}
        />
        <MacroCard 
          label="Fat" 
          value={fat} 
          unit="g" 
          color="text-yellow-600 dark:text-yellow-400" 
          percentage={fatPercentage}
        />
      </div>

      {/* Detected Food Items */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detected Food Items
        </h4>
        <div className="space-y-3">
          {food.map((item, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex justify-between items-center">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 dark:text-white">{item.name}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.quantity}</p>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.calories}</p>
                  <p className="text-gray-500 dark:text-gray-400">cal</p>
                </div>
                <div>
                  <p className="font-semibold text-red-600 dark:text-red-400">{item.protein}g</p>
                  <p className="text-gray-500 dark:text-gray-400">protein</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{item.carbs}g</p>
                  <p className="text-gray-500 dark:text-gray-400">carbs</p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-600 dark:text-yellow-400">{item.fat}g</p>
                  <p className="text-gray-500 dark:text-gray-400">fat</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
        {/* Meal Type Selection */}
        {isAuthenticated && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Save as which meal?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mealTypes.map(meal => (
                <button
                  key={meal.value}
                  onClick={() => setSelectedMealType(meal.value)}
                  className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                    selectedMealType === meal.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {meal.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            className={`btn-primary flex-1 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSaveResults}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (isAuthenticated ? 'Save Results' : 'Sign In to Save')}
          </button>
          <button 
            className="btn-secondary flex-1"
            onClick={onAnalyzeAnother}
          >
            Analyze Another
          </button>
          <button 
            className="btn-secondary"
            onClick={handleShareResults}
          >
            Share Results
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)}
        nutritionData={data}
      />
    </div>
  )
}

export default NutritionResults
