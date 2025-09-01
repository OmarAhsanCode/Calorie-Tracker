import { useState, useRef, useEffect } from 'react'

const ImageUploader = ({ onImageUpload, isAnalyzing, clearPreview }) => {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const [isStreamReady, setIsStreamReady] = useState(false)

  // Handle clearPreview prop to clear the image preview
  useEffect(() => {
    if (clearPreview) {
      setPreview(null)
      // Also reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [clearPreview])

  // Cleanup camera stream on component unmount or when closing
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
      })
      setStream(null)
    }
    setIsStreamReady(false)
  }

  // Effect to set up video when stream and showCamera are ready
  useEffect(() => {
    if (stream && showCamera && videoRef.current) {
      const video = videoRef.current
      console.log('Setting up video in useEffect')
      video.srcObject = stream
      
      const handleMetadata = () => {
        console.log('Video metadata loaded:', video.videoWidth, 'x', video.videoHeight)
        video.play().then(() => {
          console.log('Video playing successfully')
          setIsStreamReady(true)
        }).catch(err => {
          console.error('Video play error:', err)
          setIsStreamReady(true)
        })
      }
      
      video.addEventListener('loadedmetadata', handleMetadata)
      
      // Cleanup function
      return () => {
        video.removeEventListener('loadedmetadata', handleMetadata)
      }
    }
  }, [stream, showCamera])

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
    onImageUpload(file)
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

  const startCamera = async () => {
    setCameraError(null)
    setIsStreamReady(false)
    
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this browser')
      }

      // Request camera access with progressive fallback
      let mediaStream
      
      try {
        // Try with back camera and high quality first
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
      } catch (err) {
        console.log('Back camera failed, trying front camera:', err)
        try {
          // Fallback to front camera
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })
        } catch (err2) {
          console.log('Front camera failed, trying any camera:', err2)
          // Final fallback - any available camera
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true
          })
        }
      }

      setStream(mediaStream)
      setShowCamera(true)
      console.log('MediaStream created successfully:', mediaStream)
      console.log('Video tracks:', mediaStream.getVideoTracks())

    } catch (error) {
      console.error('Camera access error:', error)
      setCameraError(getCameraErrorMessage(error))
      setShowCamera(false)
    }
  }

  const getCameraErrorMessage = (error) => {
    if (error.name === 'NotAllowedError') {
      return 'Camera access denied. Please allow camera permissions in your browser.'
    } else if (error.name === 'NotFoundError') {
      return 'No camera found. Please connect a camera or use file upload.'
    } else if (error.name === 'NotSupportedError') {
      return 'Camera not supported on this browser. Please use file upload.'
    } else if (error.name === 'NotReadableError') {
      return 'Camera is being used by another application. Please close other apps using the camera.'
    } else {
      return 'Camera error: ' + (error.message || 'Unable to access camera')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || !isStreamReady) {
      console.error('Video or canvas not ready')
      return
    }

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || video.clientWidth
      canvas.height = video.videoHeight || video.clientHeight
      
      // Draw the video frame to canvas
      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
          const previewUrl = URL.createObjectURL(blob)
          setPreview(previewUrl)
          handleFile(file)
          closeCamera()
        }
      }, 'image/jpeg', 0.9)
      
    } catch (error) {
      console.error('Capture error:', error)
      setCameraError('Failed to capture photo. Please try again.')
    }
  }

  const closeCamera = () => {
    stopCamera()
    setShowCamera(false)
    setCameraError(null)
  }

  return (
    <div id="upload" className="card-surface p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute -bottom-24 -left-10 w-72 h-72 bg-gradient-to-tr from-brand-orange/10 to-brand-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analyze Your Meal</h2>
            <p className="text-sm text-gray-600 max-w-md">Snap a clear, well-lit photo. Avoid cluttered backgrounds for best recognition.</p>
          </div>
          <span className="hidden sm:inline-flex items-center text-xs font-medium bg-brand-green/10 text-brand-green px-3 py-1 rounded-full border border-brand-green/30">Image AI</span>
        </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="h-20 w-20 rounded-full border-4 border-brand-green/20 border-t-brand-green animate-spin" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-green/20 to-brand-orange/20 animate-pulse opacity-30" />
          </div>
          <p className="text-base font-semibold text-gray-800">Analyzing your meal...</p>
          <p className="text-sm text-gray-500 mt-2">Identifying food items & calculating macros</p>
          <div className="mt-8 w-full max-w-sm space-y-3">
            {['Detecting plate', 'Parsing ingredients', 'Estimating macros'].map(s => (
              <div key={s} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-brand-green/30 animate-[pulse_1.8s_ease-in-out_infinite]" />
                </div>
                <span className="text-[11px] text-gray-500 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
      ) : showCamera ? (
        <div className="camera-section">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">📸 Camera Active</h3>
            <p className="text-sm text-gray-600">Position your meal in the frame and click capture</p>
          </div>
          
          <div className="relative max-w-lg mx-auto bg-black rounded-lg overflow-hidden shadow-xl">
            {/* Video element - always visible */}
            <video
              ref={videoRef}
              className="w-full h-auto rounded-lg block"
              autoPlay
              playsInline
              muted
              controls={false}
              style={{ 
                minHeight: '300px',
                maxHeight: '500px',
                objectFit: 'cover',
                backgroundColor: '#000000',
                display: 'block',
                visibility: 'visible'
              }}
            />
            
            {/* Loading overlay - only shows when not ready */}
            {!isStreamReady && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-20">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Starting camera...</p>
                  <p className="text-sm opacity-75">Please allow camera access</p>
                </div>
              </div>
            )}
            
            {/* Camera frame overlay */}
            {isStreamReady && (
              <div className="absolute inset-4 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none opacity-60"></div>
            )}
          </div>
          
          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Camera controls */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={capturePhoto}
              disabled={!isStreamReady}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capture Photo
            </button>
            
            <button
              onClick={closeCamera}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
            >
              Cancel
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              💡 Tip: Make sure your meal is well-lit and fits completely in the frame
            </p>
          </div>
        </div>
      ) : (
        <>
          {preview && (
            <div className="mb-6 animate-fadeIn">
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">📷 Photo Preview</h3>
                <p className="text-xs text-gray-500">Make sure the meal is centered & fully visible</p>
              </div>
              <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden shadow-elevate border border-brand-green/30">
                <img
                  src={preview}
                  alt="Captured meal preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-brand-green text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
                  READY
                </div>
              </div>
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload meal photo"
            className={`dropzone-modern ${dragActive ? 'dragover' : ''} mb-6`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFileDialog() } }}
          >
            <div className="flex flex-col items-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-green to-brand-orange flex items-center justify-center text-2xl text-white shadow-md mb-5">📸</div>
              <p className="text-lg font-semibold text-gray-800 mb-1">Snap your meal or drag & drop</p>
              <p className="text-sm text-gray-500 mb-4">Clear photo • Good lighting • One plate</p>
              <p className="text-[11px] text-gray-400 tracking-wide">JPG · PNG · WebP (max 10MB)</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/5 to-brand-orange/5 rounded-2xl" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              id="upload-btn"
              onClick={openFileDialog}
              className="btn-brand-primary flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Photo
            </button>
            <button
              id="takephoto-btn"
              onClick={startCamera}
              className="btn-brand-secondary flex items-center justify-center"
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="upload-input"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      </div>
    </div>
  )
}

export default ImageUploader
