import React, { useState } from 'react'

const TextInputAnalyzer = ({ onTextAnalysis, isAnalyzing, onMockData }) => {
  const [foodText, setFoodText] = useState('')
  const [suggestions] = useState([
    'Grilled chicken breast with rice and broccoli',
    'Greek yogurt with berries and granola',
    'Salmon fillet with quinoa and asparagus',
    'Turkey sandwich with avocado and tomato',
    'Oatmeal with banana and almonds'
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (foodText.trim()) {
      onTextAnalysis(foodText.trim())
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setFoodText(suggestion)
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

          {/* Quick Suggestions */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Quick Suggestions:
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors duration-200 border"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

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
