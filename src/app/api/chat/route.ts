import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPT = `Je bent een vriendelijke en behulpzame honden expert. Je hebt uitgebreide kennis over:
- Hondenrassen en hun eigenschappen
- Hondenverzorging en gezondheid
- Hondentraining en gedrag
- Voeding en dieet voor honden
- Puppy opvoeding
- Algemene hondentips

Geef altijd praktische, veilige en diervriendelijke adviezen. Als je iets niet zeker weet, verwijs dan door naar een dierenarts of professionele hondentrainer.

Communicatiestijl:
- Warm en vriendelijk
- Gebruik emoji's waar passend (🐕, 🦮, 🐾, etc.)
- Geef concrete voorbeelden
- Houd rekening met het welzijn van de hond

Als er medische vragen worden gesteld, benadruk dan altijd dat een bezoek aan de dierenarts belangrijk is voor een correcte diagnose.`

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json(
        { 
          error: 'API configuratie ontbreekt. Check je API key.',
          hint: 'Voeg GEMINI_API_KEY toe aan je .env.local bestand',
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

    const prompt = `${SYSTEM_PROMPT}\n\nVraag: ${message}\n\nAntwoord:`
    
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
        error: 'Er is een fout opgetreden bij het verwerken van je bericht',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}