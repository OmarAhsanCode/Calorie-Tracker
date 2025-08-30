import React, { useState, useRef, useEffect } from 'react'

const ImageUploader = ({ onImageUpload, isAnalyzing, clearPreview }) => {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const [videoReady, setVideoReady] = useState(false)

  // Handle clearPreview prop to clear the image preview
  useEffect(() => {
    if (clearPreview) {
      setPreview(null)
      // Also reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ''
      }
    }
  }, [clearPreview])

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
      
      // Process the image
      onImageUpload(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = async () => {
    setCameraError(null)
    setVideoReady(false)
    
    try {
      // Request camera permission and access - works on both desktop and mobile
      let mediaStream;
      
      try {
        // Try with ideal settings first
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' }, // Prefer back camera but allow front on desktop
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            aspectRatio: { ideal: 16/9 }
          } 
        })
      } catch (error) {
        console.log('Falling back to basic camera settings')
        // Fallback to basic settings if the above fails
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        })
      }
      
      setStream(mediaStream)
      setShowCamera(true)
      
      // Set up video stream for both desktop and mobile
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Add multiple event listeners to ensure video loads properly
        const video = videoRef.current
        
        const handleVideoReady = () => {
          console.log('Video ready!')
          setVideoReady(true)
        }
        
        // Try multiple events to detect when video is ready
        video.addEventListener('loadedmetadata', handleVideoReady)
        video.addEventListener('canplay', handleVideoReady)
        video.addEventListener('playing', handleVideoReady)
        
        // Ensure video plays
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video started playing')
              handleVideoReady()
            })
            .catch(error => {
              console.log('Video play failed:', error)
              // Try again after a short delay
              setTimeout(() => {
                if (video && video.srcObject) {
                  video.play()
                    .then(() => handleVideoReady())
                    .catch(console.error)
                }
              }, 500)
            })
        }
        
        // Fallback: Set video ready after 2 seconds if events don't fire
        setTimeout(() => {
          if (video.srcObject && !videoReady) {
            console.log('Fallback: Setting video ready')
            setVideoReady(true)
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setCameraError(getErrorMessage(error))
    }
  }

  const getErrorMessage = (error) => {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Camera access denied. Please allow camera permissions in your browser settings and try again.'
      case 'NotFoundError':
        return 'No camera found on this device. Please connect a camera or use the file upload option.'
      case 'NotSupportedError':
        return 'Camera is not supported on this browser. Please try a different browser or use file upload.'
      case 'NotReadableError':
        return 'Camera is already in use by another application. Please close other apps using the camera.'
      case 'OverconstrainedError':
        return 'Camera settings not supported. Trying with default settings...'
      default:
        return 'Unable to access camera. Please check your camera connection and browser permissions.'
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File object from the blob
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
          
          // Create preview URL
          const previewUrl = URL.createObjectURL(blob)
          setPreview(previewUrl)
          
          // Close camera
          closeCamera()
          
          // Process the image
          handleFile(file)
        }
      }, 'image/jpeg', 0.9)
    }
  }

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
    setVideoReady(false)
    setCameraError(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analyze Your Meal
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload a photo or take a picture to get instant nutrition analysis
        </p>
      </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Analyzing your meal...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few seconds</p>
        </div>
      ) : showCamera ? (
        <div className="relative">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Camera Active</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Position your meal in the frame and click capture</p>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            {!videoReady && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Starting camera...</p>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              className="w-full rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-600 bg-black"
              autoPlay
              playsInline
              muted
              style={{ 
                maxHeight: '60vh',
                minHeight: '300px',
                objectFit: 'cover'
              }}
            />
            
            {/* Camera overlay for better UX */}
            {videoReady && (
              <div className="absolute inset-0 border-2 border-dashed border-primary-400 dark:border-primary-500 rounded-lg pointer-events-none opacity-30"></div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={capturePhoto}
              disabled={!stream} // Only disable if no stream at all
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center shadow-lg"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              📸 Capture Photo
            </button>
            
            <button
              onClick={closeCamera}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              ✕ Cancel
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Make sure your meal is well-lit and clearly visible in the frame
            </p>
          </div>
        </div>
      ) : (
        <>
          {preview && (
            <div className="mb-6">
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📷 Photo Preview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Your captured meal photo</p>
              </div>
              <div className="relative max-w-md mx-auto">
                <img 
                  src={preview} 
                  alt="Captured meal preview" 
                  className="w-full rounded-lg shadow-lg border-2 border-green-200 dark:border-green-600"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓ Captured
                </div>
              </div>
              <div className="text-center mt-3">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  📤 Photo ready for analysis!
                </p>
              </div>
            </div>
          )}

          <div
            className={`upload-area ${dragActive ? 'dragover' : ''} mb-6`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Drop your meal photo here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Supports JPG, PNG, WebP (max 10MB)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openFileDialog}
              className="btn-primary flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Photo
            </button>
            
            <button
              onClick={openCamera}
              className="btn-secondary flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Take Photo
            </button>
          </div>
        </>
      )}

      {/* Camera Error Display */}
      {cameraError && (
        <div className="mt-4 bg-red-50 dark:bg-red-800 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 dark:text-red-300 text-sm">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}

export default ImageUploader
