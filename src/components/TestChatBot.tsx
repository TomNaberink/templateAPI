'use client'

import { useState } from 'react'

export default function TestChatBot() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Er is een fout opgetreden')
      }

      const data = await res.json()
      setResponse(data.response)
    } catch (error) {
      console.error('Error:', error)
      setResponse('Error: ' + (error instanceof Error ? error.message : 'Onbekende fout'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
        <span className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center mr-2">
          <span className="text-white text-sm">🐕</span>
        </span>
        Stel je vraag over honden
      </h3>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-amber-200 p-3">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Stel een vraag over honden..."
                className="w-full p-2 border-0 resize-none focus:outline-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={isLoading || !message.trim()}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '⏳' : '🐾'}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-amber-700 text-sm">Even nadenken... 🐕</span>
            </div>
          </div>
        )}

        {response && !isLoading && (
          <div className="p-4 bg-white rounded-lg border border-amber-200">
            <div className="prose prose-amber">
              <p className="whitespace-pre-wrap text-gray-700">{response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}