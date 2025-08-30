import React, { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ImageUploader from './components/ImageUploader'
import NutritionResults from './components/NutritionResults'
import Footer from './components/Footer'

function App() {
  const [nutritionData, setNutritionData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
      if (data && data.length > 0 && data[0].output && data[0].output.status === 'success') {
        const output = data[0].output
        console.log('Processed output:', output)
        setNutritionData(output)
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

  const handleAnalyzeAnother = () => {
    setNutritionData(null)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <main>
        <Hero />
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Test button - remove in production */}
          <div className="text-center mb-4">
            <button 
              onClick={handleTestWithMockData}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Test with Mock Data
            </button>
          </div>
          
          <ImageUploader 
            onImageUpload={handleImageAnalysis}
            isAnalyzing={isAnalyzing}
          />
          {nutritionData && (
            <NutritionResults 
              data={nutritionData} 
              onAnalyzeAnother={handleAnalyzeAnother}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
