import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Initialiseer de Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    // Controleer of de API key is ingesteld
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is niet ingesteld' },
        { status: 500 }
      )
    }

    // Haal de bericht data op uit de request
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Bericht is vereist' },
        { status: 400 }
      )
    }

    // Input validatie en sanitization
    if (typeof message !== 'string' || message.length > 4000) {
      return NextResponse.json(
        { error: 'Bericht moet een string zijn van maximaal 4000 karakters' },
        { status: 400 }
      )
    }

    // Haal het Gemini model op - gebruik het nieuwste model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' })

    // Genereer een response van Gemini
    const result = await model.generateContent(message)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ 
      response: text,
      success: true 
    })

  } catch (error) {
    console.error('Fout bij het aanroepen van Gemini API:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verwerken van je bericht' },
      { status: 500 }
    )
  }
} 