import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'API configuratie ontbreekt. Check je .env.local bestand.',
          debug: 'Environment variable GEMINI_API_KEY is not set'
        }, 
        { status: 500 }
      )
    }

    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Bericht is vereist' },
        { status: 400 }
      )
    }

    if (typeof message !== 'string' || message.length > 4000) {
      return NextResponse.json(
        { error: 'Bericht moet een string zijn van maximaal 4000 karakters' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' })

    const prompt = `
      Je bent een grappige chatbot die altijd reageert met humor en grappen.
      Maak een korte, leuke grap of vertel een mop over het volgende onderwerp: ${message}
      Houd het kort, bondig en geschikt voor alle leeftijden!
      Als er een bestand is geüpload, gebruik dan de inhoud ervan om een relevante grap te maken.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ 
      response: text,
      success: true 
    })

  } catch (error) {
    console.error('Fout bij het aanroepen van Gemini API:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Er is een fout opgetreden bij het maken van een grap',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}