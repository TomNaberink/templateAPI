'use client'

import { useState } from 'react'

interface Question {
  question: string
  options: string[]
  correctAnswer: string
}

export default function Home() {
  const [keywords, setKeywords] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quiz, setQuiz] = useState<Question[] | null>(null)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const generateQuiz = async () => {
    if (!keywords.trim()) return
    
    setIsLoading(true)
    setQuiz(null)
    setUserAnswers([])
    setShowResults(false)

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
        const cleanJson = data.response.replace(/^```json\n|\n```$/g, '').trim()
        const parsedQuiz = JSON.parse(cleanJson)
        setQuiz(parsedQuiz.questions)
        setUserAnswers(new Array(parsedQuiz.questions.length).fill(''))
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

  const handleAnswer = (questionIndex: number, answer: string) => {
    const newAnswers = [...userAnswers]
    newAnswers[questionIndex] = answer
    setUserAnswers(newAnswers)
  }

  const calculateScore = () => {
    if (!quiz) return 0
    return quiz.reduce((score, question, index) => {
      return score + (question.correctAnswer === userAnswers[index] ? 1 : 0)
    }, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            MP Quiz Generator
          </h1>
          <p className="text-gray-600">
            Voer een paar woorden in en test je kennis!
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

        {quiz && !showResults && (
          <div className="space-y-8">
            {quiz.map((q, qIndex) => (
              <div key={qIndex} className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Vraag {qIndex + 1}: {q.question}
                </h2>
                <div className="space-y-3">
                  {q.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => handleAnswer(qIndex, option)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        userAnswers[qIndex] === option
                          ? 'bg-purple-100 border border-purple-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="text-center">
              <button
                onClick={() => setShowResults(true)}
                disabled={userAnswers.some(answer => answer === '')}
                className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Controleer Antwoorden
              </button>
            </div>
          </div>
        )}

        {showResults && quiz && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Je Score: {calculateScore()} van de {quiz.length}
              </h2>
              <p className="text-gray-600">
                {calculateScore() === quiz.length 
                  ? '🎉 Perfect! Alle antwoorden zijn correct!'
                  : calculateScore() > quiz.length / 2
                  ? '👏 Goed gedaan! Bijna alle antwoorden correct!'
                  : '💪 Blijf oefenen! Je kunt het!'}
              </p>
            </div>

            <div className="space-y-6">
              {quiz.map((q, qIndex) => (
                <div key={qIndex} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">
                    Vraag {qIndex + 1}: {q.question}
                  </h3>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className={`p-3 rounded-lg ${
                          option === q.correctAnswer
                            ? 'bg-green-100 border border-green-200'
                            : option === userAnswers[qIndex]
                            ? 'bg-red-100 border border-red-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        {option}
                        {option === q.correctAnswer && (
                          <span className="ml-2 text-green-600">✓ Correct</span>
                        )}
                        {option === userAnswers[qIndex] && option !== q.correctAnswer && (
                          <span className="ml-2 text-red-600">✗ Jouw antwoord</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setQuiz(null)
                  setUserAnswers([])
                  setShowResults(false)
                  setKeywords('')
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Nieuwe Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}