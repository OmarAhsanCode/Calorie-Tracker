import React, { useState } from 'react'

const TextInputAnalyzer = ({ onTextAnalysis, isAnalyzing, onMockData, searchHistory = [], onRerunSearch }) => {
  const [foodText, setFoodText] = useState('')

  // Helper function to generate food heading and description from result
  const getFoodDisplayInfo = (item) => {
    const result = item.result
    
    if (!result.food || result.food.length === 0) {
      return {
        heading: item.type === 'text' ? item.query : 'Image Analysis',
        description: 'No food items detected',
        macros: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      }
    }

    // Create heading from food names
    const foodNames = result.food.map(food => food.name).slice(0, 3) // Show max 3 items
    const heading = foodNames.length > 3 
      ? `${foodNames.slice(0, 2).join(', ')} & ${foodNames.length - 2} more`
      : foodNames.join(', ')

    // Create description from quantities and details
    const description = result.food.length === 1 
      ? `${result.food[0].quantity || 'Serving'}`
      : `${result.food.length} food items`

    // Get macros from total
    const macros = result.total || { calories: 0, protein: 0, carbs: 0, fat: 0 }

    return { heading, description, macros }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (foodText.trim()) {
      onTextAnalysis(foodText.trim())
    }
  }

  const handleTestWithMockText = () => {
    // Set the text to match our mock data
    setFoodText("Grilled chicken breast with brown rice and steamed broccoli")
    
    // Trigger the mock data function from parent if available
    if (onMockData) {
      onMockData()
    } else {
      // Fallback to text analysis
      onTextAnalysis("Grilled chicken breast with brown rice and steamed broccoli")
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Describe Your Meal
        </h2>
        <p className="text-gray-600">
          Type what you ate and get instant nutrition analysis
        </p>
      </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Analyzing your meal description...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <textarea
                value={foodText}
                onChange={(e) => setFoodText(e.target.value)}
                placeholder="Describe what you ate... (e.g., grilled chicken breast with quinoa and vegetables)"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-gray-900 placeholder-gray-500"
                maxLength={500}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {foodText.length}/500
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                type="submit"
                disabled={!foodText.trim() || isAnalyzing}
                className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analyze Nutrition
              </button>
              
              <button
                type="button"
                onClick={handleTestWithMockText}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Test with Sample Data
              </button>
            </div>
          </form>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Searches
              </h4>
              <div className="space-y-3">
                {searchHistory.map((item, index) => {
                  const { heading, description, macros } = getFoodDisplayInfo(item)
                  
                  return (
                    <div 
                      key={index}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => onRerunSearch(item)}
                    >
                      {/* Header with food heading and timestamp */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 text-base leading-tight">
                            {heading}
                          </h5>
                          <div className="flex items-center space-x-2 mt-1">
                            {item.type === 'text' ? (
                              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            <span className="text-xs text-gray-500">{item.timestamp}</span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3">
                        {description}
                      </p>

                      {/* Macros and Calories */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(() => {
                          // Calculate percentages relative to this meal's macros
                          const totalMacroCalories = (macros.protein * 4) + (macros.carbs * 4) + (macros.fat * 9)
                          const proteinPercentage = totalMacroCalories > 0 ? (macros.protein * 4 / totalMacroCalories) * 100 : 0
                          const carbsPercentage = totalMacroCalories > 0 ? (macros.carbs * 4 / totalMacroCalories) * 100 : 0
                          const fatPercentage = totalMacroCalories > 0 ? (macros.fat * 9 / totalMacroCalories) * 100 : 0
                          const caloriesPercentage = macros.calories > 0 ? 100 : 0 // Calories always 100% if present
                          
                          return (
                            <>
                              <div className="bg-red-50 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-red-600">
                                  {Math.round(macros.calories)}
                                </div>
                                <div className="text-xs text-red-500 font-medium mb-1">Calories</div>
                                <div className="w-full bg-red-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-red-600"
                                    style={{ width: `${caloriesPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-blue-600">
                                  {Math.round(macros.protein)}g
                                </div>
                                <div className="text-xs text-blue-500 font-medium mb-1">Protein</div>
                                <div className="w-full bg-blue-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-blue-600"
                                    style={{ width: `${proteinPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="bg-yellow-50 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-yellow-600">
                                  {Math.round(macros.carbs)}g
                                </div>
                                <div className="text-xs text-yellow-500 font-medium mb-1">Carbs</div>
                                <div className="w-full bg-yellow-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-yellow-600"
                                    style={{ width: `${carbsPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="bg-green-50 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-green-600">
                                  {Math.round(macros.fat)}g
                                </div>
                                <div className="text-xs text-green-500 font-medium mb-1">Fat</div>
                                <div className="w-full bg-green-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-green-600"
                                    style={{ width: `${fatPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Tips for better results:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include quantities when possible (e.g., "200g chicken breast")</li>
              <li>• Mention cooking methods (e.g., "grilled", "baked", "fried")</li>
              <li>• List all ingredients and sides</li>
              <li>• Be specific about portions and sizes</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default TextInputAnalyzer
