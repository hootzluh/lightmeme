import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { Send, Users, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, MoreVertical, Smile, Image, FileText } from 'lucide-react'
import PageLayout from '../components/PageLayout'

export default function LiveChat() {
  const { address, isConnected } = useAccount()
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: '0x1234...5678',
      username: 'CryptoTrader',
      message: 'Welcome to the LightMeme community! 🚀',
      timestamp: new Date(Date.now() - 300000),
      avatar: null,
      isSystem: false
    },
    {
      id: 2,
      user: 'system',
      username: 'System',
      message: 'New token MEME has been launched!',
      timestamp: new Date(Date.now() - 240000),
      avatar: null,
      isSystem: true
    },
    {
      id: 3,
      user: '0x9876...5432',
      username: 'MemeMaster',
      message: 'This is going to the moon! 🌙',
      timestamp: new Date(Date.now() - 180000),
      avatar: null,
      isSystem: false
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isChatConnected, setIsChatConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([
    { id: 1, username: 'CryptoTrader', avatar: null, isTyping: false },
    { id: 2, username: 'MemeMaster', avatar: null, isTyping: true },
    { id: 3, username: 'DiamondHands', avatar: null, isTyping: false },
    { id: 4, username: 'MoonWalker', avatar: null, isTyping: false }
  ])
  const messagesEndRef = useRef(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Simulate real-time message updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomMessages = [
          'To the moon! 🚀',
          'Diamond hands! 💎',
          'HODL! 💪',
          'This is the way!',
          'LFG! 🔥',
          'Bullish! 📈'
        ]
        const randomUsers = ['0x1111...2222', '0x3333...4444', '0x5555...6666']
        const randomUsernames = ['BullTrader', 'CryptoKing', 'MemeLord', 'DiamondHands']
        
        const newMsg = {
          id: Date.now(),
          user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
          username: randomUsernames[Math.floor(Math.random() * randomUsernames.length)],
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date(),
          avatar: null,
          isSystem: false
        }
        setMessages(prev => [...prev, newMsg])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isChatConnected) return

    const message = {
      id: Date.now(),
      user: address,
      username: 'You',
      message: newMessage,
      timestamp: new Date(),
      avatar: null,
      isSystem: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
  }

  const toggleCall = () => {
    setIsInCall(!isInCall)
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const emojis = ['🚀', '🌙', '💎', '💪', '🔥', '📈', '📉', '🎉', '😎', '🤝', '💯', '⭐']

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="live-chat-container">
          <div className="chat-connection-prompt">
            <h1>Live Community Chat</h1>
            <p>Connect your wallet to join the conversation</p>
            <button 
              className="connect-chat-btn"
              onClick={() => setIsChatConnected(true)}
            >
              Connect & Join Chat
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="live-chat-container">
        <div className="chat-header">
          <div className="chat-title">
            <h1>Live Community Chat</h1>
            <div className="online-indicator">
              <div className="online-dot"></div>
              <span>{onlineUsers.length} online</span>
            </div>
          </div>
          <div className="chat-controls">
            <button 
              className={`control-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              className={`control-btn ${isVideoOn ? 'active' : ''}`}
              onClick={toggleVideo}
              title={isVideoOn ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
            <button 
              className={`control-btn ${isInCall ? 'active' : ''}`}
              onClick={toggleCall}
              title={isInCall ? 'End call' : 'Start call'}
            >
              {isInCall ? <PhoneOff size={20} /> : <Phone size={20} />}
            </button>
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.isSystem ? 'system' : ''}`}>
                {!msg.isSystem && (
                  <div className="message-avatar">
                    {msg.avatar ? (
                      <img src={msg.avatar} alt={msg.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {msg.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                <div className="message-content">
                  {!msg.isSystem && (
                    <div className="message-header">
                      <span className="username">{msg.username}</span>
                      <span className="wallet-address">{msg.user}</span>
                      <span className="timestamp">{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                  <div className="message-text">
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="online-users">
            <div className="users-header">
              <Users size={20} />
              <span>Online ({onlineUsers.length})</span>
            </div>
            <div className="users-list">
              {onlineUsers.map((user) => (
                <div key={user.id} className="user-item">
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="online-status"></div>
                  </div>
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                    {user.isTyping && <span className="typing-indicator">typing...</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chat-input-container">
          <div className="chat-input">
            <div className="input-actions">
              <button 
                className="action-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Emoji"
              >
                <Smile size={20} />
              </button>
              <button className="action-btn" title="Image">
                <Image size={20} />
              </button>
              <button className="action-btn" title="File">
                <FileText size={20} />
              </button>
            </div>
            
            {showEmojiPicker && (
              <div className="emoji-picker">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="emoji-btn"
                    onClick={() => {
                      setNewMessage(prev => prev + emoji)
                      setShowEmojiPicker(false)
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="message-input"
              rows={1}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
