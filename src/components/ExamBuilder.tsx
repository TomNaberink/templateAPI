'use client'

import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ExamConfig {
  questionType: string
  questionCount: number
  educationLevel: string
  bloomLevel: string
  needsCase: boolean
  subject: string
  context: string
}

export default function ExamBuilder() {
  const [config, setConfig] = useState<ExamConfig>({
    questionType: '',
    questionCount: 1,
    educationLevel: '',
    bloomLevel: '',
    needsCase: false,
    subject: '',
    context: ''
  })

  const [questions, setQuestions] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const prompt = `
        Als toetsexpert, ontwikkel alsjeblieft toetsvragen met de volgende specificaties:
        - Type: ${config.questionType}
        - Aantal vragen: ${config.questionCount}
        - Onderwijsniveau: ${config.educationLevel}
        - Bloom's niveau: ${config.bloomLevel}
        - ${config.needsCase ? 'Met' : 'Zonder'} casus
        - Onderwerp: ${config.subject}
        - Context: ${config.context}
      `

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      setQuestions(data.response)
    } catch (error) {
      console.error('Error:', error)
      setQuestions('Er is een fout opgetreden bij het genereren van de vragen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type toetsvraag
            </label>
            <select
              value={config.questionType}
              onChange={(e) => setConfig({ ...config, questionType: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            >
              <option value="">Selecteer type</option>
              <option value="multiple-choice">Meerkeuzevragen</option>
              <option value="true-false">Juist-onjuist vragen</option>
              <option value="open">Open vragen</option>
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aantal vragen
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.questionCount}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setConfig({ ...config, questionCount: value });
              }}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Onderwijsniveau
            </label>
            <select
              value={config.educationLevel}
              onChange={(e) => setConfig({ ...config, educationLevel: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            >
              <option value="">Selecteer niveau</option>
              <option value="middelbare-school">Middelbare school</option>
              <option value="hbo">HBO</option>
              <option value="universiteit">Universiteit</option>
            </select>
          </div>

          {/* Bloom Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bloom's niveau
            </label>
            <select
              value={config.bloomLevel}
              onChange={(e) => setConfig({ ...config, bloomLevel: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            >
              <option value="">Selecteer niveau</option>
              <option value="kennis">Kennis</option>
              <option value="begrip">Begrip</option>
              <option value="toepassing">Toepassing</option>
              <option value="analyse">Analyse</option>
              <option value="synthese">Synthese</option>
              <option value="evaluatie">Evaluatie</option>
            </select>
          </div>
        </div>

        {/* Case Needed */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.needsCase}
              onChange={(e) => setConfig({ ...config, needsCase: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Casus toevoegen aan vragen</span>
          </label>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Onderwerp
          </label>
          <input
            type="text"
            value={config.subject}
            onChange={(e) => setConfig({ ...config, subject: e.target.value })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            required
            placeholder="Bijv. Nederlandse geschiedenis, programmeren, biologie..."
          />
        </div>

        {/* Context */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Context
          </label>
          <textarea
            value={config.context}
            onChange={(e) => setConfig({ ...config, context: e.target.value })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            rows={4}
            placeholder="Geef meer context over het onderwerp..."
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Vragen genereren...' : 'Genereer vragen'}
          </button>
        </div>
      </form>

      {/* Generated Questions */}
      {questions && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Gegenereerde vragen:</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{questions}</pre>
          </div>
        </div>
      )}
    </div>
  )
}