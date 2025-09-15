import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { Send, ArrowLeft, Phone, Video, MoreVertical, Smile, Image, FileText, Search, Plus, Users } from 'lucide-react'
import PageLayout from '../components/PageLayout'

export default function DirectChat() {
  const { address, isConnected } = useAccount()
  const [selectedChat, setSelectedChat] = useState(null)
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatAddress, setNewChatAddress] = useState('')
  const [newChatUsername, setNewChatUsername] = useState('')
  const messagesEndRef = useRef(null)

  // Load chats from localStorage
  useEffect(() => {
    const loadChats = () => {
      try {
        const savedChats = JSON.parse(localStorage.getItem('directChats') || '[]')
        setChats(savedChats)
        
        // Initialize messages for each chat
        const initialMessages = {}
        savedChats.forEach(chat => {
          const savedMessages = JSON.parse(localStorage.getItem(`chatMessages_${chat.id}`) || '[]')
          initialMessages[chat.id] = savedMessages
        })
        setMessages(initialMessages)
      } catch (error) {
        console.error('Error loading chats:', error)
        setChats([])
        setMessages({})
      }
    }

    loadChats()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom()
    }
  }, [messages, selectedChat])

  const saveChats = (updatedChats) => {
    localStorage.setItem('directChats', JSON.stringify(updatedChats))
  }

  const saveMessages = (chatId, chatMessages) => {
    localStorage.setItem(`chatMessages_${chatId}`, JSON.stringify(chatMessages))
  }

  const createNewChat = () => {
    if (!newChatAddress.trim() || !newChatUsername.trim()) {
      alert('Please enter both wallet address and username')
      return
    }

    // Validate wallet address format (basic check)
    if (!newChatAddress.startsWith('0x') || newChatAddress.length !== 42) {
      alert('Please enter a valid Ethereum wallet address (0x...)')
      return
    }

    // Check if chat already exists
    const existingChat = chats.find(chat => 
      chat.user.toLowerCase() === newChatAddress.toLowerCase()
    )

    if (existingChat) {
      alert('A chat with this address already exists')
      return
    }

    const newChat = {
      id: Date.now(),
      user: newChatAddress,
      username: newChatUsername,
      lastMessage: 'Chat started',
      timestamp: new Date(),
      unread: 0,
      avatar: null,
      isOnline: false
    }

    const updatedChats = [...chats, newChat]
    setChats(updatedChats)
    saveChats(updatedChats)

    // Initialize empty messages for new chat
    setMessages(prev => ({
      ...prev,
      [newChat.id]: []
    }))

    setNewChatAddress('')
    setNewChatUsername('')
    setShowNewChatModal(false)
    setSelectedChat(newChat)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return

    const message = {
      id: Date.now(),
      sender: address,
      message: newMessage,
      timestamp: new Date(),
      isOwn: true
    }

    const updatedMessages = {
      ...messages,
      [selectedChat.id]: [...(messages[selectedChat.id] || []), message]
    }
    setMessages(updatedMessages)
    saveMessages(selectedChat.id, updatedMessages[selectedChat.id])

    // Update last message in chat list
    const updatedChats = chats.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: newMessage, timestamp: new Date(), unread: 0 }
        : chat
    )
    setChats(updatedChats)
    saveChats(updatedChats)

    setNewMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const formatMessageTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const filteredChats = chats.filter(chat =>
    chat.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.user.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVoiceCall = () => {
    alert('Voice Call Feature\n\nThis would typically:\n1. Use WebRTC for peer-to-peer audio\n2. Request microphone permissions\n3. Establish connection with the other user\n4. Handle call controls (mute, hang up)')
  }

  const handleVideoCall = () => {
    alert('Video Call Feature\n\nThis would typically:\n1. Use WebRTC for peer-to-peer video\n2. Request camera and microphone permissions\n3. Establish connection with the other user\n4. Handle call controls (mute, video on/off, hang up)')
  }

  const handleEmojiClick = () => {
    alert('Emoji Picker\n\nThis would typically:\n1. Show an emoji picker interface\n2. Allow users to select and insert emojis\n3. Support recent and favorite emojis')
  }

  const handleImageUpload = () => {
    alert('Image Upload\n\nThis would typically:\n1. Open file picker for images\n2. Upload to IPFS or similar storage\n3. Send image message with preview\n4. Handle image compression and optimization')
  }

  const handleFileUpload = () => {
    alert('File Upload\n\nThis would typically:\n1. Open file picker for documents\n2. Upload to decentralized storage\n3. Send file message with download link\n4. Show file type and size information')
  }

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="direct-chat-container">
          <div className="chat-connection-prompt">
            <h1>Direct Messages</h1>
            <p>Connect your wallet to start private conversations</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="direct-chat-container">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <button 
              className="new-chat-btn"
              onClick={() => setShowNewChatModal(true)}
              title="Start new conversation"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="chats-list">
            {filteredChats.length === 0 ? (
              <div className="no-chats">
                <Users size={48} />
                <h3>No conversations yet</h3>
                <p>Start a new conversation by clicking the + button</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="chat-avatar">
                    {chat.avatar ? (
                      <img src={chat.avatar} alt={chat.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {chat.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {chat.isOnline && <div className="online-status"></div>}
                  </div>
                  <div className="chat-info">
                    <div className="chat-header">
                      <span className="username">{chat.username}</span>
                      <span className="timestamp">{formatTime(chat.timestamp)}</span>
                    </div>
                    <div className="chat-preview">
                      <span className="last-message">{chat.lastMessage}</span>
                      {chat.unread > 0 && (
                        <span className="unread-badge">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <button 
                  className="back-btn"
                  onClick={() => setSelectedChat(null)}
                  title="Back to chat list"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-user-info">
                  <div className="user-avatar">
                    {selectedChat.avatar ? (
                      <img src={selectedChat.avatar} alt={selectedChat.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {selectedChat.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {selectedChat.isOnline && <div className="online-status"></div>}
                  </div>
                  <div className="user-details">
                    <h3>{selectedChat.username}</h3>
                    <span className="wallet-address">{selectedChat.user}</span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button 
                    className="action-btn" 
                    title="Voice call"
                    onClick={handleVoiceCall}
                  >
                    <Phone size={20} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="Video call"
                    onClick={handleVideoCall}
                  >
                    <Video size={20} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="More options"
                    onClick={() => alert(`More options for ${selectedChat.username}\n\nThis would typically include:\n1. View profile\n2. Block user\n3. Report user\n4. Chat settings\n5. Clear chat history`)}
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              <div className="messages-container">
                {messages[selectedChat.id]?.length === 0 ? (
                  <div className="no-messages">
                    <h3>No messages yet</h3>
                    <p>Start the conversation by sending a message</p>
                  </div>
                ) : (
                  messages[selectedChat.id]?.map((msg) => (
                    <div key={msg.id} className={`message ${msg.isOwn ? 'own' : 'other'}`}>
                      <div className="message-content">
                        <div className="message-text">{msg.message}</div>
                        <div className="message-time">{formatMessageTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                <div className="input-actions">
                  <button 
                    className="action-btn" 
                    title="Add emoji"
                    onClick={handleEmojiClick}
                  >
                    <Smile size={20} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="Send image"
                    onClick={handleImageUpload}
                  >
                    <Image size={20} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="Send file"
                    onClick={handleFileUpload}
                  >
                    <FileText size={20} />
                  </button>
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="message-input"
                  rows={1}
                />
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  title="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <h3>Select a conversation</h3>
                <p>Choose a chat from the sidebar to start messaging, or create a new conversation</p>
                <button 
                  className="new-chat-btn"
                  onClick={() => setShowNewChatModal(true)}
                >
                  <Plus size={20} />
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {showNewChatModal && (
          <div className="new-chat-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Start New Conversation</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowNewChatModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Wallet Address</label>
                  <input
                    type="text"
                    value={newChatAddress}
                    onChange={(e) => setNewChatAddress(e.target.value)}
                    placeholder="0x..."
                    className="form-input"
                  />
                  <small>Enter the Ethereum wallet address of the person you want to chat with</small>
                </div>
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={newChatUsername}
                    onChange={(e) => setNewChatUsername(e.target.value)}
                    placeholder="Enter a display name"
                    className="form-input"
                  />
                  <small>Enter a display name for this contact</small>
                </div>
                <div className="modal-actions">
                  <button 
                    className="create-btn"
                    onClick={createNewChat}
                  >
                    Start Chat
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowNewChatModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}