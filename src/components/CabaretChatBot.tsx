'use client'

import { useState, useRef } from 'react'

export default function CabaretChatBot() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Voice recognition setup
  const initializeVoiceRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'nl-NL'
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setMessage(prev => prev + ' ' + transcript)
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        recognition.onerror = () => {
          setIsListening(false)
        }
        
        return recognition
      }
    }
    return null
  }

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initializeVoiceRecognition()
    }
    
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
        setIsListening(false)
      } else {
        recognitionRef.current.start()
        setIsListening(true)
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
      alert('Alleen .docx en .pdf bestanden zijn toegestaan!')
      return
    }

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
      
      const fileInfo = `📎 ${data.filename}\n`
      const contentPreview = data.content.length > 300 
        ? data.content.substring(0, 300) + '...' 
        : data.content
      
      setMessage(prev => prev + '\n\n' + fileInfo + 'Inhoud:\n' + contentPreview)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Fout bij uploaden: ' + (error instanceof Error ? error.message : 'Onbekende fout'))
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: `Je bent een cabaretier in de stijl van Youp van 't Hek. Reageer grappig en sarcastisch op het volgende: ${message}` 
        }),
      })

      if (!res.ok) {
        throw new Error('Er is een fout opgetreden')
      }

      const data = await res.json()
      setResponse(data.response)
      setMessage('')
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
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-2xl">🎭</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">De Digitale Cabaretier</h1>
          <p className="text-gray-600">Powered by AI, geïnspireerd door Youp</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chat History */}
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-gray-50 rounded-lg p-4">
          {response && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🎭</span>
                <span className="font-medium text-gray-800">De Cabaretier zegt:</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Vertel me wat je dwars zit..."
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Bestand uploaden (.docx/.pdf)"
              >
                📎
              </button>
              
              <button
                onClick={toggleVoiceRecognition}
                disabled={isLoading}
                className={`p-3 rounded-lg transition-colors ${
                  isListening 
                    ? 'text-red-600 bg-red-50 animate-pulse' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isListening ? "Stop opnemen" : "Start spraakherkenning"}
              >
                🎤
              </button>
              
              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '⏳' : '🎯'}
              </button>
            </div>
          </div>

          {isListening && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Aan het luisteren...
            </div>
          )}
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
    </div>
  )
}