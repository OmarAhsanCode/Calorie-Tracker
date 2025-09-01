import React, { useState, useRef } from 'react'

const ShareModal = ({ isOpen, onClose, nutritionData }) => {
  const [shareFormat, setShareFormat] = useState('summary')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const canvasRef = useRef(null)
  
  if (!isOpen) return null

  // Handle the new array-based output format
  let data = nutritionData
  if (Array.isArray(nutritionData) && nutritionData.length > 0 && nutritionData[0].output) {
    data = nutritionData[0].output
  }
  
  const { food = [], total = {} } = data
  const { calories = 0, protein = 0, carbs = 0, fat = 0 } = total

  const generateNutritionImage = async () => {
    setIsGeneratingImage(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Calculate dynamic height based on food items
      const baseHeight = 450
      const foodItemHeight = 90
      canvas.width = 800
      canvas.height = baseHeight + (food.length * foodItemHeight) + 100
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#f8fafc')
      gradient.addColorStop(1, '#e2e8f0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Header with better styling
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 48px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🍽️ Detailed Nutrition Report', canvas.width / 2, 80)
      
      ctx.font = '24px Arial, sans-serif'
      ctx.fillStyle = '#6b7280'
      ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, 115)
      
      // Main nutrition summary box
      const boxY = 150
      const boxHeight = 220
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 4
      ctx.fillRect(50, boxY, canvas.width - 100, boxHeight)
      ctx.shadowBlur = 0
      
      // Total calories (center, larger)
      ctx.fillStyle = '#dc2626'
      ctx.font = 'bold 72px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(Math.round(calories), canvas.width / 2, boxY + 80)
      
      ctx.fillStyle = '#374151'
      ctx.font = '24px Arial, sans-serif'
      ctx.fillText('TOTAL CALORIES', canvas.width / 2, boxY + 110)
      
      // Macros breakdown with better spacing
      const macroY = boxY + 170
      const macroSpacing = (canvas.width - 100) / 3
      
      // Protein
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 36px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.round(protein)}g`, 50 + macroSpacing * 0.5, macroY)
      ctx.fillStyle = '#374151'
      ctx.font = '16px Arial, sans-serif'
      ctx.fillText('PROTEIN', 50 + macroSpacing * 0.5, macroY + 25)
      ctx.font = '12px Arial, sans-serif'
      ctx.fillStyle = '#6b7280'
      ctx.fillText(`${Math.round((protein * 4 / calories) * 100)}% of calories`, 50 + macroSpacing * 0.5, macroY + 40)
      
      // Carbs
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 36px Arial, sans-serif'
      ctx.fillText(`${Math.round(carbs)}g`, 50 + macroSpacing * 1.5, macroY)
      ctx.fillStyle = '#374151'
      ctx.font = '16px Arial, sans-serif'
      ctx.fillText('CARBOHYDRATES', 50 + macroSpacing * 1.5, macroY + 25)
      ctx.font = '12px Arial, sans-serif'
      ctx.fillStyle = '#6b7280'
      ctx.fillText(`${Math.round((carbs * 4 / calories) * 100)}% of calories`, 50 + macroSpacing * 1.5, macroY + 40)
      
      // Fat
      ctx.fillStyle = '#8b5cf6'
      ctx.font = 'bold 36px Arial, sans-serif'
      ctx.fillText(`${Math.round(fat)}g`, 50 + macroSpacing * 2.5, macroY)
      ctx.fillStyle = '#374151'
      ctx.font = '16px Arial, sans-serif'
      ctx.fillText('FAT', 50 + macroSpacing * 2.5, macroY + 25)
      ctx.font = '12px Arial, sans-serif'
      ctx.fillStyle = '#6b7280'
      ctx.fillText(`${Math.round((fat * 9 / calories) * 100)}% of calories`, 50 + macroSpacing * 2.5, macroY + 40)
      
      // Food items section with enhanced details
      let currentY = 420
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 32px Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Food Breakdown (${food.length} item${food.length !== 1 ? 's' : ''}):`, 50, currentY)
      
      currentY += 50
      
      // Enhanced food item listing
      food.forEach((item) => {
        if (currentY > canvas.height - 150) return // Prevent overflow
        
        // Food item container with border
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
        ctx.shadowBlur = 6
        ctx.shadowOffsetY = 2
        ctx.fillRect(50, currentY - 35, canvas.width - 100, 80)
        ctx.shadowBlur = 0
        
        // Add subtle border
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        ctx.strokeRect(50, currentY - 35, canvas.width - 100, 80)
        
        // Food name (larger and bold)
        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 24px Arial, sans-serif'
        ctx.textAlign = 'left'
        const name = item.name || 'Unknown Food'
        const truncatedName = name.length > 32 ? name.substring(0, 32) + '...' : name
        ctx.fillText(truncatedName, 70, currentY - 5)
        
        // Quantity with better formatting
        ctx.fillStyle = '#6b7280'
        ctx.font = '16px Arial, sans-serif'
        ctx.fillText(`Quantity: ${item.quantity || 'N/A'}`, 70, currentY + 20)
        
        // Calories (prominent on right)
        ctx.fillStyle = '#dc2626'
        ctx.font = 'bold 28px Arial, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`${Math.round(item.calories || 0)}`, canvas.width - 120, currentY - 2)
        ctx.fillStyle = '#374151'
        ctx.font = '14px Arial, sans-serif'
        ctx.fillText('calories', canvas.width - 120, currentY + 15)
        
        // Detailed macro breakdown (right side, smaller)
        ctx.fillStyle = '#22c55e'
        ctx.font = 'bold 14px Arial, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`P: ${Math.round(item.protein || 0)}g`, canvas.width - 200, currentY + 35)
        
        ctx.fillStyle = '#f59e0b'
        ctx.fillText(`C: ${Math.round(item.carbs || 0)}g`, canvas.width - 150, currentY + 35)
        
        ctx.fillStyle = '#8b5cf6'
        ctx.fillText(`F: ${Math.round(item.fat || 0)}g`, canvas.width - 100, currentY + 35)
        
        currentY += 90
      })
      
      // Enhanced footer with branding
      ctx.fillStyle = '#374151'
      ctx.font = 'bold 20px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('💪 Keep tracking with CaloFit', canvas.width / 2, canvas.height - 40)
      
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial, sans-serif'
      ctx.fillText('Your personalized nutrition analysis tool', canvas.width / 2, canvas.height - 15)
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nutrition-report-${new Date().toISOString().split('T')[0]}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        showSuccess('Nutrition image downloaded!')
      }, 'image/png')
      
    } catch (error) {
      console.error('Error generating image:', error)
      showSuccess('Failed to generate image. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const shareImageViaWebAPI = async () => {
    setIsGeneratingImage(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Calculate dynamic height based on food items
      const baseHeight = 300
      const foodItemHeight = 60
      const maxFoodItems = Math.min(food.length, 6) // Limit to 6 items for sharing
      canvas.width = 600
      canvas.height = baseHeight + (maxFoodItems * foodItemHeight) + 80
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#f8fafc')
      gradient.addColorStop(1, '#e2e8f0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Header
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 28px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🍽️ My Nutrition Report', canvas.width / 2, 40)
      
      // Main nutrition summary box
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 2
      ctx.fillRect(30, 60, canvas.width - 60, 120)
      ctx.shadowBlur = 0
      
      // Calories (center)
      ctx.fillStyle = '#dc2626'
      ctx.font = 'bold 42px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(Math.round(calories), canvas.width / 2, 110)
      ctx.fillStyle = '#374151'
      ctx.font = '16px Arial, sans-serif'
      ctx.fillText('CALORIES', canvas.width / 2, 130)
      
      // Macros row
      const macroY = 165
      const macroSpacing = (canvas.width - 60) / 3
      
      // Protein
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 18px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.round(protein)}g`, 30 + macroSpacing * 0.5, macroY)
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial, sans-serif'
      ctx.fillText('PROTEIN', 30 + macroSpacing * 0.5, macroY + 15)
      
      // Carbs
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 18px Arial, sans-serif'
      ctx.fillText(`${Math.round(carbs)}g`, 30 + macroSpacing * 1.5, macroY)
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial, sans-serif'
      ctx.fillText('CARBS', 30 + macroSpacing * 1.5, macroY + 15)
      
      // Fat
      ctx.fillStyle = '#8b5cf6'
      ctx.font = 'bold 18px Arial, sans-serif'
      ctx.fillText(`${Math.round(fat)}g`, 30 + macroSpacing * 2.5, macroY)
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial, sans-serif'
      ctx.fillText('FAT', 30 + macroSpacing * 2.5, macroY + 15)
      
      // Food items section
      let currentY = 220
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 20px Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('What I Ate:', 30, currentY)
      
      currentY += 35
      
      // List food items with nutritional content
      food.slice(0, maxFoodItems).forEach((item) => {
        // Food item background
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.05)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 1
        ctx.fillRect(30, currentY - 25, canvas.width - 60, 50)
        ctx.shadowBlur = 0
        
        // Food name
        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 16px Arial, sans-serif'
        ctx.textAlign = 'left'
        const name = item.name || 'Unknown Food'
        const truncatedName = name.length > 25 ? name.substring(0, 25) + '...' : name
        ctx.fillText(truncatedName, 45, currentY - 5)
        
        // Quantity
        ctx.fillStyle = '#6b7280'
        ctx.font = '12px Arial, sans-serif'
        ctx.fillText(item.quantity || 'N/A', 45, currentY + 10)
        
        // Nutritional info (right side)
        ctx.fillStyle = '#dc2626'
        ctx.font = 'bold 14px Arial, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`${Math.round(item.calories || 0)} cal`, canvas.width - 45, currentY - 8)
        
        // Macro breakdown (smaller text)
        ctx.fillStyle = '#6b7280'
        ctx.font = '10px Arial, sans-serif'
        const macroText = `P:${Math.round(item.protein || 0)}g C:${Math.round(item.carbs || 0)}g F:${Math.round(item.fat || 0)}g`
        ctx.fillText(macroText, canvas.width - 45, currentY + 8)
        
        currentY += 60
      })
      
      // Show "and X more..." if there are more items
      if (food.length > maxFoodItems) {
        ctx.fillStyle = '#6b7280'
        ctx.font = 'italic 14px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`...and ${food.length - maxFoodItems} more item${food.length - maxFoodItems !== 1 ? 's' : ''}`, canvas.width / 2, currentY)
        currentY += 30
      }
      
      // Footer
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🔗 Analyzed with CaloFit', canvas.width / 2, canvas.height - 15)
      
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'nutrition.png', { type: 'image/png' })] })) {
          try {
            const file = new File([blob], 'nutrition-report.png', { type: 'image/png' })
            await navigator.share({
              title: 'My Nutrition Analysis',
              text: `Check out my nutrition analysis: ${calories} calories, ${protein}g protein!`,
              files: [file]
            })
          } catch (error) {
            console.log('Web Share cancelled:', error)
          }
        } else {
          // Fallback: just download the image
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'nutrition-share.png'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          showSuccess('Image downloaded! You can manually share it.')
        }
      }, 'image/png')
      
    } catch (error) {
      console.error('Error generating share image:', error)
      showSuccess('Failed to generate image. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const generateShareText = (format) => {
    const baseUrl = window.location.origin
    
    switch (format) {
      case 'summary':
        return `🍽️ My Nutrition Analysis

📊 ${calories} calories | ${protein}g protein | ${carbs}g carbs | ${fat}g fat

${food.length} food item${food.length !== 1 ? 's' : ''} analyzed with CaloFit 🏋️
${baseUrl}`

      case 'detailed':
        return `🍽️ Detailed Nutrition Analysis - CaloFit

📊 TOTALS:
• Calories: ${calories} kcal
• Protein: ${protein}g
• Carbohydrates: ${carbs}g  
• Fat: ${fat}g

🍕 FOOD BREAKDOWN:
${food.map(item => 
  `• ${item.name} (${item.quantity})
  └ ${item.calories} cal | ${item.protein}g protein | ${item.carbs}g carbs | ${item.fat}g fat`
).join('\n')}

Get your nutrition analysis: ${baseUrl}`

      case 'social':
        return `Just analyzed my meal with AI! 🤖🍽️

${calories} calories of delicious food:
${food.map(item => `• ${item.name}`).join('\n')}

Who else is tracking their nutrition? 
#NutritionTracking #HealthyEating #AI

Try it: ${baseUrl}`

      default:
        return generateShareText('summary')
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showSuccess('Copied to clipboard!')
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showSuccess('Copied to clipboard!')
    }
  }

  const shareViaWebAPI = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Nutrition Analysis - CaloFit',
          text: text,
          url: window.location.origin
        })
      } catch (error) {
        console.log('Web Share cancelled:', error)
      }
    } else {
      copyToClipboard(text)
    }
  }

  const shareViaURL = (platform, text) => {
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(window.location.origin)
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const showSuccess = (message) => {
    // Create temporary success notification
    const notification = document.createElement('div')
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
      ">
        ✅ ${message}
      </div>
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  const currentShareText = generateShareText(shareFormat)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Share Your Results
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Choose Format:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'summary', label: 'Summary', icon: '📊' },
              { key: 'detailed', label: 'Detailed', icon: '📋' },
              { key: 'social', label: 'Social', icon: '📱' }
            ].map(format => (
              <button
                key={format.key}
                onClick={() => setShareFormat(format.key)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  shareFormat === format.key
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="text-lg mb-1">{format.icon}</div>
                {format.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview:
          </label>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line max-h-40 overflow-y-auto">
            {currentShareText}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => copyToClipboard(currentShareText)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Text
          </button>
          {navigator.share && (
            <button
              onClick={() => shareViaWebAPI(currentShareText)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
          )}
        </div>

        {/* Share as Image Options */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Share as Image:
          </label>
          <div className="space-y-3">
            <button
              onClick={generateNutritionImage}
              disabled={isGeneratingImage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isGeneratingImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  📊 Download Full Report Image
                </>
              )}
            </button>
            
            {navigator.share && (
              <button
                onClick={shareImageViaWebAPI}
                disabled={isGeneratingImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {isGeneratingImage ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    📱 Share Image via Apps
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Social Media Buttons */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Share on Social Media:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { platform: 'twitter', label: 'Twitter', color: 'bg-blue-500 hover:bg-blue-600', icon: '🐦' },
              { platform: 'facebook', label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', icon: '📘' },
              { platform: 'whatsapp', label: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600', icon: '💬' },
              { platform: 'telegram', label: 'Telegram', color: 'bg-blue-400 hover:bg-blue-500', icon: '✈️' }
            ].map(social => (
              <button
                key={social.platform}
                onClick={() => shareViaURL(social.platform, currentShareText)}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg transition-colors ${social.color}`}
              >
                <span>{social.icon}</span>
                <span className="text-sm font-medium">{social.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
