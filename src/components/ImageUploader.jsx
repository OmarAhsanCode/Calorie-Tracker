import { useState, useRef, useEffect } from 'react'

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

  const openCamera = async () => {
    setCameraError(null)
    setVideoReady(false)
    try {
      let mediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            aspectRatio: { ideal: 16 / 9 }
          }
        })
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      }
      setStream(mediaStream)
      setShowCamera(true)
      const video = videoRef.current
      if (video) {
        video.srcObject = mediaStream
        const markReady = () => setVideoReady(true)
        video.addEventListener('loadedmetadata', markReady, { once: true })
        video.addEventListener('canplay', markReady, { once: true })
        video.addEventListener('playing', markReady, { once: true })
        const attemptPlay = () => {
          const p = video.play()
          if (p?.then) p.then(markReady).catch(() => setTimeout(attemptPlay, 400))
        }
        attemptPlay()
        setTimeout(() => { if (!videoReady) setVideoReady(true) }, 2000)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setCameraError(getErrorMessage(err))
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
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
      const previewUrl = URL.createObjectURL(blob)
      setPreview(previewUrl)
      closeCamera()
      handleFile(file)
    }, 'image/jpeg', 0.9)
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
              onClick={openCamera}
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

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        id="upload-input"
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
    </div>
  )
}

export default ImageUploader
