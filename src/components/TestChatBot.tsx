'use client'

import { useState, useRef } from 'react'
import VoiceInput from './VoiceInput'
import FileUpload from './FileUpload'

export default function TestChatBot() {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const handleVoiceInput = (transcript: string) => {
    setCurrentMessage(prev => prev + ' ' + transcript)
  }

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload-docx', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const fileInfo = `📎 ${file.name}\n${data.content.substring(0, 300)}${data.content.length > 300 ? '...' : ''}`
      setCurrentMessage(prev => prev + '\n\nBekijk dit document:\n' + fileInfo)
    } catch (error) {
      console.error('File upload error:', error)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = currentMessage
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Je bent Arnoud, een afstudeerbegeleider die altijd grappen maakt. Geef eerst een grapje en daarna pas een serieus antwoord op deze vraag: ${userMessage}` 
        }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()
      setMessages(prev => [...prev, { type: 'bot', content: data.response }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Ha! Zelfs mijn computer humor werkt niet meer! 😅\nEr is helaas een technisch probleem opgetreden.' 
      }])
    } finally {
      setIsLoading(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="h-[500px] overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.type === 'bot' && (
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">👨‍🏫</span>
                  <span className="font-medium">Arnoud</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl">👨‍🏫</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <VoiceInput onTranscript={handleVoiceInput} isDisabled={isLoading} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Bestand uploaden"
          >
            📎
          </button>
        </div>
        
        <div className="flex space-x-2">
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Stel je vraag aan Arnoud..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !currentMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
          >
            Verstuur
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
        className="hidden"
      />
    </div>
  )
}