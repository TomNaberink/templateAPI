'use client'

import { useState } from 'react'

export default function Home() {
  const [keywords, setKeywords] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quiz, setQuiz] = useState<{
    question: string
    options: string[]
    correctAnswer: string
  }[] | null>(null)

  const generateQuiz = async () => {
    if (!keywords.trim()) return
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Genereer een multiple choice quiz met 3 vragen over het volgende onderwerp: ${keywords}. 
          Geef het antwoord in dit JSON formaat:
          {
            "questions": [
              {
                "question": "De vraag hier",
                "options": ["A) optie 1", "B) optie 2", "C) optie 3", "D) optie 4"],
                "correctAnswer": "A) optie 1"
              }
            ]
          }
          Zorg ervoor dat het valide JSON is.`
        }),
      })

      if (!res.ok) throw new Error('Failed to generate quiz')
      
      const data = await res.json()
      try {
        // Clean the response string by removing markdown code block delimiters
        const cleanJson = data.response.replace(/^```json\n|\n```$/g, '').trim()
        const parsedQuiz = JSON.parse(cleanJson)
        setQuiz(parsedQuiz.questions)
      } catch (e) {
        console.error('Failed to parse quiz JSON:', e)
        throw new Error('Invalid quiz format')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Er ging iets mis bij het genereren van de quiz')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            MP Quiz Generator
          </h1>
          <p className="text-gray-600">
            Voer een paar woorden in en krijg direct een quiz!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Bijv: kunstmatige intelligentie, geschiedenis WO2..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && generateQuiz()}
            />
            <button
              onClick={generateQuiz}
              disabled={isLoading || !keywords.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '⏳ Even denken...' : 'Genereer Quiz'}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center p-12">
            <div className="inline-flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {quiz && (
          <div className="space-y-8">
            {quiz.map((q, qIndex) => (
              <div key={qIndex} className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Vraag {qIndex + 1}: {q.question}
                </h2>
                <div className="space-y-3">
                  {q.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        option === q.correctAnswer
                          ? 'bg-green-100 border border-green-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                      {option === q.correctAnswer && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}