import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CalorieProgressProvider } from './contexts/CalorieProgressContext'
import Header from './components/Header'
import Hero from './components/Hero'
import TextInputAnalyzer from './components/TextInputAnalyzer'
import ImageUploader from './components/ImageUploader'
import NutritionResults from './components/NutritionResults'
import OnboardingForm from './components/OnboardingForm'
import FoodDiaryModal from './components/FoodDiaryModal'
import AuthModal from './components/AuthModal'
import Footer from './components/Footer'

// Main App Content Component
function AppContent() {
  const { user, needsOnboarding, isLoading, completeOnboarding } = useAuth()
  const [nutritionData, setNutritionData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAnalyzingText, setIsAnalyzingText] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [clearImagePreview, setClearImagePreview] = useState(false)
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show onboarding form for authenticated users who need onboarding
  if (user && needsOnboarding) {
    return (
      <OnboardingForm 
        userId={user.id}
        userEmail={user.email}
        userName={user.name}
        onComplete={completeOnboarding}
      />
    )
  }

  // Helper function to add items to search history (keep only last 3)
  const addToSearchHistory = (searchItem) => {
    setSearchHistory(prev => {
      const newHistory = [searchItem, ...prev.filter(item => item.query !== searchItem.query)]
      return newHistory.slice(0, 3) // Keep only the most recent 3 searches
    })
  }

  // Helper function to check if status indicates success
  const isSuccessStatus = (status) => {
    return status === 'success' || 
           status === 'Dish analyzed successfully' || 
           (typeof status === 'string' && status.toLowerCase().includes('successfully'))
  }

  const handleTextAnalysis = async (foodText) => {
    setIsAnalyzingText(true)
    setNutritionData(null)

    try {
      console.log('Starting text analysis for:', foodText)
      
      // Create FormData for text input
      const formData = new FormData()
      formData.append('text', foodText)
      
      console.log('Sending text request to webhook...')

      // Send to the same webhook as image analysis
      const response = await fetch('https://submastery.app.n8n.cloud/webhook-test/Calapp', {
        method: 'POST',
        body: formData
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Raw webhook response:', data)
      
      // Process the webhook response for text input (same format as image)
      if (data && data.length > 0 && data[0].output) {
        const output = data[0].output
        
        // Check if the status indicates an error (no food items detected)
        if (!isSuccessStatus(output.status) && typeof output.status === 'string') {
          console.log('No food items detected:', output.status)
          setNutritionData({
            error: true,
            message: "Oops! Only food items allowed. Please describe what you ate, like 'grilled chicken with rice' or 'apple and peanut butter'."
          })
        } else if (isSuccessStatus(output.status)) {
          console.log('Processed text output:', output)
          setNutritionData(output)
          
          // Add to search history
          addToSearchHistory({
            type: 'text',
            query: foodText,
            timestamp: new Date().toLocaleString(),
            result: output
          })
        } else {
          throw new Error('Invalid response format from webhook')
        }
      } else {
        console.log('Invalid text response format:', data)
        throw new Error('Invalid response format from webhook')
      }
    } catch (error) {
      console.error('Error analyzing text:', error)
      // Set error state or fallback data
      setNutritionData({
        error: true,
        message: `Failed to analyze the food description: ${error.message}. Please try again.`
      })
    } finally {
      setIsAnalyzingText(false)
    }
  }

  const handleImageAnalysis = async (imageFile) => {
    setIsAnalyzing(true)
    setNutritionData(null)

    try {
      console.log('Starting image analysis...')
      
      // Create FormData for image upload
      const formData = new FormData()
      formData.append('image', imageFile)
      
      console.log('Sending request to webhook...')

      // Send to webhook
      const response = await fetch('https://submastery.app.n8n.cloud/webhook-test/Calapp', {
        method: 'POST',
        body: formData
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Raw webhook response:', data)
      
      // Process the webhook response
      if (data && data.length > 0 && data[0].output && isSuccessStatus(data[0].output.status)) {
        const output = data[0].output
        console.log('Processed output:', output)
        setNutritionData(output)
        
        // Add to search history
        addToSearchHistory({
          type: 'image',
          query: imageFile.name || 'Image Upload',
          timestamp: new Date().toLocaleString(),
          result: output
        })
      } else {
        console.log('Invalid response format:', data)
        throw new Error('Invalid response format from webhook')
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      // Set error state or fallback data
      setNutritionData({
        error: true,
        message: `Failed to analyze the image: ${error.message}. Please try again.`
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Function to rerun a previous search
  const handleRerunSearch = (historyItem) => {
    // Always show the stored result instantly without loading
    setNutritionData(historyItem.result)
  }

  const handleAnalyzeAnother = () => {
    setNutritionData(null)
    setIsAnalyzing(false)
    setIsAnalyzingText(false)
    setClearImagePreview(true) // Trigger image preview clearing
    // Reset the clear flag after a brief moment
    setTimeout(() => setClearImagePreview(false), 100)
  }

  // Test function with mock data to verify display functionality
  const handleTestWithMockData = () => {
    const mockData = {
      status: "success",
      food: [
        {
          name: "Grilled Salmon",
          quantity: "150 grams",
          calories: 280,
          protein: 30,
          carbs: 0,
          fat: 18
        },
        {
          name: "Asparagus",
          quantity: "100 grams", 
          calories: 20,
          protein: 2.2,
          carbs: 3.7,
          fat: 0.2
        },
        {
          name: "Cherry Tomatoes",
          quantity: "2 pieces",
          calories: 6,
          protein: 0.1,
          carbs: 1.3,
          fat: 0.1
        }
      ],
      total: {
        calories: 306,
        protein: 32.3,
        carbs: 5.0,
        fat: 18.3
      }
    }
    setNutritionData(mockData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} />
      <main>
        <Hero />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <TextInputAnalyzer 
            onTextAnalysis={handleTextAnalysis}
            isAnalyzing={isAnalyzingText}
            onMockData={handleTestWithMockData}
            searchHistory={searchHistory}
            onRerunSearch={handleRerunSearch}
          />
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
            </div>
          </div>
          
          <ImageUploader 
            onImageUpload={handleImageAnalysis}
            isAnalyzing={isAnalyzing}
            clearPreview={clearImagePreview}
          />
          {nutritionData && (
            <NutritionResults 
              data={nutritionData} 
              onAnalyzeAnother={handleAnalyzeAnother}
            />
          )}
        </div>
      </main>

      {/* Diary Button - Branded Floating Action (expands on hover) */}
      {user && (
        <button
          onClick={() => setIsDiaryOpen(true)}
          aria-label="Open Food Diary"
          title="Open Food Diary"
          className="group fixed bottom-6 left-6 z-40 flex items-center rounded-full bg-gradient-to-br from-brand-green to-brand-orange p-[3px] shadow-elevate hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-green/40 transition-all"
        >
          <span className="flex items-center rounded-full bg-white dark:bg-gray-900 pl-3 pr-3 sm:pr-4 py-2">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-white shadow-inner transition-transform duration-300 group-hover:scale-110">
              {/* Custom brandable diary icon (nutrition journal) */}
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                {/* Book outline */}
                <path d="M6.5 4.5h7.5a3.5 3.5 0 0 1 3.5 3.5v9.75c0 .414-.336.75-.75.75H6.5A2.5 2.5 0 0 1 4 16v-9A2.5 2.5 0 0 1 6.5 4.5Z" fill="url(#gradPages)" stroke="#16A34A" />
                <path d="M14 4.5v14" stroke="#0F5132" opacity=".25" />
                {/* Fork */}
                <path d="M9.2 8v2.2M10.4 8v2.2M8 8v2.2" stroke="#0F5132" strokeWidth="1.4" />
                <path d="M9.2 10.2v2.3" stroke="#0F5132" strokeWidth="1.4" strokeLinecap="round" />
                {/* Leaf / vitality mark */}
                <path d="M16.2 9.4c1.1-.9 1.9-1.3 2.8-1.4-.2 1-.7 1.9-1.6 2.9-.8.9-1.9 1.6-3 2 .4-1.3 1-2.6 1.8-3.5Z" fill="#FFB703" stroke="#FFB703" strokeWidth=".5" />
                <defs>
                  <linearGradient id="gradPages" x1="4" x2="18" y1="4" y2="19" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#F1F5F9" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            {/* Expanding label (hidden on very small screens) */}
            <span className="ml-2 font-semibold text-sm text-gray-900 dark:text-gray-100 max-w-0 overflow-hidden opacity-0 translate-x-[-4px] group-hover:translate-x-0 group-hover:max-w-[90px] group-hover:opacity-100 transition-all duration-300 ease-out hidden xs:inline-block">
              Diary
            </span>
          </span>
        </button>
      )}

      {/* Food Diary Modal */}
      <FoodDiaryModal 
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
      />

      {/* Auth Modal - Rendered at App level to escape stacking contexts */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Footer />
    </div>
  )
}

// Main App Component with Providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CalorieProgressProvider>
          <AppContent />
        </CalorieProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
