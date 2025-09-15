import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { Play, Mic, MicOff, Video, VideoOff, Users, Heart, MessageCircle, Share2, Settings } from 'lucide-react'
import PageLayout from '../components/PageLayout'

export default function LiveStream() {
  const { address, isConnected } = useAccount()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [viewers, setViewers] = useState(0)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [streamTitle, setStreamTitle] = useState('My Live Stream')
  const [streamDescription, setStreamDescription] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [permissionError, setPermissionError] = useState('')
  const [streamStartTime, setStreamStartTime] = useState(null)
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const requestPermissions = async () => {
    try {
      setPermissionError('')
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser')
      }
      
      console.log('Requesting camera and microphone permissions...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      console.log('Permissions granted, setting up video stream...')
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        console.log('Video stream set up successfully')
      }
      
      setPermissionsGranted(true)
      return true
    } catch (error) {
      console.error('Permission error:', error)
      
      let errorMessage = 'Camera and microphone access is required to stream. '
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions in your browser settings and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found. Please connect a camera and microphone.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Your browser does not support camera/microphone access.'
      } else {
        errorMessage += `Error: ${error.message}`
      }
      
      setPermissionError(errorMessage)
      setPermissionsGranted(false)
      return false
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setPermissionsGranted(false)
  }

  const handleStartStream = async () => {
    console.log('Starting stream...')
    const hasPermissions = await requestPermissions()
    if (hasPermissions) {
      console.log('Permissions granted, starting stream...')
      setIsStreaming(true)
      setStreamStartTime(new Date())
      setViewers(1) // Only count yourself initially
      console.log('Stream started successfully')
    } else {
      console.log('Failed to get permissions, cannot start stream')
    }
  }

  const handleStopStream = () => {
    setIsStreaming(false)
    setViewers(0)
    setStreamStartTime(null)
    stopStream()
  }

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn
      })
      setIsVideoOn(!isVideoOn)
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      user: address,
      username: 'You',
      message: newMessage,
      timestamp: new Date(),
      isSuperChat: false
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStreamDuration = () => {
    if (!streamStartTime) return '00:00'
    const now = new Date()
    const diff = Math.floor((now - streamStartTime) / 1000)
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSaveSettings = () => {
    setShowSettings(false)
    // In a real app, this would save to a backend
    console.log('Stream settings saved:', { streamTitle, streamDescription })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [])

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="live-stream-container">
          <div className="stream-connection-prompt">
            <h1>Live Streaming</h1>
            <p>Connect your wallet to start streaming</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="live-stream-container">
        <div className="stream-main">
          <div className="video-container">
            <div className="video-player">
              {isStreaming && permissionsGranted ? (
                <div className="stream-video">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted={isMuted}
                    playsInline
                    className="stream-video-element"
                  />
                  <div className="stream-overlay">
                    <div className="stream-info">
                      <div className="live-indicator">
                        <div className="live-dot"></div>
                        <span>LIVE</span>
                        <span className="stream-duration">{getStreamDuration()}</span>
                      </div>
                      <div className="viewer-count">
                        <Users size={16} />
                        <span>{viewers} viewer{viewers !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="stream-placeholder">
                  <div className="placeholder-content">
                    {permissionError ? (
                      <div className="error-message">
                        <h3>Permission Required</h3>
                        <p>{permissionError}</p>
                        <button className="retry-btn" onClick={requestPermissions}>
                          Grant Permissions
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3>Ready to Go Live?</h3>
                        <p>Start streaming to share your content with the community</p>
                        <button className="start-stream-btn" onClick={handleStartStream}>
                          <Play size={20} />
                          Start Stream
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="stream-controls">
              <div className="control-group">
                <button 
                  className={`control-btn ${isMuted ? 'muted' : ''}`}
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  disabled={!isStreaming}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button 
                  className={`control-btn ${isVideoOn ? 'active' : ''}`}
                  onClick={toggleVideo}
                  title={isVideoOn ? 'Turn off video' : 'Turn on video'}
                  disabled={!isStreaming}
                >
                  {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                <button 
                  className="control-btn"
                  onClick={() => setShowSettings(true)}
                  title="Stream Settings"
                >
                  <Settings size={20} />
                </button>
              </div>

              <div className="stream-actions">
                <button 
                  className={`like-btn ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  <Heart size={20} />
                  <span>{likes}</span>
                </button>
                <button className="share-btn">
                  <Share2 size={20} />
                  Share
                </button>
                {isStreaming && (
                  <button className="stop-stream-btn" onClick={handleStopStream}>
                    Stop Stream
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="stream-info-panel">
            <div className="stream-details">
              <h2>{streamTitle}</h2>
              {streamDescription && <p>{streamDescription}</p>}
              <div className="stream-stats">
                <div className="stat">
                  <Users size={16} />
                  <span>{viewers} viewer{viewers !== 1 ? 's' : ''}</span>
                </div>
                <div className="stat">
                  <Heart size={16} />
                  <span>{likes} like{likes !== 1 ? 's' : ''}</span>
                </div>
                {streamStartTime && (
                  <div className="stat">
                    <span>Duration: {getStreamDuration()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="stream-chat">
          <div className="chat-header">
            <h3>Live Chat</h3>
            <div className="chat-stats">
              <Users size={16} />
              <span>{viewers}</span>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="no-messages">No messages yet. Start the conversation!</div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.isSuperChat ? 'super-chat' : ''}`}>
                  <div className="message-header">
                    <span className="username">{msg.username}</span>
                    <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-text">{msg.message}</div>
                </div>
              ))
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="message-input"
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="stream-settings">
            <div className="settings-content">
              <h3>Stream Settings</h3>
              <div className="setting-group">
                <label>Stream Title</label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="setting-input"
                />
              </div>
              <div className="setting-group">
                <label>Description</label>
                <textarea
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  className="setting-textarea"
                  rows={3}
                  placeholder="Describe your stream..."
                />
              </div>
              <div className="setting-actions">
                <button className="save-btn" onClick={handleSaveSettings}>
                  Save Settings
                </button>
                <button className="cancel-btn" onClick={() => setShowSettings(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}