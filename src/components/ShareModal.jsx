import React, { useState } from 'react'

const ShareModal = ({ isOpen, onClose, nutritionData }) => {
  const [shareFormat, setShareFormat] = useState('summary')
  
  if (!isOpen) return null

  // Handle the new array-based output format
  let data = nutritionData
  if (Array.isArray(nutritionData) && nutritionData.length > 0 && nutritionData[0].output) {
    data = nutritionData[0].output
  }
  
  const { food = [], total = {} } = data
  const { calories = 0, protein = 0, carbs = 0, fat = 0 } = total

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
