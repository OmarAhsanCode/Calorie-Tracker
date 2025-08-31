import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { profileService } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  // Make handleGoogleResponse available globally for HTML-based sign-in
  useEffect(() => {
    window.handleGoogleCredentialResponse = handleGoogleResponse
    return () => {
      delete window.handleGoogleCredentialResponse
    }
  }, [])

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        console.log('Starting Google Sign-In initialization...')
        console.log('Environment:', import.meta.env.VITE_APP_ENV)
        console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
        console.log('Current URL:', window.location.href)
        
        // Load Google Sign-In script
        if (!window.google) {
          console.log('Loading Google Sign-In script...')
          const script = document.createElement('script')
          script.src = 'https://accounts.google.com/gsi/client'
          script.async = true
          script.defer = true
          
          script.onload = () => {
            console.log('Google script loaded successfully')
            if (window.google) {
              console.log('window.google is available')
              // Initialize Google Sign-In
              try {
                window.google.accounts.id.initialize({
                  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                  callback: handleGoogleResponse,
                  auto_select: false,
                  cancel_on_tap_outside: true,
                  use_fedcm_for_prompt: false
                })
                console.log('Google Sign-In initialized successfully')
                setIsGoogleLoaded(true)
              } catch (initError) {
                console.error('Error during Google initialization:', initError)
                setIsLoading(false)
              }
            } else {
              console.error('Google script loaded but window.google not available')
              setIsLoading(false)
            }
          }

          script.onerror = (error) => {
            console.error('Failed to load Google Sign-In script:', error)
            setIsLoading(false)
          }

          document.head.appendChild(script)
        } else {
          console.log('Google script already available')
          // Google script already loaded
          try {
            window.google.accounts.id.initialize({
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              callback: handleGoogleResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              use_fedcm_for_prompt: false
            })
            console.log('Google Sign-In re-initialized successfully')
            setIsGoogleLoaded(true)
          } catch (initError) {
            console.error('Error during Google re-initialization:', initError)
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error)
        setIsLoading(false)
      }
    }

    initializeGoogleSignIn()
  }, [])

  // Check for existing authentication and profile on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const storedUser = Cookies.get('calorie_valorie_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          
          // Check if user has a profile in Supabase
          try {
            const userProfile = await profileService.getProfile(userData.id)
            if (userProfile) {
              setProfile(userProfile)
              setNeedsOnboarding(false)
            } else {
              setNeedsOnboarding(true)
            }
          } catch (error) {
            console.error('Error fetching profile:', error)
            setNeedsOnboarding(true)
          }
        }
      } catch (error) {
        console.error('Error checking existing auth:', error)
        // Clear corrupted cookie
        Cookies.remove('calorie_valorie_user')
      } finally {
        setIsLoading(false)
      }
    }

    if (isGoogleLoaded) {
      checkExistingAuth()
    }
  }, [isGoogleLoaded])

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response) => {
    try {
      setIsLoading(true)
      
      // Decode the JWT token to get user info
      const credential = response.credential
      const payload = JSON.parse(atob(credential.split('.')[1]))
      
      const userData = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        verified_email: payload.email_verified,
        credential: credential,
        login_time: new Date().toISOString()
      }

      // Store user data
      setUser(userData)
      
      // Store in cookie (expires in 7 days)
      Cookies.set('calorie_valorie_user', JSON.stringify(userData), { 
        expires: 7,
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      })

      // Check if user has a profile in Supabase
      try {
        const userProfile = await profileService.getProfile(userData.id)
        if (userProfile) {
          setProfile(userProfile)
          setNeedsOnboarding(false)
        } else {
          setNeedsOnboarding(true)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setNeedsOnboarding(true)
      }

      console.log('User signed in successfully:', userData.name)
      
    } catch (error) {
      console.error('Error handling Google response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sign in function
  const signIn = () => {
    if (window.google && isGoogleLoaded) {
      try {
        console.log('Attempting to trigger Google Sign-In...')
        
        // First, try to render a button and trigger it
        const tempDiv = document.createElement('div')
        tempDiv.style.position = 'absolute'
        tempDiv.style.top = '-9999px'
        tempDiv.style.left = '-9999px'
        document.body.appendChild(tempDiv)
        
        window.google.accounts.id.renderButton(tempDiv, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          click_listener: () => {
            console.log('Google button clicked')
          }
        })
        
        // Click the rendered button
        setTimeout(() => {
          const button = tempDiv.querySelector('div[role="button"]')
          if (button) {
            console.log('Clicking rendered Google button')
            button.click()
          } else {
            console.log('Fallback to prompt method')
            // Fallback to prompt
            window.google.accounts.id.prompt((notification) => {
              console.log('Prompt notification:', notification)
              if (notification.isNotDisplayed()) {
                console.log('Prompt was not displayed - possible popup blocker')
                alert('Please allow popups for this site and try again, or check if you have an ad blocker preventing Google Sign-In.')
              } else if (notification.isSkippedMoment()) {
                console.log('Prompt was skipped')
              }
            })
          }
          
          // Clean up
          setTimeout(() => {
            if (document.body.contains(tempDiv)) {
              document.body.removeChild(tempDiv)
            }
          }, 1000)
        }, 100)
        
      } catch (error) {
        console.error('Error triggering Google Sign-In:', error)
      }
    } else {
      console.error('Google Sign-In not loaded yet')
    }
  }

  // Sign out function
  const signOut = () => {
    try {
      setIsLoading(true)
      
      // Clear user state
      setUser(null)
      setProfile(null)
      setNeedsOnboarding(false)
      
      // Remove cookie
      Cookies.remove('calorie_valorie_user')
      
      // Sign out from Google (if available)
      if (window.google) {
        window.google.accounts.id.disableAutoSelect()
      }

      console.log('User signed out successfully')
      
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Complete onboarding
  const completeOnboarding = (userProfile) => {
    setProfile(userProfile)
    setNeedsOnboarding(false)
  }

  // Show Google One Tap prompt
  const showOneTapPrompt = () => {
    if (window.google && isGoogleLoaded && !user) {
      window.google.accounts.id.prompt()
    }
  }

  const value = {
    user,
    profile,
    needsOnboarding,
    isLoading,
    isGoogleLoaded,
    signIn,
    signOut,
    showOneTapPrompt,
    completeOnboarding,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
