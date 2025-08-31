import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import FileLogo from '../images/file.svg'

const AuthModal = ({ isOpen, onClose }) => {
  const { signIn, isGoogleLoaded } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      console.log('Google Sign-In button clicked')
      console.log('Google loaded:', isGoogleLoaded)
      console.log('Google object:', window.google)
      console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
      
      if (!isGoogleLoaded) {
        console.error('Google Sign-In not loaded yet')
        alert('Google Sign-In is still loading. Please wait a moment and try again.')
        return
      }
      
      if (!window.google) {
        console.error('Google object not found')
        alert('Google Sign-In failed to load. Please refresh the page and try again.')
        return
      }
      
      signIn()
      // Note: The actual sign-in handling is done in the AuthContext
      // The modal will close when the user state updates
    } catch (error) {
      console.error('Error during sign in:', error)
      alert('Sign-in failed: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Close modal when user is authenticated
  const { user } = useAuth()
  useEffect(() => {
    if (user) {
      onClose()
    }
  }, [user, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Modal */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-6 py-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md"
        >
          {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal content */}
        <div className="text-center">
          {/* Logo/Header */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <img 
                src={FileLogo} 
                alt="CaloFit Logo" 
                className="w-12 h-12"
              />
            </div>
            <h2 id="auth-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to CaloFit
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to save your nutrition history and access personalized features
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6 text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Benefits of signing in:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save your nutrition analysis history
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Track your daily calorie intake
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Get personalized recommendations
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Access from any device
              </li>
            </ul>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={!isGoogleLoaded || isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </div>
            )}
          </button>

          {/* Privacy note */}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy. 
            We&apos;ll only access your basic profile information.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
