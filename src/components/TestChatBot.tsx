'use client'

import { useState, useRef } from 'react'

export default function TestChatBot() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [uploadedContent, setUploadedContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadedContent(data.content)
      
      const fileInfo = `📎 ${data.filename} (${data.fileType})\n`
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
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
          <span className="text-white text-sm">😄</span>
        </span>
        Grappenmaker ChatBot
      </h3>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-purple-200 p-3">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Waar wil je een grap over horen?"
                className="w-full p-2 border-0 resize-none focus:outline-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Bestand uploaden (.docx/.pdf)"
              >
                📎
              </button>
              
              <button
                onClick={toggleVoiceRecognition}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'text-red-600 bg-red-50 animate-pulse' 
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title={isListening ? "Stop opnamen" : "Start spraakherkenning"}
              >
                🎤
              </button>
              
              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '⏳' : '😄'}
              </button>
            </div>
          </div>
          
          {uploadedContent && (
            <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              ✅ Bestand geüpload ({uploadedContent.length} karakters)
            </div>
          )}
          
          {isListening && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Luistert...
            </div>
          )}
        </div>

        {isLoading && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-purple-700 text-sm">Even nadenken over een leuke grap...</span>
            </div>
          </div>
        )}

        {response && !isLoading && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🤣</span>
              <p className="text-green-800 font-medium">Hier komt ie:</p>
            </div>
            <p className="text-gray-700 text-sm bg-white p-3 rounded border whitespace-pre-wrap">
              {response}
            </p>
          </div>
        )}

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