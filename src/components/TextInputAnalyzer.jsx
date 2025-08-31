import React, { useState } from 'react'

const TextInputAnalyzer = ({ onTextAnalysis, isAnalyzing, onMockData, searchHistory = [], onRerunSearch }) => {
  const [foodText, setFoodText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceError, setVoiceError] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recognition, setRecognition] = useState(null)
  const [justTranscribed, setJustTranscribed] = useState(false)

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

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      setVoiceError(null)
      
      // Check if Web Speech API is supported
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognitionInstance = new SpeechRecognition()
        
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'en-US'
        
        recognitionInstance.onstart = () => {
          setIsRecording(true)
          console.log('Voice recognition started')
        }
        
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          console.log('Voice transcript:', transcript)
          setFoodText(transcript)
          setIsRecording(false)
          setJustTranscribed(true)
          // Auto-hide the transcription success message after 3 seconds
          setTimeout(() => setJustTranscribed(false), 3000)
        }
        
        recognitionInstance.onerror = (event) => {
          console.error('Voice recognition error:', event.error)
          setVoiceError(getVoiceErrorMessage(event.error))
          setIsRecording(false)
        }
        
        recognitionInstance.onend = () => {
          setIsRecording(false)
        }
        
        setRecognition(recognitionInstance)
        recognitionInstance.start()
      } else {
        throw new Error('Speech recognition not supported in this browser')
      }
    } catch (error) {
      console.error('Voice recording error:', error)
      setVoiceError('Voice recording not supported in this browser. Please use Chrome or Safari.')
      setIsRecording(false)
    }
  }

  const stopVoiceRecording = () => {
    if (recognition) {
      recognition.stop()
    }
    setIsRecording(false)
  }

  const getVoiceErrorMessage = (errorType) => {
    switch (errorType) {
      case 'no-speech':
        return 'No speech detected. Please try speaking again.'
      case 'audio-capture':
        return 'Microphone not accessible. Please check your microphone settings.'
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone permissions.'
      case 'network':
        return 'Network error occurred. Please check your connection.'
      default:
        return 'Voice recognition failed. Please try again.'
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (foodText.trim()) {
      onTextAnalysis(foodText.trim())
      setJustTranscribed(false) // Clear transcription notification when analyzing
    }
  }

  const handleTextChange = (e) => {
    setFoodText(e.target.value)
    setJustTranscribed(false) // Clear transcription notification when user types
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
    <div id="describe" className="card-surface mb-8 p-6 sm:p-8 relative overflow-hidden">
      {/* Background aura for subtle depth */}
      <div className="absolute -top-20 -right-14 w-64 h-64 bg-gradient-to-br from-brand-green/5 to-brand-orange/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Describe Your Meal</h2>
            <p className="text-sm text-gray-600 max-w-md">Be specific: include cooking method, portion size, and sides (e.g., "grilled salmon 150g with quinoa and roasted veggies").</p>
          </div>
          <span className="hidden sm:inline-flex items-center text-xs font-medium bg-brand-orange/15 text-brand-orange px-3 py-1 rounded-full border border-brand-orange/30">AI Powered</span>
        </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Analyzing your meal description...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few seconds</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative group">
              <label htmlFor="meal-desc" className="sr-only">Meal description</label>
              <textarea
                id="meal-desc"
                value={foodText}
                onChange={handleTextChange}
                placeholder="e.g. grilled chicken breast (200g) with brown rice and steamed broccoli"
                className="w-full h-40 leading-relaxed px-4 py-4 pr-16 rounded-2xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-400 text-sm shadow-inner transition-colors"
                maxLength={500}
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-focus-within:border-brand-green/40" />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {foodText.length}/500
                </span>
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={isAnalyzing}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isRecording ? 'Stop recording' : 'Start voice recording'}
                >
                  {isRecording ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Voice Transcription Success */}
            {justTranscribed && (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-800 border border-green-200 dark:border-green-700 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Voice transcribed successfully! Review the text above and click "Analyze Nutrition" when ready.
                </p>
              </div>
            )}
            
            {/* Voice Error Message */}
            {voiceError && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-800 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {voiceError}
                </p>
              </div>
            )}

            {/* Recording Status */}
            {isRecording && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-800 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                  <svg className="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Listening... Speak now to describe your meal.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mt-5">
              <button
                id="analyze-btn"
                type="submit"
                disabled={!foodText.trim() || isAnalyzing}
                className="btn-brand-primary w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analyze Nutrition
              </button>
              <button
                type="button"
                onClick={handleTestWithMockText}
                className="btn-brand-secondary w-full sm:w-auto justify-center"
              >
                Use sample data
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500">Need inspiration? Try: "overnight oats with almond milk, chia seeds, blueberries"</p>
          </form>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
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
                      className="bg-white dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => onRerunSearch(item)}
                    >
                      {/* Header with food heading and timestamp */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">
                            {heading}
                          </h5>
                          <div className="flex items-center space-x-2 mt-1">
                            {item.type === 'text' ? (
                              <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
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
                              <div className="bg-red-50 dark:bg-red-800 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                  {Math.round(macros.calories)}
                                </div>
                                <div className="text-xs text-red-500 dark:text-red-400 font-medium mb-1">Calories</div>
                                <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-red-600 dark:bg-red-400"
                                    style={{ width: `${caloriesPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-800 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {Math.round(macros.protein)}g
                                </div>
                                <div className="text-xs text-blue-500 dark:text-blue-400 font-medium mb-1">Protein</div>
                                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                                    style={{ width: `${proteinPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="bg-yellow-50 dark:bg-yellow-800 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                  {Math.round(macros.carbs)}g
                                </div>
                                <div className="text-xs text-yellow-500 dark:text-yellow-400 font-medium mb-1">Carbs</div>
                                <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-yellow-600 dark:bg-yellow-400"
                                    style={{ width: `${carbsPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="bg-green-50 dark:bg-green-800 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {Math.round(macros.fat)}g
                                </div>
                                <div className="text-xs text-green-500 dark:text-green-400 font-medium mb-1">Fat</div>
                                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-green-600 dark:bg-green-400"
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4">
              <h5 className="text-xs font-semibold text-brand-green mb-2 tracking-wide uppercase">📝 Text & Voice Input</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Include quantities (e.g., 200g chicken)</li>
                <li>• Add cooking method (grilled / baked)</li>
                <li>• List sides & sauces</li>
                <li>• One meal per analysis for clarity</li>
              </ul>
            </div>
            <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-4">
              <h5 className="text-xs font-semibold text-brand-orange mb-2 tracking-wide uppercase">🎤 Voice Recording</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Speak clearly at normal pace</li>
                <li>• Minimize background noise</li>
                <li>• Review text before analyzing</li>
                <li>• Stop recording if done early</li>
              </ul>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}

export default TextInputAnalyzer
